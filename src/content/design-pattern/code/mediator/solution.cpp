// Mediator Pattern - Air Traffic Control System
// Centralizes complex communications and control logic between related objects

#include <iostream>
#include <string>
#include <vector>
#include <queue>
#include <memory>
#include <thread>
#include <chrono>
#include <mutex>
#include <iomanip>
#include <sstream>
#include <algorithm>
#include <random>

// Forward declarations
class Aircraft;

// Enums
enum class AircraftStatus {
    PARKED,
    TAXIING,
    TAKEOFF_REQUESTED,
    TAKING_OFF,
    IN_FLIGHT,
    LANDING_REQUESTED,
    LANDING,
    EMERGENCY
};

// Utility function to convert enum to string
std::string statusToString(AircraftStatus status) {
    switch (status) {
        case AircraftStatus::PARKED: return "PARKED";
        case AircraftStatus::TAXIING: return "TAXIING";
        case AircraftStatus::TAKEOFF_REQUESTED: return "TAKEOFF_REQUESTED";
        case AircraftStatus::TAKING_OFF: return "TAKING_OFF";
        case AircraftStatus::IN_FLIGHT: return "IN_FLIGHT";
        case AircraftStatus::LANDING_REQUESTED: return "LANDING_REQUESTED";
        case AircraftStatus::LANDING: return "LANDING";
        case AircraftStatus::EMERGENCY: return "EMERGENCY";
        default: return "UNKNOWN";
    }
}

// Abstract Mediator interface
class AirTrafficControlMediator {
public:
    virtual ~AirTrafficControlMediator() = default;
    virtual void requestTakeoff(std::shared_ptr<Aircraft> aircraft) = 0;
    virtual void requestLanding(std::shared_ptr<Aircraft> aircraft) = 0;
    virtual void requestEmergencyLanding(std::shared_ptr<Aircraft> aircraft) = 0;
    virtual void notifyAircraftPositionUpdate(std::shared_ptr<Aircraft> aircraft, const std::string& position) = 0;
    virtual void registerAircraft(std::shared_ptr<Aircraft> aircraft) = 0;
    virtual void unregisterAircraft(std::shared_ptr<Aircraft> aircraft) = 0;
};

// Abstract Colleague class
class Aircraft {
protected:
    std::shared_ptr<AirTrafficControlMediator> mediator;
    std::string callSign;
    std::string aircraftType;
    std::string currentPosition;
    AircraftStatus status;

public:
    Aircraft(const std::string& cs, const std::string& type, 
             std::shared_ptr<AirTrafficControlMediator> med)
        : callSign(cs), aircraftType(type), mediator(med), 
          currentPosition("Gate"), status(AircraftStatus::PARKED) {}
    
    virtual ~Aircraft() = default;
    
    // Getters
    std::string getCallSign() const { return callSign; }
    std::string getAircraftType() const { return aircraftType; }
    std::string getCurrentPosition() const { return currentPosition; }
    AircraftStatus getStatus() const { return status; }
    void setStatus(AircraftStatus newStatus) { status = newStatus; }
    
    // Abstract methods
    virtual void receiveMessage(const std::string& message) = 0;
    virtual void grantTakeoff() = 0;
    virtual void grantLanding() = 0;
    virtual void denyRequest(const std::string& reason) = 0;
    
    // Common methods
    void requestTakeoff() {
        if (status == AircraftStatus::PARKED || status == AircraftStatus::TAXIING) {
            status = AircraftStatus::TAKEOFF_REQUESTED;
            std::cout << "[" << getCurrentTime() << "] " << callSign 
                     << ": Requesting takeoff clearance" << std::endl;
            mediator->requestTakeoff(shared_from_this());
        } else {
            std::cout << "[" << getCurrentTime() << "] " << callSign 
                     << ": Cannot request takeoff in current status: " 
                     << statusToString(status) << std::endl;
        }
    }
    
