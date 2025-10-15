#include <iostream>
#include <memory>
#include <queue>
#include <set>
#include <mutex>
#include <condition_variable>
#include <thread>
#include <chrono>
#include <atomic>
#include <vector>
#include <functional>
#include <future>
#include <sstream>
#include <iomanip>

/**
 * Object Pool Pattern - Thread Pool Example
 * Manages a pool of expensive worker threads for reuse and efficient task execution
 */

// Forward declarations
class WorkerThread;

// Poolable object interface
class PoolableObject {
public:
    virtual ~PoolableObject() = default;
    virtual void reset() = 0;
    virtual bool isValid() const = 0;
    virtual std::string getId() const = 0;
    virtual std::chrono::time_point<std::chrono::steady_clock> getCreatedAt() const = 0;
    virtual std::chrono::time_point<std::chrono::steady_clock> getLastUsedAt() const = 0;
};

// Task interface
class Task {
public:
    virtual ~Task() = default;
    virtual void execute() = 0;
    virtual std::string getDescription() const = 0;
};

// Concrete task implementations
class ComputationTask : public Task {
private:
    std::string taskId;
    int iterations;
    std::function<void(const std::string&)> callback;
    
public:
    ComputationTask(const std::string& id, int iter, std::function<void(const std::string&)> cb = nullptr)
        : taskId(id), iterations(iter), callback(cb) {}
    
    void execute() override {
        std::cout << "🧮 Executing computation task: " << taskId 
                  << " (thread: " << std::this_thread::get_id() << ")" << std::endl;
        
        // Simulate computational work
        long long result = 0;
        for (int i = 0; i < iterations; ++i) {
            result += i * i;
            
            // Add small delay to simulate work
            if (i % 1000 == 0) {
                std::this_thread::sleep_for(std::chrono::microseconds(10));
            }
        }
        
        std::cout << "✅ Completed computation task: " << taskId 
                  << " (result: " << result << ")" << std::endl;
        
        if (callback) {
            callback(taskId);
        }
    }
    
    std::string getDescription() const override {
        return "ComputationTask[" + taskId + ", iterations=" + std::to_string(iterations) + "]";
    }
};

class IOTask : public Task {
private:
    std::string taskId;
    std::string filename;
    
public:
    IOTask(const std::string& id, const std::string& file)
        : taskId(id), filename(file) {}
    
    void execute() override {
        std::cout << "💾 Executing I/O task: " << taskId 
                  << " (thread: " << std::this_thread::get_id() << ")" << std::endl;
        
        // Simulate I/O work
        std::this_thread::sleep_for(std::chrono::milliseconds(100));
        
        std::cout << "✅ Completed I/O task: " << taskId 
                  << " (file: " << filename << ")" << std::endl;
    }
    
    std::string getDescription() const override {
        return "IOTask[" + taskId + ", file=" + filename + "]";
    }
};

// Worker thread class - poolable object
class WorkerThread : public PoolableObject {
private:
    std::string threadId;
    std::chrono::time_point<std::chrono::steady_clock> createdAt;
    std::chrono::time_point<std::chrono::steady_clock> lastUsedAt;
    std::atomic<int> tasksExecuted{0};
    std::atomic<bool> busy{false};
    std::atomic<bool> shouldStop{false};
    
    std::thread worker;
    std::queue<std::unique_ptr<Task>> taskQueue;
    std::mutex taskMutex;
    std::condition_variable taskCondition;
    
    static const int MAX_TASKS_PER_THREAD = 50;
    static constexpr auto MAX_THREAD_AGE = std::chrono::minutes(5);
    
public:
    WorkerThread(const std::string& id) 
        : threadId(id), 
          createdAt(std::chrono::steady_clock::now()),
          lastUsedAt(std::chrono::steady_clock::now()) {
        
        // Create worker thread
        worker = std::thread(&WorkerThread::workerLoop, this);
        
        std::cout << "🧵 Created worker thread: " << threadId << std::endl;
        
        // Simulate expensive thread creation
        std::this_thread::sleep_for(std::chrono::milliseconds(50));
    }
    
    ~WorkerThread() {
        shutdown();
    }
    
    void reset() override {
        lastUsedAt = std::chrono::steady_clock::now();
        busy = false;
        std::cout << "🔄 Reset worker thread: " << threadId << std::endl;
    }
    
