// Iterator Pattern - Music Playlist System
// Provides sequential access to elements without exposing underlying representation

#include <iostream>
#include <string>
#include <vector>
#include <memory>
#include <algorithm>
#include <random>
#include <chrono>

// Song class - the elements we'll iterate over
class Song {
private:
    std::string title;
    std::string artist;
    std::string album;
    int duration; // in seconds
    std::string genre;

public:
    Song(const std::string& t, const std::string& a, const std::string& al, int d, const std::string& g)
        : title(t), artist(a), album(al), duration(d), genre(g) {}
    
    // Getters
    std::string getTitle() const { return title; }
    std::string getArtist() const { return artist; }
    std::string getAlbum() const { return album; }
    int getDuration() const { return duration; }
    std::string getGenre() const { return genre; }
    
    std::string getFormattedDuration() const {
        int minutes = duration / 60;
        int seconds = duration % 60;
        return std::to_string(minutes) + ":" + (seconds < 10 ? "0" : "") + std::to_string(seconds);
    }
    
    std::string toString() const {
        return "\"" + title + "\" by " + artist + " [" + album + "] (" + 
               getFormattedDuration() + ") - " + genre;
    }
    
    bool operator==(const Song& other) const {
        return title == other.title && artist == other.artist;
    }
};

// Abstract Iterator interface
template<typename T>
class Iterator {
public:
    virtual ~Iterator() = default;
    virtual bool hasNext() = 0;
    virtual T next() = 0;
    virtual void reset() = 0;
};

// Abstract Aggregate interface
template<typename T>
class IterableCollection {
public:
    virtual ~IterableCollection() = default;
    virtual std::unique_ptr<Iterator<T>> createIterator() = 0;
    virtual std::unique_ptr<Iterator<T>> createReverseIterator() = 0;
    virtual std::unique_ptr<Iterator<T>> createShuffleIterator() = 0;
};

// Forward Iterator implementation
template<typename T>
class ForwardIterator : public Iterator<T> {
private:
    std::vector<T> collection;
    size_t position;

public:
    ForwardIterator(const std::vector<T>& coll) : collection(coll), position(0) {}
    
    bool hasNext() override {
        return position < collection.size();
    }
    
    T next() override {
        if (!hasNext()) {
            throw std::runtime_error("No more elements");
        }
        return collection[position++];
    }
    
    void reset() override {
        position = 0;
    }
};

// Reverse Iterator implementation
template<typename T>
class ReverseIterator : public Iterator<T> {
private:
    std::vector<T> collection;
    int position;

public:
    ReverseIterator(const std::vector<T>& coll) : collection(coll) {
        position = static_cast<int>(collection.size()) - 1;
    }
    
    bool hasNext() override {
        return position >= 0;
    }
    
    T next() override {
        if (!hasNext()) {
            throw std::runtime_error("No more elements");
        }
        return collection[position--];
    }
    
    void reset() override {
        position = static_cast<int>(collection.size()) - 1;
    }
};

// Shuffle Iterator implementation
template<typename T>
class ShuffleIterator : public Iterator<T> {
private:
    std::vector<T> originalCollection;
    std::vector<T> shuffledCollection;
    size_t position;
    std::mt19937 rng;

public:
    ShuffleIterator(const std::vector<T>& coll) 
        : originalCollection(coll), shuffledCollection(coll), position(0) {
        // Initialize random number generator with current time
        rng.seed(std::chrono::steady_clock::now().time_since_epoch().count());
        std::shuffle(shuffledCollection.begin(), shuffledCollection.end(), rng);
    }
    
    bool hasNext() override {
        return position < shuffledCollection.size();
    }
    
    T next() override {
        if (!hasNext()) {
            throw std::runtime_error("No more elements");
        }
        return shuffledCollection[position++];
    }
    
    void reset() override {
        shuffledCollection = originalCollection;
        std::shuffle(shuffledCollection.begin(), shuffledCollection.end(), rng);
        position = 0;
    }
};

// Genre Filter Iterator - filters songs by genre
class GenreFilterIterator : public Iterator<Song> {
private:
    std::vector<Song> collection;
    std::string targetGenre;
    size_t position;
    
