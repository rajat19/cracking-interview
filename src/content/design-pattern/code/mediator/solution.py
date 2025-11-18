"""
Mediator Pattern - Air Traffic Control System
Centralizes complex communications and control logic between related objects
"""

from abc import ABC, abstractmethod
from enum import Enum
from typing import List, Optional, Deque
from collections import deque
import threading
import time
from datetime import datetime
import random

class AircraftStatus(Enum):
    PARKED = "PARKED"
    TAXIING = "TAXIING"
    TAKEOFF_REQUESTED = "TAKEOFF_REQUESTED"
    TAKING_OFF = "TAKING_OFF"
    IN_FLIGHT = "IN_FLIGHT"
    LANDING_REQUESTED = "LANDING_REQUESTED"
    LANDING = "LANDING"
    EMERGENCY = "EMERGENCY"

class AirTrafficControlMediator(ABC):
    """Abstract mediator interface for air traffic control"""
    
    @abstractmethod
    def request_takeoff(self, aircraft: 'Aircraft') -> None:
        pass
    
    @abstractmethod
    def request_landing(self, aircraft: 'Aircraft') -> None:
        pass
    
    @abstractmethod
    def request_emergency_landing(self, aircraft: 'Aircraft') -> None:
        pass
    
    @abstractmethod
    def notify_aircraft_position_update(self, aircraft: 'Aircraft', position: str) -> None:
        pass
    
    @abstractmethod
    def register_aircraft(self, aircraft: 'Aircraft') -> None:
        pass
    
    @abstractmethod
    def unregister_aircraft(self, aircraft: 'Aircraft') -> None:
        pass

class Aircraft(ABC):
    """Abstract colleague class representing an aircraft"""
    
    def __init__(self, call_sign: str, aircraft_type: str, mediator: AirTrafficControlMediator):
        self._call_sign = call_sign
        self._aircraft_type = aircraft_type
        self._mediator = mediator
        self._current_position = "Gate"
        self._status = AircraftStatus.PARKED
        self._mediator.register_aircraft(self)
    
    @property
    def call_sign(self) -> str:
        return self._call_sign
    
    @property
    def aircraft_type(self) -> str:
        return self._aircraft_type
    
    @property
    def current_position(self) -> str:
        return self._current_position
    
    @property
    def status(self) -> AircraftStatus:
        return self._status
    
    @status.setter
    def status(self, value: AircraftStatus) -> None:
        self._status = value
    
    # Abstract methods to be implemented by concrete aircraft
    @abstractmethod
    def receive_message(self, message: str) -> None:
        pass
    
    @abstractmethod
    def grant_takeoff(self) -> None:
        pass
    
    @abstractmethod
    def grant_landing(self) -> None:
        pass
    
    @abstractmethod
    def deny_request(self, reason: str) -> None:
        pass
    
    # Common methods
    def request_takeoff(self) -> None:
        if self._status in [AircraftStatus.PARKED, AircraftStatus.TAXIING]:
            self._status = AircraftStatus.TAKEOFF_REQUESTED
            print(f"[{self._get_current_time()}] {self._call_sign}: Requesting takeoff clearance")
            self._mediator.request_takeoff(self)
        else:
            print(f"[{self._get_current_time()}] {self._call_sign}: Cannot request takeoff in current status: {self._status.value}")
    
    def request_landing(self) -> None:
        if self._status == AircraftStatus.IN_FLIGHT:
            self._status = AircraftStatus.LANDING_REQUESTED
            print(f"[{self._get_current_time()}] {self._call_sign}: Requesting landing clearance")
            self._mediator.request_landing(self)
        else:
            print(f"[{self._get_current_time()}] {self._call_sign}: Cannot request landing in current status: {self._status.value}")
    
    def declare_emergency(self) -> None:
        previous_status = self._status
        self._status = AircraftStatus.EMERGENCY
        print(f"[{self._get_current_time()}] {self._call_sign}: EMERGENCY DECLARED! Previous status: {previous_status.value}")
        self._mediator.request_emergency_landing(self)
    
    def update_position(self, new_position: str) -> None:
        self._current_position = new_position
        print(f"[{self._get_current_time()}] {self._call_sign}: Position update - {new_position}")
        self._mediator.notify_aircraft_position_update(self, new_position)
    
    def _get_current_time(self) -> str:
        return datetime.now().strftime("%H:%M:%S")
    
    def __str__(self) -> str:
        return f"{self._call_sign} ({self._aircraft_type}) - {self._status.value} at {self._current_position}"