    bool isValid() const override {
        auto age = std::chrono::steady_clock::now() - createdAt;
        
        // Check age limit
        if (age > MAX_THREAD_AGE) {
            std::cout << "⏰ Worker thread " << threadId << " expired due to age" << std::endl;
            return false;
        }
        
        // Check task count limit
        if (tasksExecuted.load() >= MAX_TASKS_PER_THREAD) {
            std::cout << "🔢 Worker thread " << threadId << " expired due to task count: " 
                      << tasksExecuted.load() << std::endl;
            return false;
        }
        
        // Check if thread is still running
        if (shouldStop.load()) {
            std::cout << "🛑 Worker thread " << threadId << " is stopping" << std::endl;
            return false;
        }
        
        return true;
    }
    
    std::string getId() const override {
        return threadId;
    }
    
    std::chrono::time_point<std::chrono::steady_clock> getCreatedAt() const override {
        return createdAt;
    }
    
    std::chrono::time_point<std::chrono::steady_clock> getLastUsedAt() const override {
        return lastUsedAt;
    }
    
    bool isBusy() const {
        return busy.load();
    }
    
    int getTasksExecuted() const {
        return tasksExecuted.load();
    }
    
    void executeTask(std::unique_ptr<Task> task) {
        {
            std::lock_guard<std::mutex> lock(taskMutex);
            taskQueue.push(std::move(task));
        }
        taskCondition.notify_one();
    }
    
    void shutdown() {
        shouldStop = true;
        taskCondition.notify_all();
        
        if (worker.joinable()) {
            worker.join();
        }
        
        std::cout << "🔚 Shutdown worker thread: " << threadId << std::endl;
    }
    
    std::string getStatus() const {
        auto age = std::chrono::steady_clock::now() - createdAt;
        auto idle = std::chrono::steady_clock::now() - lastUsedAt;
        
        std::stringstream ss;
        ss << "WorkerThread{id=" << threadId
           << ", busy=" << (busy.load() ? "true" : "false")
           << ", tasks=" << tasksExecuted.load()
           << ", age=" << std::chrono::duration_cast<std::chrono::seconds>(age).count() << "s"
           << ", idle=" << std::chrono::duration_cast<std::chrono::seconds>(idle).count() << "s"
           << ", valid=" << (isValid() ? "true" : "false") << "}";
        
        return ss.str();
    }

private:
    void workerLoop() {
        while (!shouldStop.load()) {
            std::unique_ptr<Task> task;
            
            {
                std::unique_lock<std::mutex> lock(taskMutex);
                taskCondition.wait(lock, [this] { 
                    return !taskQueue.empty() || shouldStop.load(); 
                });
                
                if (shouldStop.load() && taskQueue.empty()) {
                    break;
                }
                
                if (!taskQueue.empty()) {
                    task = std::move(taskQueue.front());
                    taskQueue.pop();
                }
            }
            
            if (task) {
                busy = true;
                lastUsedAt = std::chrono::steady_clock::now();
                
                try {
                    task->execute();
                    tasksExecuted++;
                } catch (const std::exception& e) {
                    std::cerr << "❌ Task execution failed on " << threadId << ": " << e.what() << std::endl;
                }
                
                busy = false;
            }
        }
        
        std::cout << "🔚 Worker thread loop ended: " << threadId << std::endl;
    }
};

// Pool statistics
struct PoolStatistics {
    size_t availableCount;
    size_t inUseCount;
    size_t totalCount;
    size_t maxPoolSize;
    size_t totalCreated;
    size_t totalAcquired;
    size_t totalReturned;
    size_t totalExpired;
    
    double getUtilizationPercentage() const {
        return maxPoolSize > 0 ? (totalCount * 100.0 / maxPoolSize) : 0.0;
    }
    
    double getReusePercentage() const {
        return totalAcquired > 0 ? (totalReturned * 100.0 / totalAcquired) : 0.0;
    }
    
    std::string toString() const {
        std::stringstream ss;
        ss << "Pool Statistics:\n"
           << "├─ Available: " << availableCount << "\n"
           << "├─ In Use: " << inUseCount << "\n"
           << "├─ Total: " << totalCount << "/" << maxPoolSize 
           << " (" << std::fixed << std::setprecision(1) << getUtilizationPercentage() << "% utilization)\n"
           << "├─ Total Created: " << totalCreated << "\n"
           << "├─ Total Acquired: " << totalAcquired << "\n"
           << "├─ Total Returned: " << totalReturned << "\n"
           << "├─ Total Expired: " << totalExpired << "\n"
           << "└─ Reuse Rate: " << std::fixed << std::setprecision(1) << getReusePercentage() << "%";
        
        return ss.str();
    }
};

// Generic object pool
template<typename T>
class ObjectPool {
public:
    using FactoryFunction = std::function<std::unique_ptr<T>()>;
    
private:
    FactoryFunction factory;
    size_t minSize;
    size_t maxSize;
    
