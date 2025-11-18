#include <iostream>
#include <string>
#include <memory>
#include <vector>

// Product interface
class Vehicle {
public:
    virtual ~Vehicle() = default;
    virtual void start() = 0;
    virtual void stop() = 0;
    virtual std::string getType() = 0;
    virtual int getMaxSpeed() = 0;
};

// Concrete Products
class Car : public Vehicle {
public:
    void start() override {
        std::cout << "🚗 Car engine starting..." << std::endl;
    }
    
    void stop() override {
        std::cout << "🚗 Car engine stopping..." << std::endl;
    }
    
    std::string getType() override {
        return "Car";
    }
    
    int getMaxSpeed() override {
        return 200; // km/h
    }
};

class Motorcycle : public Vehicle {
public:
    void start() override {
        std::cout << "🏍️ Motorcycle engine roaring to life..." << std::endl;
    }
    
    void stop() override {
        std::cout << "🏍️ Motorcycle engine turning off..." << std::endl;
    }
    
    std::string getType() override {
        return "Motorcycle";
    }
    
    int getMaxSpeed() override {
        return 300; // km/h
    }
};

class Truck : public Vehicle {
public:
    void start() override {
        std::cout << "🚚 Truck diesel engine starting..." << std::endl;
    }
    
    void stop() override {
        std::cout << "🚚 Truck diesel engine stopping..." << std::endl;
    }
    
    std::string getType() override {
        return "Truck";
    }
    
    int getMaxSpeed() override {
        return 120; // km/h
    }
};

class Bicycle : public Vehicle {
public:
    void start() override {
        std::cout << "🚲 Ready to pedal!" << std::endl;
    }
    
    void stop() override {
        std::cout << "🚲 Stopped pedaling." << std::endl;
    }
    
    std::string getType() override {
        return "Bicycle";
    }
    
    int getMaxSpeed() override {
        return 50; // km/h
    }
};

// Creator abstract class
class VehicleFactory {
public:
    virtual ~VehicleFactory() = default;
    
    // Factory method - to be implemented by subclasses
    virtual std::unique_ptr<Vehicle> createVehicle() = 0;
    
    // Template method that uses the factory method
    void processVehicle() {
        std::cout << "\n=== Processing Vehicle ===" << std::endl;
        auto vehicle = createVehicle();
        
        std::cout << "Vehicle Created: " << vehicle->getType() << std::endl;
        std::cout << "Max Speed: " << vehicle->getMaxSpeed() << " km/h" << std::endl;
        
        vehicle->start();
        std::cout << "Vehicle is now operational!" << std::endl;
        
        // Simulate usage
        std::cout << "Using vehicle for transportation..." << std::endl;
        
        vehicle->stop();
        std::cout << "Vehicle processing completed.\n" << std::endl;
    }
};

// Concrete Creators
class CarFactory : public VehicleFactory {
public:
    std::unique_ptr<Vehicle> createVehicle() override {
        std::cout << "🏭 Car Factory: Creating a new car..." << std::endl;
        return std::make_unique<Car>();
    }
};

class MotorcycleFactory : public VehicleFactory {
public:
    std::unique_ptr<Vehicle> createVehicle() override {
        std::cout << "🏭 Motorcycle Factory: Creating a new motorcycle..." << std::endl;
        return std::make_unique<Motorcycle>();
    }
};

class TruckFactory : public VehicleFactory {
public:
    std::unique_ptr<Vehicle> createVehicle() override {
        std::cout << "🏭 Truck Factory: Creating a new truck..." << std::endl;
        return std::make_unique<Truck>();
    }
};

class BicycleFactory : public VehicleFactory {
public:
    std::unique_ptr<Vehicle> createVehicle() override {
        std::cout << "🏭 Bicycle Factory: Creating a new bicycle..." << std::endl;
        return std::make_unique<Bicycle>();
    }
};

int main() {
    std::cout << "=== FACTORY METHOD PATTERN DEMO ===" << std::endl;
    
    // Array of different factories
    std::vector<std::unique_ptr<VehicleFactory>> factories;
    factories.push_back(std::make_unique<CarFactory>());
    factories.push_back(std::make_unique<MotorcycleFactory>());
    factories.push_back(std::make_unique<TruckFactory>());
    factories.push_back(std::make_unique<BicycleFactory>());
    
    // Process vehicles using different factories
    for (auto& factory : factories) {
        factory->processVehicle();
    }
    
    std::cout << "=== DIRECT VEHICLE CREATION ===" << std::endl;
    // We can also create vehicles directly for comparison
    auto directCar = std::make_unique<Car>();
    std::cout << "Direct creation: " << directCar->getType() << std::endl;
    
    std::cout << "\n=== FACTORY METHOD BENEFITS ===" << std::endl;
    std::cout << "✓ Encapsulates object creation logic" << std::endl;
    std::cout << "✓ Allows subclasses to decide which objects to create" << std::endl;
    std::cout << "✓ Promotes loose coupling between creator and product" << std::endl;
    std::cout << "✓ Follows Open/Closed Principle - easy to add new vehicle types" << std::endl;
    std::cout << "✓ Client code doesn't need to know concrete classes" << std::endl;
    
    return 0;
}
