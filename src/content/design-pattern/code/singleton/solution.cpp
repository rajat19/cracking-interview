#include <iostream>
#include <memory>
#include <string>
#include <vector>
#include <map>
#include <mutex>
#include <thread>
#include <chrono>
#include <fstream>
#include <sstream>
#include <atomic>

/**
 * Singleton Pattern - Resource Manager System
 * Thread-safe singleton managing system resources with lazy initialization
 */

class ResourceManager {
private:
    // Static instance pointer and mutex for thread safety
    static std::unique_ptr<ResourceManager> instance;
    static std::mutex instanceMutex;
    
    // Instance data and synchronization
    mutable std::mutex dataMutex;
    std::map<std::string, std::string> resources;
    std::vector<std::string> loadedResources;
    std::atomic<int> accessCount{0};
    std::string configPath;
    bool initialized;
    
    // Private constructor prevents direct instantiation
    ResourceManager() : configPath("resources.conf"), initialized(false) {
        std::cout << "🔧 ResourceManager constructor called on thread: " 
                  << std::this_thread::get_id() << std::endl;
        loadDefaultResources();
        initialized = true;
    }
    
    void loadDefaultResources() {
        std::lock_guard<std::mutex> lock(dataMutex);
        
        // Load default system resources
        resources["system.name"] = "MyApplication";
        resources["system.version"] = "1.0.0";
        resources["system.environment"] = "development";
        
        // Database resources
        resources["database.host"] = "localhost";
        resources["database.port"] = "5432";
        resources["database.name"] = "myapp";
        resources["database.pool_size"] = "10";
        
        // Cache resources
        resources["cache.enabled"] = "true";
        resources["cache.ttl"] = "3600";
        resources["cache.max_entries"] = "1000";
        
        // Logging resources
        resources["logging.level"] = "INFO";
        resources["logging.file"] = "application.log";
        resources["logging.console"] = "true";
        
        loadedResources.push_back("Default Resources");
        
        std::cout << "📚 Loaded " << resources.size() << " default resources" << std::endl;
    }

public:
    // Deleted copy constructor and assignment operator to prevent copying
    ResourceManager(const ResourceManager&) = delete;
    ResourceManager& operator=(const ResourceManager&) = delete;
    
    // Thread-safe singleton instance retrieval using Meyer's Singleton (C++11 guarantees)
    static ResourceManager& getInstance() {
        // C++11 guarantees that local static initialization is thread-safe
        static ResourceManager instance;
        return instance;
    }
    
    // Alternative implementation with explicit double-checked locking
    static ResourceManager& getInstanceExplicit() {
        // First check without lock (performance optimization)
        if (instance == nullptr) {
            std::lock_guard<std::mutex> lock(instanceMutex);
            // Second check with lock (thread safety)
            if (instance == nullptr) {
                instance = std::unique_ptr<ResourceManager>(new ResourceManager());
            }
        }
        return *instance;
    }
    
    // Resource access methods
    std::string getResource(const std::string& key, const std::string& defaultValue = "") const {
        std::lock_guard<std::mutex> lock(dataMutex);
        accessCount++;
        
        auto it = resources.find(key);
        if (it != resources.end()) {
            return it->second;
        }
        return defaultValue;
    }
    
    void setResource(const std::string& key, const std::string& value) {
        std::lock_guard<std::mutex> lock(dataMutex);
        
        std::string oldValue = resources[key];
        resources[key] = value;
        
        std::cout << "🔄 Resource updated: " << key << " = '" << value 
                  << "' (was: '" << oldValue << "')" << std::endl;
    }
    
    bool hasResource(const std::string& key) const {
        std::lock_guard<std::mutex> lock(dataMutex);
        return resources.find(key) != resources.end();
    }
    
    void removeResource(const std::string& key) {
        std::lock_guard<std::mutex> lock(dataMutex);
        
        auto it = resources.find(key);
        if (it != resources.end()) {
            std::cout << "🗑️  Removed resource: " << key << " (was: '" << it->second << "')" << std::endl;
            resources.erase(it);
        }
    }
    