    void requestLanding() {
        if (status == AircraftStatus::IN_FLIGHT) {
            status = AircraftStatus::LANDING_REQUESTED;
            std::cout << "[" << getCurrentTime() << "] " << callSign 
                     << ": Requesting landing clearance" << std::endl;
            mediator->requestLanding(shared_from_this());
        } else {
            std::cout << "[" << getCurrentTime() << "] " << callSign 
                     << ": Cannot request landing in current status: " 
                     << statusToString(status) << std::endl;
        }
    }
    
    void declareEmergency() {
        AircraftStatus previousStatus = status;
        status = AircraftStatus::EMERGENCY;
        std::cout << "[" << getCurrentTime() << "] " << callSign 
                 << ": EMERGENCY DECLARED! Previous status: " 
                 << statusToString(previousStatus) << std::endl;
        mediator->requestEmergencyLanding(shared_from_this());
    }
    
    void updatePosition(const std::string& newPosition) {
        currentPosition = newPosition;
        std::cout << "[" << getCurrentTime() << "] " << callSign 
                 << ": Position update - " << newPosition << std::endl;
        mediator->notifyAircraftPositionUpdate(shared_from_this(), newPosition);
    }
    
    std::string toString() const {
        return callSign + " (" + aircraftType + ") - " + 
               statusToString(status) + " at " + currentPosition;
    }
    
    // Enable shared_from_this
    virtual std::shared_ptr<Aircraft> shared_from_this() = 0;

protected:
    std::string getCurrentTime() const {
        auto now = std::chrono::system_clock::now();
        auto time_t = std::chrono::system_clock::to_time_t(now);
        auto tm = *std::localtime(&time_t);
        
        std::stringstream ss;
        ss << std::put_time(&tm, "%H:%M:%S");
        return ss.str();
    }
};

// Concrete Colleague classes
class CommercialAircraft : public Aircraft, public std::enable_shared_from_this<CommercialAircraft> {
private:
    int passengerCount;

public:
    CommercialAircraft(const std::string& cs, const std::string& type, int passengers,
                      std::shared_ptr<AirTrafficControlMediator> med)
        : Aircraft(cs, type, med), passengerCount(passengers) {
        med->registerAircraft(shared_from_this());
    }
    
    std::shared_ptr<Aircraft> shared_from_this() override {
        return std::enable_shared_from_this<CommercialAircraft>::shared_from_this();
    }
    
    void receiveMessage(const std::string& message) override {
        std::cout << "[" << getCurrentTime() << "] " << callSign 
                 << " (Commercial): Received - " << message << std::endl;
    }
    
    void grantTakeoff() override {
        status = AircraftStatus::TAKING_OFF;
        std::cout << "[" << getCurrentTime() << "] " << callSign 
                 << " (Commercial): Takeoff granted. Taking off with " 
                 << passengerCount << " passengers." << std::endl;
        
        // Simulate takeoff sequence
        std::thread([this]() {
            std::this_thread::sleep_for(std::chrono::seconds(2));
            status = AircraftStatus::IN_FLIGHT;
            updatePosition("Airspace Sector 1");
        }).detach();
    }
    
    void grantLanding() override {
        status = AircraftStatus::LANDING;
        std::cout << "[" << getCurrentTime() << "] " << callSign 
                 << " (Commercial): Landing granted. Approaching runway." << std::endl;
        
        // Simulate landing sequence
        std::thread([this]() {
            std::this_thread::sleep_for(std::chrono::milliseconds(1500));
            status = AircraftStatus::PARKED;
            
            std::random_device rd;
            std::mt19937 gen(rd());
            std::uniform_int_distribution<> dis(1, 20);
            int gateNumber = dis(gen);
            
            updatePosition("Gate " + std::to_string(gateNumber));
        }).detach();
    }
    
    void denyRequest(const std::string& reason) override {
        if (status == AircraftStatus::TAKEOFF_REQUESTED) {
            status = AircraftStatus::TAXIING;
        } else if (status == AircraftStatus::LANDING_REQUESTED) {
            status = AircraftStatus::IN_FLIGHT;
        }
        std::cout << "[" << getCurrentTime() << "] " << callSign 
                 << " (Commercial): Request denied - " << reason << std::endl;
    }
};

