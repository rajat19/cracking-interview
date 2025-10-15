// Complex subsystem classes
class AudioSystem {
    public void turnOn() {
        System.out.println("Audio System: Turning on...");
    }
    
    public void setVolume(int volume) {
        System.out.println("Audio System: Setting volume to " + volume);
    }
    
    public void setSource(String source) {
        System.out.println("Audio System: Setting source to " + source);
    }
    
    public void turnOff() {
        System.out.println("Audio System: Turning off...");
    }
}

class VideoProjector {
    public void turnOn() {
        System.out.println("Video Projector: Turning on...");
    }
    
    public void setInput(String input) {
        System.out.println("Video Projector: Setting input to " + input);
    }
    
    public void setResolution(String resolution) {
        System.out.println("Video Projector: Setting resolution to " + resolution);
    }
    
    public void turnOff() {
        System.out.println("Video Projector: Turning off...");
    }
}

class LightingSystem {
    public void turnOn() {
        System.out.println("Lighting System: Turning on...");
    }
    
    public void setBrightness(int brightness) {
        System.out.println("Lighting System: Setting brightness to " + brightness + "%");
    }
    
    public void setColor(String color) {
        System.out.println("Lighting System: Setting color to " + color);
    }
    
    public void turnOff() {
        System.out.println("Lighting System: Turning off...");
    }
}

class ClimateControl {
    public void turnOn() {
        System.out.println("Climate Control: Turning on...");
    }
    
    public void setTemperature(int temperature) {
        System.out.println("Climate Control: Setting temperature to " + temperature + "°F");
    }
    
    public void turnOff() {
        System.out.println("Climate Control: Turning off...");
    }
}

class SecuritySystem {
    public void armSystem() {
        System.out.println("Security System: Arming security system...");
    }
    
    public void disarmSystem() {
        System.out.println("Security System: Disarming security system...");
    }
    
    public void setMode(String mode) {
        System.out.println("Security System: Setting mode to " + mode);
    }
}

class StreamingDevice {
    public void turnOn() {
        System.out.println("Streaming Device: Powering on...");
    }
    
    public void connectToWiFi() {
        System.out.println("Streaming Device: Connecting to WiFi...");
    }
    
    public void launchApp(String app) {
        System.out.println("Streaming Device: Launching " + app + " app...");
    }
    
    public void turnOff() {
        System.out.println("Streaming Device: Turning off...");
    }
}

// Facade class that provides simple interface
class SmartHomeFacade {
    private AudioSystem audioSystem;
    private VideoProjector projector;
    private LightingSystem lights;
    private ClimateControl climate;
    private SecuritySystem security;
    private StreamingDevice streaming;

    public SmartHomeFacade() {
        this.audioSystem = new AudioSystem();
        this.projector = new VideoProjector();
        this.lights = new LightingSystem();
        this.climate = new ClimateControl();
        this.security = new SecuritySystem();
        this.streaming = new StreamingDevice();
    }

    // Simple methods that hide complex subsystem interactions
    public void startMovieNight() {
        System.out.println("\n=== STARTING MOVIE NIGHT MODE ===");
        
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
        
        System.out.println("Movie night mode activated! Enjoy your movie!\n");
    }

    public void startPartyMode() {
        System.out.println("\n=== STARTING PARTY MODE ===");
        
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
        
        System.out.println("Party mode activated! Let's party!\n");
    }

    public void startSleepMode() {
        System.out.println("\n=== STARTING SLEEP MODE ===");
        
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
        
        System.out.println("Sleep mode activated! Good night!\n");
    }

    public void startWorkMode() {
        System.out.println("\n=== STARTING WORK MODE ===");
        
        // Bright, productive lighting
        lights.turnOn();
        lights.setBrightness(80);
        lights.setColor("cool white");
        
        // Quiet background audio
        audioSystem.turnOn();
        audioSystem.setVolume(30);
        audioSystem.setSource("Spotify");
        
        // Set comfortable work temperature
        climate.turnOn();
        climate.setTemperature(70);
        
        // Home security mode
        security.setMode("Home");
        
        System.out.println("Work mode activated! Time to be productive!\n");
    }

    public void leaveHome() {
        System.out.println("\n=== LEAVING HOME ===");
        
        // Turn off all systems
        lights.turnOff();
        audioSystem.turnOff();
        projector.turnOff();
        streaming.turnOff();
        climate.turnOff();
        
        // Arm security system
        security.armSystem();
        
        System.out.println("Home secured! All systems turned off.\n");
    }

    public void arriveHome() {
        System.out.println("\n=== ARRIVING HOME ===");
        
        // Disarm security
        security.disarmSystem();
        
        // Turn on basic lighting
        lights.turnOn();
        lights.setBrightness(60);
        lights.setColor("warm white");
        
        // Set comfortable temperature
        climate.turnOn();
        climate.setTemperature(72);
        
        System.out.println("Welcome home! Basic systems activated.\n");
    }
}

public class FacadePatternDemo {
    public static void main(String[] args) {
        SmartHomeFacade smartHome = new SmartHomeFacade();

        // Demonstrate different scenarios using simple facade methods
        System.out.println("Welcome to your Smart Home!");
        
        // Arrive home
        smartHome.arriveHome();
        
        // Start work session
        smartHome.startWorkMode();
        
        // Movie time
        smartHome.startMovieNight();
        
        // Party time
        smartHome.startPartyMode();
        
        // Time for bed
        smartHome.startSleepMode();
        
        // Leave home
        smartHome.leaveHome();

        System.out.println("\nWithout the facade, you would need to manually control:");
        System.out.println("- Audio System (4 methods)");
        System.out.println("- Video Projector (4 methods)");
        System.out.println("- Lighting System (4 methods)");
        System.out.println("- Climate Control (3 methods)");
        System.out.println("- Security System (3 methods)");
        System.out.println("- Streaming Device (4 methods)");
        System.out.println("Total: 22 method calls for each scenario!");
        System.out.println("The facade reduces this to just 1 method call per scenario.");
    }
}