    // Configuration file operations
    bool loadFromFile(const std::string& filename) {
        std::ifstream file(filename);
        if (!file.is_open()) {
            std::cout << "⚠️  Could not open file: " << filename << std::endl;
            return false;
        }
        
        std::lock_guard<std::mutex> lock(dataMutex);
        std::string line;
        int loadedCount = 0;
        
        while (std::getline(file, line)) {
            // Skip empty lines and comments
            if (line.empty() || line[0] == '#') continue;
            
            size_t pos = line.find('=');
            if (pos != std::string::npos) {
                std::string key = line.substr(0, pos);
                std::string value = line.substr(pos + 1);
                
                // Trim whitespace
                key.erase(0, key.find_first_not_of(" \t"));
                key.erase(key.find_last_not_of(" \t") + 1);
                value.erase(0, value.find_first_not_of(" \t"));
                value.erase(value.find_last_not_of(" \t") + 1);
                
                resources[key] = value;
                loadedCount++;
            }
        }
        
        configPath = filename;
        loadedResources.push_back("File: " + filename + " (" + std::to_string(loadedCount) + " resources)");
        
        std::cout << "📁 Loaded " << loadedCount << " resources from " << filename << std::endl;
        return true;
    }
    
    bool saveToFile(const std::string& filename) const {
        std::ofstream file(filename);
        if (!file.is_open()) {
            std::cout << "❌ Could not create file: " << filename << std::endl;
            return false;
        }
        
        std::lock_guard<std::mutex> lock(dataMutex);
        
        file << "# Resource configuration file" << std::endl;
        file << "# Generated at: " << getCurrentTimeString() << std::endl;
        file << std::endl;
        
        for (const auto& pair : resources) {
            file << pair.first << "=" << pair.second << std::endl;
        }
        
        std::cout << "💾 Saved " << resources.size() << " resources to " << filename << std::endl;
        return true;
    }
    
    // Resource categories
    std::map<std::string, std::string> getResourcesByPrefix(const std::string& prefix) const {
        std::lock_guard<std::mutex> lock(dataMutex);
        std::map<std::string, std::string> result;
        
        for (const auto& pair : resources) {
            if (pair.first.substr(0, prefix.length()) == prefix) {
                result[pair.first] = pair.second;
            }
        }
        
        return result;
    }
    
    // Statistics and information
    struct Statistics {
        size_t totalResources;
        int accessCount;
        size_t loadedSources;
        std::string configPath;
        std::thread::id threadId;
        bool initialized;
    };
    
    Statistics getStatistics() const {
        std::lock_guard<std::mutex> lock(dataMutex);
        
        return {
            resources.size(),
            accessCount.load(),
            loadedResources.size(),
            configPath,
            std::this_thread::get_id(),
            initialized
        };
    }
    
    void printConfiguration() const {
        std::lock_guard<std::mutex> lock(dataMutex);
        
        std::cout << "📋 Resource Manager Configuration:" << std::endl;
        std::cout << "├─ Total Resources: " << resources.size() << std::endl;
        std::cout << "├─ Access Count: " << accessCount.load() << std::endl;
        std::cout << "├─ Config File: " << configPath << std::endl;
        std::cout << "├─ Thread ID: " << std::this_thread::get_id() << std::endl;
        std::cout << "└─ Initialized: " << (initialized ? "Yes" : "No") << std::endl;
        
        std::cout << "\n📚 Loaded Sources:" << std::endl;
        for (const auto& source : loadedResources) {
            std::cout << "  • " << source << std::endl;
        }
        
        std::cout << "\n🔧 Current Resources:" << std::endl;
        for (const auto& pair : resources) {
            std::cout << "  " << pair.first << " = " << pair.second << std::endl;
        }
    }
    
    void clearResources() {
        std::lock_guard<std::mutex> lock(dataMutex);
        
        size_t count = resources.size();
        resources.clear();
        loadedResources.clear();
        
        std::cout << "🧹 Cleared " << count << " resources" << std::endl;
        
        // Reload defaults
        loadDefaultResources();
    }
    
private:
    std::string getCurrentTimeString() const {
        auto now = std::chrono::system_clock::now();
        auto time_t = std::chrono::system_clock::to_time_t(now);
        
        std::stringstream ss;
        ss << std::put_time(std::localtime(&time_t), "%Y-%m-%d %H:%M:%S");
        return ss.str();
    }
};

// Static member definitions
std::unique_ptr<ResourceManager> ResourceManager::instance = nullptr;
std::mutex ResourceManager::instanceMutex;

// Example classes demonstrating resource usage
class DatabaseConnection {
private:
    ResourceManager& resourceManager;
    std::string connectionString;
    bool connected;
    
public:
    DatabaseConnection() : resourceManager(ResourceManager::getInstance()), connected(false) {
        std::cout << "🗄️  DatabaseConnection created" << std::endl;
    }
    
