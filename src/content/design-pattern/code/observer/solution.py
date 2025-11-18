from abc import ABC, abstractmethod
from typing import List

# Observer interface
class Observer(ABC):
    @abstractmethod
    def update(self, news: str) -> None:
        pass

# Subject interface
class Subject(ABC):
    @abstractmethod
    def subscribe(self, observer: Observer) -> None:
        pass
    
    @abstractmethod
    def unsubscribe(self, observer: Observer) -> None:
        pass
    
    @abstractmethod
    def notify_observers(self) -> None:
        pass

# Concrete Subject - News Agency
class NewsAgency(Subject):
    def __init__(self):
        self._observers: List[Observer] = []
        self._latest_news: str = ""

    def subscribe(self, observer: Observer) -> None:
        self._observers.append(observer)
        print(f"Observer subscribed. Total subscribers: {len(self._observers)}")

    def unsubscribe(self, observer: Observer) -> None:
        if observer in self._observers:
            self._observers.remove(observer)
            print(f"Observer unsubscribed. Total subscribers: {len(self._observers)}")

    def notify_observers(self) -> None:
        print("\n--- BROADCASTING NEWS ---")
        for observer in self._observers:
            observer.update(self._latest_news)
        print("------------------------\n")

    def set_news(self, news: str) -> None:
        self._latest_news = news
        print(f"NEWS ALERT: {news}")
        self.notify_observers()

    def get_latest_news(self) -> str:
        return self._latest_news

# Concrete Observers
class NewsChannel(Observer):
    def __init__(self, channel_name: str):
        self._channel_name = channel_name

    def update(self, news: str) -> None:
        print(f"[{self._channel_name} TV] Broadcasting: {news}")

class Newspaper(Observer):
    def __init__(self, paper_name: str):
        self._paper_name = paper_name

    def update(self, news: str) -> None:
        print(f"[{self._paper_name} Newspaper] Publishing: {news}")

class OnlineNews(Observer):
    def __init__(self, website_name: str):
        self._website_name = website_name

    def update(self, news: str) -> None:
        print(f"[{self._website_name} Website] Posted: {news}")

class MobileApp(Observer):
    def __init__(self, app_name: str, user_email: str):
        self._app_name = app_name
        self._user_email = user_email

    def update(self, news: str) -> None:
        print(f"[{self._app_name} App] Push notification to {self._user_email}: {news}")

def main():
    # Create the subject (news agency)
    news_agency = NewsAgency()

    # Create observers
    cnn = NewsChannel("CNN")
    bbc = NewsChannel("BBC")
    nytimes = Newspaper("NY Times")
    techcrunch = OnlineNews("TechCrunch")
    news_app = MobileApp("NewsBreaker", "user@example.com")

    print("=== SUBSCRIPTION PHASE ===")
    # Subscribe observers
    news_agency.subscribe(cnn)
    news_agency.subscribe(bbc)
    news_agency.subscribe(nytimes)
    news_agency.subscribe(techcrunch)
    news_agency.subscribe(news_app)

    print("\n=== NEWS UPDATES ===")
    # Publish news updates
    news_agency.set_news("Breaking: New AI breakthrough announced!")
    
    news_agency.set_news("Tech giants report record quarterly earnings")

    print("\n=== UNSUBSCRIPTION ===")
    # Unsubscribe some observers
    news_agency.unsubscribe(bbc)
    news_agency.unsubscribe(nytimes)

    # Publish another update
    news_agency.set_news("Climate summit reaches historic agreement")

    print("\n=== RE-SUBSCRIPTION ===")
    # Re-subscribe
    news_agency.subscribe(bbc)
    
    news_agency.set_news("Sports: World Cup final ends in dramatic victory!")

if __name__ == "__main__":
    main()
