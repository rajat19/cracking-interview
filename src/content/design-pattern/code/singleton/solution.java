/**
 * Singleton Pattern - Application Logger System
 * Ensures only one instance of the logger exists throughout the application with thread-safety
 */

import java.util.*;
import java.util.concurrent.*;
import java.io.*;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

// Thread-safe Singleton Logger implementation
class Logger {
    // Volatile ensures that changes to the instance are visible across threads
    private static volatile Logger instance;
    
    // Configuration and state
    private final List<String> logHistory;
    private LogLevel currentLevel;
    private boolean enableConsoleOutput;
    private boolean enableFileOutput;
    private String logFileName;
    private final Object lockObject; // For synchronizing log operations
    
    public enum LogLevel {
        DEBUG(0, "DEBUG", "🐛"),
        INFO(1, "INFO", "ℹ️"),
        WARN(2, "WARN", "⚠️"),
        ERROR(3, "ERROR", "❌"),
        FATAL(4, "FATAL", "💀");
        
        private final int priority;
        private final String name;
        private final String emoji;
        
        LogLevel(int priority, String name, String emoji) {
            this.priority = priority;
            this.name = name;
            this.emoji = emoji;
        }
        
        public int getPriority() { return priority; }
        public String getName() { return name; }
        public String getEmoji() { return emoji; }
    }
    
    // Private constructor prevents direct instantiation
    private Logger() {
        this.logHistory = new ArrayList<>();
        this.currentLevel = LogLevel.INFO;
        this.enableConsoleOutput = true;
        this.enableFileOutput = false;
        this.logFileName = "application.log";
        this.lockObject = new Object();
        
        // Log the logger initialization
        logMessage(LogLevel.INFO, "Logger", "Logger initialized with default configuration");
    }
    
    // Thread-safe lazy initialization using double-checked locking
    public static Logger getInstance() {
        // First check without synchronization for performance
        if (instance == null) {
            synchronized (Logger.class) {
                // Second check with synchronization
                if (instance == null) {
                    instance = new Logger();
                }
            }
        }
        return instance;
    }
    
    // Core logging method with thread safety
    private void logMessage(LogLevel level, String className, String message) {
        if (level.getPriority() < currentLevel.getPriority()) {
            return; // Skip if below current log level
        }
        
        synchronized (lockObject) {
            String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss.SSS"));
            String threadName = Thread.currentThread().getName();
            String formattedMessage = String.format("[%s] [%s] [%s] %s %s: %s",
                timestamp, threadName, level.getName(), level.getEmoji(), className, message);
            
            // Add to history
            logHistory.add(formattedMessage);
            
            // Console output
            if (enableConsoleOutput) {
                System.out.println(formattedMessage);
            }
            
            // File output
            if (enableFileOutput) {
                writeToFile(formattedMessage);
            }
        }
    }
    
    // Public logging methods
    public void debug(String className, String message) {
        logMessage(LogLevel.DEBUG, className, message);
    }
    
    public void info(String className, String message) {
        logMessage(LogLevel.INFO, className, message);
    }
    
    public void warn(String className, String message) {
        logMessage(LogLevel.WARN, className, message);
    }
    
    public void error(String className, String message) {
        logMessage(LogLevel.ERROR, className, message);
    }
    
    public void fatal(String className, String message) {
        logMessage(LogLevel.FATAL, className, message);
    }
    
    // Convenience methods with automatic class detection
    public void info(String message) {
        StackTraceElement caller = Thread.currentThread().getStackTrace()[2];
        info(caller.getClassName(), message);
    }
    
    public void error(String message) {
        StackTraceElement caller = Thread.currentThread().getStackTrace()[2];
        error(caller.getClassName(), message);
    }
    
    public void warn(String message) {
        StackTraceElement caller = Thread.currentThread().getStackTrace()[2];
        warn(caller.getClassName(), message);
    }
    
    // Configuration methods
    public void setLogLevel(LogLevel level) {
        synchronized (lockObject) {
            LogLevel oldLevel = this.currentLevel;
            this.currentLevel = level;
            info("Logger", "Log level changed from " + oldLevel.getName() + " to " + level.getName());
        }
    }
    
    public void enableConsoleOutput(boolean enable) {
        synchronized (lockObject) {
            this.enableConsoleOutput = enable;
            if (enable) {
                info("Logger", "Console output enabled");
            }
        }
    }
    
    public void enableFileOutput(boolean enable) {
        enableFileOutput(enable, logFileName);
    }
    
    public void enableFileOutput(boolean enable, String fileName) {
        synchronized (lockObject) {
            this.enableFileOutput = enable;
            if (fileName != null && !fileName.isEmpty()) {
                this.logFileName = fileName;
            }
            if (enable) {
                info("Logger", "File output enabled: " + this.logFileName);
            } else {
                info("Logger", "File output disabled");
            }
        }
    }
    