class CommercialAircraft(Aircraft):
    """Commercial aircraft with passenger capacity"""
    
    def __init__(self, call_sign: str, aircraft_type: str, passenger_count: int, 
                 mediator: AirTrafficControlMediator):
        super().__init__(call_sign, aircraft_type, mediator)
        self._passenger_count = passenger_count
    
    def receive_message(self, message: str) -> None:
        print(f"[{self._get_current_time()}] {self._call_sign} (Commercial): Received - {message}")
    
    def grant_takeoff(self) -> None:
        self._status = AircraftStatus.TAKING_OFF
        print(f"[{self._get_current_time()}] {self._call_sign} (Commercial): Takeoff granted. Taking off with {self._passenger_count} passengers.")
        
        # Simulate takeoff sequence in separate thread
        def takeoff_sequence():
            time.sleep(2)
            self._status = AircraftStatus.IN_FLIGHT
            self.update_position("Airspace Sector 1")
        
        threading.Thread(target=takeoff_sequence, daemon=True).start()
    
    def grant_landing(self) -> None:
        self._status = AircraftStatus.LANDING
        print(f"[{self._get_current_time()}] {self._call_sign} (Commercial): Landing granted. Approaching runway.")
        
        # Simulate landing sequence
        def landing_sequence():
            time.sleep(1.5)
            self._status = AircraftStatus.PARKED
            gate_number = random.randint(1, 20)
            self.update_position(f"Gate {gate_number}")
        
        threading.Thread(target=landing_sequence, daemon=True).start()
    
    def deny_request(self, reason: str) -> None:
        if self._status == AircraftStatus.TAKEOFF_REQUESTED:
            self._status = AircraftStatus.TAXIING
        elif self._status == AircraftStatus.LANDING_REQUESTED:
            self._status = AircraftStatus.IN_FLIGHT
        print(f"[{self._get_current_time()}] {self._call_sign} (Commercial): Request denied - {reason}")

class CargoAircraft(Aircraft):
    """Cargo aircraft with weight capacity"""
    
    def __init__(self, call_sign: str, aircraft_type: str, cargo_weight: float, 
                 mediator: AirTrafficControlMediator):
        super().__init__(call_sign, aircraft_type, mediator)
        self._cargo_weight = cargo_weight
    
    def receive_message(self, message: str) -> None:
        print(f"[{self._get_current_time()}] {self._call_sign} (Cargo): Received - {message}")
    
    def grant_takeoff(self) -> None:
        self._status = AircraftStatus.TAKING_OFF
        print(f"[{self._get_current_time()}] {self._call_sign} (Cargo): Takeoff granted. Departing with {self._cargo_weight} tons of cargo.")
        
        def takeoff_sequence():
            time.sleep(2.5)  # Cargo planes take longer to takeoff
            self._status = AircraftStatus.IN_FLIGHT
            self.update_position("Cargo Route Alpha")
        
        threading.Thread(target=takeoff_sequence, daemon=True).start()
    
    def grant_landing(self) -> None:
        self._status = AircraftStatus.LANDING
        print(f"[{self._get_current_time()}] {self._call_sign} (Cargo): Landing granted. Approaching cargo terminal.")
        
        def landing_sequence():
            time.sleep(2)  # Cargo planes take longer to land
            self._status = AircraftStatus.PARKED
            terminal = chr(ord('A') + random.randint(0, 4))
            self.update_position(f"Cargo Terminal {terminal}")
        
        threading.Thread(target=landing_sequence, daemon=True).start()
    
    def deny_request(self, reason: str) -> None:
        if self._status == AircraftStatus.TAKEOFF_REQUESTED:
            self._status = AircraftStatus.TAXIING
        elif self._status == AircraftStatus.LANDING_REQUESTED:
            self._status = AircraftStatus.IN_FLIGHT
        print(f"[{self._get_current_time()}] {self._call_sign} (Cargo): Request denied - {reason}")