    void connect() {
        std::string host = resourceManager.getResource("database.host", "localhost");
        std::string port = resourceManager.getResource("database.port", "5432");
        std::string dbName = resourceManager.getResource("database.name", "default");
        std::string poolSize = resourceManager.getResource("database.pool_size", "5");
        
        connectionString = "postgresql://" + host + ":" + port + "/" + dbName;
        
        std::cout << "🔌 Connecting to database..." << std::endl;
        std::cout << "   Host: " << host << ":" << port << std::endl;
        std::cout << "   Database: " << dbName << std::endl;
        std::cout << "   Pool size: " << poolSize << std::endl;
        
        // Simulate connection delay
        std::this_thread::sleep_for(std::chrono::milliseconds(100));
        
        connected = true;
        std::cout << "✅ Connected to database successfully" << std::endl;
    }
    
    void disconnect() {
        if (connected) {
            connected = false;
            std::cout << "🔌 Disconnected from database" << std::endl;
        }
    }
    
    std::string getConnectionString() const {
        return connectionString;
    }
    
    bool isConnected() const {
        return connected;
    }
};

class CacheManager {
private:
    ResourceManager& resourceManager;
    std::map<std::string, std::string> cache;
    size_t maxEntries;
    int ttl;
    bool enabled;
    
public:
    CacheManager() : resourceManager(ResourceManager::getInstance()) {
        initialize();
    }
    
    void initialize() {
        enabled = resourceManager.getResource("cache.enabled", "true") == "true";
        ttl = std::stoi(resourceManager.getResource("cache.ttl", "3600"));
        maxEntries = std::stoull(resourceManager.getResource("cache.max_entries", "1000"));
        
        std::cout << "🧠 Cache Manager initialized:" << std::endl;
        std::cout << "   Enabled: " << (enabled ? "Yes" : "No") << std::endl;
        std::cout << "   TTL: " << ttl << " seconds" << std::endl;
        std::cout << "   Max entries: " << maxEntries << std::endl;
    }
    
    void put(const std::string& key, const std::string& value) {
        if (!enabled) return;
        
        if (cache.size() >= maxEntries) {
            cache.clear(); // Simple eviction strategy
            std::cout << "🗑️  Cache cleared due to size limit" << std::endl;
        }
        
        cache[key] = value;
        std::cout << "📝 Cached: " << key << " = " << value << std::endl;
    }
    
    std::string get(const std::string& key) {
        if (!enabled) return "";
        
        auto it = cache.find(key);
        if (it != cache.end()) {
            std::cout << "🎯 Cache hit: " << key << std::endl;
            return it->second;
        }
        
        std::cout << "❌ Cache miss: " << key << std::endl;
        return "";
    }
    
    void printStatus() const {
        std::cout << "🧠 Cache Status:" << std::endl;
        std::cout << "   Enabled: " << (enabled ? "Yes" : "No") << std::endl;
        std::cout << "   Entries: " << cache.size() << "/" << maxEntries << std::endl;
        std::cout << "   TTL: " << ttl << "s" << std::endl;
    }
};

// Thread worker function for testing thread safety
void resourceWorker(int workerId, int operationCount) {
    ResourceManager& rm = ResourceManager::getInstance();
    
    std::cout << "🏃 Worker " << workerId << " started on thread " 
              << std::this_thread::get_id() << std::endl;
    
    for (int i = 0; i < operationCount; ++i) {
        // Read operations
        std::string systemName = rm.getResource("system.name");
        std::string dbHost = rm.getResource("database.host");
        
        // Write operations
        rm.setResource("worker" + std::to_string(workerId) + ".counter", std::to_string(i));
        rm.setResource("worker" + std::to_string(workerId) + ".thread", 
                      std::to_string(std::hash<std::thread::id>{}(std::this_thread::get_id())));
        
        // Small delay to allow thread interleaving
        std::this_thread::sleep_for(std::chrono::milliseconds(10));
    }
    
    std::cout << "✅ Worker " << workerId << " completed " << operationCount << " operations" << std::endl;
}

