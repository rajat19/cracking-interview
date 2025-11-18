from abc import ABC, abstractmethod
from typing import List

# Product interface
class Vehicle(ABC):
    @abstractmethod
    def start(self) -> None:
        pass
    
    @abstractmethod
    def stop(self) -> None:
        pass
    
    @abstractmethod
    def get_type(self) -> str:
        pass
    
    @abstractmethod
    def get_max_speed(self) -> int:
        pass

# Concrete Products
class Car(Vehicle):
    def start(self) -> None:
        print("🚗 Car engine starting...")
    
    def stop(self) -> None:
        print("🚗 Car engine stopping...")
    
    def get_type(self) -> str:
        return "Car"
    
    def get_max_speed(self) -> int:
        return 200  # km/h

class Motorcycle(Vehicle):
    def start(self) -> None:
        print("🏍️ Motorcycle engine roaring to life...")
    
    def stop(self) -> None:
        print("🏍️ Motorcycle engine turning off...")
    
    def get_type(self) -> str:
        return "Motorcycle"
    
    def get_max_speed(self) -> int:
        return 300  # km/h

class Truck(Vehicle):
    def start(self) -> None:
        print("🚚 Truck diesel engine starting...")
    
    def stop(self) -> None:
        print("🚚 Truck diesel engine stopping...")
    
    def get_type(self) -> str:
        return "Truck"
    
    def get_max_speed(self) -> int:
        return 120  # km/h

class Bicycle(Vehicle):
    def start(self) -> None:
        print("🚲 Ready to pedal!")
    
    def stop(self) -> None:
        print("🚲 Stopped pedaling.")
    
    def get_type(self) -> str:
        return "Bicycle"
    
    def get_max_speed(self) -> int:
        return 50  # km/h

# Creator abstract class
class VehicleFactory(ABC):
    @abstractmethod
    def create_vehicle(self) -> Vehicle:
        """Factory method - to be implemented by subclasses"""
        pass
    
    def process_vehicle(self) -> None:
        """Template method that uses the factory method"""
        print("\n=== Processing Vehicle ===")
        vehicle = self.create_vehicle()
        
        print(f"Vehicle Created: {vehicle.get_type()}")
        print(f"Max Speed: {vehicle.get_max_speed()} km/h")
        
        vehicle.start()
        print("Vehicle is now operational!")
        
        # Simulate usage
        print("Using vehicle for transportation...")
        
        vehicle.stop()
        print("Vehicle processing completed.\n")

# Concrete Creators
class CarFactory(VehicleFactory):
    def create_vehicle(self) -> Vehicle:
        print("🏭 Car Factory: Creating a new car...")
        return Car()

class MotorcycleFactory(VehicleFactory):
    def create_vehicle(self) -> Vehicle:
        print("🏭 Motorcycle Factory: Creating a new motorcycle...")
        return Motorcycle()

class TruckFactory(VehicleFactory):
    def create_vehicle(self) -> Vehicle:
        print("🏭 Truck Factory: Creating a new truck...")
        return Truck()

class BicycleFactory(VehicleFactory):
    def create_vehicle(self) -> Vehicle:
        print("🏭 Bicycle Factory: Creating a new bicycle...")
        return Bicycle()

# Client code
def main():
    print("=== FACTORY METHOD PATTERN DEMO ===")
    
    # Array of different factories
    factories: List[VehicleFactory] = [
        CarFactory(),
        MotorcycleFactory(),
        TruckFactory(),
        BicycleFactory()
    ]
    
    # Process vehicles using different factories
    for factory in factories:
        factory.process_vehicle()
    
    print("=== DIRECT VEHICLE CREATION ===")
    # We can also create vehicles directly for comparison
    direct_car = Car()
    print(f"Direct creation: {direct_car.get_type()}")
    
    print("\n=== FACTORY METHOD BENEFITS ===")
    print("✓ Encapsulates object creation logic")
    print("✓ Allows subclasses to decide which objects to create")
    print("✓ Promotes loose coupling between creator and product")
    print("✓ Follows Open/Closed Principle - easy to add new vehicle types")
    print("✓ Client code doesn't need to know concrete classes")

if __name__ == "__main__":
    main()