class PrivateJet(Aircraft):
    """Private jet with owner information"""
    
    def __init__(self, call_sign: str, aircraft_type: str, owner: str, 
                 mediator: AirTrafficControlMediator):
        super().__init__(call_sign, aircraft_type, mediator)
        self._owner = owner
    
    def receive_message(self, message: str) -> None:
        print(f"[{self._get_current_time()}] {self._call_sign} (Private): Received - {message}")
    
    def grant_takeoff(self) -> None:
        self._status = AircraftStatus.TAKING_OFF
        print(f"[{self._get_current_time()}] {self._call_sign} (Private): Takeoff granted. {self._owner}'s jet departing.")
        
        def takeoff_sequence():
            time.sleep(1)  # Private jets are faster
            self._status = AircraftStatus.IN_FLIGHT
            self.update_position("VIP Airspace")
        
        threading.Thread(target=takeoff_sequence, daemon=True).start()
    
    def grant_landing(self) -> None:
        self._status = AircraftStatus.LANDING
        print(f"[{self._get_current_time()}] {self._call_sign} (Private): Landing granted. Proceeding to VIP terminal.")
        
        def landing_sequence():
            time.sleep(1)
            self._status = AircraftStatus.PARKED
            self.update_position("VIP Terminal")
        
        threading.Thread(target=landing_sequence, daemon=True).start()
    
    def deny_request(self, reason: str) -> None:
        if self._status == AircraftStatus.TAKEOFF_REQUESTED:
            self._status = AircraftStatus.TAXIING
        elif self._status == AircraftStatus.LANDING_REQUESTED:
            self._status = AircraftStatus.IN_FLIGHT
        print(f"[{self._get_current_time()}] {self._call_sign} (Private): Request denied - {reason}")