    void findNextMatch() {
        while (position < collection.size()) {
            std::string songGenre = collection[position].getGenre();
            std::transform(songGenre.begin(), songGenre.end(), songGenre.begin(), ::tolower);
            if (songGenre == targetGenre) {
                break;
            }
            position++;
        }
    }

public:
    GenreFilterIterator(const std::vector<Song>& coll, const std::string& genre) 
        : collection(coll), targetGenre(genre), position(0) {
        std::transform(targetGenre.begin(), targetGenre.end(), targetGenre.begin(), ::tolower);
        findNextMatch();
    }
    
    bool hasNext() override {
        return position < collection.size();
    }
    
    Song next() override {
        if (!hasNext()) {
            throw std::runtime_error("No more elements");
        }
        Song result = collection[position++];
        findNextMatch();
        return result;
    }
    
    void reset() override {
        position = 0;
        findNextMatch();
    }
};

// Concrete Aggregate - Music Playlist
class MusicPlaylist : public IterableCollection<Song> {
private:
    std::vector<Song> songs;
    std::string playlistName;

public:
    MusicPlaylist(const std::string& name) : playlistName(name) {}
    
    void addSong(const Song& song) {
        auto it = std::find(songs.begin(), songs.end(), song);
        if (it == songs.end()) {
            songs.push_back(song);
            std::cout << "Added to " << playlistName << ": " << song.getTitle() << std::endl;
        } else {
            std::cout << "Song already exists in playlist: " << song.getTitle() << std::endl;
        }
    }
    
    void removeSong(const Song& song) {
        auto it = std::find(songs.begin(), songs.end(), song);
        if (it != songs.end()) {
            songs.erase(it);
            std::cout << "Removed from " << playlistName << ": " << song.getTitle() << std::endl;
        } else {
            std::cout << "Song not found in playlist: " << song.getTitle() << std::endl;
        }
    }
    
    size_t size() const {
        return songs.size();
    }
    
    std::string getName() const {
        return playlistName;
    }
    
    // Iterator factory methods
    std::unique_ptr<Iterator<Song>> createIterator() override {
        return std::make_unique<ForwardIterator<Song>>(songs);
    }
    
    std::unique_ptr<Iterator<Song>> createReverseIterator() override {
        return std::make_unique<ReverseIterator<Song>>(songs);
    }
    
    std::unique_ptr<Iterator<Song>> createShuffleIterator() override {
        return std::make_unique<ShuffleIterator<Song>>(songs);
    }
    
    std::unique_ptr<Iterator<Song>> createGenreIterator(const std::string& genre) {
        return std::make_unique<GenreFilterIterator>(songs, genre);
    }
    
    void showPlaylistInfo() {
        std::cout << "\n=== Playlist: " << playlistName << " ===" << std::endl;
        std::cout << "Total songs: " << songs.size() << std::endl;
        if (!songs.empty()) {
            int totalDuration = 0;
            for (const auto& song : songs) {
                totalDuration += song.getDuration();
            }
            std::cout << "Total duration: " << formatTotalDuration(totalDuration) << std::endl;
        }
    }

private:
    std::string formatTotalDuration(int totalSeconds) {
        int hours = totalSeconds / 3600;
        int minutes = (totalSeconds % 3600) / 60;
        int seconds = totalSeconds % 60;
        
        if (hours > 0) {
            return std::to_string(hours) + ":" + 
                   (minutes < 10 ? "0" : "") + std::to_string(minutes) + ":" +
                   (seconds < 10 ? "0" : "") + std::to_string(seconds);
        } else {
            return std::to_string(minutes) + ":" + 
                   (seconds < 10 ? "0" : "") + std::to_string(seconds);
        }
    }
};

// Music Player using Iterator
class MusicPlayer {
private:
    std::string playerName;

public:
    MusicPlayer(const std::string& name) : playerName(name) {}
    
    void play(std::unique_ptr<Iterator<Song>> iterator, const std::string& mode) {
        std::cout << "\n" << playerName << " - Playing in " << mode << " mode:" << std::endl;
        std::cout << std::string(playerName.length() + mode.length() + 20, '=') << std::endl;
        
        int trackNumber = 1;
        while (iterator->hasNext()) {
            Song song = iterator->next();
            std::cout << trackNumber << ". " << song.toString() << std::endl;
            trackNumber++;
        }
        
        if (trackNumber == 1) {
            std::cout << "No songs found for the specified criteria." << std::endl;
        }
        std::cout << std::endl;
    }
    
