"""
Iterator Pattern - Music Playlist System
Provides sequential access to elements without exposing underlying representation
"""

from abc import ABC, abstractmethod
from typing import List, Optional, TypeVar, Generic
import random

T = TypeVar('T')

class Song:
    """Represents a song with metadata"""
    
    def __init__(self, title: str, artist: str, album: str, duration: int, genre: str):
        self.title = title
        self.artist = artist
        self.album = album
        self.duration = duration  # in seconds
        self.genre = genre
    
    def get_formatted_duration(self) -> str:
        """Get duration in mm:ss format"""
        minutes = self.duration // 60
        seconds = self.duration % 60
        return f"{minutes}:{seconds:02d}"
    
    def __str__(self) -> str:
        return f'"{self.title}" by {self.artist} [{self.album}] ({self.get_formatted_duration()}) - {self.genre}'
    
    def __eq__(self, other) -> bool:
        if not isinstance(other, Song):
            return False
        return self.title == other.title and self.artist == other.artist
    
    def __hash__(self) -> int:
        return hash((self.title, self.artist))

class Iterator(ABC, Generic[T]):
    """Abstract iterator interface"""
    
    @abstractmethod
    def has_next(self) -> bool:
        """Check if there are more elements"""
        pass
    
    @abstractmethod
    def next(self) -> T:
        """Get the next element"""
        pass
    
    @abstractmethod
    def reset(self) -> None:
        """Reset iterator to beginning"""
        pass

class IterableCollection(ABC, Generic[T]):
    """Abstract aggregate interface"""
    
    @abstractmethod
    def create_iterator(self) -> Iterator[T]:
        """Create forward iterator"""
        pass
    
    @abstractmethod
    def create_reverse_iterator(self) -> Iterator[T]:
        """Create reverse iterator"""
        pass
    
    @abstractmethod
    def create_shuffle_iterator(self) -> Iterator[T]:
        """Create shuffle iterator"""
        pass

class ForwardIterator(Iterator[T]):
    """Iterator that traverses collection from beginning to end"""
    
    def __init__(self, collection: List[T]):
        self._collection = collection.copy()
        self._position = 0
    
    def has_next(self) -> bool:
        return self._position < len(self._collection)
    
    def next(self) -> T:
        if not self.has_next():
            raise StopIteration("No more elements")
        result = self._collection[self._position]
        self._position += 1
        return result
    
    def reset(self) -> None:
        self._position = 0

class ReverseIterator(Iterator[T]):
    """Iterator that traverses collection from end to beginning"""
    
    def __init__(self, collection: List[T]):
        self._collection = collection.copy()
        self._position = len(self._collection) - 1
    
    def has_next(self) -> bool:
        return self._position >= 0
    
    def next(self) -> T:
        if not self.has_next():
            raise StopIteration("No more elements")
        result = self._collection[self._position]
        self._position -= 1
        return result
    
    def reset(self) -> None:
        self._position = len(self._collection) - 1

class ShuffleIterator(Iterator[T]):
    """Iterator that traverses collection in random order"""
    
    def __init__(self, collection: List[T]):
        self._original_collection = collection.copy()
        self._shuffled_collection = collection.copy()
        random.shuffle(self._shuffled_collection)
        self._position = 0
    
    def has_next(self) -> bool:
        return self._position < len(self._shuffled_collection)
    
    def next(self) -> T:
        if not self.has_next():
            raise StopIteration("No more elements")
        result = self._shuffled_collection[self._position]
        self._position += 1
        return result
    
    def reset(self) -> None:
        """Reset and reshuffle"""
        self._shuffled_collection = self._original_collection.copy()
        random.shuffle(self._shuffled_collection)
        self._position = 0

class GenreFilterIterator(Iterator[Song]):
    """Iterator that filters songs by genre"""
    
    def __init__(self, collection: List[Song], genre: str):
        self._collection = collection.copy()
        self._target_genre = genre.lower()
        self._position = 0
        self._find_next_match()
    
    def has_next(self) -> bool:
        return self._position < len(self._collection)
    
    def next(self) -> Song:
        if not self.has_next():
            raise StopIteration("No more elements")
        result = self._collection[self._position]
        self._position += 1
        self._find_next_match()
        return result
    
    def reset(self) -> None:
        self._position = 0
        self._find_next_match()
    
    def _find_next_match(self) -> None:
        """Find next song that matches the target genre"""
        while (self._position < len(self._collection) and 
               self._collection[self._position].genre.lower() != self._target_genre):
            self._position += 1

