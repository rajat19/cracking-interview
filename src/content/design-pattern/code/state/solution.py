from abc import ABC, abstractmethod
from typing import Optional

# Forward declaration
class MediaPlayer:
    pass

# State interface
class MediaPlayerState(ABC):
    @abstractmethod
    def play(self, context: MediaPlayer) -> None:
        pass
    
    @abstractmethod
    def pause(self, context: MediaPlayer) -> None:
        pass
    
    @abstractmethod
    def stop(self, context: MediaPlayer) -> None:
        pass
    
    @abstractmethod
    def next(self, context: MediaPlayer) -> None:
        pass
    
    @abstractmethod
    def previous(self, context: MediaPlayer) -> None:
        pass
    
    @abstractmethod
    def get_state_name(self) -> str:
        pass

# Context class
class MediaPlayer:
    def __init__(self):
        from .state_implementations import StoppedState  # Import here to avoid circular import
        self._current_state: MediaPlayerState = StoppedState()
        self._current_track: str = "No track selected"
        self._track_number: int = 0
        self._volume: int = 50
    
    def set_state(self, state: MediaPlayerState) -> None:
        self._current_state = state
        print(f"🔄 State changed to: {state.get_state_name()}")
    
    # Delegate operations to current state
    def play(self) -> None:
        self._current_state.play(self)
    
    def pause(self) -> None:
        self._current_state.pause(self)
    
    def stop(self) -> None:
        self._current_state.stop(self)
    
    def next(self) -> None:
        self._current_state.next(self)
    
    def previous(self) -> None:
        self._current_state.previous(self)
    
    # Getters and setters
    def get_current_track(self) -> str:
        return self._current_track
    
    def set_current_track(self, track: str) -> None:
        self._current_track = track
    
    def get_track_number(self) -> int:
        return self._track_number
    
    def set_track_number(self, number: int) -> None:
        self._track_number = number
    
    def get_volume(self) -> int:
        return self._volume
    
    def set_volume(self, volume: int) -> None:
        self._volume = volume
    
    def get_state_name(self) -> str:
        return self._current_state.get_state_name()
    
    def display_status(self) -> None:
        print("━━━ MEDIA PLAYER STATUS ━━━")
        print(f"State: {self.get_state_name()}")
        print(f"Track: {self._current_track}")
        print(f"Track #: {self._track_number}")
        print(f"Volume: {self._volume}%")
        print("━━━━━━━━━━━━━━━━━━━━━━━━━━━\n")

# Concrete States
class StoppedState(MediaPlayerState):
    def _load_track(self, context: MediaPlayer, track_number: int) -> None:
        context.set_track_number(track_number)
        context.set_current_track(f"Song {track_number} - Artist {track_number}")
        print(f"🎵 Loaded: {context.get_current_track()}")
    
    def play(self, context: MediaPlayer) -> None:
        print("▶️ Starting playback...")
        self._load_track(context, 1)
        context.set_state(PlayingState())
    
    def pause(self, context: MediaPlayer) -> None:
        print("⏸️ Cannot pause - player is stopped")
    
    def stop(self, context: MediaPlayer) -> None:
        print("⏹️ Player is already stopped")
    
    def next(self, context: MediaPlayer) -> None:
        print("⏭️ Loading next track...")
        self._load_track(context, context.get_track_number() + 1)
    
    def previous(self, context: MediaPlayer) -> None:
        print("⏮️ Loading previous track...")
        if context.get_track_number() > 1:
            self._load_track(context, context.get_track_number() - 1)
    
    def get_state_name(self) -> str:
        return "Stopped"

class PlayingState(MediaPlayerState):
    def play(self, context: MediaPlayer) -> None:
        print(f"▶️ Already playing: {context.get_current_track()}")
    
    def pause(self, context: MediaPlayer) -> None:
        print("⏸️ Pausing playback...")
        context.set_state(PausedState())
    
    def stop(self, context: MediaPlayer) -> None:
        print("⏹️ Stopping playback...")
        context.set_state(StoppedState())
    
    def next(self, context: MediaPlayer) -> None:
        print("⏭️ Skipping to next track...")
        next_track = context.get_track_number() + 1
        context.set_track_number(next_track)
        context.set_current_track(f"Song {next_track} - Artist {next_track}")
        print(f"🎵 Now playing: {context.get_current_track()}")
    
    def previous(self, context: MediaPlayer) -> None:
        print("⏮️ Going to previous track...")
        if context.get_track_number() > 1:
            prev_track = context.get_track_number() - 1
            context.set_track_number(prev_track)
            context.set_current_track(f"Song {prev_track} - Artist {prev_track}")
            print(f"🎵 Now playing: {context.get_current_track()}")
        else:
            print("🔚 Already at first track")
    
    def get_state_name(self) -> str:
        return "Playing"

class PausedState(MediaPlayerState):
    def play(self, context: MediaPlayer) -> None:
        print("▶️ Resuming playback...")
        context.set_state(PlayingState())
    
    def pause(self, context: MediaPlayer) -> None:
        print("⏸️ Already paused")
    
    def stop(self, context: MediaPlayer) -> None:
        print("⏹️ Stopping from paused state...")
        context.set_state(StoppedState())
    
    def next(self, context: MediaPlayer) -> None:
        print("⏭️ Loading next track (will remain paused)...")
        next_track = context.get_track_number() + 1
        context.set_track_number(next_track)
        context.set_current_track(f"Song {next_track} - Artist {next_track}")
        print(f"🎵 Loaded: {context.get_current_track()}")
    
    def previous(self, context: MediaPlayer) -> None:
        print("⏮️ Loading previous track (will remain paused)...")
        if context.get_track_number() > 1:
            prev_track = context.get_track_number() - 1
            context.set_track_number(prev_track)
            context.set_current_track(f"Song {prev_track} - Artist {prev_track}")
            print(f"🎵 Loaded: {context.get_current_track()}")
    
    def get_state_name(self) -> str:
        return "Paused"

# Update MediaPlayer constructor to avoid circular import
MediaPlayer.__init__ = lambda self: (
    setattr(self, '_current_state', StoppedState()),
    setattr(self, '_current_track', "No track selected"),
    setattr(self, '_track_number', 0),
    setattr(self, '_volume', 50)
)[0] or None

def main():
    print("=== MEDIA PLAYER STATE PATTERN DEMO ===\n")
    
    player = MediaPlayer()
    
    # Initial state
    player.display_status()
    
    # Test different state transitions
    print("1. STARTING PLAYBACK")
    player.play()
    player.display_status()
    
    print("2. SKIPPING TRACKS WHILE PLAYING")
    player.next()
    player.next()
    player.display_status()
    
    print("3. PAUSING PLAYBACK")
    player.pause()
    player.display_status()
    
    print("4. TRYING TO PAUSE AGAIN")
    player.pause()
    
    print("5. NAVIGATING WHILE PAUSED")
    player.previous()
    player.display_status()
    
    print("6. RESUMING PLAYBACK")
    player.play()
    player.display_status()
    
    print("7. STOPPING PLAYBACK")
    player.stop()
    player.display_status()
    
    print("8. TRYING TO PAUSE WHEN STOPPED")
    player.pause()
    
    print("9. NAVIGATING WHEN STOPPED")
    player.next()
    player.display_status()
    
    print("=== STATE PATTERN BENEFITS ===")
    print("✓ Eliminates complex conditional logic")
    print("✓ Each state handles its own behavior")
    print("✓ Easy to add new states without modifying existing code")
    print("✓ State transitions are explicit and clear")
    print("✓ Follows Single Responsibility Principle")

if __name__ == "__main__":
    main()
