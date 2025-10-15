// Mediator Pattern - Air Traffic Control System
// Centralizes complex communications and control logic between related objects

import java.util.*;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

// Mediator interface
interface AirTrafficControlMediator {
    void requestTakeoff(Aircraft aircraft);
    void requestLanding(Aircraft aircraft);
    void requestEmergencyLanding(Aircraft aircraft);
    void notifyAircraftPositionUpdate(Aircraft aircraft, String position);
    void registerAircraft(Aircraft aircraft);
    void unregisterAircraft(Aircraft aircraft);
}

// Abstract Colleague class
abstract class Aircraft {
    protected AirTrafficControlMediator mediator;
    protected String callSign;
    protected String aircraftType;
    protected String currentPosition;
    protected AircraftStatus status;
    
    public enum AircraftStatus {
        PARKED, TAXIING, TAKEOFF_REQUESTED, TAKING_OFF, IN_FLIGHT, 
        LANDING_REQUESTED, LANDING, EMERGENCY
    }
    
    public Aircraft(String callSign, String aircraftType, AirTrafficControlMediator mediator) {
        this.callSign = callSign;
        this.aircraftType = aircraftType;
        this.mediator = mediator;
        this.currentPosition = "Gate";
        this.status = AircraftStatus.PARKED;
        this.mediator.registerAircraft(this);
    }
    
    // Getters
    public String getCallSign() { return callSign; }
    public String getAircraftType() { return aircraftType; }
    public String getCurrentPosition() { return currentPosition; }
    public AircraftStatus getStatus() { return status; }
    
    // Abstract methods to be implemented by concrete aircraft
    public abstract void receiveMessage(String message);
    public abstract void grantTakeoff();
    public abstract void grantLanding();
    public abstract void denyRequest(String reason);
    
    // Common methods
    public void requestTakeoff() {
        if (status == AircraftStatus.PARKED || status == AircraftStatus.TAXIING) {
            status = AircraftStatus.TAKEOFF_REQUESTED;
            System.out.println("[" + getCurrentTime() + "] " + callSign + ": Requesting takeoff clearance");
            mediator.requestTakeoff(this);
        } else {
            System.out.println("[" + getCurrentTime() + "] " + callSign + ": Cannot request takeoff in current status: " + status);
        }
    }
    
    public void requestLanding() {
        if (status == AircraftStatus.IN_FLIGHT) {
            status = AircraftStatus.LANDING_REQUESTED;
            System.out.println("[" + getCurrentTime() + "] " + callSign + ": Requesting landing clearance");
            mediator.requestLanding(this);
        } else {
            System.out.println("[" + getCurrentTime() + "] " + callSign + ": Cannot request landing in current status: " + status);
        }
    }
    
    public void declareEmergency() {
        AircraftStatus previousStatus = status;
        status = AircraftStatus.EMERGENCY;
        System.out.println("[" + getCurrentTime() + "] " + callSign + ": EMERGENCY DECLARED! Previous status: " + previousStatus);
        mediator.requestEmergencyLanding(this);
    }
    
    public void updatePosition(String newPosition) {
        this.currentPosition = newPosition;
        System.out.println("[" + getCurrentTime() + "] " + callSign + ": Position update - " + newPosition);
        mediator.notifyAircraftPositionUpdate(this, newPosition);
    }
    
    protected String getCurrentTime() {
        return LocalDateTime.now().format(DateTimeFormatter.ofPattern("HH:mm:ss"));
    }
    
    @Override
    public String toString() {
        return callSign + " (" + aircraftType + ") - " + status + " at " + currentPosition;
    }
}

// Concrete Colleague classes
class CommercialAircraft extends Aircraft {
    private int passengerCount;
    
    public CommercialAircraft(String callSign, String aircraftType, int passengerCount, 
                            AirTrafficControlMediator mediator) {
        super(callSign, aircraftType, mediator);
        this.passengerCount = passengerCount;
    }
    