class MusicPlaylist(IterableCollection[Song]):
    """Concrete aggregate - Music Playlist"""
    
    def __init__(self, name: str):
        self._playlist_name = name
        self._songs: List[Song] = []
    
    def add_song(self, song: Song) -> None:
        """Add a song to the playlist"""
        if song not in self._songs:
            self._songs.append(song)
            print(f"Added to {self._playlist_name}: {song.title}")
        else:
            print(f"Song already exists in playlist: {song.title}")
    
    def remove_song(self, song: Song) -> None:
        """Remove a song from the playlist"""
        if song in self._songs:
            self._songs.remove(song)
            print(f"Removed from {self._playlist_name}: {song.title}")
        else:
            print(f"Song not found in playlist: {song.title}")
    
    def size(self) -> int:
        """Get number of songs in playlist"""
        return len(self._songs)
    
    @property
    def name(self) -> str:
        """Get playlist name"""
        return self._playlist_name
    
    # Iterator factory methods
    def create_iterator(self) -> Iterator[Song]:
        return ForwardIterator(self._songs)
    
    def create_reverse_iterator(self) -> Iterator[Song]:
        return ReverseIterator(self._songs)
    
    def create_shuffle_iterator(self) -> Iterator[Song]:
        return ShuffleIterator(self._songs)
    
    def create_genre_iterator(self, genre: str) -> Iterator[Song]:
        """Create iterator that filters by genre"""
        return GenreFilterIterator(self._songs, genre)
    
    def show_playlist_info(self) -> None:
        """Display playlist information"""
        print(f"\n=== Playlist: {self._playlist_name} ===")
        print(f"Total songs: {len(self._songs)}")
        if self._songs:
            total_duration = sum(song.duration for song in self._songs)
            print(f"Total duration: {self._format_total_duration(total_duration)}")
    
    def _format_total_duration(self, total_seconds: int) -> str:
        """Format total duration as h:mm:ss or mm:ss"""
        hours = total_seconds // 3600
        minutes = (total_seconds % 3600) // 60
        seconds = total_seconds % 60
        
        if hours > 0:
            return f"{hours}:{minutes:02d}:{seconds:02d}"
        else:
            return f"{minutes}:{seconds:02d}"

class MusicPlayer:
    """Music player that uses iterators to play songs"""
    
    def __init__(self, name: str):
        self._player_name = name
    
    def play(self, iterator: Iterator[Song], mode: str) -> None:
        """Play all songs using the provided iterator"""
        print(f"\n{self._player_name} - Playing in {mode} mode:")
        print("=" * (len(self._player_name) + len(mode) + 20))
        
        track_number = 1
        while iterator.has_next():
            song = iterator.next()
            print(f"{track_number}. {song}")
            track_number += 1
        
        if track_number == 1:
            print("No songs found for the specified criteria.")
        print()
    
    def play_first(self, iterator: Iterator[Song], count: int, mode: str) -> None:
        """Play first N songs using the provided iterator"""
        print(f"\n{self._player_name} - Playing first {count} songs in {mode} mode:")
        print("=" * (len(self._player_name) + len(mode) + 30))
        
        track_number = 1
        while iterator.has_next() and track_number <= count:
            song = iterator.next()
            print(f"{track_number}. {song}")
            track_number += 1
        print()

