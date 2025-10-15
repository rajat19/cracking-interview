// Iterator Pattern - Music Playlist System
// Provides sequential access to elements without exposing underlying representation

import java.util.*;

// Song class - the elements we'll iterate over
class Song {
    private String title;
    private String artist;
    private String album;
    private int duration; // in seconds
    private String genre;
    
    public Song(String title, String artist, String album, int duration, String genre) {
        this.title = title;
        this.artist = artist;
        this.album = album;
        this.duration = duration;
        this.genre = genre;
    }
    
    // Getters
    public String getTitle() { return title; }
    public String getArtist() { return artist; }
    public String getAlbum() { return album; }
    public int getDuration() { return duration; }
    public String getGenre() { return genre; }
    
    public String getFormattedDuration() {
        int minutes = duration / 60;
        int seconds = duration % 60;
        return String.format("%d:%02d", minutes, seconds);
    }
    
    @Override
    public String toString() {
        return String.format("\"%s\" by %s [%s] (%s) - %s", 
                           title, artist, album, getFormattedDuration(), genre);
    }
    
    @Override
    public boolean equals(Object obj) {
        if (this == obj) return true;
        if (obj == null || getClass() != obj.getClass()) return false;
        Song song = (Song) obj;
        return Objects.equals(title, song.title) && Objects.equals(artist, song.artist);
    }
    
    @Override
    public int hashCode() {
        return Objects.hash(title, artist);
    }
}

// Generic Iterator interface
interface Iterator<T> {
    boolean hasNext();
    T next();
    void reset();
}

// Aggregate interface
interface IterableCollection<T> {
    Iterator<T> createIterator();
    Iterator<T> createReverseIterator();
    Iterator<T> createShuffleIterator();
}

// Forward Iterator implementation
class ForwardIterator<T> implements Iterator<T> {
    private List<T> collection;
    private int position;
    
    public ForwardIterator(List<T> collection) {
        this.collection = new ArrayList<>(collection);
        this.position = 0;
    }
    
    @Override
    public boolean hasNext() {
        return position < collection.size();
    }
    
    @Override
    public T next() {
        if (!hasNext()) {
            throw new NoSuchElementException("No more elements");
        }
        return collection.get(position++);
    }
    
    @Override
    public void reset() {
        position = 0;
    }
}

// Reverse Iterator implementation
class ReverseIterator<T> implements Iterator<T> {
    private List<T> collection;
    private int position;
    
    public ReverseIterator(List<T> collection) {
        this.collection = new ArrayList<>(collection);
        this.position = collection.size() - 1;
    }
    
    @Override
    public boolean hasNext() {
        return position >= 0;
    }
    
    @Override
    public T next() {
        if (!hasNext()) {
            throw new NoSuchElementException("No more elements");
        }
        return collection.get(position--);
    }
    
    @Override
    public void reset() {
        position = collection.size() - 1;
    }
}

// Shuffle Iterator implementation
class ShuffleIterator<T> implements Iterator<T> {
    private List<T> shuffledCollection;
    private int position;
    
    public ShuffleIterator(List<T> collection) {
        this.shuffledCollection = new ArrayList<>(collection);
        Collections.shuffle(this.shuffledCollection);
        this.position = 0;
    }
    
    @Override
    public boolean hasNext() {
        return position < shuffledCollection.size();
    }
    
    @Override
    public T next() {
        if (!hasNext()) {
            throw new NoSuchElementException("No more elements");
        }
        return shuffledCollection.get(position++);
    }
    
    @Override
    public void reset() {
        Collections.shuffle(shuffledCollection);
        position = 0;
    }
}

// Genre Filter Iterator - filters songs by genre
class GenreFilterIterator implements Iterator<Song> {
    private List<Song> collection;
    private String targetGenre;
    private int position;
    
    public GenreFilterIterator(List<Song> collection, String genre) {
        this.collection = new ArrayList<>(collection);
        this.targetGenre = genre.toLowerCase();
        this.position = 0;
        findNextMatch();
    }
    
    @Override
    public boolean hasNext() {
        return position < collection.size();
    }
    