class AirTrafficControlTower(AirTrafficControlMediator):
    """Concrete mediator - Air Traffic Control Tower"""
    
    def __init__(self):
        self._registered_aircraft: List[Aircraft] = []
        self._takeoff_queue: Deque[Aircraft] = deque()
        self._landing_queue: Deque[Aircraft] = deque()
        self._runway_occupied = False
        self._current_runway_user: Optional[Aircraft] = None
        self._lock = threading.RLock()  # Reentrant lock for thread safety
    
    def register_aircraft(self, aircraft: Aircraft) -> None:
        with self._lock:
            self._registered_aircraft.append(aircraft)
            print(f"[{self._get_current_time()}] ATC: Aircraft registered - {aircraft.call_sign}")
            self._broadcast_to_all_aircraft(f"New aircraft in controlled airspace: {aircraft.call_sign}")
    
    def unregister_aircraft(self, aircraft: Aircraft) -> None:
        with self._lock:
            if aircraft in self._registered_aircraft:
                self._registered_aircraft.remove(aircraft)
            if aircraft in self._takeoff_queue:
                self._takeoff_queue.remove(aircraft)
            if aircraft in self._landing_queue:
                self._landing_queue.remove(aircraft)
            print(f"[{self._get_current_time()}] ATC: Aircraft unregistered - {aircraft.call_sign}")
    
    def request_takeoff(self, aircraft: Aircraft) -> None:
        with self._lock:
            print(f"[{self._get_current_time()}] ATC: Takeoff request received from {aircraft.call_sign}")
            
            if self._can_grant_takeoff():
                self._grant_takeoff_immediately(aircraft)
            else:
                self._takeoff_queue.append(aircraft)
                aircraft.receive_message(f"Added to takeoff queue. Position: {len(self._takeoff_queue)}")
                print(f"[{self._get_current_time()}] ATC: {aircraft.call_sign} queued for takeoff")
    
    def request_landing(self, aircraft: Aircraft) -> None:
        with self._lock:
            print(f"[{self._get_current_time()}] ATC: Landing request received from {aircraft.call_sign}")
            
            if self._can_grant_landing():
                self._grant_landing_immediately(aircraft)
            else:
                self._landing_queue.append(aircraft)
                aircraft.receive_message(f"Added to landing queue. Position: {len(self._landing_queue)}")
                print(f"[{self._get_current_time()}] ATC: {aircraft.call_sign} queued for landing")
    
    def request_emergency_landing(self, aircraft: Aircraft) -> None:
        with self._lock:
            print(f"[{self._get_current_time()}] ATC: EMERGENCY LANDING request from {aircraft.call_sign}")
            
            # Emergency aircraft get highest priority
            if self._runway_occupied and self._current_runway_user:
                self._current_runway_user.receive_message("Emergency landing in progress. Expedite your operation.")
            
            # Remove aircraft from regular queues
            if aircraft in self._takeoff_queue:
                self._takeoff_queue.remove(aircraft)
            if aircraft in self._landing_queue:
                self._landing_queue.remove(aircraft)
            
            self._broadcast_to_all_aircraft(f"Emergency landing in progress: {aircraft.call_sign}. All aircraft standby.")
            aircraft.receive_message("Emergency landing approved. Priority clearance granted.")
            aircraft.grant_landing()
            
            self._runway_occupied = True
            self._current_runway_user = aircraft
    
    def notify_aircraft_position_update(self, aircraft: Aircraft, position: str) -> None:
        print(f"[{self._get_current_time()}] ATC: Position update logged for {aircraft.call_sign}")
        
        # If aircraft has completed runway operation, process next in queue
        if self._current_runway_user == aircraft:
            if (position.startswith("Gate") or position.startswith("VIP Terminal") or 
                position.startswith("Cargo Terminal") or "Airspace" in position or 
                "Route" in position):
                
                with self._lock:
                    self._runway_occupied = False
                    self._current_runway_user = None
                    self._process_next_operation()
    
    def _can_grant_takeoff(self) -> bool:
        return not self._runway_occupied and len(self._landing_queue) == 0  # Landing has priority
    
    def _can_grant_landing(self) -> bool:
        return not self._runway_occupied
    
    def _grant_takeoff_immediately(self, aircraft: Aircraft) -> None:
        self._runway_occupied = True
        self._current_runway_user = aircraft
        aircraft.grant_takeoff()
        self._broadcast_to_all_aircraft_except(aircraft, f"Aircraft {aircraft.call_sign} cleared for takeoff")
    
    def _grant_landing_immediately(self, aircraft: Aircraft) -> None:
        self._runway_occupied = True
        self._current_runway_user = aircraft
        aircraft.grant_landing()
        self._broadcast_to_all_aircraft_except(aircraft, f"Aircraft {aircraft.call_sign} cleared for landing")
    
    def _process_next_operation(self) -> None:
        # Landing requests have priority over takeoff requests
        if self._landing_queue:
            next_to_land = self._landing_queue.popleft()
            print(f"[{self._get_current_time()}] ATC: Processing next landing request")
            self._grant_landing_immediately(next_to_land)
        elif self._takeoff_queue:
            next_to_takeoff = self._takeoff_queue.popleft()
            print(f"[{self._get_current_time()}] ATC: Processing next takeoff request")
            self._grant_takeoff_immediately(next_to_takeoff)
    
    def _broadcast_to_all_aircraft(self, message: str) -> None:
        print(f"[{self._get_current_time()}] ATC: Broadcasting - {message}")
        for aircraft in self._registered_aircraft:
            aircraft.receive_message(message)
    
    def _broadcast_to_all_aircraft_except(self, excluded: Aircraft, message: str) -> None:
        for aircraft in self._registered_aircraft:
            if aircraft != excluded:
                aircraft.receive_message(message)
    
    def show_system_status(self) -> None:
        with self._lock:
            print(f"\n[{self._get_current_time()}] ===== ATC SYSTEM STATUS =====")
            runway_status = f"OCCUPIED by {self._current_runway_user.call_sign}" if self._runway_occupied else "CLEAR"
            print(f"Runway Status: {runway_status}")
            print(f"Takeoff Queue: {len(self._takeoff_queue)} aircraft waiting")
            print(f"Landing Queue: {len(self._landing_queue)} aircraft waiting")
            print(f"Total Registered Aircraft: {len(self._registered_aircraft)}")
            
            print("\nAircraft Status:")
            for aircraft in self._registered_aircraft:
                print(f"  - {aircraft}")
            print("=====================================\n")
    
    def _get_current_time(self) -> str:
        return datetime.now().strftime("%H:%M:%S")