    @Override
    public void receiveMessage(String message) {
        System.out.println("[" + getCurrentTime() + "] " + callSign + " (Commercial): Received - " + message);
    }
    
    @Override
    public void grantTakeoff() {
        status = AircraftStatus.TAKING_OFF;
        System.out.println("[" + getCurrentTime() + "] " + callSign + " (Commercial): Takeoff granted. Taking off with " + passengerCount + " passengers.");
        
        // Simulate takeoff sequence
        new Thread(() -> {
            try {
                Thread.sleep(2000);
                status = AircraftStatus.IN_FLIGHT;
                updatePosition("Airspace Sector 1");
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
        }).start();
    }
    
    @Override
    public void grantLanding() {
        status = AircraftStatus.LANDING;
        System.out.println("[" + getCurrentTime() + "] " + callSign + " (Commercial): Landing granted. Approaching runway.");
        
        // Simulate landing sequence
        new Thread(() -> {
            try {
                Thread.sleep(1500);
                status = AircraftStatus.PARKED;
                updatePosition("Gate " + (new Random().nextInt(20) + 1));
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
        }).start();
    }
    
    @Override
    public void denyRequest(String reason) {
        if (status == AircraftStatus.TAKEOFF_REQUESTED) {
            status = AircraftStatus.TAXIING;
        } else if (status == AircraftStatus.LANDING_REQUESTED) {
            status = AircraftStatus.IN_FLIGHT;
        }
        System.out.println("[" + getCurrentTime() + "] " + callSign + " (Commercial): Request denied - " + reason);
    }
}

class CargoAircraft extends Aircraft {
    private double cargoWeight;
    
    public CargoAircraft(String callSign, String aircraftType, double cargoWeight, 
                        AirTrafficControlMediator mediator) {
        super(callSign, aircraftType, mediator);
        this.cargoWeight = cargoWeight;
    }
    
    @Override
    public void receiveMessage(String message) {
        System.out.println("[" + getCurrentTime() + "] " + callSign + " (Cargo): Received - " + message);
    }
    
    @Override
    public void grantTakeoff() {
        status = AircraftStatus.TAKING_OFF;
        System.out.println("[" + getCurrentTime() + "] " + callSign + " (Cargo): Takeoff granted. Departing with " + cargoWeight + " tons of cargo.");
        
        new Thread(() -> {
            try {
                Thread.sleep(2500); // Cargo planes take longer to takeoff
                status = AircraftStatus.IN_FLIGHT;
                updatePosition("Cargo Route Alpha");
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
        }).start();
    }
    
    @Override
    public void grantLanding() {
        status = AircraftStatus.LANDING;
        System.out.println("[" + getCurrentTime() + "] " + callSign + " (Cargo): Landing granted. Approaching cargo terminal.");
        
        new Thread(() -> {
            try {
                Thread.sleep(2000); // Cargo planes take longer to land
                status = AircraftStatus.PARKED;
                updatePosition("Cargo Terminal " + (char)('A' + new Random().nextInt(5)));
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
        }).start();
    }
    
    @Override
    public void denyRequest(String reason) {
        if (status == AircraftStatus.TAKEOFF_REQUESTED) {
            status = AircraftStatus.TAXIING;
        } else if (status == AircraftStatus.LANDING_REQUESTED) {
            status = AircraftStatus.IN_FLIGHT;
        }
        System.out.println("[" + getCurrentTime() + "] " + callSign + " (Cargo): Request denied - " + reason);
    }
}

class PrivateJet extends Aircraft {
    private String owner;
    
    public PrivateJet(String callSign, String aircraftType, String owner, 
                     AirTrafficControlMediator mediator) {
        super(callSign, aircraftType, mediator);
        this.owner = owner;
    }
    
    @Override
    public void receiveMessage(String message) {
        System.out.println("[" + getCurrentTime() + "] " + callSign + " (Private): Received - " + message);
    }
    
    @Override
    public void grantTakeoff() {
        status = AircraftStatus.TAKING_OFF;
        System.out.println("[" + getCurrentTime() + "] " + callSign + " (Private): Takeoff granted. " + owner + "'s jet departing.");
        
        new Thread(() -> {
            try {
                Thread.sleep(1000); // Private jets are faster
                status = AircraftStatus.IN_FLIGHT;
                updatePosition("VIP Airspace");
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
        }).start();
    }
    
    @Override
    public void grantLanding() {
        status = AircraftStatus.LANDING;
        System.out.println("[" + getCurrentTime() + "] " + callSign + " (Private): Landing granted. Proceeding to VIP terminal.");
        
        new Thread(() -> {
            try {
                Thread.sleep(1000);
                status = AircraftStatus.PARKED;
                updatePosition("VIP Terminal");
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
        }).start();
    }
    
    @Override
    public void denyRequest(String reason) {
        if (status == AircraftStatus.TAKEOFF_REQUESTED) {
            status = AircraftStatus.TAXIING;
        } else if (status == AircraftStatus.LANDING_REQUESTED) {
            status = AircraftStatus.IN_FLIGHT;
        }
        System.out.println("[" + getCurrentTime() + "] " + callSign + " (Private): Request denied - " + reason);
    }
}

// Concrete Mediator
class AirTrafficControlTower implements AirTrafficControlMediator {
    private List<Aircraft> registeredAircraft;
    private Queue<Aircraft> takeoffQueue;
    private Queue<Aircraft> landingQueue;
    private boolean runwayOccupied;
    private Aircraft currentRunwayUser;
    private int maxConcurrentOperations;
    
    public AirTrafficControlTower() {
        this.registeredAircraft = new ArrayList<>();
        this.takeoffQueue = new LinkedList<>();
        this.landingQueue = new LinkedList<>();
        this.runwayOccupied = false;
        this.maxConcurrentOperations = 2; // Allow 2 concurrent operations
    }
    
    @Override
    public void registerAircraft(Aircraft aircraft) {
        registeredAircraft.add(aircraft);
        System.out.println("[" + getCurrentTime() + "] ATC: Aircraft registered - " + aircraft.getCallSign());
        broadcastToAllAircraft("New aircraft in controlled airspace: " + aircraft.getCallSign());
    }
    
    @Override
    public void unregisterAircraft(Aircraft aircraft) {
        registeredAircraft.remove(aircraft);
        takeoffQueue.remove(aircraft);
        landingQueue.remove(aircraft);
        System.out.println("[" + getCurrentTime() + "] ATC: Aircraft unregistered - " + aircraft.getCallSign());
    }
    
    @Override
    public void requestTakeoff(Aircraft aircraft) {
        System.out.println("[" + getCurrentTime() + "] ATC: Takeoff request received from " + aircraft.getCallSign());
        
        if (canGrantTakeoff()) {
            grantTakeoffImmediately(aircraft);
        } else {
            takeoffQueue.offer(aircraft);
            aircraft.receiveMessage("Added to takeoff queue. Position: " + takeoffQueue.size());
            System.out.println("[" + getCurrentTime() + "] ATC: " + aircraft.getCallSign() + " queued for takeoff");
        }
    }
    
    @Override
    public void requestLanding(Aircraft aircraft) {
        System.out.println("[" + getCurrentTime() + "] ATC: Landing request received from " + aircraft.getCallSign());
        
        if (canGrantLanding()) {
            grantLandingImmediately(aircraft);
        } else {
            landingQueue.offer(aircraft);
            aircraft.receiveMessage("Added to landing queue. Position: " + landingQueue.size());
            System.out.println("[" + getCurrentTime() + "] ATC: " + aircraft.getCallSign() + " queued for landing");
        }
    }
    
    @Override
    public void requestEmergencyLanding(Aircraft aircraft) {
        System.out.println("[" + getCurrentTime() + "] ATC: EMERGENCY LANDING request from " + aircraft.getCallSign());
        
        // Emergency aircraft get highest priority
        if (runwayOccupied && currentRunwayUser != null) {
            currentRunwayUser.receiveMessage("Emergency landing in progress. Expedite your operation.");
        }
        
        // Clear the aircraft from regular queues and grant immediate landing
        takeoffQueue.remove(aircraft);
        landingQueue.remove(aircraft);
        
        broadcastToAllAircraft("Emergency landing in progress: " + aircraft.getCallSign() + ". All aircraft standby.");
        aircraft.receiveMessage("Emergency landing approved. Priority clearance granted.");
        aircraft.grantLanding();
        
        runwayOccupied = true;
        currentRunwayUser = aircraft;
    }
    
    @Override
    public void notifyAircraftPositionUpdate(Aircraft aircraft, String position) {
        System.out.println("[" + getCurrentTime() + "] ATC: Position update logged for " + aircraft.getCallSign());
        
        // If aircraft has completed runway operation, process next in queue
        if ((position.startsWith("Gate") || position.startsWith("VIP Terminal") || 
             position.startsWith("Cargo Terminal")) && currentRunwayUser == aircraft) {
            runwayOccupied = false;
            currentRunwayUser = null;
            processNextOperation();
        } else if (position.contains("Airspace") || position.contains("Route") && 
                  currentRunwayUser == aircraft) {
            runwayOccupied = false;
            currentRunwayUser = null;
            processNextOperation();
        }
    }
    
    private boolean canGrantTakeoff() {
        return !runwayOccupied && landingQueue.isEmpty(); // Landing has priority over takeoff
    }
    
    private boolean canGrantLanding() {
        return !runwayOccupied;
    }
    
    private void grantTakeoffImmediately(Aircraft aircraft) {
        runwayOccupied = true;
        currentRunwayUser = aircraft;
        aircraft.grantTakeoff();
        broadcastToAllAircraftExcept(aircraft, "Aircraft " + aircraft.getCallSign() + " cleared for takeoff");
    }
    
    private void grantLandingImmediately(Aircraft aircraft) {
        runwayOccupied = true;
        currentRunwayUser = aircraft;
        aircraft.grantLanding();
        broadcastToAllAircraftExcept(aircraft, "Aircraft " + aircraft.getCallSign() + " cleared for landing");
    }
    
    private void processNextOperation() {
        // Landing requests have priority over takeoff requests
        if (!landingQueue.isEmpty()) {
            Aircraft nextToLand = landingQueue.poll();
            System.out.println("[" + getCurrentTime() + "] ATC: Processing next landing request");
            grantLandingImmediately(nextToLand);
        } else if (!takeoffQueue.isEmpty()) {
            Aircraft nextToTakeoff = takeoffQueue.poll();
            System.out.println("[" + getCurrentTime() + "] ATC: Processing next takeoff request");
            grantTakeoffImmediately(nextToTakeoff);
        }
    }
    
    private void broadcastToAllAircraft(String message) {
        System.out.println("[" + getCurrentTime() + "] ATC: Broadcasting - " + message);
        for (Aircraft aircraft : registeredAircraft) {
            aircraft.receiveMessage(message);
        }
    }
    
    private void broadcastToAllAircraftExcept(Aircraft excluded, String message) {
        for (Aircraft aircraft : registeredAircraft) {
            if (aircraft != excluded) {
                aircraft.receiveMessage(message);
            }
        }
    }
    
    public void showSystemStatus() {
        System.out.println("\n[" + getCurrentTime() + "] ===== ATC SYSTEM STATUS =====");
        System.out.println("Runway Status: " + (runwayOccupied ? "OCCUPIED by " + currentRunwayUser.getCallSign() : "CLEAR"));
        System.out.println("Takeoff Queue: " + takeoffQueue.size() + " aircraft waiting");
        System.out.println("Landing Queue: " + landingQueue.size() + " aircraft waiting");
        System.out.println("Total Registered Aircraft: " + registeredAircraft.size());
        
        System.out.println("\nAircraft Status:");
        for (Aircraft aircraft : registeredAircraft) {
            System.out.println("  - " + aircraft.toString());
        }
        System.out.println("=====================================\n");
    }
    
    private String getCurrentTime() {
        return LocalDateTime.now().format(DateTimeFormatter.ofPattern("HH:mm:ss"));
    }
}

// Main demonstration class
public class MediatorPatternDemo {
    public static void main(String[] args) throws InterruptedException {
        System.out.println("=== Mediator Pattern - Air Traffic Control System ===\n");
        
        // Create the mediator (Air Traffic Control Tower)
        AirTrafficControlTower atcTower = new AirTrafficControlTower();
        
        // Create different types of aircraft
        CommercialAircraft flight1 = new CommercialAircraft("AA101", "Boeing 737", 180, atcTower);
        CommercialAircraft flight2 = new CommercialAircraft("UA205", "Airbus A320", 150, atcTower);
        CargoAircraft cargo1 = new CargoAircraft("FX789", "Boeing 747F", 120.5, atcTower);
        PrivateJet jet1 = new PrivateJet("N123PJ", "Gulfstream G650", "Tech CEO", atcTower);
        CommercialAircraft flight3 = new CommercialAircraft("DL456", "Boeing 777", 300, atcTower);
        
        System.out.println("\n1. Initial System Status:");
        atcTower.showSystemStatus();
        
        System.out.println("2. Multiple Takeoff Requests:");
        // Simulate multiple takeoff requests
        flight1.requestTakeoff();
        Thread.sleep(500);
        
        cargo1.requestTakeoff();
        Thread.sleep(500);
        
        jet1.requestTakeoff();
        Thread.sleep(1000);
        
        atcTower.showSystemStatus();
        
        System.out.println("3. Simulating Aircraft in Flight Requesting Landing:");
        // Simulate some aircraft already in flight requesting landing
        flight2.updatePosition("Approaching Airspace");
        flight2.status = Aircraft.AircraftStatus.IN_FLIGHT;
        flight2.requestLanding();
        Thread.sleep(500);
        
        flight3.updatePosition("10 miles out");
        flight3.status = Aircraft.AircraftStatus.IN_FLIGHT;
        flight3.requestLanding();
        Thread.sleep(2000);
        
        atcTower.showSystemStatus();
        
        System.out.println("4. Emergency Scenario:");
        // Create emergency aircraft
        CommercialAircraft emergencyFlight = new CommercialAircraft("EM999", "Airbus A330", 250, atcTower);
        emergencyFlight.updatePosition("Emergency Approach");
        emergencyFlight.status = Aircraft.AircraftStatus.IN_FLIGHT;
        Thread.sleep(1000);
        
        // Declare emergency
        emergencyFlight.declareEmergency();
        Thread.sleep(3000);
        
        atcTower.showSystemStatus();
        
        System.out.println("5. System Continues Processing Queue:");
        // Wait for operations to complete and show final status
        Thread.sleep(5000);
        atcTower.showSystemStatus();
        
        System.out.println("=== Mediator Pattern Benefits ===");
        System.out.println("1. Loose Coupling: Aircraft don't need to communicate directly with each other");
        System.out.println("2. Centralized Control: All coordination logic is centralized in the mediator");
        System.out.println("3. Reusable Components: Aircraft classes can be reused with different mediators");
        System.out.println("4. Easy to Extend: New aircraft types can be added without changing existing ones");
        System.out.println("5. Complex Interactions: Mediator handles complex coordination scenarios");
        System.out.println("6. Single Responsibility: Each aircraft focuses on its own behavior");
        
        System.out.println("\n=== Real-world Applications ===");
        System.out.println("- Chat rooms and messaging systems");
        System.out.println("- GUI frameworks (component communication)");
        System.out.println("- Workflow management systems");
        System.out.println("- Game development (entity interactions)");
        System.out.println("- Microservice orchestration");
    }
}
