// State interface
interface MediaPlayerState {
    void play(MediaPlayer context);
    void pause(MediaPlayer context);
    void stop(MediaPlayer context);
    void next(MediaPlayer context);
    void previous(MediaPlayer context);
    String getStateName();
}

// Context class
class MediaPlayer {
    private MediaPlayerState currentState;
    private String currentTrack;
    private int trackNumber;
    private int volume;
    
    public MediaPlayer() {
        this.currentState = new StoppedState();
        this.currentTrack = "No track selected";
        this.trackNumber = 0;
        this.volume = 50;
    }
    
    public void setState(MediaPlayerState state) {
        this.currentState = state;
        System.out.println("🔄 State changed to: " + state.getStateName());
    }
    
    // Delegate operations to current state
    public void play() {
        currentState.play(this);
    }
    
    public void pause() {
        currentState.pause(this);
    }
    
    public void stop() {
        currentState.stop(this);
    }
    
    public void next() {
        currentState.next(this);
    }
    
    public void previous() {
        currentState.previous(this);
    }
    
    // Getters and setters
    public String getCurrentTrack() {
        return currentTrack;
    }
    
    public void setCurrentTrack(String track) {
        this.currentTrack = track;
    }
    
    public int getTrackNumber() {
        return trackNumber;
    }
    
    public void setTrackNumber(int number) {
        this.trackNumber = number;
    }
    
    public int getVolume() {
        return volume;
    }
    
    public void setVolume(int volume) {
        this.volume = volume;
    }
    
    public String getStateName() {
        return currentState.getStateName();
    }
    
    public void displayStatus() {
        System.out.println("━━━ MEDIA PLAYER STATUS ━━━");
        System.out.println("State: " + getStateName());
        System.out.println("Track: " + currentTrack);
        System.out.println("Track #: " + trackNumber);
        System.out.println("Volume: " + volume + "%");
        System.out.println("━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
    }
}

// Concrete States
class StoppedState implements MediaPlayerState {
    @Override
    public void play(MediaPlayer context) {
        System.out.println("▶️ Starting playback...");
        loadTrack(context, 1);
        context.setState(new PlayingState());
    }
    
    @Override
    public void pause(MediaPlayer context) {
        System.out.println("⏸️ Cannot pause - player is stopped");
    }
    
    @Override
    public void stop(MediaPlayer context) {
        System.out.println("⏹️ Player is already stopped");
    }
    
    @Override
    public void next(MediaPlayer context) {
        System.out.println("⏭️ Loading next track...");
        loadTrack(context, context.getTrackNumber() + 1);
    }
    
    @Override
    public void previous(MediaPlayer context) {
        System.out.println("⏮️ Loading previous track...");
        if (context.getTrackNumber() > 1) {
            loadTrack(context, context.getTrackNumber() - 1);
        }
    }
    
    private void loadTrack(MediaPlayer context, int trackNumber) {
        context.setTrackNumber(trackNumber);
        context.setCurrentTrack("Song " + trackNumber + " - Artist " + trackNumber);
        System.out.println("🎵 Loaded: " + context.getCurrentTrack());
    }
    
    @Override
    public String getStateName() {
        return "Stopped";
    }
}

class PlayingState implements MediaPlayerState {
    @Override
    public void play(MediaPlayer context) {
        System.out.println("▶️ Already playing: " + context.getCurrentTrack());
    }
    
    @Override
    public void pause(MediaPlayer context) {
        System.out.println("⏸️ Pausing playback...");
        context.setState(new PausedState());
    }
    
    @Override
    public void stop(MediaPlayer context) {
        System.out.println("⏹️ Stopping playback...");
        context.setState(new StoppedState());
    }
    
    @Override
    public void next(MediaPlayer context) {
        System.out.println("⏭️ Skipping to next track...");
        int nextTrack = context.getTrackNumber() + 1;
        context.setTrackNumber(nextTrack);
        context.setCurrentTrack("Song " + nextTrack + " - Artist " + nextTrack);
        System.out.println("🎵 Now playing: " + context.getCurrentTrack());
    }
    
    @Override
    public void previous(MediaPlayer context) {
        System.out.println("⏮️ Going to previous track...");
        if (context.getTrackNumber() > 1) {
            int prevTrack = context.getTrackNumber() - 1;
            context.setTrackNumber(prevTrack);
            context.setCurrentTrack("Song " + prevTrack + " - Artist " + prevTrack);
            System.out.println("🎵 Now playing: " + context.getCurrentTrack());
        } else {
            System.out.println("🔚 Already at first track");
        }
    }
    
    @Override
    public String getStateName() {
        return "Playing";
    }
}

class PausedState implements MediaPlayerState {
    @Override
    public void play(MediaPlayer context) {
        System.out.println("▶️ Resuming playback...");
        context.setState(new PlayingState());
    }
    
    @Override
    public void pause(MediaPlayer context) {
        System.out.println("⏸️ Already paused");
    }
    
    @Override
    public void stop(MediaPlayer context) {
        System.out.println("⏹️ Stopping from paused state...");
        context.setState(new StoppedState());
    }
    
    @Override
    public void next(MediaPlayer context) {
        System.out.println("⏭️ Loading next track (will remain paused)...");
        int nextTrack = context.getTrackNumber() + 1;
        context.setTrackNumber(nextTrack);
        context.setCurrentTrack("Song " + nextTrack + " - Artist " + nextTrack);
        System.out.println("🎵 Loaded: " + context.getCurrentTrack());
    }
    
    @Override
    public void previous(MediaPlayer context) {
        System.out.println("⏮️ Loading previous track (will remain paused)...");
        if (context.getTrackNumber() > 1) {
            int prevTrack = context.getTrackNumber() - 1;
            context.setTrackNumber(prevTrack);
            context.setCurrentTrack("Song " + prevTrack + " - Artist " + prevTrack);
            System.out.println("🎵 Loaded: " + context.getCurrentTrack());
        }
    }
    
    @Override
    public String getStateName() {
        return "Paused";
    }
}

// Demo class
public class StatePatternDemo {
    public static void main(String[] args) {
        System.out.println("=== MEDIA PLAYER STATE PATTERN DEMO ===\n");
        
        MediaPlayer player = new MediaPlayer();
        
        // Initial state
        player.displayStatus();
        
        // Test different state transitions
        System.out.println("1. STARTING PLAYBACK");
        player.play();
        player.displayStatus();
        
        System.out.println("2. SKIPPING TRACKS WHILE PLAYING");
        player.next();
        player.next();
        player.displayStatus();
        
        System.out.println("3. PAUSING PLAYBACK");
        player.pause();
        player.displayStatus();
        
        System.out.println("4. TRYING TO PAUSE AGAIN");
        player.pause();
        
        System.out.println("5. NAVIGATING WHILE PAUSED");
        player.previous();
        player.displayStatus();
        
        System.out.println("6. RESUMING PLAYBACK");
        player.play();
        player.displayStatus();
        
        System.out.println("7. STOPPING PLAYBACK");
        player.stop();
        player.displayStatus();
        
        System.out.println("8. TRYING TO PAUSE WHEN STOPPED");
        player.pause();
        
        System.out.println("9. NAVIGATING WHEN STOPPED");
        player.next();
        player.displayStatus();
        
        System.out.println("=== STATE PATTERN BENEFITS ===");
        System.out.println("✓ Eliminates complex conditional logic");
        System.out.println("✓ Each state handles its own behavior");
        System.out.println("✓ Easy to add new states without modifying existing code");
        System.out.println("✓ State transitions are explicit and clear");
        System.out.println("✓ Follows Single Responsibility Principle");
    }
}