def main():
    """Demonstrate the Iterator pattern"""
    print("=== Iterator Pattern - Music Playlist System ===\n")
    
    # Create songs
    songs_to_add = [
        Song("Bohemian Rhapsody", "Queen", "A Night at the Opera", 355, "Rock"),
        Song("Stairway to Heaven", "Led Zeppelin", "Led Zeppelin IV", 482, "Rock"),
        Song("Hotel California", "Eagles", "Hotel California", 391, "Rock"),
        Song("Imagine", "John Lennon", "Imagine", 183, "Pop"),
        Song("Yesterday", "The Beatles", "Help!", 125, "Pop"),
        Song("What's Going On", "Marvin Gaye", "What's Going On", 229, "Soul"),
        Song("Respect", "Aretha Franklin", "I Never Loved a Man", 147, "Soul"),
        Song("Like a Rolling Stone", "Bob Dylan", "Highway 61 Revisited", 369, "Folk"),
        Song("Smells Like Teen Spirit", "Nirvana", "Nevermind", 301, "Grunge"),
        Song("Billie Jean", "Michael Jackson", "Thriller", 294, "Pop")
    ]
    
    # Create playlist and add songs
    my_playlist = MusicPlaylist("My Greatest Hits")
    
    for song in songs_to_add:
        my_playlist.add_song(song)
    
    my_playlist.show_playlist_info()
    
    # Create music player
    player = MusicPlayer("Spotify Player")
    
    # Demonstrate different iteration patterns
    print("\n1. Forward Iteration:")
    forward_iterator = my_playlist.create_iterator()
    player.play(forward_iterator, "Sequential")
    
    print("2. Reverse Iteration:")
    reverse_iterator = my_playlist.create_reverse_iterator()
    player.play(reverse_iterator, "Reverse")
    
    print("3. Shuffle Iteration:")
    shuffle_iterator = my_playlist.create_shuffle_iterator()
    player.play(shuffle_iterator, "Shuffle")
    
    print("4. Genre Filter Iteration (Rock songs only):")
    rock_iterator = my_playlist.create_genre_iterator("Rock")
    player.play(rock_iterator, "Rock Filter")
    
    print("5. Genre Filter Iteration (Pop songs only):")
    pop_iterator = my_playlist.create_genre_iterator("Pop")
    player.play(pop_iterator, "Pop Filter")
    
    print("6. Limited Playback (First 3 songs):")
    limited_iterator = my_playlist.create_iterator()
    player.play_first(limited_iterator, 3, "Sequential")
    
    # Demonstrate iterator reset functionality
    print("7. Iterator Reset Demonstration:")
    reset_iterator = my_playlist.create_shuffle_iterator()
    print("First shuffle:")
    player.play_first(reset_iterator, 3, "Shuffle")
    
    reset_iterator.reset()
    print("After reset - Second shuffle:")
    player.play_first(reset_iterator, 3, "Shuffle")
    
    # Demonstrate multiple simultaneous iterators
    print("8. Multiple Simultaneous Iterators:")
    iter1 = my_playlist.create_iterator()
    iter2 = my_playlist.create_reverse_iterator()
    
    print(f"Forward iterator - First song: {iter1.next().title if iter1.has_next() else 'None'}")
    print(f"Reverse iterator - First song: {iter2.next().title if iter2.has_next() else 'None'}")
    print(f"Forward iterator - Second song: {iter1.next().title if iter1.has_next() else 'None'}")
    print(f"Reverse iterator - Second song: {iter2.next().title if iter2.has_next() else 'None'}")
    
    # Demonstrate Python's iterator protocol compatibility
    print("\n9. Python Iterator Protocol Integration:")
    
    class PythonIteratorAdapter:
        """Adapter to make our iterator work with Python's for loops"""
        
        def __init__(self, custom_iterator: Iterator[Song]):
            self._iterator = custom_iterator
        
        def __iter__(self):
            return self
        
        def __next__(self):
            if self._iterator.has_next():
                return self._iterator.next()
            else:
                raise StopIteration
    
    print("Using Python's for loop with custom iterator:")
    adapted_iterator = PythonIteratorAdapter(my_playlist.create_genre_iterator("Pop"))
    for i, song in enumerate(adapted_iterator, 1):
        print(f"{i}. {song.title} by {song.artist}")
    
    print("\n=== Iterator Pattern Benefits ===")
    print("1. Uniform Interface: Same interface for different traversal algorithms")
    print("2. Encapsulation: Internal structure of collection is hidden")
    print("3. Multiple Iterators: Can have multiple iterators on same collection")
    print("4. Polymorphic Iteration: Client code works with any iterator implementation")
    print("5. Lazy Evaluation: Elements are accessed only when needed")
    print("6. Memory Efficient: Don't need to load all elements at once")
    print("7. Separation of Concerns: Iteration logic is separate from collection logic")

if __name__ == "__main__":
    main()