    @Override
    public Song next() {
        if (!hasNext()) {
            throw new NoSuchElementException("No more elements");
        }
        Song result = collection.get(position++);
        findNextMatch();
        return result;
    }
    
    @Override
    public void reset() {
        position = 0;
        findNextMatch();
    }
    
    private void findNextMatch() {
        while (position < collection.size() && 
               !collection.get(position).getGenre().toLowerCase().equals(targetGenre)) {
            position++;
        }
    }
}

// Concrete Aggregate - Music Playlist
class MusicPlaylist implements IterableCollection<Song> {
    private List<Song> songs;
    private String playlistName;
    
    public MusicPlaylist(String name) {
        this.playlistName = name;
        this.songs = new ArrayList<>();
    }
    
    public void addSong(Song song) {
        if (!songs.contains(song)) {
            songs.add(song);
            System.out.println("Added to " + playlistName + ": " + song.getTitle());
        } else {
            System.out.println("Song already exists in playlist: " + song.getTitle());
        }
    }
    
    public void removeSong(Song song) {
        if (songs.remove(song)) {
            System.out.println("Removed from " + playlistName + ": " + song.getTitle());
        } else {
            System.out.println("Song not found in playlist: " + song.getTitle());
        }
    }
    
    public int size() {
        return songs.size();
    }
    
    public String getName() {
        return playlistName;
    }
    
    // Iterator factory methods
    @Override
    public Iterator<Song> createIterator() {
        return new ForwardIterator<>(songs);
    }
    
    @Override
    public Iterator<Song> createReverseIterator() {
        return new ReverseIterator<>(songs);
    }
    
    @Override
    public Iterator<Song> createShuffleIterator() {
        return new ShuffleIterator<>(songs);
    }
    
    public Iterator<Song> createGenreIterator(String genre) {
        return new GenreFilterIterator(songs, genre);
    }
    
    // Utility method to display playlist info
    public void showPlaylistInfo() {
        System.out.println("\n=== Playlist: " + playlistName + " ===");
        System.out.println("Total songs: " + songs.size());
        if (!songs.isEmpty()) {
            int totalDuration = songs.stream().mapToInt(Song::getDuration).sum();
            System.out.println("Total duration: " + formatTotalDuration(totalDuration));
        }
    }
    
    private String formatTotalDuration(int totalSeconds) {
        int hours = totalSeconds / 3600;
        int minutes = (totalSeconds % 3600) / 60;
        int seconds = totalSeconds % 60;
        if (hours > 0) {
            return String.format("%d:%02d:%02d", hours, minutes, seconds);
        } else {
            return String.format("%d:%02d", minutes, seconds);
        }
    }
}

// Music Player using Iterator
class MusicPlayer {
    private String playerName;
    
    public MusicPlayer(String name) {
        this.playerName = name;
    }
    
    public void play(Iterator<Song> iterator, String mode) {
        System.out.println("\n" + playerName + " - Playing in " + mode + " mode:");
        System.out.println("=" + "=".repeat(playerName.length() + mode.length() + 20));
        
        int trackNumber = 1;
        while (iterator.hasNext()) {
            Song song = iterator.next();
            System.out.println(trackNumber + ". " + song);
            trackNumber++;
        }
        
        if (trackNumber == 1) {
            System.out.println("No songs found for the specified criteria.");
        }
        System.out.println();
    }
    
    public void playFirst(Iterator<Song> iterator, int count, String mode) {
        System.out.println("\n" + playerName + " - Playing first " + count + " songs in " + mode + " mode:");
        System.out.println("=" + "=".repeat(playerName.length() + mode.length() + 30));
        
        int trackNumber = 1;
        while (iterator.hasNext() && trackNumber <= count) {
            Song song = iterator.next();
            System.out.println(trackNumber + ". " + song);
            trackNumber++;
        }
        System.out.println();
    }
}

