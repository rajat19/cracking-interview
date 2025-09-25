/**
 * Builder Pattern - Computer Configuration Example
 * Constructs complex objects step by step with fluent interface and optional parameters
 */

// Product class - Complex object being built
class Computer {
    // Required parameters
    private final String processor;
    private final int ramGB;
    
    // Optional parameters - initialized with defaults
    private final String motherboard;
    private final String graphicsCard;
    private final int storageGB;
    private final String storageType;
    private final boolean hasWiFi;
    private final boolean hasBluetooth;
    private final String powerSupply;
    private final String caseType;
    
    private Computer(ComputerBuilder builder) {
        this.processor = builder.processor;
        this.ramGB = builder.ramGB;
        this.motherboard = builder.motherboard;
        this.graphicsCard = builder.graphicsCard;
        this.storageGB = builder.storageGB;
        this.storageType = builder.storageType;
        this.hasWiFi = builder.hasWiFi;
        this.hasBluetooth = builder.hasBluetooth;
        this.powerSupply = builder.powerSupply;
        this.caseType = builder.caseType;
    }
    
    @Override
    public String toString() {
        return String.format("""
            Computer Configuration:
            ├─ Processor: %s
            ├─ RAM: %d GB
            ├─ Motherboard: %s
            ├─ Graphics: %s
            ├─ Storage: %d GB %s
            ├─ WiFi: %s
            ├─ Bluetooth: %s
            ├─ Power Supply: %s
            └─ Case: %s
            """,
            processor, ramGB, motherboard, graphicsCard, 
            storageGB, storageType, hasWiFi ? "Yes" : "No", 
            hasBluetooth ? "Yes" : "No", powerSupply, caseType
        );
    }
    
    public void startUp() {
        System.out.println("🔧 Starting computer with " + processor + " and " + ramGB + "GB RAM");
        System.out.println("💾 Loading from " + storageGB + "GB " + storageType);
        if (hasWiFi) System.out.println("📶 WiFi adapter detected");
        if (hasBluetooth) System.out.println("🔵 Bluetooth adapter detected");
        System.out.println("✅ Computer started successfully!");
    }
    
    // Builder class - Static nested class
    public static class ComputerBuilder {
        // Required parameters
        private final String processor;
        private final int ramGB;
        
        // Optional parameters with default values
        private String motherboard = "Standard ATX";
        private String graphicsCard = "Integrated Graphics";
        private int storageGB = 256;
        private String storageType = "SSD";
        private boolean hasWiFi = true;
        private boolean hasBluetooth = false;
        private String powerSupply = "500W";
        private String caseType = "Mid Tower";
        
        // Constructor with required parameters
        public ComputerBuilder(String processor, int ramGB) {
            this.processor = processor;
            this.ramGB = ramGB;
        }
        
        // Fluent interface methods for optional parameters
        public ComputerBuilder motherboard(String motherboard) {
            this.motherboard = motherboard;
            return this;
        }
        
        public ComputerBuilder graphicsCard(String graphicsCard) {
            this.graphicsCard = graphicsCard;
            return this;
        }
        
        public ComputerBuilder storage(int storageGB, String storageType) {
            this.storageGB = storageGB;
            this.storageType = storageType;
            return this;
        }
        
        public ComputerBuilder withWiFi(boolean hasWiFi) {
            this.hasWiFi = hasWiFi;
            return this;
        }
        
        public ComputerBuilder withBluetooth(boolean hasBluetooth) {
            this.hasBluetooth = hasBluetooth;
            return this;
        }
        
        public ComputerBuilder powerSupply(String powerSupply) {
            this.powerSupply = powerSupply;
            return this;
        }
        
        public ComputerBuilder caseType(String caseType) {
            this.caseType = caseType;
            return this;
        }
        
