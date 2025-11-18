#include <iostream>
#include <string>
#include <memory>

// Forward declaration
class MediaPlayer;

// State interface
class MediaPlayerState {
public:
    virtual ~MediaPlayerState() = default;
    virtual void play(MediaPlayer& context) = 0;
    virtual void pause(MediaPlayer& context) = 0;
    virtual void stop(MediaPlayer& context) = 0;
    virtual void next(MediaPlayer& context) = 0;
    virtual void previous(MediaPlayer& context) = 0;
    virtual std::string getStateName() = 0;
};

// Context class
class MediaPlayer {
private:
    std::unique_ptr<MediaPlayerState> currentState;
    std::string currentTrack;
    int trackNumber;
    int volume;
    
public:
    MediaPlayer();
    
    void setState(std::unique_ptr<MediaPlayerState> state) {
        this->currentState = std::move(state);
        std::cout << "🔄 State changed to: " << this->currentState->getStateName() << std::endl;
    }
    
    // Delegate operations to current state
    void play() {
        currentState->play(*this);
    }
    
    void pause() {
        currentState->pause(*this);
    }
    
    void stop() {
        currentState->stop(*this);
    }
    
    void next() {
        currentState->next(*this);
    }
    
    void previous() {
        currentState->previous(*this);
    }
    
    // Getters and setters
    std::string getCurrentTrack() const {
        return currentTrack;
    }
    
    void setCurrentTrack(const std::string& track) {
        this->currentTrack = track;
    }
    
    int getTrackNumber() const {
        return trackNumber;
    }
    
    void setTrackNumber(int number) {
        this->trackNumber = number;
    }
    
    int getVolume() const {
        return volume;
    }
    
    void setVolume(int volume) {
        this->volume = volume;
    }
    
    std::string getStateName() {
        return currentState->getStateName();
    }
    
    void displayStatus() {
        std::cout << "━━━ MEDIA PLAYER STATUS ━━━" << std::endl;
        std::cout << "State: " << getStateName() << std::endl;
        std::cout << "Track: " << currentTrack << std::endl;
        std::cout << "Track #: " << trackNumber << std::endl;
        std::cout << "Volume: " << volume << "%" << std::endl;
        std::cout << "━━━━━━━━━━━━━━━━━━━━━━━━━━━\n" << std::endl;
    }
};

// Forward declarations for states
class StoppedState;
class PlayingState;
class PausedState;

// Concrete States
class StoppedState : public MediaPlayerState {
private:
    void loadTrack(MediaPlayer& context, int trackNumber) {
        context.setTrackNumber(trackNumber);
        context.setCurrentTrack("Song " + std::to_string(trackNumber) + 
                               " - Artist " + std::to_string(trackNumber));
        std::cout << "🎵 Loaded: " << context.getCurrentTrack() << std::endl;
    }
    
public:
    void play(MediaPlayer& context) override {
        std::cout << "▶️ Starting playback..." << std::endl;
        loadTrack(context, 1);
        context.setState(std::make_unique<PlayingState>());
    }
    
    void pause(MediaPlayer& context) override {
        std::cout << "⏸️ Cannot pause - player is stopped" << std::endl;
    }
    
    void stop(MediaPlayer& context) override {
        std::cout << "⏹️ Player is already stopped" << std::endl;
    }
    
    void next(MediaPlayer& context) override {
        std::cout << "⏭️ Loading next track..." << std::endl;
        loadTrack(context, context.getTrackNumber() + 1);
    }
    
    void previous(MediaPlayer& context) override {
        std::cout << "⏮️ Loading previous track..." << std::endl;
        if (context.getTrackNumber() > 1) {
            loadTrack(context, context.getTrackNumber() - 1);
        }
    }
    
    std::string getStateName() override {
        return "Stopped";
    }
};

class PlayingState : public MediaPlayerState {
public:
    void play(MediaPlayer& context) override {
        std::cout << "▶️ Already playing: " << context.getCurrentTrack() << std::endl;
    }
    
    void pause(MediaPlayer& context) override {
        std::cout << "⏸️ Pausing playback..." << std::endl;
        context.setState(std::make_unique<PausedState>());
    }
    
    void stop(MediaPlayer& context) override {
        std::cout << "⏹️ Stopping playback..." << std::endl;
        context.setState(std::make_unique<StoppedState>());
    }
    