    std::queue<std::unique_ptr<T>> available;
    std::set<T*> inUse;
    mutable std::mutex poolMutex;
    std::condition_variable poolCondition;
    
    // Statistics
    std::atomic<size_t> totalCreated{0};
    std::atomic<size_t> totalAcquired{0};
    std::atomic<size_t> totalReturned{0};
    std::atomic<size_t> totalExpired{0};
    
    // Cleanup thread
    std::thread cleanupThread;
    std::atomic<bool> shouldShutdown{false};
    
public:
    ObjectPool(FactoryFunction fact, size_t minSz, size_t maxSz)
        : factory(fact), minSize(minSz), maxSize(maxSz) {
        
        // Initialize with minimum objects
        initializePool();
        
        // Start cleanup thread
        cleanupThread = std::thread(&ObjectPool::cleanupLoop, this);
        
        std::cout << "🏊 ObjectPool initialized: min=" << minSize << ", max=" << maxSize << std::endl;
    }
    
    ~ObjectPool() {
        shutdown();
    }
    
    std::unique_ptr<T> acquire(std::chrono::milliseconds timeout = std::chrono::milliseconds(5000)) {
        std::unique_lock<std::mutex> lock(poolMutex);
        
        auto deadline = std::chrono::steady_clock::now() + timeout;
        
        while (std::chrono::steady_clock::now() < deadline) {
            // Try to get available object
            if (!available.empty()) {
                auto obj = std::move(available.front());
                available.pop();
                
                if (obj->isValid()) {
                    inUse.insert(obj.get());
                    totalAcquired++;
                    std::cout << "✅ Acquired object from pool: " << obj->getId() << std::endl;
                    return obj;
                } else {
                    totalExpired++;
                    std::cout << "⏰ Object expired during acquire: " << obj->getId() << std::endl;
                    continue;
                }
            }
            
            // No available objects, try to create new one
            if (getTotalCount() < maxSize) {
                auto obj = factory();
                inUse.insert(obj.get());
                totalCreated++;
                totalAcquired++;
                std::cout << "🆕 Created new object for immediate use: " << obj->getId() << std::endl;
                return obj;
            }
            
            // Pool exhausted, wait
            std::cout << "⏳ Pool exhausted, waiting for available object..." << std::endl;
            poolCondition.wait_until(lock, deadline);
        }
        
        throw std::runtime_error("Timeout waiting for object from pool");
    }
    
    void release(std::unique_ptr<T> obj) {
        if (!obj) return;
        
        std::lock_guard<std::mutex> lock(poolMutex);
        
        auto it = inUse.find(obj.get());
        if (it != inUse.end()) {
            inUse.erase(it);
            
            if (obj->isValid()) {
                obj->reset();
                available.push(std::move(obj));
                totalReturned++;
                std::cout << "🔄 Returned object to pool: " << (*it)->getId() << std::endl;
                poolCondition.notify_one();
            } else {
                totalExpired++;
                std::cout << "⏰ Object expired on return: " << (*it)->getId() << std::endl;
            }
        } else {
            std::cout << "⚠️  Attempted to return object not from this pool" << std::endl;
        }
    }
    
    PoolStatistics getStatistics() const {
        std::lock_guard<std::mutex> lock(poolMutex);
        
        return {
            available.size(),
            inUse.size(),
            getTotalCount(),
            maxSize,
            totalCreated.load(),
            totalAcquired.load(),
            totalReturned.load(),
            totalExpired.load()
        };
    }
    
    void shutdown() {
        shouldShutdown = true;
        
        if (cleanupThread.joinable()) {
            cleanupThread.join();
        }
        
        std::lock_guard<std::mutex> lock(poolMutex);
        
        // Shutdown all objects
        while (!available.empty()) {
            auto obj = std::move(available.front());
            available.pop();
            // obj will be automatically destroyed
        }
        
        for (auto* objPtr : inUse) {
            // Objects in use will be cleaned up when returned/destroyed
        }
        
        std::cout << "🔚 ObjectPool shutdown completed" << std::endl;
    }

private:
    void initializePool() {
        std::lock_guard<std::mutex> lock(poolMutex);
        
        for (size_t i = 0; i < minSize; ++i) {
            auto obj = factory();
            available.push(std::move(obj));
            totalCreated++;
        }
        
        std::cout << "📦 Pool initialized with " << minSize << " objects" << std::endl;
    }
    
    void cleanupLoop() {
        while (!shouldShutdown.load()) {
            std::this_thread::sleep_for(std::chrono::seconds(5));
            
            if (!shouldShutdown.load()) {
                cleanupExpiredObjects();
                ensureMinimumSize();
            }
        }
    }
    