        // Build method to create the Computer instance
        public Computer build() {
            // Validation logic can be added here
            if (ramGB < 4) {
                throw new IllegalArgumentException("RAM must be at least 4GB");
            }
            if (storageGB < 128) {
                throw new IllegalArgumentException("Storage must be at least 128GB");
            }
            
            return new Computer(this);
        }
    }
}

// Director class - Optional, provides specific configurations
class ComputerDirector {
    public static Computer buildGamingPC() {
        return new Computer.ComputerBuilder("Intel i9-12900K", 32)
                .motherboard("ASUS ROG STRIX Z690-E")
                .graphicsCard("NVIDIA RTX 4080")
                .storage(1000, "NVMe SSD")
                .withWiFi(true)
                .withBluetooth(true)
                .powerSupply("850W 80+ Gold")
                .caseType("Full Tower RGB")
                .build();
    }
    
    public static Computer buildOfficePC() {
        return new Computer.ComputerBuilder("Intel i5-12400", 16)
                .motherboard("MSI B660M Pro")
                .storage(512, "SSD")
                .withWiFi(true)
                .withBluetooth(false)
                .powerSupply("450W")
                .caseType("Mini ITX")
                .build();
    }
    
    public static Computer buildBudgetPC() {
        return new Computer.ComputerBuilder("AMD Ryzen 5 5600G", 8)
                .storage(256, "SSD")
                .withWiFi(false)
                .build(); // Uses default values for other components
    }
}

public class BuilderPatternDemo {
    public static void main(String[] args) {
        System.out.println("=== Builder Pattern Demo - Computer Configuration ===\n");
        
        // Example 1: Step-by-step building with method chaining
        System.out.println("1. Building Custom Gaming Computer:");
        Computer gamingPC = new Computer.ComputerBuilder("AMD Ryzen 9 7900X", 64)
                .motherboard("ASUS ROG Crosshair X670E Hero")
                .graphicsCard("NVIDIA RTX 4090")
                .storage(2000, "NVMe SSD")
                .withWiFi(true)
                .withBluetooth(true)
                .powerSupply("1000W 80+ Platinum")
                .caseType("Full Tower Tempered Glass")
                .build();
        
        System.out.println(gamingPC);
        gamingPC.startUp();
        
        System.out.println("\n" + "=".repeat(60) + "\n");
        
        // Example 2: Minimal configuration (using defaults)
        System.out.println("2. Building Basic Computer (with defaults):");
        Computer basicPC = new Computer.ComputerBuilder("Intel i3-12100", 8)
                .build();
        
        System.out.println(basicPC);
        basicPC.startUp();
        
        System.out.println("\n" + "=".repeat(60) + "\n");
        
        // Example 3: Using Director for pre-configured builds
        System.out.println("3. Using Director for Pre-configured Builds:");
        
        System.out.println("Gaming PC Configuration:");
        Computer directorGamingPC = ComputerDirector.buildGamingPC();
        System.out.println(directorGamingPC);
        
        System.out.println("Office PC Configuration:");
        Computer officePC = ComputerDirector.buildOfficePC();
        System.out.println(officePC);
        
        System.out.println("Budget PC Configuration:");
        Computer budgetPC = ComputerDirector.buildBudgetPC();
        System.out.println(budgetPC);
        
        // Example 4: Validation in action
        System.out.println("\n4. Validation Example:");
        try {
            Computer invalidPC = new Computer.ComputerBuilder("Intel i5", 2) // Too little RAM
                    .build();
        } catch (IllegalArgumentException e) {
            System.out.println("❌ Build failed: " + e.getMessage());
        }
        
        try {
            Computer invalidStorage = new Computer.ComputerBuilder("Intel i5", 8)
                    .storage(64, "HDD") // Too little storage
                    .build();
        } catch (IllegalArgumentException e) {
            System.out.println("❌ Build failed: " + e.getMessage());
        }
        
        System.out.println("\n✅ Builder pattern successfully demonstrated!");
        System.out.println("Benefits: Fluent interface, optional parameters, validation, readability");
    }
}
