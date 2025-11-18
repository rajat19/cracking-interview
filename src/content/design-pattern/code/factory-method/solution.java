// Product interface
interface Vehicle {
    void start();
    void stop();
    String getType();
    int getMaxSpeed();
}

// Concrete Products
class Car implements Vehicle {
    @Override
    public void start() {
        System.out.println("🚗 Car engine starting...");
    }

    @Override
    public void stop() {
        System.out.println("🚗 Car engine stopping...");
    }

    @Override
    public String getType() {
        return "Car";
    }

    @Override
    public int getMaxSpeed() {
        return 200; // km/h
    }
}

class Motorcycle implements Vehicle {
    @Override
    public void start() {
        System.out.println("🏍️ Motorcycle engine roaring to life...");
    }

    @Override
    public void stop() {
        System.out.println("🏍️ Motorcycle engine turning off...");
    }

    @Override
    public String getType() {
        return "Motorcycle";
    }

    @Override
    public int getMaxSpeed() {
        return 300; // km/h
    }
}

class Truck implements Vehicle {
    @Override
    public void start() {
        System.out.println("🚚 Truck diesel engine starting...");
    }

    @Override
    public void stop() {
        System.out.println("🚚 Truck diesel engine stopping...");
    }

    @Override
    public String getType() {
        return "Truck";
    }

    @Override
    public int getMaxSpeed() {
        return 120; // km/h
    }
}

class Bicycle implements Vehicle {
    @Override
    public void start() {
        System.out.println("🚲 Ready to pedal!");
    }

    @Override
    public void stop() {
        System.out.println("🚲 Stopped pedaling.");
    }

    @Override
    public String getType() {
        return "Bicycle";
    }

    @Override
    public int getMaxSpeed() {
        return 50; // km/h
    }
}

// Creator abstract class
abstract class VehicleFactory {
    // Factory method - to be implemented by subclasses
    public abstract Vehicle createVehicle();

    // Template method that uses the factory method
    public void processVehicle() {
        System.out.println("\n=== Processing Vehicle ===");
        Vehicle vehicle = createVehicle();
        
        System.out.println("Vehicle Created: " + vehicle.getType());
        System.out.println("Max Speed: " + vehicle.getMaxSpeed() + " km/h");
        
        vehicle.start();
        System.out.println("Vehicle is now operational!");
        
        // Simulate usage
        System.out.println("Using vehicle for transportation...");
        
        vehicle.stop();
        System.out.println("Vehicle processing completed.\n");
    }
}

// Concrete Creators
class CarFactory extends VehicleFactory {
    @Override
    public Vehicle createVehicle() {
        System.out.println("🏭 Car Factory: Creating a new car...");
        return new Car();
    }
}

class MotorcycleFactory extends VehicleFactory {
    @Override
    public Vehicle createVehicle() {
        System.out.println("🏭 Motorcycle Factory: Creating a new motorcycle...");
        return new Motorcycle();
    }
}

class TruckFactory extends VehicleFactory {
    @Override
    public Vehicle createVehicle() {
        System.out.println("🏭 Truck Factory: Creating a new truck...");
        return new Truck();
    }
}

class BicycleFactory extends VehicleFactory {
    @Override
    public Vehicle createVehicle() {
        System.out.println("🏭 Bicycle Factory: Creating a new bicycle...");
        return new Bicycle();
    }
}

// Client code
public class FactoryMethodDemo {
    public static void main(String[] args) {
        System.out.println("=== FACTORY METHOD PATTERN DEMO ===");

        // Array of different factories
        VehicleFactory[] factories = {
            new CarFactory(),
            new MotorcycleFactory(),
            new TruckFactory(),
            new BicycleFactory()
        };

        // Process vehicles using different factories
        for (VehicleFactory factory : factories) {
            factory.processVehicle();
        }

        System.out.println("=== DIRECT VEHICLE CREATION ===");
        // We can also create vehicles directly for comparison
        Vehicle directCar = new Car();
        System.out.println("Direct creation: " + directCar.getType());

        System.out.println("\n=== FACTORY METHOD BENEFITS ===");
        System.out.println("✓ Encapsulates object creation logic");
        System.out.println("✓ Allows subclasses to decide which objects to create");
        System.out.println("✓ Promotes loose coupling between creator and product");
        System.out.println("✓ Follows Open/Closed Principle - easy to add new vehicle types");
        System.out.println("✓ Client code doesn't need to know concrete classes");
    }
}