    // File writing helper
    private void writeToFile(String message) {
        try (FileWriter writer = new FileWriter(logFileName, true);
             BufferedWriter bufferedWriter = new BufferedWriter(writer)) {
            bufferedWriter.write(message);
            bufferedWriter.newLine();
        } catch (IOException e) {
            System.err.println("Failed to write to log file: " + e.getMessage());
        }
    }
    
    // Statistics and information methods
    public int getLogCount() {
        synchronized (lockObject) {
            return logHistory.size();
        }
    }
    
    public List<String> getRecentLogs(int count) {
        synchronized (lockObject) {
            int size = logHistory.size();
            int startIndex = Math.max(0, size - count);
            return new ArrayList<>(logHistory.subList(startIndex, size));
        }
    }
    
    public void clearLogs() {
        synchronized (lockObject) {
            int previousCount = logHistory.size();
            logHistory.clear();
            info("Logger", "Cleared " + previousCount + " log entries");
        }
    }
    
    public String getConfiguration() {
        synchronized (lockObject) {
            return String.format("""
                Logger Configuration:
                ├─ Current Level: %s (%s)
                ├─ Console Output: %s
                ├─ File Output: %s
                ├─ Log File: %s
                ├─ Total Logs: %d
                └─ Thread ID: %s
                """,
                currentLevel.getName(), currentLevel.getEmoji(),
                enableConsoleOutput ? "Enabled" : "Disabled",
                enableFileOutput ? "Enabled" : "Disabled",
                logFileName,
                logHistory.size(),
                Thread.currentThread().getName()
            );
        }
    }
    
    // Prevent cloning
    @Override
    protected Object clone() throws CloneNotSupportedException {
        throw new CloneNotSupportedException("Cannot clone Singleton Logger instance");
    }
}

// Example classes to demonstrate logging usage
class DatabaseConnection {
    private String connectionString;
    private boolean connected;
    
    public DatabaseConnection(String connectionString) {
        this.connectionString = connectionString;
        this.connected = false;
        Logger.getInstance().info("DatabaseConnection", "Created new database connection: " + connectionString);
    }
    
    public void connect() {
        Logger logger = Logger.getInstance();
        try {
            logger.info("DatabaseConnection", "Attempting to connect to database...");
            
            // Simulate connection process
            Thread.sleep(100);
            
            if (connectionString.contains("invalid")) {
                throw new RuntimeException("Invalid connection string");
            }
            
            connected = true;
            logger.info("DatabaseConnection", "Successfully connected to database");
            
        } catch (InterruptedException e) {
            logger.error("DatabaseConnection", "Connection interrupted: " + e.getMessage());
        } catch (RuntimeException e) {
            logger.error("DatabaseConnection", "Connection failed: " + e.getMessage());
            throw e;
        }
    }
    
    public void disconnect() {
        Logger logger = Logger.getInstance();
        if (connected) {
            connected = false;
            logger.info("DatabaseConnection", "Disconnected from database");
        } else {
            logger.warn("DatabaseConnection", "Attempted to disconnect but connection was not active");
        }
    }
    
    public void executeQuery(String query) {
        Logger logger = Logger.getInstance();
        if (!connected) {
            logger.error("DatabaseConnection", "Cannot execute query - not connected to database");
            return;
        }
        
        logger.debug("DatabaseConnection", "Executing query: " + query);
        logger.info("DatabaseConnection", "Query executed successfully");
    }
}

class UserService {
    public void createUser(String username, String email) {
        Logger logger = Logger.getInstance();
        logger.info("UserService", "Creating new user: " + username);
        
        if (username == null || username.isEmpty()) {
            logger.error("UserService", "Username cannot be null or empty");
            throw new IllegalArgumentException("Username cannot be null or empty");
        }
        
        if (!email.contains("@")) {
            logger.warn("UserService", "Email format appears invalid: " + email);
        }
        
        logger.debug("UserService", "Validating user data...");
        logger.info("UserService", "User created successfully: " + username);
    }
    
    public void deleteUser(String username) {
        Logger logger = Logger.getInstance();
        logger.warn("UserService", "Deleting user: " + username);
        logger.info("UserService", "User deleted: " + username);
    }
}

// Thread test to demonstrate singleton behavior
class LoggingWorker implements Runnable {
    private final String workerName;
    private final int messageCount;
    
    public LoggingWorker(String workerName, int messageCount) {
        this.workerName = workerName;
        this.messageCount = messageCount;
    }
    
