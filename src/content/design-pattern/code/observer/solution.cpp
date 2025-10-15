#include <iostream>
#include <vector>
#include <algorithm>
#include <string>
#include <memory>

// Observer interface
class Observer {
public:
    virtual ~Observer() = default;
    virtual void update(const std::string& news) = 0;
};

// Subject interface
class Subject {
public:
    virtual ~Subject() = default;
    virtual void subscribe(std::shared_ptr<Observer> observer) = 0;
    virtual void unsubscribe(std::shared_ptr<Observer> observer) = 0;
    virtual void notifyObservers() = 0;
};

// Concrete Subject - News Agency
class NewsAgency : public Subject {
private:
    std::vector<std::shared_ptr<Observer>> observers;
    std::string latestNews;

public:
    void subscribe(std::shared_ptr<Observer> observer) override {
        observers.push_back(observer);
        std::cout << "Observer subscribed. Total subscribers: " << observers.size() << std::endl;
    }

    void unsubscribe(std::shared_ptr<Observer> observer) override {
        auto it = std::find(observers.begin(), observers.end(), observer);
        if (it != observers.end()) {
            observers.erase(it);
            std::cout << "Observer unsubscribed. Total subscribers: " << observers.size() << std::endl;
        }
    }

    void notifyObservers() override {
        std::cout << "\n--- BROADCASTING NEWS ---" << std::endl;
        for (const auto& observer : observers) {
            if (auto obs = observer.lock ? observer : observer) { // Handle weak_ptr if needed
                obs->update(latestNews);
            }
        }
        std::cout << "------------------------\n" << std::endl;
    }

    void setNews(const std::string& news) {
        this->latestNews = news;
        std::cout << "NEWS ALERT: " << news << std::endl;
        notifyObservers();
    }

    std::string getLatestNews() const {
        return latestNews;
    }
};

// Concrete Observers
class NewsChannel : public Observer {
private:
    std::string channelName;

public:
    NewsChannel(const std::string& channelName) : channelName(channelName) {}

    void update(const std::string& news) override {
        std::cout << "[" << channelName << " TV] Broadcasting: " << news << std::endl;
    }
};

class Newspaper : public Observer {
private:
    std::string paperName;

public:
    Newspaper(const std::string& paperName) : paperName(paperName) {}

    void update(const std::string& news) override {
        std::cout << "[" << paperName << " Newspaper] Publishing: " << news << std::endl;
    }
};

class OnlineNews : public Observer {
private:
    std::string websiteName;

public:
    OnlineNews(const std::string& websiteName) : websiteName(websiteName) {}

    void update(const std::string& news) override {
        std::cout << "[" << websiteName << " Website] Posted: " << news << std::endl;
    }
};

class MobileApp : public Observer {
private:
    std::string appName;
    std::string userEmail;

public:
    MobileApp(const std::string& appName, const std::string& userEmail) 
        : appName(appName), userEmail(userEmail) {}

    void update(const std::string& news) override {
        std::cout << "[" << appName << " App] Push notification to " << userEmail << ": " << news << std::endl;
    }
};

int main() {
    // Create the subject (news agency)
    auto newsAgency = std::make_unique<NewsAgency>();

    // Create observers
    auto cnn = std::make_shared<NewsChannel>("CNN");
    auto bbc = std::make_shared<NewsChannel>("BBC");
    auto nytimes = std::make_shared<Newspaper>("NY Times");
    auto techcrunch = std::make_shared<OnlineNews>("TechCrunch");
    auto newsApp = std::make_shared<MobileApp>("NewsBreaker", "user@example.com");

    std::cout << "=== SUBSCRIPTION PHASE ===" << std::endl;
    // Subscribe observers
    newsAgency->subscribe(cnn);
    newsAgency->subscribe(bbc);
    newsAgency->subscribe(nytimes);
    newsAgency->subscribe(techcrunch);
    newsAgency->subscribe(newsApp);

    std::cout << "\n=== NEWS UPDATES ===" << std::endl;
    // Publish news updates
    newsAgency->setNews("Breaking: New AI breakthrough announced!");
    
    newsAgency->setNews("Tech giants report record quarterly earnings");

    std::cout << "\n=== UNSUBSCRIPTION ===" << std::endl;
    // Unsubscribe some observers
    newsAgency->unsubscribe(bbc);
    newsAgency->unsubscribe(nytimes);

    // Publish another update
    newsAgency->setNews("Climate summit reaches historic agreement");

    std::cout << "\n=== RE-SUBSCRIPTION ===" << std::endl;
    // Re-subscribe
    newsAgency->subscribe(bbc);
    
    newsAgency->setNews("Sports: World Cup final ends in dramatic victory!");

    return 0;
}