    void cleanupExpiredObjects() {
        std::lock_guard<std::mutex> lock(poolMutex);
        
        std::queue<std::unique_ptr<T>> validObjects;
        size_t expiredCount = 0;
        
        while (!available.empty()) {
            auto obj = std::move(available.front());
            available.pop();
            
            if (obj->isValid()) {
                validObjects.push(std::move(obj));
            } else {
                expiredCount++;
                totalExpired++;
            }
        }
        
        available = std::move(validObjects);
        
        if (expiredCount > 0) {
            std::cout << "🧹 Cleaned up " << expiredCount << " expired objects" << std::endl;
        }
    }
    
    void ensureMinimumSize() {
        std::lock_guard<std::mutex> lock(poolMutex);
        
        size_t currentAvailable = available.size();
        size_t currentTotal = getTotalCount();
        
        if (currentAvailable < minSize && currentTotal < maxSize) {
            size_t toCreate = std::min(minSize - currentAvailable, maxSize - currentTotal);
            
            for (size_t i = 0; i < toCreate; ++i) {
                auto obj = factory();
                available.push(std::move(obj));
                totalCreated++;
            }
            
            if (toCreate > 0) {
                std::cout << "📈 Added " << toCreate << " objects to maintain minimum pool size" << std::endl;
            }
        }
    }
    
    size_t getTotalCount() const {
        return available.size() + inUse.size();
    }
};

// Thread pool service using object pool
class ThreadPoolService {
private:
    ObjectPool<WorkerThread> threadPool;
    std::atomic<size_t> tasksSubmitted{0};
    std::atomic<size_t> tasksCompleted{0};
    
public:
    ThreadPoolService(size_t minThreads, size_t maxThreads) 
        : threadPool([this](){ 
            return std::make_unique<WorkerThread>("worker_" + std::to_string(tasksSubmitted.load()));
        }, minThreads, maxThreads) {
        
        std::cout << "🏭 ThreadPoolService created with " << minThreads << "-" << maxThreads << " threads" << std::endl;
    }
    
    void submitTask(std::unique_ptr<Task> task) {
        try {
            auto worker = threadPool.acquire();
            
            std::cout << "📋 Submitting task: " << task->getDescription() 
                      << " to worker: " << worker->getId() << std::endl;
            
            // Create callback to handle task completion
            auto completionCallback = [this](const std::string& taskId) {
                tasksCompleted++;
                std::cout << "🎯 Task completed: " << taskId 
                          << " (total completed: " << tasksCompleted.load() << ")" << std::endl;
            };
            
            tasksSubmitted++;
            worker->executeTask(std::move(task));
            
            // Return worker after small delay to simulate processing time
            std::thread([this, worker = std::move(worker)]() mutable {
                std::this_thread::sleep_for(std::chrono::milliseconds(200));
                threadPool.release(std::move(worker));
            }).detach();
            
        } catch (const std::exception& e) {
            std::cerr << "❌ Failed to submit task: " << e.what() << std::endl;
        }
    }
    
    std::future<void> submitTaskAsync(std::unique_ptr<Task> task) {
        return std::async(std::launch::async, [this, task = std::move(task)]() mutable {
            submitTask(std::move(task));
        });
    }
    
    PoolStatistics getPoolStatistics() const {
        return threadPool.getStatistics();
    }
    
    size_t getTasksSubmitted() const { return tasksSubmitted.load(); }
    size_t getTasksCompleted() const { return tasksCompleted.load(); }
    
    void shutdown() {
        std::cout << "🔚 Shutting down ThreadPoolService..." << std::endl;
        
        // Wait a bit for pending tasks
        std::this_thread::sleep_for(std::chrono::seconds(1));
        
        threadPool.shutdown();
        
        std::cout << "📊 Final task statistics:" << std::endl;
        std::cout << "  Tasks submitted: " << tasksSubmitted.load() << std::endl;
        std::cout << "  Tasks completed: " << tasksCompleted.load() << std::endl;
    }
};

