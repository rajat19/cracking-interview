import java.util.*;

// Subject interface
interface ImageViewer {
    void displayImage();
    String getImageInfo();
}

// Real Subject - Heavy image that takes time to load
class HighResolutionImage implements ImageViewer {
    private String filename;
    private String imageData;
    private long fileSize;

    public HighResolutionImage(String filename) {
        this.filename = filename;
        this.fileSize = (long)(Math.random() * 10000 + 5000); // Random file size
        loadImageFromDisk(); // Expensive operation
    }

    private void loadImageFromDisk() {
        System.out.println("Loading high-resolution image: " + filename);
        System.out.println("File size: " + fileSize + " KB");
        
        // Simulate time-consuming loading process
        try {
            Thread.sleep(2000); // Simulate 2 seconds loading time
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
        
        this.imageData = "Raw image data for " + filename;
        System.out.println("✓ Image loaded successfully!");
    }

    @Override
    public void displayImage() {
        System.out.println("🖼️  Displaying: " + filename);
        System.out.println("   Resolution: 4K Ultra HD");
        System.out.println("   Size: " + fileSize + " KB");
    }

    @Override
    public String getImageInfo() {
        return filename + " (" + fileSize + " KB)";
    }
}

// Proxy - Controls access and provides additional functionality
class ImageProxy implements ImageViewer {
    private HighResolutionImage realImage;
    private String filename;
    private String userRole;
    private static Map<String, HighResolutionImage> imageCache = new HashMap<>();
    private static Set<String> accessLog = new HashSet<>();

    public ImageProxy(String filename, String userRole) {
        this.filename = filename;
        this.userRole = userRole;
    }

    // Lazy loading - only load image when needed
    private HighResolutionImage getRealImage() {
        if (realImage == null) {
            // Check cache first
            if (imageCache.containsKey(filename)) {
                System.out.println("📋 Loading from cache: " + filename);
                realImage = imageCache.get(filename);
            } else {
                // Load from disk and cache it
                realImage = new HighResolutionImage(filename);
                imageCache.put(filename, realImage);
                System.out.println("💾 Image cached for future use");
            }
        }
        return realImage;
    }

    @Override
    public void displayImage() {
        // Access control
        if (!hasAccess()) {
            System.out.println("❌ Access denied! User role '" + userRole + "' cannot view: " + filename);
            return;
        }

        // Logging
        logAccess();
        
        // Additional functionality before delegation
        System.out.println("🔍 Proxy: Preparing to display " + filename);
        
        // Lazy loading and delegation to real object
        HighResolutionImage image = getRealImage();
        image.displayImage();
        
        // Additional functionality after delegation
        System.out.println("📊 Proxy: Display completed, updating view statistics");
    }

    @Override
    public String getImageInfo() {
        // Some info can be provided without loading the actual image
        if (realImage == null && !imageCache.containsKey(filename)) {
            return filename + " (not loaded yet)";
        } else {
            return getRealImage().getImageInfo();
        }
    }

    private boolean hasAccess() {
        // Simple role-based access control
        if (filename.contains("confidential") && !userRole.equals("admin")) {
            return false;
        }
        if (filename.contains("premium") && userRole.equals("guest")) {
            return false;
        }
        return true;
    }

    private void logAccess() {
        String logEntry = userRole + " accessed " + filename;
        accessLog.add(logEntry);
        System.out.println("📝 Access logged: " + logEntry);
    }

    public static void printAccessLog() {
        System.out.println("\n=== ACCESS LOG ===");
        for (String entry : accessLog) {
            System.out.println("  " + entry);
        }
        System.out.println("==================\n");
    }

    public static void printCacheStatus() {
        System.out.println("=== CACHE STATUS ===");
        System.out.println("Images in cache: " + imageCache.size());
        for (String filename : imageCache.keySet()) {
            System.out.println("  - " + filename);
        }
        System.out.println("===================\n");
    }
}

// Client code
public class ProxyPatternDemo {
    public static void main(String[] args) {
        System.out.println("=== PROXY PATTERN DEMO ===\n");

        // Create image proxies for different users
        ImageViewer[] images = {
            new ImageProxy("nature_landscape.jpg", "user"),
            new ImageProxy("confidential_document.jpg", "user"),
            new ImageProxy("premium_photo.jpg", "guest"),
            new ImageProxy("vacation_photo.jpg", "admin"),
            new ImageProxy("confidential_blueprint.jpg", "admin")
        };

        System.out.println("1. INITIAL ACCESS - Images not loaded yet");
        System.out.println("Getting image info (lightweight operation):");
        for (ImageViewer image : images) {
            System.out.println("  - " + image.getImageInfo());
        }

        System.out.println("\n2. FIRST DISPLAY ATTEMPTS");
        System.out.println("Now attempting to display images (heavy operation):\n");
        
        for (ImageViewer image : images) {
            System.out.println("--- Attempting to display ---");
            image.displayImage();
            System.out.println();
        }

        System.out.println("3. SECOND ACCESS - Should use cache");
        System.out.println("Displaying the first image again (should be faster):\n");
        images[0].displayImage();

        System.out.println("\n4. PROXY FEATURES DEMONSTRATION");
        ImageProxy.printAccessLog();
        ImageProxy.printCacheStatus();

        System.out.println("=== PROXY BENEFITS ===");
        System.out.println("✓ Lazy Loading: Images only loaded when displayed");
        System.out.println("✓ Caching: Subsequent access is faster");
        System.out.println("✓ Access Control: Role-based permissions enforced");
        System.out.println("✓ Logging: All access attempts are logged");
        System.out.println("✓ Transparent: Client code doesn't know about proxy");
    }
}