class CargoAircraft : public Aircraft, public std::enable_shared_from_this<CargoAircraft> {
private:
    double cargoWeight;

public:
    CargoAircraft(const std::string& cs, const std::string& type, double weight,
                 std::shared_ptr<AirTrafficControlMediator> med)
        : Aircraft(cs, type, med), cargoWeight(weight) {
        med->registerAircraft(shared_from_this());
    }
    
    std::shared_ptr<Aircraft> shared_from_this() override {
        return std::enable_shared_from_this<CargoAircraft>::shared_from_this();
    }
    
    void receiveMessage(const std::string& message) override {
        std::cout << "[" << getCurrentTime() << "] " << callSign 
                 << " (Cargo): Received - " << message << std::endl;
    }
    
    void grantTakeoff() override {
        status = AircraftStatus::TAKING_OFF;
        std::cout << "[" << getCurrentTime() << "] " << callSign 
                 << " (Cargo): Takeoff granted. Departing with " 
                 << cargoWeight << " tons of cargo." << std::endl;
        
        std::thread([this]() {
            std::this_thread::sleep_for(std::chrono::milliseconds(2500));
            status = AircraftStatus::IN_FLIGHT;
            updatePosition("Cargo Route Alpha");
        }).detach();
    }
    
    void grantLanding() override {
        status = AircraftStatus::LANDING;
        std::cout << "[" << getCurrentTime() << "] " << callSign 
                 << " (Cargo): Landing granted. Approaching cargo terminal." << std::endl;
        
        std::thread([this]() {
            std::this_thread::sleep_for(std::chrono::seconds(2));
            status = AircraftStatus::PARKED;
            
            std::random_device rd;
            std::mt19937 gen(rd());
            std::uniform_int_distribution<> dis(0, 4);
            char terminal = 'A' + dis(gen);
            
            updatePosition("Cargo Terminal " + std::string(1, terminal));
        }).detach();
    }
    
    void denyRequest(const std::string& reason) override {
        if (status == AircraftStatus::TAKEOFF_REQUESTED) {
            status = AircraftStatus::TAXIING;
        } else if (status == AircraftStatus::LANDING_REQUESTED) {
            status = AircraftStatus::IN_FLIGHT;
        }
        std::cout << "[" << getCurrentTime() << "] " << callSign 
                 << " (Cargo): Request denied - " << reason << std::endl;
    }
};

class PrivateJet : public Aircraft, public std::enable_shared_from_this<PrivateJet> {
private:
    std::string owner;

public:
    PrivateJet(const std::string& cs, const std::string& type, const std::string& o,
              std::shared_ptr<AirTrafficControlMediator> med)
        : Aircraft(cs, type, med), owner(o) {
        med->registerAircraft(shared_from_this());
    }
    
    std::shared_ptr<Aircraft> shared_from_this() override {
        return std::enable_shared_from_this<PrivateJet>::shared_from_this();
    }
    
    void receiveMessage(const std::string& message) override {
        std::cout << "[" << getCurrentTime() << "] " << callSign 
                 << " (Private): Received - " << message << std::endl;
    }
    
    void grantTakeoff() override {
        status = AircraftStatus::TAKING_OFF;
        std::cout << "[" << getCurrentTime() << "] " << callSign 
                 << " (Private): Takeoff granted. " << owner << "'s jet departing." << std::endl;
        
        std::thread([this]() {
            std::this_thread::sleep_for(std::chrono::seconds(1));
            status = AircraftStatus::IN_FLIGHT;
            updatePosition("VIP Airspace");
        }).detach();
    }
    
    void grantLanding() override {
        status = AircraftStatus::LANDING;
        std::cout << "[" << getCurrentTime() << "] " << callSign 
                 << " (Private): Landing granted. Proceeding to VIP terminal." << std::endl;
        
        std::thread([this]() {
            std::this_thread::sleep_for(std::chrono::seconds(1));
            status = AircraftStatus::PARKED;
            updatePosition("VIP Terminal");
        }).detach();
    }
    
