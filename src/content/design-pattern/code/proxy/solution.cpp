#include <iostream>
#include <string>
#include <unordered_map>
#include <unordered_set>
#include <memory>
#include <thread>
#include <chrono>
#include <vector>
#include <random>

// Subject interface
class ImageViewer {
public:
    virtual ~ImageViewer() = default;
    virtual void displayImage() = 0;
    virtual std::string getImageInfo() = 0;
};

// Real Subject - Heavy image that takes time to load
class HighResolutionImage : public ImageViewer {
private:
    std::string filename;
    std::string imageData;
    long fileSize;
    
    void loadImageFromDisk() {
        std::cout << "Loading high-resolution image: " << filename << std::endl;
        std::cout << "File size: " << fileSize << " KB" << std::endl;
        
        // Simulate time-consuming loading process
        std::this_thread::sleep_for(std::chrono::seconds(2));
        
        this->imageData = "Raw image data for " + filename;
        std::cout << "✓ Image loaded successfully!" << std::endl;
    }
    
public:
    HighResolutionImage(const std::string& filename) : filename(filename) {
        // Random file size
        std::random_device rd;
        std::mt19937 gen(rd());
        std::uniform_int_distribution<> dis(5000, 15000);
        this->fileSize = dis(gen);
        loadImageFromDisk(); // Expensive operation
    }
    
    void displayImage() override {
        std::cout << "🖼️  Displaying: " << filename << std::endl;
        std::cout << "   Resolution: 4K Ultra HD" << std::endl;
        std::cout << "   Size: " << fileSize << " KB" << std::endl;
    }
    
    std::string getImageInfo() override {
        return filename + " (" + std::to_string(fileSize) + " KB)";
    }
};

// Proxy - Controls access and provides additional functionality
class ImageProxy : public ImageViewer {
private:
    std::unique_ptr<HighResolutionImage> realImage;
    std::string filename;
    std::string userRole;
    static std::unordered_map<std::string, std::unique_ptr<HighResolutionImage>> imageCache;
    static std::unordered_set<std::string> accessLog;
    
    HighResolutionImage* getRealImage() {
        if (realImage == nullptr) {
            // Check cache first
            auto it = imageCache.find(filename);
            if (it != imageCache.end()) {
                std::cout << "📋 Loading from cache: " << filename << std::endl;
                realImage = std::move(it->second);
                imageCache.erase(it);
            } else {
                // Load from disk and cache it
                realImage = std::make_unique<HighResolutionImage>(filename);
                std::cout << "💾 Image cached for future use" << std::endl;
            }
        }
        return realImage.get();
    }
    
    bool hasAccess() {
        if (filename.find("confidential") != std::string::npos && userRole != "admin") {
            return false;
        }
        if (filename.find("premium") != std::string::npos && userRole == "guest") {
            return false;
        }
        return true;
    }
    
    void logAccess() {
        std::string logEntry = userRole + " accessed " + filename;
        accessLog.insert(logEntry);
        std::cout << "📝 Access logged: " << logEntry << std::endl;
    }
    
public:
    ImageProxy(const std::string& filename, const std::string& userRole) 
        : filename(filename), userRole(userRole) {}
    
    void displayImage() override {
        // Access control
        if (!hasAccess()) {
            std::cout << "❌ Access denied! User role '" << userRole 
                     << "' cannot view: " << filename << std::endl;
            return;
        }
        
        // Logging
        logAccess();
        
        // Additional functionality before delegation
        std::cout << "🔍 Proxy: Preparing to display " << filename << std::endl;
        
        // Lazy loading and delegation to real object
        HighResolutionImage* image = getRealImage();
        image->displayImage();
        
        // Additional functionality after delegation
        std::cout << "📊 Proxy: Display completed, updating view statistics" << std::endl;
    }
    
    std::string getImageInfo() override {
        // Some info can be provided without loading the actual image
        if (realImage == nullptr && imageCache.find(filename) == imageCache.end()) {
            return filename + " (not loaded yet)";
        } else {
            return getRealImage()->getImageInfo();
        }
    }
    
    static void printAccessLog() {
        std::cout << "\n=== ACCESS LOG ===" << std::endl;
        for (const auto& entry : accessLog) {
            std::cout << "  " << entry << std::endl;
        }
        std::cout << "==================\n" << std::endl;
    }
    
    static void printCacheStatus() {
        std::cout << "=== CACHE STATUS ===" << std::endl;
        std::cout << "Images in cache: " << imageCache.size() << std::endl;
        for (const auto& pair : imageCache) {
            std::cout << "  - " << pair.first << std::endl;
        }
        std::cout << "===================\n" << std::endl;
    }
};

// Static member definitions
std::unordered_map<std::string, std::unique_ptr<HighResolutionImage>> ImageProxy::imageCache;
std::unordered_set<std::string> ImageProxy::accessLog;

int main() {
    std::cout << "=== PROXY PATTERN DEMO ===\n" << std::endl;
    
    // Create image proxies for different users
    std::vector<std::unique_ptr<ImageViewer>> images;
    images.push_back(std::make_unique<ImageProxy>("nature_landscape.jpg", "user"));
    images.push_back(std::make_unique<ImageProxy>("confidential_document.jpg", "user"));
    images.push_back(std::make_unique<ImageProxy>("premium_photo.jpg", "guest"));
    images.push_back(std::make_unique<ImageProxy>("vacation_photo.jpg", "admin"));
    images.push_back(std::make_unique<ImageProxy>("confidential_blueprint.jpg", "admin"));
    
    std::cout << "1. INITIAL ACCESS - Images not loaded yet" << std::endl;
    std::cout << "Getting image info (lightweight operation):" << std::endl;
    for (const auto& image : images) {
        std::cout << "  - " << image->getImageInfo() << std::endl;
    }
    
    std::cout << "\n2. FIRST DISPLAY ATTEMPTS" << std::endl;
    std::cout << "Now attempting to display images (heavy operation):\n" << std::endl;
    
    for (const auto& image : images) {
        std::cout << "--- Attempting to display ---" << std::endl;
        image->displayImage();
        std::cout << std::endl;
    }
    
    std::cout << "3. SECOND ACCESS - Should use cache" << std::endl;
    std::cout << "Displaying the first image again (should be faster):\n" << std::endl;
    images[0]->displayImage();
    
    std::cout << "\n4. PROXY FEATURES DEMONSTRATION" << std::endl;
    ImageProxy::printAccessLog();
    ImageProxy::printCacheStatus();
    
    std::cout << "=== PROXY BENEFITS ===" << std::endl;
    std::cout << "✓ Lazy Loading: Images only loaded when displayed" << std::endl;
    std::cout << "✓ Caching: Subsequent access is faster" << std::endl;
    std::cout << "✓ Access Control: Role-based permissions enforced" << std::endl;
    std::cout << "✓ Logging: All access attempts are logged" << std::endl;
    std::cout << "✓ Transparent: Client code doesn't know about proxy" << std::endl;
    
    return 0;
}