int main() {
    std::cout << "=== Singleton Pattern Demo - Resource Manager ===\n" << std::endl;
    
    // Demonstrate singleton behavior
    std::cout << "1. Demonstrating Singleton Behavior:" << std::endl;
    ResourceManager& rm1 = ResourceManager::getInstance();
    ResourceManager& rm2 = ResourceManager::getInstance();
    
    std::cout << "rm1 == rm2: " << (&rm1 == &rm2 ? "true" : "false") << std::endl;
    std::cout << "rm1 address: " << &rm1 << std::endl;
    std::cout << "rm2 address: " << &rm2 << std::endl;
    
    // Basic resource operations
    std::cout << "\n2. Basic Resource Operations:" << std::endl;
    
    std::cout << "System name: " << rm1.getResource("system.name") << std::endl;
    std::cout << "Database host: " << rm1.getResource("database.host") << std::endl;
    std::cout << "Non-existent resource: '" << rm1.getResource("non.existent", "default") << "'" << std::endl;
    
    // Set new resources
    rm1.setResource("system.version", "2.0.0");
    rm1.setResource("feature.newfeature", "enabled");
    
    std::cout << "Updated system version: " << rm1.getResource("system.version") << std::endl;
    
    // Configuration sections
    std::cout << "\n3. Configuration Sections:" << std::endl;
    
    std::cout << "Database configuration:" << std::endl;
    auto dbConfig = rm1.getResourcesByPrefix("database.");
    for (const auto& pair : dbConfig) {
        std::cout << "  " << pair.first << " = " << pair.second << std::endl;
    }
    
    std::cout << "\nCache configuration:" << std::endl;
    auto cacheConfig = rm1.getResourcesByPrefix("cache.");
    for (const auto& pair : cacheConfig) {
        std::cout << "  " << pair.first << " = " << pair.second << std::endl;
    }
    
    // Services using the singleton
    std::cout << "\n4. Services Using Resource Manager:" << std::endl;
    
    DatabaseConnection dbConn;
    dbConn.connect();
    std::cout << "Connection string: " << dbConn.getConnectionString() << std::endl;
    
    CacheManager cacheManager;
    cacheManager.put("user:123", "John Doe");
    cacheManager.put("user:456", "Jane Smith");
    std::string user = cacheManager.get("user:123");
    cacheManager.printStatus();
    
    // File operations
    std::cout << "\n5. File Operations:" << std::endl;
    
    // Save current configuration
    rm1.saveToFile("demo_resources.conf");
    
    // Modify configuration
    rm1.setResource("temp.value", "temporary");
    std::cout << "Temp value before reload: " << rm1.getResource("temp.value") << std::endl;
    
    // Reload from file (temp.value should be gone)
    rm1.loadFromFile("demo_resources.conf");
    std::cout << "Temp value after reload: '" << rm1.getResource("temp.value", "not found") << "'" << std::endl;
    
    // Thread safety demonstration
    std::cout << "\n6. Thread Safety Demonstration:" << std::endl;
    
    const int threadCount = 5;
    const int operationsPerThread = 5;
    std::vector<std::thread> threads;
    
    auto startTime = std::chrono::high_resolution_clock::now();
    
    // Create and start threads
    for (int i = 0; i < threadCount; ++i) {
        threads.emplace_back(resourceWorker, i, operationsPerThread);
    }
    
    // Wait for all threads to complete
    for (auto& thread : threads) {
        thread.join();
    }
    
    auto endTime = std::chrono::high_resolution_clock::now();
    auto duration = std::chrono::duration_cast<std::chrono::milliseconds>(endTime - startTime);
    
    std::cout << "⏱️  Thread test completed in " << duration.count() << "ms" << std::endl;
    
    // Statistics
    std::cout << "\n7. Resource Manager Statistics:" << std::endl;
    
    auto stats = rm1.getStatistics();
    std::cout << "Total resources: " << stats.totalResources << std::endl;
    std::cout << "Access count: " << stats.accessCount << std::endl;
    std::cout << "Loaded sources: " << stats.loadedSources << std::endl;
    std::cout << "Current thread: " << stats.threadId << std::endl;
    std::cout << "Initialized: " << (stats.initialized ? "Yes" : "No") << std::endl;
    
    // Print full configuration
    std::cout << "\n8. Full Configuration:" << std::endl;
    rm1.printConfiguration();
    
    // Test resource removal
    std::cout << "\n9. Resource Management:" << std::endl;
    rm1.removeResource("temp.removed");
    rm1.setResource("temp.test", "test_value");
    std::cout << "Has temp.test: " << (rm1.hasResource("temp.test") ? "Yes" : "No") << std::endl;
    rm1.removeResource("temp.test");
    std::cout << "Has temp.test after removal: " << (rm1.hasResource("temp.test") ? "Yes" : "No") << std::endl;
    
    // Cleanup demonstration
    std::cout << "\n10. Cleanup Operations:" << std::endl;
    std::cout << "Resources before clear: " << stats.totalResources << std::endl;
    rm1.clearResources();
    auto finalStats = rm1.getStatistics();
    std::cout << "Resources after clear: " << finalStats.totalResources << std::endl;
    
    // Cleanup services
    dbConn.disconnect();
    
    std::cout << "\n✅ Singleton pattern successfully demonstrated!" << std::endl;
    std::cout << "Benefits: Single instance, thread safety, global resource access, lazy initialization" << std::endl;
    
    std::cout << "\nFinal access count: " << rm1.getStatistics().accessCount << std::endl;
    
    return 0;
}