    void denyRequest(const std::string& reason) override {
        if (status == AircraftStatus::TAKEOFF_REQUESTED) {
            status = AircraftStatus::TAXIING;
        } else if (status == AircraftStatus::LANDING_REQUESTED) {
            status = AircraftStatus::IN_FLIGHT;
        }
        std::cout << "[" << getCurrentTime() << "] " << callSign 
                 << " (Private): Request denied - " << reason << std::endl;
    }
};

// Concrete Mediator
class AirTrafficControlTower : public AirTrafficControlMediator {
private:
    std::vector<std::shared_ptr<Aircraft>> registeredAircraft;
    std::queue<std::shared_ptr<Aircraft>> takeoffQueue;
    std::queue<std::shared_ptr<Aircraft>> landingQueue;
    bool runwayOccupied;
    std::shared_ptr<Aircraft> currentRunwayUser;
    mutable std::mutex towerMutex;

public:
    AirTrafficControlTower() : runwayOccupied(false) {}
    
    void registerAircraft(std::shared_ptr<Aircraft> aircraft) override {
        std::lock_guard<std::mutex> lock(towerMutex);
        registeredAircraft.push_back(aircraft);
        std::cout << "[" << getCurrentTime() << "] ATC: Aircraft registered - " 
                 << aircraft->getCallSign() << std::endl;
        broadcastToAllAircraft("New aircraft in controlled airspace: " + aircraft->getCallSign());
    }
    
    void unregisterAircraft(std::shared_ptr<Aircraft> aircraft) override {
        std::lock_guard<std::mutex> lock(towerMutex);
        auto it = std::find(registeredAircraft.begin(), registeredAircraft.end(), aircraft);
        if (it != registeredAircraft.end()) {
            registeredAircraft.erase(it);
        }
        std::cout << "[" << getCurrentTime() << "] ATC: Aircraft unregistered - " 
                 << aircraft->getCallSign() << std::endl;
    }
    
    void requestTakeoff(std::shared_ptr<Aircraft> aircraft) override {
        std::lock_guard<std::mutex> lock(towerMutex);
        std::cout << "[" << getCurrentTime() << "] ATC: Takeoff request received from " 
                 << aircraft->getCallSign() << std::endl;
        
        if (canGrantTakeoff()) {
            grantTakeoffImmediately(aircraft);
        } else {
            takeoffQueue.push(aircraft);
            aircraft->receiveMessage("Added to takeoff queue. Position: " + 
                                   std::to_string(takeoffQueue.size()));
            std::cout << "[" << getCurrentTime() << "] ATC: " << aircraft->getCallSign() 
                     << " queued for takeoff" << std::endl;
        }
    }
    
    void requestLanding(std::shared_ptr<Aircraft> aircraft) override {
        std::lock_guard<std::mutex> lock(towerMutex);
        std::cout << "[" << getCurrentTime() << "] ATC: Landing request received from " 
                 << aircraft->getCallSign() << std::endl;
        
        if (canGrantLanding()) {
            grantLandingImmediately(aircraft);
        } else {
            landingQueue.push(aircraft);
            aircraft->receiveMessage("Added to landing queue. Position: " + 
                                   std::to_string(landingQueue.size()));
            std::cout << "[" << getCurrentTime() << "] ATC: " << aircraft->getCallSign() 
                     << " queued for landing" << std::endl;
        }
    }
    
    void requestEmergencyLanding(std::shared_ptr<Aircraft> aircraft) override {
        std::lock_guard<std::mutex> lock(towerMutex);
        std::cout << "[" << getCurrentTime() << "] ATC: EMERGENCY LANDING request from " 
                 << aircraft->getCallSign() << std::endl;
        
        if (runwayOccupied && currentRunwayUser) {
            currentRunwayUser->receiveMessage("Emergency landing in progress. Expedite your operation.");
        }
        
        broadcastToAllAircraft("Emergency landing in progress: " + aircraft->getCallSign() + 
                              ". All aircraft standby.");
        aircraft->receiveMessage("Emergency landing approved. Priority clearance granted.");
        aircraft->grantLanding();
        
        runwayOccupied = true;
        currentRunwayUser = aircraft;
    }
    
