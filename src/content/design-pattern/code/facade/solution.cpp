#include <iostream>
#include <string>

// Complex subsystem classes
class AudioSystem {
public:
    void turnOn() {
        std::cout << "Audio System: Turning on..." << std::endl;
    }
    
    void setVolume(int volume) {
        std::cout << "Audio System: Setting volume to " << volume << std::endl;
    }
    
    void setSource(const std::string& source) {
        std::cout << "Audio System: Setting source to " << source << std::endl;
    }
    
    void turnOff() {
        std::cout << "Audio System: Turning off..." << std::endl;
    }
};

class VideoProjector {
public:
    void turnOn() {
        std::cout << "Video Projector: Turning on..." << std::endl;
    }
    
    void setInput(const std::string& input) {
        std::cout << "Video Projector: Setting input to " << input << std::endl;
    }
    
    void setResolution(const std::string& resolution) {
        std::cout << "Video Projector: Setting resolution to " << resolution << std::endl;
    }
    
    void turnOff() {
        std::cout << "Video Projector: Turning off..." << std::endl;
    }
};

class LightingSystem {
public:
    void turnOn() {
        std::cout << "Lighting System: Turning on..." << std::endl;
    }
    
    void setBrightness(int brightness) {
        std::cout << "Lighting System: Setting brightness to " << brightness << "%" << std::endl;
    }
    
    void setColor(const std::string& color) {
        std::cout << "Lighting System: Setting color to " << color << std::endl;
    }
    
    void turnOff() {
        std::cout << "Lighting System: Turning off..." << std::endl;
    }
};

class ClimateControl {
public:
    void turnOn() {
        std::cout << "Climate Control: Turning on..." << std::endl;
    }
    
    void setTemperature(int temperature) {
        std::cout << "Climate Control: Setting temperature to " << temperature << "°F" << std::endl;
    }
    
    void turnOff() {
        std::cout << "Climate Control: Turning off..." << std::endl;
    }
};

class SecuritySystem {
public:
    void armSystem() {
        std::cout << "Security System: Arming security system..." << std::endl;
    }
    
    void disarmSystem() {
        std::cout << "Security System: Disarming security system..." << std::endl;
    }
    
    void setMode(const std::string& mode) {
        std::cout << "Security System: Setting mode to " << mode << std::endl;
    }
};

class StreamingDevice {
public:
    void turnOn() {
        std::cout << "Streaming Device: Powering on..." << std::endl;
    }
    
    void connectToWiFi() {
        std::cout << "Streaming Device: Connecting to WiFi..." << std::endl;
    }
    
    void launchApp(const std::string& app) {
        std::cout << "Streaming Device: Launching " << app << " app..." << std::endl;
    }
    
    void turnOff() {
        std::cout << "Streaming Device: Turning off..." << std::endl;
    }
};

// Facade class that provides simple interface
class SmartHomeFacade {
private:
    AudioSystem audioSystem;
    VideoProjector projector;
    LightingSystem lights;
    ClimateControl climate;
    SecuritySystem security;
    StreamingDevice streaming;

public:
    void startMovieNight() {
        std::cout << "\n=== STARTING MOVIE NIGHT MODE ===" << std::endl;
        
        // Set up lighting
        lights.turnOn();
        lights.setBrightness(20);
        lights.setColor("warm white");
        
        // Set up audio/video
        audioSystem.turnOn();
        audioSystem.setVolume(75);
        audioSystem.setSource("HDMI");
        
        projector.turnOn();
        projector.setInput("HDMI");
        projector.setResolution("4K");
        
        // Start streaming
        streaming.turnOn();
        streaming.connectToWiFi();
        streaming.launchApp("Netflix");
        
        // Set comfortable temperature
        climate.turnOn();
        climate.setTemperature(72);
        
        // Set security to home mode
        security.setMode("Home");
        
        std::cout << "Movie night mode activated! Enjoy your movie!\n" << std::endl;
    }

    void startPartyMode() {
        std::cout << "\n=== STARTING PARTY MODE ===" << std::endl;
        
        // Bright, colorful lighting
        lights.turnOn();
        lights.setBrightness(100);
        lights.setColor("party colors");
        
        // Loud music setup
        audioSystem.turnOn();
        audioSystem.setVolume(90);
        audioSystem.setSource("Bluetooth");
        
        // Turn off projector for party
        projector.turnOff();
        
        // Set party temperature
        climate.turnOn();
        climate.setTemperature(68);
        
        // Disable security for guests
        security.disarmSystem();
        
        std::cout << "Party mode activated! Let's party!\n" << std::endl;
    }

    void startSleepMode() {
        std::cout << "\n=== STARTING SLEEP MODE ===" << std::endl;
        
        // Dim lighting gradually
        lights.setBrightness(5);
        lights.setColor("red");
        
        // Turn off entertainment systems
        audioSystem.turnOff();
        projector.turnOff();
        streaming.turnOff();
        
        // Set sleep temperature
        climate.setTemperature(65);
        
        // Arm security system
        security.armSystem();
        
        std::cout << "Sleep mode activated! Good night!\n" << std::endl;
    }

    void leaveHome() {
        std::cout << "\n=== LEAVING HOME ===" << std::endl;
        
        // Turn off all systems
        lights.turnOff();
        audioSystem.turnOff();
        projector.turnOff();
        streaming.turnOff();
        climate.turnOff();
        
        // Arm security system
        security.armSystem();
        
        std::cout << "Home secured! All systems turned off.\n" << std::endl;
    }
};

int main() {
    SmartHomeFacade smartHome;

    std::cout << "Welcome to your Smart Home!" << std::endl;
    
    // Demonstrate different scenarios
    smartHome.startMovieNight();
    smartHome.startPartyMode();
    smartHome.startSleepMode();
    smartHome.leaveHome();

    std::cout << "Without the facade, you would need to manually control:" << std::endl;
    std::cout << "- Audio System (4 methods)" << std::endl;
    std::cout << "- Video Projector (4 methods)" << std::endl;
    std::cout << "- Lighting System (4 methods)" << std::endl;
    std::cout << "- Climate Control (3 methods)" << std::endl;
    std::cout << "- Security System (3 methods)" << std::endl;
    std::cout << "- Streaming Device (4 methods)" << std::endl;
    std::cout << "Total: 22 method calls for each scenario!" << std::endl;
    std::cout << "The facade reduces this to just 1 method call per scenario." << std::endl;

    return 0;
}