    @Override
    public void run() {
        Logger logger = Logger.getInstance();
        
        for (int i = 1; i <= messageCount; i++) {
            logger.info("LoggingWorker", workerName + " - Message " + i);
            
            try {
                Thread.sleep(10); // Small delay to interleave messages
            } catch (InterruptedException e) {
                logger.error("LoggingWorker", workerName + " interrupted");
                break;
            }
        }
        
        logger.info("LoggingWorker", workerName + " completed " + messageCount + " messages");
    }
}

public class SingletonPatternDemo {
    public static void main(String[] args) {
        System.out.println("=== Singleton Pattern Demo - Application Logger ===\n");
        
        // Demonstrate singleton behavior
        System.out.println("1. Demonstrating Singleton Behavior:");
        Logger logger1 = Logger.getInstance();
        Logger logger2 = Logger.getInstance();
        
        System.out.println("Logger1 == Logger2: " + (logger1 == logger2));
        System.out.println("Logger1.hashCode(): " + logger1.hashCode());
        System.out.println("Logger2.hashCode(): " + logger2.hashCode());
        
        // Configure the logger
        logger1.info("SingletonPatternDemo", "Starting singleton pattern demonstration");
        logger1.setLogLevel(Logger.LogLevel.DEBUG);
        logger1.enableFileOutput(true, "demo.log");
        
        System.out.println("\n" + logger1.getConfiguration());
        
        System.out.println("\n2. Basic Logging Operations:");
        
        // Basic logging
        logger1.debug("SingletonPatternDemo", "This is a debug message");
        logger1.info("SingletonPatternDemo", "Application started successfully");
        logger1.warn("SingletonPatternDemo", "This is a warning message");
        logger1.error("SingletonPatternDemo", "This is an error message");
        
        System.out.println("\n3. Real-world Usage Examples:");
        
        // Database operations
        DatabaseConnection db = new DatabaseConnection("jdbc:mysql://localhost:3306/testdb");
        try {
            db.connect();
            db.executeQuery("SELECT * FROM users");
            db.executeQuery("INSERT INTO users (name) VALUES ('John')");
            db.disconnect();
        } catch (Exception e) {
            Logger.getInstance().fatal("SingletonPatternDemo", "Database operation failed: " + e.getMessage());
        }
        
        // User service operations
        UserService userService = new UserService();
        try {
            userService.createUser("john_doe", "john@example.com");
            userService.createUser("jane_smith", "invalid-email");
            userService.deleteUser("old_user");
        } catch (Exception e) {
            Logger.getInstance().error("SingletonPatternDemo", "User service error: " + e.getMessage());
        }
        
        System.out.println("\n4. Thread Safety Demonstration:");
        
        // Test thread safety with multiple threads
        ExecutorService executor = Executors.newFixedThreadPool(5);
        
        // Submit multiple logging tasks
        for (int i = 1; i <= 3; i++) {
            executor.submit(new LoggingWorker("Worker-" + i, 3));
        }
        
        // Wait for completion
        executor.shutdown();
        try {
            if (!executor.awaitTermination(5, TimeUnit.SECONDS)) {
                executor.shutdownNow();
            }
        } catch (InterruptedException e) {
            executor.shutdownNow();
            Logger.getInstance().error("SingletonPatternDemo", "Thread execution interrupted");
        }
        
        System.out.println("\n5. Logger Statistics:");
        Logger logger = Logger.getInstance();
        System.out.println("Total log entries: " + logger.getLogCount());
        
        System.out.println("\nRecent log entries (last 5):");
        List<String> recentLogs = logger.getRecentLogs(5);
        for (String logEntry : recentLogs) {
            System.out.println("  " + logEntry);
        }
        
        System.out.println("\n6. Testing Different Log Levels:");
        
        // Test different log levels
        logger.setLogLevel(Logger.LogLevel.WARN);
        logger.debug("SingletonPatternDemo", "This debug message should not appear");
        logger.info("SingletonPatternDemo", "This info message should not appear");
        logger.warn("SingletonPatternDemo", "This warning message should appear");
        logger.error("SingletonPatternDemo", "This error message should appear");
        
        // Reset to info level
        logger.setLogLevel(Logger.LogLevel.INFO);
        
        System.out.println("\n7. Configuration Summary:");
        System.out.println(logger.getConfiguration());
        
        // Test clone prevention
        System.out.println("\n8. Testing Clone Prevention:");
        try {
            Logger clonedLogger = (Logger) logger.clone();
        } catch (CloneNotSupportedException e) {
            System.out.println("✅ Clone prevention working: " + e.getMessage());
        }
        
        // Final statistics
        logger.info("SingletonPatternDemo", "Demonstration completed successfully");
        System.out.println("\nFinal log count: " + logger.getLogCount());
        
        System.out.println("\n✅ Singleton pattern successfully demonstrated!");
        System.out.println("Benefits: Single instance, global access, thread safety, resource management");
        
        // Cleanup
        logger.enableFileOutput(false);
    }
}
