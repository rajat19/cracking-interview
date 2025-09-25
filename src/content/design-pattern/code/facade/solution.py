# Complex subsystem classes
class AudioSystem:
    def turn_on(self):
        print("Audio System: Turning on...")
    
    def set_volume(self, volume):
        print(f"Audio System: Setting volume to {volume}")
    
    def set_source(self, source):
        print(f"Audio System: Setting source to {source}")
    
    def turn_off(self):
        print("Audio System: Turning off...")

class VideoProjector:
    def turn_on(self):
        print("Video Projector: Turning on...")
    
    def set_input(self, input_source):
        print(f"Video Projector: Setting input to {input_source}")
    
    def set_resolution(self, resolution):
        print(f"Video Projector: Setting resolution to {resolution}")
    
    def turn_off(self):
        print("Video Projector: Turning off...")

class LightingSystem:
    def turn_on(self):
        print("Lighting System: Turning on...")
    
    def set_brightness(self, brightness):
        print(f"Lighting System: Setting brightness to {brightness}%")
    
    def set_color(self, color):
        print(f"Lighting System: Setting color to {color}")
    
    def turn_off(self):
        print("Lighting System: Turning off...")

class ClimateControl:
    def turn_on(self):
        print("Climate Control: Turning on...")
    
    def set_temperature(self, temperature):
        print(f"Climate Control: Setting temperature to {temperature}°F")
    
    def turn_off(self):
        print("Climate Control: Turning off...")

class SecuritySystem:
    def arm_system(self):
        print("Security System: Arming security system...")
    
    def disarm_system(self):
        print("Security System: Disarming security system...")
    
    def set_mode(self, mode):
        print(f"Security System: Setting mode to {mode}")

class StreamingDevice:
    def turn_on(self):
        print("Streaming Device: Powering on...")
    
    def connect_to_wifi(self):
        print("Streaming Device: Connecting to WiFi...")
    
    def launch_app(self, app):
        print(f"Streaming Device: Launching {app} app...")
    
    def turn_off(self):
        print("Streaming Device: Turning off...")

# Facade class that provides simple interface
class SmartHomeFacade:
    def __init__(self):
        self.audio_system = AudioSystem()
        self.projector = VideoProjector()
        self.lights = LightingSystem()
        self.climate = ClimateControl()
        self.security = SecuritySystem()
        self.streaming = StreamingDevice()

    def start_movie_night(self):
        print("\n=== STARTING MOVIE NIGHT MODE ===")
        
        # Set up lighting
        self.lights.turn_on()
        self.lights.set_brightness(20)
        self.lights.set_color("warm white")
        
        # Set up audio/video
        self.audio_system.turn_on()
        self.audio_system.set_volume(75)
        self.audio_system.set_source("HDMI")
        
        self.projector.turn_on()
        self.projector.set_input("HDMI")
        self.projector.set_resolution("4K")
        
        # Start streaming
        self.streaming.turn_on()
        self.streaming.connect_to_wifi()
        self.streaming.launch_app("Netflix")
        
        # Set comfortable temperature
        self.climate.turn_on()
        self.climate.set_temperature(72)
        
        # Set security to home mode
        self.security.set_mode("Home")
        
        print("Movie night mode activated! Enjoy your movie!\n")

    def start_party_mode(self):
        print("\n=== STARTING PARTY MODE ===")
        
        # Bright, colorful lighting
        self.lights.turn_on()
        self.lights.set_brightness(100)
        self.lights.set_color("party colors")
        
        # Loud music setup
        self.audio_system.turn_on()
        self.audio_system.set_volume(90)
        self.audio_system.set_source("Bluetooth")
        
        # Turn off projector for party
        self.projector.turn_off()
        
        # Set party temperature
        self.climate.turn_on()
        self.climate.set_temperature(68)
        
        # Disable security for guests
        self.security.disarm_system()
        
        print("Party mode activated! Let's party!\n")

    def start_sleep_mode(self):
        print("\n=== STARTING SLEEP MODE ===")
        
        # Dim lighting gradually
        self.lights.set_brightness(5)
        self.lights.set_color("red")
        
        # Turn off entertainment systems
        self.audio_system.turn_off()
        self.projector.turn_off()
        self.streaming.turn_off()
        
        # Set sleep temperature
        self.climate.set_temperature(65)
        
        # Arm security system
        self.security.arm_system()
        
        print("Sleep mode activated! Good night!\n")

    def leave_home(self):
        print("\n=== LEAVING HOME ===")
        
        # Turn off all systems
        self.lights.turn_off()
        self.audio_system.turn_off()
        self.projector.turn_off()
        self.streaming.turn_off()
        self.climate.turn_off()
        
        # Arm security system
        self.security.arm_system()
        
        print("Home secured! All systems turned off.\n")

def main():
    smart_home = SmartHomeFacade()

    print("Welcome to your Smart Home!")
    
    # Demonstrate different scenarios
    smart_home.start_movie_night()
    smart_home.start_party_mode()
    smart_home.start_sleep_mode()
    smart_home.leave_home()

    print("Without the facade, you would need to manually control:")
    print("- Audio System (4 methods)")
    print("- Video Projector (4 methods)")
    print("- Lighting System (4 methods)")
    print("- Climate Control (3 methods)")
    print("- Security System (3 methods)")
    print("- Streaming Device (4 methods)")
    print("Total: 22 method calls for each scenario!")
    print("The facade reduces this to just 1 method call per scenario.")

if __name__ == "__main__":
    main()
