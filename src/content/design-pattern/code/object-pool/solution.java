/**
 * Object Pool Pattern - Database Connection Pool Example
 * Manages a pool of expensive-to-create objects for reuse, improving performance
 */

import java.util.*;
import java.util.concurrent.*;
import java.util.concurrent.locks.ReentrantLock;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

// Poolable object interface
interface PoolableObject {
    void reset();
    boolean isValid();
    String getId();
    LocalDateTime getCreatedAt();
    LocalDateTime getLastUsedAt();
}

// Concrete poolable object - Database Connection
class DatabaseConnection implements PoolableObject {
    private final String connectionId;
    private final String connectionString;
    private final LocalDateTime createdAt;
    private LocalDateTime lastUsedAt;
    private boolean connected;
    private int queryCount;
    private String currentDatabase;
    
    public DatabaseConnection(String connectionId, String host, int port, String database) {
        this.connectionId = connectionId;
        this.connectionString = String.format("jdbc:postgresql://%s:%d/%s", host, port, database);
        this.createdAt = LocalDateTime.now();
        this.lastUsedAt = LocalDateTime.now();
        this.connected = false;
        this.queryCount = 0;
        this.currentDatabase = database;
        
        // Simulate expensive connection creation
        try {
            Thread.sleep(100); // Simulate network delay
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
        
        System.out.println("🔗 Created new database connection: " + connectionId);
    }
    
    @Override
    public void reset() {
        this.lastUsedAt = LocalDateTime.now();
        this.connected = false;
        this.queryCount = 0;
        System.out.println("🔄 Reset connection: " + connectionId);
    }
    
    @Override
    public boolean isValid() {
        // Simulate connection validation
        long minutesSinceCreation = java.time.Duration.between(createdAt, LocalDateTime.now()).toMinutes();
        return minutesSinceCreation < 30; // Connection expires after 30 minutes
    }
    
    @Override
    public String getId() {
        return connectionId;
    }
    
    @Override
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    
    @Override
    public LocalDateTime getLastUsedAt() {
        return lastUsedAt;
    }
    
    // Database-specific methods
    public void connect() {
        if (!connected) {
            connected = true;
            lastUsedAt = LocalDateTime.now();
            System.out.println("📡 Connected to database via " + connectionId);
        }
    }
    
    public void disconnect() {
        if (connected) {
            connected = false;
            System.out.println("📡 Disconnected from database via " + connectionId);
        }
    }
    
    public void executeQuery(String query) {
        if (!connected) {
            throw new IllegalStateException("Connection not established");
        }
        
        queryCount++;
        lastUsedAt = LocalDateTime.now();
        System.out.println("🔍 Executing query on " + connectionId + ": " + query);
        
        // Simulate query execution time
        try {
            Thread.sleep(50);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
    }
    
    public String getConnectionString() {
        return connectionString;
    }
    
    public boolean isConnected() {
        return connected;
    }
    
    public int getQueryCount() {
        return queryCount;
    }
    
    public String getStatus() {
        return String.format("Connection{id=%s, connected=%s, queries=%d, created=%s, lastUsed=%s}",
                connectionId, connected, queryCount,
                createdAt.format(DateTimeFormatter.ofPattern("HH:mm:ss")),
                lastUsedAt.format(DateTimeFormatter.ofPattern("HH:mm:ss")));
    }
}

// Generic Object Pool implementation
class ObjectPool<T extends PoolableObject> {
    private final Queue<T> availableObjects;
    private final Set<T> inUseObjects;
    private final int maxPoolSize;
    private final int minPoolSize;
    private final ReentrantLock lock;
    private final ObjectFactory<T> factory;
    private final ScheduledExecutorService cleanupExecutor;
    
    // Statistics
    private int totalCreated;
    private int totalAcquired;
    private int totalReturned;
    private int totalExpired;
    
    public interface ObjectFactory<T> {
        T createObject();
    }
    
    public ObjectPool(ObjectFactory<T> factory, int minPoolSize, int maxPoolSize) {
        this.factory = factory;
        this.minPoolSize = minPoolSize;
        this.maxPoolSize = maxPoolSize;
        this.availableObjects = new LinkedList<>();
        this.inUseObjects = new HashSet<>();
        this.lock = new ReentrantLock();
        this.cleanupExecutor = Executors.newSingleThreadScheduledExecutor();
        
        this.totalCreated = 0;
        this.totalAcquired = 0;
        this.totalReturned = 0;
        this.totalExpired = 0;
        
        // Initialize with minimum objects
        initializePool();
        
        // Schedule periodic cleanup
        scheduleCleanup();
        
        System.out.println("🏊 Object Pool initialized: min=" + minPoolSize + ", max=" + maxPoolSize);
    }
    
    private void initializePool() {
        lock.lock();
        try {
            for (int i = 0; i < minPoolSize; i++) {
                T obj = factory.createObject();
                availableObjects.offer(obj);
                totalCreated++;
            }
            System.out.println("🏊 Pool initialized with " + minPoolSize + " objects");
        } finally {
            lock.unlock();
        }
    }
    
    public T acquire() throws InterruptedException {
        return acquire(5, TimeUnit.SECONDS);
    }
    
    public T acquire(long timeout, TimeUnit unit) throws InterruptedException {
        long timeoutMillis = unit.toMillis(timeout);
        long startTime = System.currentTimeMillis();
        
        lock.lock();
        try {
            while (true) {
                // Try to get an available object
                T obj = availableObjects.poll();
                
                if (obj != null) {
                    if (obj.isValid()) {
                        inUseObjects.add(obj);
                        totalAcquired++;
                        System.out.println("✅ Acquired object from pool: " + obj.getId());
                        return obj;
                    } else {
                        // Object expired, don't return it to pool
                        totalExpired++;
                        System.out.println("⏰ Object expired and removed: " + obj.getId());
                        continue;
                    }
                }
                
                // No available objects, try to create new one
                if (getTotalObjects() < maxPoolSize) {
                    obj = factory.createObject();
                    inUseObjects.add(obj);
                    totalCreated++;
                    totalAcquired++;
                    System.out.println("🆕 Created new object for immediate use: " + obj.getId());
                    return obj;
                }
                
                // Pool is full, wait for an object to be returned
                long elapsed = System.currentTimeMillis() - startTime;
                if (elapsed >= timeoutMillis) {
                    throw new RuntimeException("Timeout waiting for object from pool");
                }
                
                System.out.println("⏳ Pool exhausted, waiting for available object...");
                Thread.sleep(100); // Wait a bit before retrying
            }
        } finally {
            lock.unlock();
        }
    }
    
    public void release(T obj) {
        if (obj == null) {
            return;
        }
        
        lock.lock();
        try {
            if (inUseObjects.remove(obj)) {
                if (obj.isValid()) {
                    obj.reset();
                    availableObjects.offer(obj);
                    totalReturned++;
                    System.out.println("🔄 Returned object to pool: " + obj.getId());
                } else {
                    totalExpired++;
                    System.out.println("⏰ Object expired on return: " + obj.getId());
                }
            } else {
                System.out.println("⚠️  Attempted to return object not from this pool: " + obj.getId());
            }
        } finally {
            lock.unlock();
        }
    }
    
    private void scheduleCleanup() {
        cleanupExecutor.scheduleAtFixedRate(() -> {
            cleanupExpiredObjects();
            ensureMinimumSize();
        }, 10, 10, TimeUnit.SECONDS);
    }
    
    private void cleanupExpiredObjects() {
        lock.lock();
        try {
            Iterator<T> iterator = availableObjects.iterator();
            int removedCount = 0;
            
            while (iterator.hasNext()) {
                T obj = iterator.next();
                if (!obj.isValid()) {
                    iterator.remove();
                    removedCount++;
                    totalExpired++;
                }
            }
            
            if (removedCount > 0) {
                System.out.println("🧹 Cleaned up " + removedCount + " expired objects from pool");
            }
        } finally {
            lock.unlock();
        }
    }
    
    private void ensureMinimumSize() {
        lock.lock();
        try {
            int currentAvailable = availableObjects.size();
            int totalCurrent = getTotalObjects();
            
            if (currentAvailable < minPoolSize && totalCurrent < maxPoolSize) {
                int toCreate = Math.min(minPoolSize - currentAvailable, maxPoolSize - totalCurrent);
                
                for (int i = 0; i < toCreate; i++) {
                    T obj = factory.createObject();
                    availableObjects.offer(obj);
                    totalCreated++;
                }
                
                if (toCreate > 0) {
                    System.out.println("📈 Added " + toCreate + " objects to maintain minimum pool size");
                }
            }
        } finally {
            lock.unlock();
        }
    }
    
    public PoolStatistics getStatistics() {
        lock.lock();
        try {
            return new PoolStatistics(
                availableObjects.size(),
                inUseObjects.size(),
                getTotalObjects(),
                maxPoolSize,
                totalCreated,
                totalAcquired,
                totalReturned,
                totalExpired
            );
        } finally {
            lock.unlock();
        }
    }
    
    private int getTotalObjects() {
        return availableObjects.size() + inUseObjects.size();
    }
    
    public void shutdown() {
        cleanupExecutor.shutdown();
        try {
            if (!cleanupExecutor.awaitTermination(5, TimeUnit.SECONDS)) {
                cleanupExecutor.shutdownNow();
            }
        } catch (InterruptedException e) {
            cleanupExecutor.shutdownNow();
        }
        
        lock.lock();
        try {
            System.out.println("🔚 Pool shutdown. Final statistics:");
            System.out.println(getStatistics());
        } finally {
            lock.unlock();
        }
    }
    
    // Statistics class
    public static class PoolStatistics {
        private final int availableCount;
        private final int inUseCount;
        private final int totalCount;
        private final int maxPoolSize;
        private final int totalCreated;
        private final int totalAcquired;
        private final int totalReturned;
        private final int totalExpired;
        
        public PoolStatistics(int availableCount, int inUseCount, int totalCount, int maxPoolSize,
                             int totalCreated, int totalAcquired, int totalReturned, int totalExpired) {
            this.availableCount = availableCount;
            this.inUseCount = inUseCount;
            this.totalCount = totalCount;
            this.maxPoolSize = maxPoolSize;
            this.totalCreated = totalCreated;
            this.totalAcquired = totalAcquired;
            this.totalReturned = totalReturned;
            this.totalExpired = totalExpired;
        }
        
        @Override
        public String toString() {
            return String.format("""
                Pool Statistics:
                ├─ Available: %d
                ├─ In Use: %d
                ├─ Total: %d/%d (%.1f%% utilization)
                ├─ Total Created: %d
                ├─ Total Acquired: %d
                ├─ Total Returned: %d
                ├─ Total Expired: %d
                └─ Efficiency: %.1f%% (reuse rate)
                """,
                availableCount, inUseCount, totalCount, maxPoolSize,
                (totalCount * 100.0 / maxPoolSize),
                totalCreated, totalAcquired, totalReturned, totalExpired,
                totalAcquired > 0 ? (totalReturned * 100.0 / totalAcquired) : 0.0
            );
        }
        
        // Getters
        public int getAvailableCount() { return availableCount; }
        public int getInUseCount() { return inUseCount; }
        public int getTotalCount() { return totalCount; }
        public double getUtilizationPercentage() { return totalCount * 100.0 / maxPoolSize; }
    }
}

// Example client class using the pool
class DatabaseService {
    private final ObjectPool<DatabaseConnection> connectionPool;
    
    public DatabaseService(ObjectPool<DatabaseConnection> connectionPool) {
        this.connectionPool = connectionPool;
    }
    
    public void performDatabaseOperation(String operation) {
        DatabaseConnection connection = null;
        
        try {
            System.out.println("🔄 Starting database operation: " + operation);
            connection = connectionPool.acquire();
            
            connection.connect();
            connection.executeQuery("SELECT * FROM users WHERE operation = '" + operation + "'");
            connection.executeQuery("UPDATE statistics SET count = count + 1 WHERE operation = '" + operation + "'");
            connection.disconnect();
            
            System.out.println("✅ Completed database operation: " + operation);
            
        } catch (Exception e) {
            System.err.println("❌ Database operation failed: " + e.getMessage());
        } finally {
            if (connection != null) {
                connectionPool.release(connection);
            }
        }
    }
    
    public void performBatchOperations(List<String> operations) {
        System.out.println("📦 Starting batch operations (" + operations.size() + " operations)");
        
        for (String operation : operations) {
            performDatabaseOperation(operation);
        }
        
        System.out.println("✅ Completed batch operations");
    }
}

// Worker thread for testing concurrent access
class DatabaseWorker implements Runnable {
    private final DatabaseService dbService;
    private final String workerName;
    private final int operationCount;
    
    public DatabaseWorker(DatabaseService dbService, String workerName, int operationCount) {
        this.dbService = dbService;
        this.workerName = workerName;
        this.operationCount = operationCount;
    }
    
    @Override
    public void run() {
        System.out.println("🏃 " + workerName + " started");
        
        List<String> operations = new ArrayList<>();
        for (int i = 1; i <= operationCount; i++) {
            operations.add(workerName + "_operation_" + i);
        }
        
        dbService.performBatchOperations(operations);
        
        System.out.println("✅ " + workerName + " completed");
    }
}

public class ObjectPoolPatternDemo {
    public static void main(String[] args) {
        System.out.println("=== Object Pool Pattern Demo - Database Connection Pool ===\n");
        
        // Create connection pool with factory
        ObjectPool.ObjectFactory<DatabaseConnection> connectionFactory = () -> {
            String connectionId = "conn_" + System.currentTimeMillis() + "_" + 
                                 (int)(Math.random() * 1000);
            return new DatabaseConnection(connectionId, "localhost", 5432, "testdb");
        };
        
        ObjectPool<DatabaseConnection> connectionPool = new ObjectPool<>(connectionFactory, 3, 8);
        
        System.out.println("\n1. Basic Pool Operations:");
        
        try {
            // Test basic acquire and release
            DatabaseConnection conn1 = connectionPool.acquire();
            DatabaseConnection conn2 = connectionPool.acquire();
            
            System.out.println("Acquired connections:");
            System.out.println("  " + conn1.getStatus());
            System.out.println("  " + conn2.getStatus());
            
            System.out.println("\nPool statistics after acquisition:");
            System.out.println(connectionPool.getStatistics());
            
            // Use the connections
            conn1.connect();
            conn1.executeQuery("SELECT 1");
            conn1.disconnect();
            
            conn2.connect();
            conn2.executeQuery("SELECT COUNT(*) FROM users");
            conn2.disconnect();
            
            // Return connections to pool
            connectionPool.release(conn1);
            connectionPool.release(conn2);
            
            System.out.println("Pool statistics after release:");
            System.out.println(connectionPool.getStatistics());
            
        } catch (InterruptedException e) {
            System.err.println("Interrupted while acquiring connection: " + e.getMessage());
        }
        
        System.out.println("\n2. Database Service Usage:");
        
        // Create database service using the pool
        DatabaseService dbService = new DatabaseService(connectionPool);
        
        // Perform some database operations
        dbService.performDatabaseOperation("user_login");
        dbService.performDatabaseOperation("data_export");
        dbService.performDatabaseOperation("report_generation");
        
        System.out.println("\nPool statistics after service operations:");
        System.out.println(connectionPool.getStatistics());
        
        System.out.println("\n3. Concurrent Access Testing:");
        
        // Test with multiple threads
        ExecutorService executor = Executors.newFixedThreadPool(5);
        
        long startTime = System.currentTimeMillis();
        
        // Submit multiple workers
        for (int i = 1; i <= 4; i++) {
            executor.submit(new DatabaseWorker(dbService, "Worker-" + i, 3));
        }
        
        // Wait for completion
        executor.shutdown();
        try {
            if (!executor.awaitTermination(30, TimeUnit.SECONDS)) {
                executor.shutdownNow();
            }
        } catch (InterruptedException e) {
            executor.shutdownNow();
        }
        
        long endTime = System.currentTimeMillis();
        
        System.out.println("\n⏱️  Concurrent operations completed in " + (endTime - startTime) + "ms");
        
        System.out.println("\n4. Final Pool Statistics:");
        ObjectPool.PoolStatistics stats = connectionPool.getStatistics();
        System.out.println(stats);
        
        System.out.println("\n5. Pool Utilization Analysis:");
        System.out.printf("Pool Efficiency: %.1f%% utilization\n", stats.getUtilizationPercentage());
        System.out.printf("Object Reuse Rate: %.1f%%\n", 
            stats.getInUseCount() > 0 ? (stats.getTotalCount() * 100.0 / stats.getInUseCount()) : 100.0);
        
        // Test pool exhaustion
        System.out.println("\n6. Testing Pool Exhaustion:");
        List<DatabaseConnection> heldConnections = new ArrayList<>();
        
        try {
            // Acquire all available connections
            for (int i = 0; i < 8; i++) {
                DatabaseConnection conn = connectionPool.acquire();
                heldConnections.add(conn);
                System.out.println("Acquired connection " + (i + 1) + "/8: " + conn.getId());
            }
            
            System.out.println("Pool is now exhausted:");
            System.out.println(connectionPool.getStatistics());
            
            // Try to acquire one more (should timeout)
            try {
                DatabaseConnection extraConn = connectionPool.acquire(2, TimeUnit.SECONDS);
                System.out.println("ERROR: Should not have acquired extra connection!");
                connectionPool.release(extraConn);
            } catch (RuntimeException e) {
                System.out.println("✅ Expected timeout: " + e.getMessage());
            }
            
        } catch (InterruptedException e) {
            System.err.println("Interrupted during exhaustion test: " + e.getMessage());
        } finally {
            // Release all held connections
            for (DatabaseConnection conn : heldConnections) {
                connectionPool.release(conn);
            }
        }
        
        System.out.println("\n7. Pool After Releasing All Connections:");
        System.out.println(connectionPool.getStatistics());
        
        // Wait a bit to see cleanup in action
        System.out.println("\n8. Testing Automatic Cleanup (waiting 15 seconds)...");
        try {
            Thread.sleep(15000);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
        
        System.out.println("Pool statistics after cleanup period:");
        System.out.println(connectionPool.getStatistics());
        
        // Shutdown pool
        connectionPool.shutdown();
        
        System.out.println("\n✅ Object Pool pattern successfully demonstrated!");
        System.out.println("Benefits: Resource reuse, performance optimization, controlled resource allocation, automatic cleanup");
    }
}