    void playFirst(std::unique_ptr<Iterator<Song>> iterator, int count, const std::string& mode) {
        std::cout << "\n" << playerName << " - Playing first " << count << " songs in " << mode << " mode:" << std::endl;
        std::cout << std::string(playerName.length() + mode.length() + 30, '=') << std::endl;
        
        int trackNumber = 1;
        while (iterator->hasNext() && trackNumber <= count) {
            Song song = iterator->next();
            std::cout << trackNumber << ". " << song.toString() << std::endl;
            trackNumber++;
        }
        std::cout << std::endl;
    }
};

// Main demonstration
int main() {
    std::cout << "=== Iterator Pattern - Music Playlist System ===\n" << std::endl;
    
    // Create songs
    std::vector<Song> songsToAdd = {
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
    };
    
    // Create playlist and add songs
    MusicPlaylist myPlaylist("My Greatest Hits");
    
    for (const auto& song : songsToAdd) {
        myPlaylist.addSong(song);
    }
    
    myPlaylist.showPlaylistInfo();
    
    // Create music player
    MusicPlayer player("Spotify Player");
    
    // Demonstrate different iteration patterns
    std::cout << "\n1. Forward Iteration:" << std::endl;
    player.play(myPlaylist.createIterator(), "Sequential");
    
    std::cout << "2. Reverse Iteration:" << std::endl;
    player.play(myPlaylist.createReverseIterator(), "Reverse");
    
    std::cout << "3. Shuffle Iteration:" << std::endl;
    player.play(myPlaylist.createShuffleIterator(), "Shuffle");
    
    std::cout << "4. Genre Filter Iteration (Rock songs only):" << std::endl;
    player.play(myPlaylist.createGenreIterator("Rock"), "Rock Filter");
    
    std::cout << "5. Genre Filter Iteration (Pop songs only):" << std::endl;
    player.play(myPlaylist.createGenreIterator("Pop"), "Pop Filter");
    
    std::cout << "6. Limited Playback (First 3 songs):" << std::endl;
    player.playFirst(myPlaylist.createIterator(), 3, "Sequential");
    
    // Demonstrate iterator reset functionality
    std::cout << "7. Iterator Reset Demonstration:" << std::endl;
    auto resetIterator = myPlaylist.createShuffleIterator();
    std::cout << "First shuffle:" << std::endl;
    player.playFirst(std::move(resetIterator), 3, "Shuffle");
    
    resetIterator = myPlaylist.createShuffleIterator();
    resetIterator->reset();
    std::cout << "After reset - Second shuffle:" << std::endl;
    player.playFirst(std::move(resetIterator), 3, "Shuffle");
    
    // Demonstrate multiple simultaneous iterators
    std::cout << "8. Multiple Simultaneous Iterators:" << std::endl;
    auto iter1 = myPlaylist.createIterator();
    auto iter2 = myPlaylist.createReverseIterator();
    
    std::cout << "Forward iterator - First song: " << 
                 (iter1->hasNext() ? iter1->next().getTitle() : "None") << std::endl;
    std::cout << "Reverse iterator - First song: " << 
                 (iter2->hasNext() ? iter2->next().getTitle() : "None") << std::endl;
    std::cout << "Forward iterator - Second song: " << 
                 (iter1->hasNext() ? iter1->next().getTitle() : "None") << std::endl;
    std::cout << "Reverse iterator - Second song: " << 
                 (iter2->hasNext() ? iter2->next().getTitle() : "None") << std::endl;
    
    std::cout << "\n=== Iterator Pattern Benefits ===" << std::endl;
    std::cout << "1. Uniform Interface: Same interface for different traversal algorithms" << std::endl;
    std::cout << "2. Encapsulation: Internal structure of collection is hidden" << std::endl;
    std::cout << "3. Multiple Iterators: Can have multiple iterators on same collection" << std::endl;
    std::cout << "4. Polymorphic Iteration: Client code works with any iterator implementation" << std::endl;
    std::cout << "5. Lazy Evaluation: Elements are accessed only when needed" << std::endl;
    std::cout << "6. Memory Efficient: Don't need to load all elements at once" << std::endl;
    
    return 0;
}
