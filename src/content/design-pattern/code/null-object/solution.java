// Null Object Design Pattern - Logger System
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

// Abstract Logger interface
abstract class Logger {
    public abstract void info(String message);
    public abstract void warning(String message);
    public abstract void error(String message);
}

// Real Logger implementation
class ConsoleLogger extends Logger {
    private String name;
    
    public ConsoleLogger(String name) {
        this.name = name;
    }
    
    @Override
    public void info(String message) {
        System.out.println("[INFO] " + getCurrentTime() + " [" + name + "] " + message);
    }
    
    @Override
    public void warning(String message) {
        System.out.println("[WARN] " + getCurrentTime() + " [" + name + "] " + message);
    }
    
    @Override
    public void error(String message) {
        System.err.println("[ERROR] " + getCurrentTime() + " [" + name + "] " + message);
    }
    
    private String getCurrentTime() {
        return LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"));
    }
}

// File Logger implementation
class FileLogger extends Logger {
    private String filename;
    
    public FileLogger(String filename) {
        this.filename = filename;
    }
    
    @Override
    public void info(String message) {
        writeToFile("[INFO] " + getCurrentTime() + " " + message);
    }
    
    @Override
    public void warning(String message) {
        writeToFile("[WARN] " + getCurrentTime() + " " + message);
    }
    
    @Override
    public void error(String message) {
        writeToFile("[ERROR] " + getCurrentTime() + " " + message);
    }
    
    private void writeToFile(String message) {
        // Simulate file writing
        System.out.println("Writing to " + filename + ": " + message);
    }
    
    private String getCurrentTime() {
        return LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"));
    }
}

// Null Object Logger - does nothing
class NullLogger extends Logger {
    private static NullLogger instance = new NullLogger();
    
    private NullLogger() {} // Private constructor for Singleton
    
    public static NullLogger getInstance() {
        return instance;
    }
    
    @Override
    public void info(String message) {
        // Do nothing - silent operation
    }
    
    @Override
    public void warning(String message) {
        // Do nothing - silent operation
    }
    
    @Override
    public void error(String message) {
        // Do nothing - silent operation
    }
}

// Service class that uses logger
class UserService {
    private Logger logger;
    
    public UserService(Logger logger) {
        this.logger = logger;
    }
    
    public void createUser(String username) {
        // Business logic
        System.out.println("Creating user: " + username);
        
        // No null check needed - logger will handle it
        logger.info("User created: " + username);
    }
    
    public void deleteUser(String username) {
        // Business logic
        System.out.println("Deleting user: " + username);
        
        // No null check needed
        logger.warning("User deleted: " + username);
    }
    
    public void handleError(String error) {
        // Error handling
        System.out.println("Handling error: " + error);
        
        // No null check needed
        logger.error("Error occurred: " + error);
    }
}

// Another service example
class OrderService {
    private Logger logger;
    
    public OrderService(Logger logger) {
        this.logger = logger;
    }
    
    public void processOrder(String orderId) {
        System.out.println("Processing order: " + orderId);
        logger.info("Order processed: " + orderId);
        
        // Simulate some processing steps
        logger.info("Validating payment for order: " + orderId);
        logger.info("Updating inventory for order: " + orderId);
        logger.info("Sending confirmation for order: " + orderId);
    }
}

// Client code
public class Main {
    public static void main(String[] args) {
        System.out.println("=== Null Object Pattern Demo ===");
        
        // Service with real console logger
        System.out.println("\n1. Using Console Logger:");
        UserService userServiceWithConsole = new UserService(new ConsoleLogger("UserService"));
        userServiceWithConsole.createUser("john_doe");
        userServiceWithConsole.deleteUser("jane_smith");
        userServiceWithConsole.handleError("Database connection failed");
        
        // Service with file logger
        System.out.println("\n2. Using File Logger:");
        UserService userServiceWithFile = new UserService(new FileLogger("users.log"));
        userServiceWithFile.createUser("alice");
        userServiceWithFile.deleteUser("bob");
        
        // Service with null logger - no logging output
        System.out.println("\n3. Using Null Logger (no log output):");
        UserService userServiceWithNull = new UserService(NullLogger.getInstance());
        userServiceWithNull.createUser("charlie");
        userServiceWithNull.deleteUser("diana");
        userServiceWithNull.handleError("Network timeout");
        
        // Order service with different loggers
        System.out.println("\n4. Order Service Examples:");
        
        OrderService orderServiceWithConsole = new OrderService(new ConsoleLogger("OrderService"));
        orderServiceWithConsole.processOrder("ORD-001");
        
        System.out.println("\n   Order Service with Null Logger:");
        OrderService orderServiceWithNull = new OrderService(NullLogger.getInstance());
        orderServiceWithNull.processOrder("ORD-002");
        
        System.out.println("\n=== Demo Complete ===");
        System.out.println("Note: Null Object pattern eliminates the need for null checks");
        System.out.println("and provides consistent behavior regardless of logger availability.");
    }
}