int main() {
    std::cout << "=== Object Pool Pattern Demo - Thread Pool ===\n" << std::endl;
    
    try {
        // Create thread pool service
        ThreadPoolService service(2, 6);
        
        std::cout << "\n1. Basic Thread Pool Operations:" << std::endl;
        
        // Submit some basic tasks
        for (int i = 1; i <= 5; ++i) {
            auto task = std::make_unique<ComputationTask>("compute_" + std::to_string(i), i * 10000);
            service.submitTask(std::move(task));
        }
        
        // Wait a bit for tasks to process
        std::this_thread::sleep_for(std::chrono::seconds(2));
        
        std::cout << "\nPool statistics after basic operations:" << std::endl;
        std::cout << service.getPoolStatistics().toString() << std::endl;
        
        std::cout << "\n2. Mixed Task Types:" << std::endl;
        
        // Submit mixed task types
        for (int i = 1; i <= 3; ++i) {
            auto computeTask = std::make_unique<ComputationTask>("mixed_compute_" + std::to_string(i), 50000);
            auto ioTask = std::make_unique<IOTask>("mixed_io_" + std::to_string(i), "file_" + std::to_string(i) + ".txt");
            
            service.submitTask(std::move(computeTask));
            service.submitTask(std::move(ioTask));
        }
        
        std::this_thread::sleep_for(std::chrono::seconds(2));
        
        std::cout << "\n3. Concurrent Task Submission:" << std::endl;
        
        // Submit tasks from multiple threads
        std::vector<std::future<void>> futures;
        
        for (int t = 0; t < 4; ++t) {
            auto future = std::async(std::launch::async, [&service, t]() {
                for (int i = 1; i <= 3; ++i) {
                    auto task = std::make_unique<ComputationTask>(
                        "thread_" + std::to_string(t) + "_task_" + std::to_string(i), 
                        25000
                    );
                    service.submitTask(std::move(task));
                    
                    // Small delay between tasks
                    std::this_thread::sleep_for(std::chrono::milliseconds(100));
                }
                std::cout << "✅ Thread " << t << " finished submitting tasks" << std::endl;
            });
            
            futures.push_back(std::move(future));
        }
        
        // Wait for all submission threads
        for (auto& future : futures) {
            future.wait();
        }
        
        std::cout << "\n⏳ Waiting for all tasks to complete..." << std::endl;
        std::this_thread::sleep_for(std::chrono::seconds(3));
        
        std::cout << "\n4. Final Statistics:" << std::endl;
        auto stats = service.getPoolStatistics();
        std::cout << stats.toString() << std::endl;
        
        std::cout << "\nTask execution statistics:" << std::endl;
        std::cout << "Tasks submitted: " << service.getTasksSubmitted() << std::endl;
        std::cout << "Tasks completed: " << service.getTasksCompleted() << std::endl;
        
        std::cout << "\n5. Pool Efficiency Analysis:" << std::endl;
        std::cout << "Pool utilization: " << std::fixed << std::setprecision(1) 
                  << stats.getUtilizationPercentage() << "%" << std::endl;
        std::cout << "Thread reuse rate: " << std::fixed << std::setprecision(1) 
                  << stats.getReusePercentage() << "%" << std::endl;
        
        if (stats.totalCreated > 0) {
            double tasksPerThread = static_cast<double>(service.getTasksSubmitted()) / stats.totalCreated;
            std::cout << "Average tasks per thread: " << std::fixed << std::setprecision(1) 
                      << tasksPerThread << std::endl;
        }
        
        std::cout << "\n6. Pool Stress Test:" << std::endl;
        
        // Rapid task submission to test pool limits
        auto startTime = std::chrono::high_resolution_clock::now();
        
        for (int i = 0; i < 20; ++i) {
            auto task = std::make_unique<ComputationTask>("stress_" + std::to_string(i), 10000);
            service.submitTask(std::move(task));
        }
        
        auto submitTime = std::chrono::high_resolution_clock::now();
        auto submitDuration = std::chrono::duration_cast<std::chrono::milliseconds>(submitTime - startTime);
        
        std::cout << "📊 Submitted 20 tasks in " << submitDuration.count() << "ms" << std::endl;
        
        // Wait for completion
        std::this_thread::sleep_for(std::chrono::seconds(2));
        
        auto endTime = std::chrono::high_resolution_clock::now();
        auto totalDuration = std::chrono::duration_cast<std::chrono::milliseconds>(endTime - startTime);
        
        std::cout << "⏱️  Total stress test duration: " << totalDuration.count() << "ms" << std::endl;
        
        std::cout << "\nFinal pool statistics:" << std::endl;
        std::cout << service.getPoolStatistics().toString() << std::endl;
        
        // Shutdown
        std::cout << "\n7. Service Shutdown:" << std::endl;
        service.shutdown();
        
        std::cout << "\n✅ Object Pool pattern successfully demonstrated!" << std::endl;
        std::cout << "Benefits: Thread reuse, resource management, performance optimization, controlled concurrency" << std::endl;
        
    } catch (const std::exception& e) {
        std::cerr << "❌ Demo failed: " << e.what() << std::endl;
        return 1;
    }
    
    return 0;
}