// Main demonstration class
public class IteratorPatternDemo {
    public static void main(String[] args) {
        System.out.println("=== Iterator Pattern - Music Playlist System ===\n");
        
        // Create songs
        List<Song> songsToAdd = Arrays.asList(
            new Song("Bohemian Rhapsody", "Queen", "A Night at the Opera", 355, "Rock"),
            new Song("Stairway to Heaven", "Led Zeppelin", "Led Zeppelin IV", 482, "Rock"),
            new Song("Hotel California", "Eagles", "Hotel California", 391, "Rock"),
            new Song("Imagine", "John Lennon", "Imagine", 183, "Pop"),
            new Song("Yesterday", "The Beatles", "Help!", 125, "Pop"),
            new Song("What's Going On", "Marvin Gaye", "What's Going On", 229, "Soul"),
            new Song("Respect", "Aretha Franklin", "I Never Loved a Man", 147, "Soul"),
            new Song("Like a Rolling Stone", "Bob Dylan", "Highway 61 Revisited", 369, "Folk"),
            new Song("Smells Like Teen Spirit", "Nirvana", "Nevermind", 301, "Grunge"),
            new Song("Billie Jean", "Michael Jackson", "Thriller", 294, "Pop")
        );
        
        // Create playlist and add songs
        MusicPlaylist myPlaylist = new MusicPlaylist("My Greatest Hits");
        
        for (Song song : songsToAdd) {
            myPlaylist.addSong(song);
        }
        
        myPlaylist.showPlaylistInfo();
        
        // Create music player
        MusicPlayer player = new MusicPlayer("Spotify Player");
        
        // Demonstrate different iteration patterns
        System.out.println("\n1. Forward Iteration:");
        Iterator<Song> forwardIterator = myPlaylist.createIterator();
        player.play(forwardIterator, "Sequential");
        
        System.out.println("2. Reverse Iteration:");
        Iterator<Song> reverseIterator = myPlaylist.createReverseIterator();
        player.play(reverseIterator, "Reverse");
        
        System.out.println("3. Shuffle Iteration:");
        Iterator<Song> shuffleIterator = myPlaylist.createShuffleIterator();
        player.play(shuffleIterator, "Shuffle");
        
        System.out.println("4. Genre Filter Iteration (Rock songs only):");
        Iterator<Song> rockIterator = myPlaylist.createGenreIterator("Rock");
        player.play(rockIterator, "Rock Filter");
        
        System.out.println("5. Genre Filter Iteration (Pop songs only):");
        Iterator<Song> popIterator = myPlaylist.createGenreIterator("Pop");
        player.play(popIterator, "Pop Filter");
        
        System.out.println("6. Limited Playback (First 3 songs):");
        Iterator<Song> limitedIterator = myPlaylist.createIterator();
        player.playFirst(limitedIterator, 3, "Sequential");
        
        // Demonstrate iterator reset functionality
        System.out.println("7. Iterator Reset Demonstration:");
        Iterator<Song> resetIterator = myPlaylist.createShuffleIterator();
        System.out.println("First shuffle:");
        player.playFirst(resetIterator, 3, "Shuffle");
        
        resetIterator.reset();
        System.out.println("After reset - Second shuffle:");
        player.playFirst(resetIterator, 3, "Shuffle");
        
        System.out.println("\n=== Iterator Pattern Benefits ===");
        System.out.println("1. Uniform Interface: Same interface for different traversal algorithms");
        System.out.println("2. Encapsulation: Internal structure of collection is hidden");
        System.out.println("3. Multiple Iterators: Can have multiple iterators on same collection");
        System.out.println("4. Polymorphic Iteration: Client code works with any iterator implementation");
        System.out.println("5. Lazy Evaluation: Elements are accessed only when needed");
        System.out.println("6. Memory Efficient: Don't need to load all elements at once");
        
        // Demonstrate multiple simultaneous iterators
        System.out.println("\n8. Multiple Simultaneous Iterators:");
        Iterator<Song> iter1 = myPlaylist.createIterator();
        Iterator<Song> iter2 = myPlaylist.createReverseIterator();
        
        System.out.println("Forward iterator - First song: " + (iter1.hasNext() ? iter1.next().getTitle() : "None"));
        System.out.println("Reverse iterator - First song: " + (iter2.hasNext() ? iter2.next().getTitle() : "None"));
        System.out.println("Forward iterator - Second song: " + (iter1.hasNext() ? iter1.next().getTitle() : "None"));
        System.out.println("Reverse iterator - Second song: " + (iter2.hasNext() ? iter2.next().getTitle() : "None"));
    }
}