    void notifyAircraftPositionUpdate(std::shared_ptr<Aircraft> aircraft, 
                                    const std::string& position) override {
        std::cout << "[" << getCurrentTime() << "] ATC: Position update logged for " 
                 << aircraft->getCallSign() << std::endl;
        
        // If aircraft has completed runway operation, process next in queue
        if (currentRunwayUser == aircraft) {
            if (position.find("Gate") == 0 || position.find("VIP Terminal") == 0 || 
                position.find("Cargo Terminal") == 0 || position.find("Airspace") != std::string::npos || 
                position.find("Route") != std::string::npos) {
                
                std::lock_guard<std::mutex> lock(towerMutex);
                runwayOccupied = false;
                currentRunwayUser = nullptr;
                processNextOperation();
            }
        }
    }
    
    void showSystemStatus() const {
        std::lock_guard<std::mutex> lock(towerMutex);
        std::cout << "\n[" << getCurrentTime() << "] ===== ATC SYSTEM STATUS =====" << std::endl;
        
        std::string runwayStatus = runwayOccupied ? 
            ("OCCUPIED by " + currentRunwayUser->getCallSign()) : "CLEAR";
        std::cout << "Runway Status: " << runwayStatus << std::endl;
        std::cout << "Takeoff Queue: " << takeoffQueue.size() << " aircraft waiting" << std::endl;
        std::cout << "Landing Queue: " << landingQueue.size() << " aircraft waiting" << std::endl;
        std::cout << "Total Registered Aircraft: " << registeredAircraft.size() << std::endl;
        
        std::cout << "\nAircraft Status:" << std::endl;
        for (const auto& aircraft : registeredAircraft) {
            std::cout << "  - " << aircraft->toString() << std::endl;
        }
        std::cout << "=====================================\n" << std::endl;
    }

private:
    bool canGrantTakeoff() const {
        return !runwayOccupied && landingQueue.empty();
    }
    
    bool canGrantLanding() const {
        return !runwayOccupied;
    }
    
    void grantTakeoffImmediately(std::shared_ptr<Aircraft> aircraft) {
        runwayOccupied = true;
        currentRunwayUser = aircraft;
        aircraft->grantTakeoff();
        broadcastToAllAircraftExcept(aircraft, "Aircraft " + aircraft->getCallSign() + 
                                   " cleared for takeoff");
    }
    
    void grantLandingImmediately(std::shared_ptr<Aircraft> aircraft) {
        runwayOccupied = true;
        currentRunwayUser = aircraft;
        aircraft->grantLanding();
        broadcastToAllAircraftExcept(aircraft, "Aircraft " + aircraft->getCallSign() + 
                                   " cleared for landing");
    }
    
    void processNextOperation() {
        if (!landingQueue.empty()) {
            auto nextToLand = landingQueue.front();
            landingQueue.pop();
            std::cout << "[" << getCurrentTime() << "] ATC: Processing next landing request" << std::endl;
            grantLandingImmediately(nextToLand);
        } else if (!takeoffQueue.empty()) {
            auto nextToTakeoff = takeoffQueue.front();
            takeoffQueue.pop();
            std::cout << "[" << getCurrentTime() << "] ATC: Processing next takeoff request" << std::endl;
            grantTakeoffImmediately(nextToTakeoff);
        }
    }
    
    void broadcastToAllAircraft(const std::string& message) const {
        std::cout << "[" << getCurrentTime() << "] ATC: Broadcasting - " << message << std::endl;
        for (const auto& aircraft : registeredAircraft) {
            aircraft->receiveMessage(message);
        }
    }
    
