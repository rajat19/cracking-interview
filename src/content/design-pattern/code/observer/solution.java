import java.util.*;

// Observer interface
interface Observer {
    void update(String news);
}

// Subject interface
interface Subject {
    void subscribe(Observer observer);
    void unsubscribe(Observer observer);
    void notifyObservers();
}

// Concrete Subject - News Agency
class NewsAgency implements Subject {
    private List<Observer> observers;
    private String latestNews;

    public NewsAgency() {
        this.observers = new ArrayList<>();
    }

    @Override
    public void subscribe(Observer observer) {
        observers.add(observer);
        System.out.println("Observer subscribed. Total subscribers: " + observers.size());
    }

    @Override
    public void unsubscribe(Observer observer) {
        observers.remove(observer);
        System.out.println("Observer unsubscribed. Total subscribers: " + observers.size());
    }

    @Override
    public void notifyObservers() {
        System.out.println("\n--- BROADCASTING NEWS ---");
        for (Observer observer : observers) {
            observer.update(latestNews);
        }
        System.out.println("------------------------\n");
    }

    public void setNews(String news) {
        this.latestNews = news;
        System.out.println("NEWS ALERT: " + news);
        notifyObservers();
    }

    public String getLatestNews() {
        return latestNews;
    }
}

// Concrete Observers
class NewsChannel implements Observer {
    private String channelName;

    public NewsChannel(String channelName) {
        this.channelName = channelName;
    }

    @Override
    public void update(String news) {
        System.out.println("[" + channelName + " TV] Broadcasting: " + news);
    }
}

class Newspaper implements Observer {
    private String paperName;

    public Newspaper(String paperName) {
        this.paperName = paperName;
    }

    @Override
    public void update(String news) {
        System.out.println("[" + paperName + " Newspaper] Publishing: " + news);
    }
}

class OnlineNews implements Observer {
    private String websiteName;

    public OnlineNews(String websiteName) {
        this.websiteName = websiteName;
    }

    @Override
    public void update(String news) {
        System.out.println("[" + websiteName + " Website] Posted: " + news);
    }
}

class MobileApp implements Observer {
    private String appName;
    private String userEmail;

    public MobileApp(String appName, String userEmail) {
        this.appName = appName;
        this.userEmail = userEmail;
    }

    @Override
    public void update(String news) {
        System.out.println("[" + appName + " App] Push notification to " + userEmail + ": " + news);
    }
}

public class ObserverPatternDemo {
    public static void main(String[] args) {
        // Create the subject (news agency)
        NewsAgency newsAgency = new NewsAgency();

        // Create observers
        NewsChannel cnn = new NewsChannel("CNN");
        NewsChannel bbc = new NewsChannel("BBC");
        Newspaper nytimes = new Newspaper("NY Times");
        OnlineNews techcrunch = new OnlineNews("TechCrunch");
        MobileApp newsApp = new MobileApp("NewsBreaker", "user@example.com");

        System.out.println("=== SUBSCRIPTION PHASE ===");
        // Subscribe observers
        newsAgency.subscribe(cnn);
        newsAgency.subscribe(bbc);
        newsAgency.subscribe(nytimes);
        newsAgency.subscribe(techcrunch);
        newsAgency.subscribe(newsApp);

        System.out.println("\n=== NEWS UPDATES ===");
        // Publish news updates
        newsAgency.setNews("Breaking: New AI breakthrough announced!");
        
        newsAgency.setNews("Tech giants report record quarterly earnings");

        System.out.println("\n=== UNSUBSCRIPTION ===");
        // Unsubscribe some observers
        newsAgency.unsubscribe(bbc);
        newsAgency.unsubscribe(nytimes);

        // Publish another update
        newsAgency.setNews("Climate summit reaches historic agreement");

        System.out.println("\n=== RE-SUBSCRIPTION ===");
        // Re-subscribe
        newsAgency.subscribe(bbc);
        
        newsAgency.setNews("Sports: World Cup final ends in dramatic victory!");
    }
}