    void next(MediaPlayer& context) override {
        std::cout << "⏭️ Skipping to next track..." << std::endl;
        int nextTrack = context.getTrackNumber() + 1;
        context.setTrackNumber(nextTrack);
        context.setCurrentTrack("Song " + std::to_string(nextTrack) + 
                               " - Artist " + std::to_string(nextTrack));
        std::cout << "🎵 Now playing: " << context.getCurrentTrack() << std::endl;
    }
    
    void previous(MediaPlayer& context) override {
        std::cout << "⏮️ Going to previous track..." << std::endl;
        if (context.getTrackNumber() > 1) {
            int prevTrack = context.getTrackNumber() - 1;
            context.setTrackNumber(prevTrack);
            context.setCurrentTrack("Song " + std::to_string(prevTrack) + 
                                   " - Artist " + std::to_string(prevTrack));
            std::cout << "🎵 Now playing: " << context.getCurrentTrack() << std::endl;
        } else {
            std::cout << "🔚 Already at first track" << std::endl;
        }
    }
    
    std::string getStateName() override {
        return "Playing";
    }
};

class PausedState : public MediaPlayerState {
public:
    void play(MediaPlayer& context) override {
        std::cout << "▶️ Resuming playback..." << std::endl;
        context.setState(std::make_unique<PlayingState>());
    }
    
    void pause(MediaPlayer& context) override {
        std::cout << "⏸️ Already paused" << std::endl;
    }
    
    void stop(MediaPlayer& context) override {
        std::cout << "⏹️ Stopping from paused state..." << std::endl;
        context.setState(std::make_unique<StoppedState>());
    }
    
    void next(MediaPlayer& context) override {
        std::cout << "⏭️ Loading next track (will remain paused)..." << std::endl;
        int nextTrack = context.getTrackNumber() + 1;
        context.setTrackNumber(nextTrack);
        context.setCurrentTrack("Song " + std::to_string(nextTrack) + 
                               " - Artist " + std::to_string(nextTrack));
        std::cout << "🎵 Loaded: " << context.getCurrentTrack() << std::endl;
    }
    
    void previous(MediaPlayer& context) override {
        std::cout << "⏮️ Loading previous track (will remain paused)..." << std::endl;
        if (context.getTrackNumber() > 1) {
            int prevTrack = context.getTrackNumber() - 1;
            context.setTrackNumber(prevTrack);
            context.setCurrentTrack("Song " + std::to_string(prevTrack) + 
                                   " - Artist " + std::to_string(prevTrack));
            std::cout << "🎵 Loaded: " << context.getCurrentTrack() << std::endl;
        }
    }
    
    std::string getStateName() override {
        return "Paused";
    }
};

// MediaPlayer constructor implementation
MediaPlayer::MediaPlayer() {
    this->currentState = std::make_unique<StoppedState>();
    this->currentTrack = "No track selected";
    this->trackNumber = 0;
    this->volume = 50;
}

int main() {
    std::cout << "=== MEDIA PLAYER STATE PATTERN DEMO ===\n" << std::endl;
    
    MediaPlayer player;
    
    // Initial state
    player.displayStatus();
    
    // Test different state transitions
    std::cout << "1. STARTING PLAYBACK" << std::endl;
    player.play();
    player.displayStatus();
    
    std::cout << "2. SKIPPING TRACKS WHILE PLAYING" << std::endl;
    player.next();
    player.next();
    player.displayStatus();
    
    std::cout << "3. PAUSING PLAYBACK" << std::endl;
    player.pause();
    player.displayStatus();
    
    std::cout << "4. TRYING TO PAUSE AGAIN" << std::endl;
    player.pause();
    
    std::cout << "5. NAVIGATING WHILE PAUSED" << std::endl;
    player.previous();
    player.displayStatus();
    
    std::cout << "6. RESUMING PLAYBACK" << std::endl;
    player.play();
    player.displayStatus();
    
    std::cout << "7. STOPPING PLAYBACK" << std::endl;
    player.stop();
    player.displayStatus();
    
    std::cout << "8. TRYING TO PAUSE WHEN STOPPED" << std::endl;
    player.pause();
    
    std::cout << "9. NAVIGATING WHEN STOPPED" << std::endl;
    player.next();
    player.displayStatus();
    
    std::cout << "=== STATE PATTERN BENEFITS ===" << std::endl;
    std::cout << "✓ Eliminates complex conditional logic" << std::endl;
    std::cout << "✓ Each state handles its own behavior" << std::endl;
    std::cout << "✓ Easy to add new states without modifying existing code" << std::endl;
    std::cout << "✓ State transitions are explicit and clear" << std::endl;
    std::cout << "✓ Follows Single Responsibility Principle" << std::endl;
    
    return 0;
}