    void broadcastToAllAircraftExcept(std::shared_ptr<Aircraft> excluded, 
                                    const std::string& message) const {
        for (const auto& aircraft : registeredAircraft) {
            if (aircraft != excluded) {
                aircraft->receiveMessage(message);
            }
        }
    }
    
    std::string getCurrentTime() const {
        auto now = std::chrono::system_clock::now();
        auto time_t = std::chrono::system_clock::to_time_t(now);
        auto tm = *std::localtime(&time_t);
        
        std::stringstream ss;
        ss << std::put_time(&tm, "%H:%M:%S");
        return ss.str();
    }
};

// Main demonstration
int main() {
    std::cout << "=== Mediator Pattern - Air Traffic Control System ===\n" << std::endl;
    
    // Create the mediator (Air Traffic Control Tower)
    auto atcTower = std::make_shared<AirTrafficControlTower>();
    
    // Create different types of aircraft
    auto flight1 = std::make_shared<CommercialAircraft>("AA101", "Boeing 737", 180, atcTower);
    auto flight2 = std::make_shared<CommercialAircraft>("UA205", "Airbus A320", 150, atcTower);
    auto cargo1 = std::make_shared<CargoAircraft>("FX789", "Boeing 747F", 120.5, atcTower);
    auto jet1 = std::make_shared<PrivateJet>("N123PJ", "Gulfstream G650", "Tech CEO", atcTower);
    auto flight3 = std::make_shared<CommercialAircraft>("DL456", "Boeing 777", 300, atcTower);
    
    std::cout << "\n1. Initial System Status:" << std::endl;
    atcTower->showSystemStatus();
    
    std::cout << "2. Multiple Takeoff Requests:" << std::endl;
    flight1->requestTakeoff();
    std::this_thread::sleep_for(std::chrono::milliseconds(500));
    
    cargo1->requestTakeoff();
    std::this_thread::sleep_for(std::chrono::milliseconds(500));
    
    jet1->requestTakeoff();
    std::this_thread::sleep_for(std::chrono::seconds(1));
    
    atcTower->showSystemStatus();
    
    std::cout << "3. Simulating Aircraft in Flight Requesting Landing:" << std::endl;
    flight2->updatePosition("Approaching Airspace");
    flight2->setStatus(AircraftStatus::IN_FLIGHT);
    flight2->requestLanding();
    std::this_thread::sleep_for(std::chrono::milliseconds(500));
    
    flight3->updatePosition("10 miles out");
    flight3->setStatus(AircraftStatus::IN_FLIGHT);
    flight3->requestLanding();
    std::this_thread::sleep_for(std::chrono::seconds(2));
    
    atcTower->showSystemStatus();
    
    std::cout << "4. Emergency Scenario:" << std::endl;
    auto emergencyFlight = std::make_shared<CommercialAircraft>("EM999", "Airbus A330", 250, atcTower);
    emergencyFlight->updatePosition("Emergency Approach");
    emergencyFlight->setStatus(AircraftStatus::IN_FLIGHT);
    std::this_thread::sleep_for(std::chrono::seconds(1));
    
    emergencyFlight->declareEmergency();
    std::this_thread::sleep_for(std::chrono::seconds(3));
    
    atcTower->showSystemStatus();
    
    std::cout << "5. System Continues Processing Queue:" << std::endl;
    std::this_thread::sleep_for(std::chrono::seconds(5));
    atcTower->showSystemStatus();
    
    std::cout << "=== Mediator Pattern Benefits ===" << std::endl;
    std::cout << "1. Loose Coupling: Aircraft don't need to communicate directly with each other" << std::endl;
    std::cout << "2. Centralized Control: All coordination logic is centralized in the mediator" << std::endl;
    std::cout << "3. Reusable Components: Aircraft classes can be reused with different mediators" << std::endl;
    std::cout << "4. Easy to Extend: New aircraft types can be added without changing existing ones" << std::endl;
    std::cout << "5. Complex Interactions: Mediator handles complex coordination scenarios" << std::endl;
    std::cout << "6. Single Responsibility: Each aircraft focuses on its own behavior" << std::endl;
    
    return 0;
}