def main():
    """Demonstrate the Mediator pattern"""
    print("=== Mediator Pattern - Air Traffic Control System ===\n")
    
    # Create the mediator (Air Traffic Control Tower)
    atc_tower = AirTrafficControlTower()
    
    # Create different types of aircraft
    flight1 = CommercialAircraft("AA101", "Boeing 737", 180, atc_tower)
    flight2 = CommercialAircraft("UA205", "Airbus A320", 150, atc_tower)
    cargo1 = CargoAircraft("FX789", "Boeing 747F", 120.5, atc_tower)
    jet1 = PrivateJet("N123PJ", "Gulfstream G650", "Tech CEO", atc_tower)
    flight3 = CommercialAircraft("DL456", "Boeing 777", 300, atc_tower)
    
    print("\n1. Initial System Status:")
    atc_tower.show_system_status()
    
    print("2. Multiple Takeoff Requests:")
    # Simulate multiple takeoff requests
    flight1.request_takeoff()
    time.sleep(0.5)
    
    cargo1.request_takeoff()
    time.sleep(0.5)
    
    jet1.request_takeoff()
    time.sleep(1)
    
    atc_tower.show_system_status()
    
    print("3. Simulating Aircraft in Flight Requesting Landing:")
    # Simulate some aircraft already in flight requesting landing
    flight2.update_position("Approaching Airspace")
    flight2.status = AircraftStatus.IN_FLIGHT
    flight2.request_landing()
    time.sleep(0.5)
    
    flight3.update_position("10 miles out")
    flight3.status = AircraftStatus.IN_FLIGHT
    flight3.request_landing()
    time.sleep(2)
    
    atc_tower.show_system_status()
    
    print("4. Emergency Scenario:")
    # Create emergency aircraft
    emergency_flight = CommercialAircraft("EM999", "Airbus A330", 250, atc_tower)
    emergency_flight.update_position("Emergency Approach")
    emergency_flight.status = AircraftStatus.IN_FLIGHT
    time.sleep(1)
    
    # Declare emergency
    emergency_flight.declare_emergency()
    time.sleep(3)
    
    atc_tower.show_system_status()
    
    print("5. System Continues Processing Queue:")
    # Wait for operations to complete and show final status
    time.sleep(5)
    atc_tower.show_system_status()
    
    print("=== Mediator Pattern Benefits ===")
    print("1. Loose Coupling: Aircraft don't need to communicate directly with each other")
    print("2. Centralized Control: All coordination logic is centralized in the mediator")
    print("3. Reusable Components: Aircraft classes can be reused with different mediators")
    print("4. Easy to Extend: New aircraft types can be added without changing existing ones")
    print("5. Complex Interactions: Mediator handles complex coordination scenarios")
    print("6. Single Responsibility: Each aircraft focuses on its own behavior")
    
    print("\n=== Real-world Applications ===")
    print("- Chat rooms and messaging systems")
    print("- GUI frameworks (component communication)")
    print("- Workflow management systems")
    print("- Game development (entity interactions)")
    print("- Microservice orchestration")
    print("- Event-driven architectures")

if __name__ == "__main__":
    main()
