"""
Chain of Responsibility Pattern - Support Ticket System
Handles different types of support requests through a chain of handlers
"""

from abc import ABC, abstractmethod
from enum import Enum
from typing import Optional, List

class Priority(Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"

class TicketType(Enum):
    TECHNICAL = "TECHNICAL"
    BILLING = "BILLING"
    GENERAL = "GENERAL"

class SupportTicket:
    """Represents a support ticket with priority and type"""
    
    def __init__(self, ticket_id: str, priority: Priority, ticket_type: TicketType, description: str):
        self.ticket_id = ticket_id
        self.priority = priority
        self.ticket_type = ticket_type
        self.description = description
    
    def __str__(self):
        return f"Ticket[{self.ticket_id}]: {self.ticket_type.value} - {self.priority.value} ({self.description})"

class SupportHandler(ABC):
    """Abstract base class for support handlers"""
    
    def __init__(self):
        self._next_handler: Optional[SupportHandler] = None
    
    def set_next_handler(self, handler: 'SupportHandler') -> None:
        """Set the next handler in the chain"""
        self._next_handler = handler
    
    @abstractmethod
    def handle_request(self, ticket: SupportTicket) -> None:
        """Handle the support ticket request"""
        pass

class Level1SupportHandler(SupportHandler):
    """Level 1 Support - handles basic general inquiries"""
    
    def handle_request(self, ticket: SupportTicket) -> None:
        if (ticket.priority == Priority.LOW and 
            ticket.ticket_type == TicketType.GENERAL):
            print(f"Level 1 Support: Handling ticket {ticket.ticket_id}")
            print("Resolution: Provided FAQ link and basic troubleshooting")
            print("Ticket resolved by Level 1 Support\n")
        else:
            print(f"Level 1 Support: Escalating ticket {ticket.ticket_id}")
            if self._next_handler:
                self._next_handler.handle_request(ticket)

class Level2SupportHandler(SupportHandler):
    """Level 2 Support - handles technical and billing issues"""
    
    def handle_request(self, ticket: SupportTicket) -> None:
        if ((ticket.priority == Priority.MEDIUM and 
             ticket.ticket_type == TicketType.TECHNICAL) or
            (ticket.priority == Priority.LOW and 
             ticket.ticket_type == TicketType.BILLING)):
            print(f"Level 2 Support: Handling ticket {ticket.ticket_id}")
            print("Resolution: Technical analysis completed, solution provided")
            print("Ticket resolved by Level 2 Support\n")
        else:
            print(f"Level 2 Support: Escalating ticket {ticket.ticket_id}")
            if self._next_handler:
                self._next_handler.handle_request(ticket)

class Level3SupportHandler(SupportHandler):
    """Level 3 Support - handles high priority and critical issues"""
    
    def handle_request(self, ticket: SupportTicket) -> None:
        if (ticket.priority == Priority.HIGH or 
            ticket.priority == Priority.CRITICAL):
            print(f"Level 3 Support: Handling ticket {ticket.ticket_id}")
            print("Resolution: Senior engineer assigned, comprehensive solution provided")
            print("Ticket resolved by Level 3 Support\n")
        else:
            print(f"Level 3 Support: Escalating ticket {ticket.ticket_id}")
            if self._next_handler:
                self._next_handler.handle_request(ticket)

class ManagerHandler(SupportHandler):
    """Manager - handles billing disputes and unresolved tickets"""
    
    def handle_request(self, ticket: SupportTicket) -> None:
        print(f"Manager: Handling ticket {ticket.ticket_id}")
        if ticket.ticket_type == TicketType.BILLING:
            print("Resolution: Billing dispute resolved, account adjusted")
        else:
            print("Resolution: Escalated to specialized team, priority handling assigned")
        print("Ticket resolved by Manager\n")

class SupportTicketSystem:
    """Support ticket system using chain of responsibility"""
    
    def __init__(self):
        # Create the chain of handlers
        self.level1 = Level1SupportHandler()
        self.level2 = Level2SupportHandler()
        self.level3 = Level3SupportHandler()
        self.manager = ManagerHandler()
        
        # Set up the chain
        self.level1.set_next_handler(self.level2)
        self.level2.set_next_handler(self.level3)
        self.level3.set_next_handler(self.manager)
    
    def process_ticket(self, ticket: SupportTicket) -> None:
        """Process a support ticket through the chain"""
        print(f"Processing: {ticket}")
        self.level1.handle_request(ticket)

def main():
    """Demonstrate the Chain of Responsibility pattern"""
    print("=== Support Ticket System - Chain of Responsibility Pattern ===\n")
    
    # Create support ticket system
    support_system = SupportTicketSystem()
    
    # Create different types of support tickets
    tickets = [
        SupportTicket("T001", Priority.LOW, TicketType.GENERAL, 
                     "How to reset password?"),
        SupportTicket("T002", Priority.MEDIUM, TicketType.TECHNICAL, 
                     "Application crashes on startup"),
        SupportTicket("T003", Priority.HIGH, TicketType.TECHNICAL, 
                     "Database connection issues"),
        SupportTicket("T004", Priority.CRITICAL, TicketType.TECHNICAL, 
                     "System down - production outage"),
        SupportTicket("T005", Priority.MEDIUM, TicketType.BILLING, 
                     "Incorrect charges on account"),
        SupportTicket("T006", Priority.HIGH, TicketType.BILLING, 
                     "Unauthorized transaction dispute")
    ]
    
    # Process each ticket through the chain
    for ticket in tickets:
        support_system.process_ticket(ticket)
    
    print("=== Chain of Responsibility Benefits ===")
    print("1. Decoupling: Senders don't know which handler will process the request")
    print("2. Flexibility: Easy to add/remove handlers without changing client code")
    print("3. Responsibility: Each handler has a single responsibility")
    print("4. Dynamic: Chain can be configured at runtime")
    
    # Demonstrate dynamic chain modification
    print("\n=== Dynamic Chain Modification ===")
    print("Adding VIP Support Handler for high-priority billing issues...")
    
    class VIPSupportHandler(SupportHandler):
        """VIP Support - handles high-priority billing issues"""
        
        def handle_request(self, ticket: SupportTicket) -> None:
            if (ticket.priority == Priority.HIGH and 
                ticket.ticket_type == TicketType.BILLING):
                print(f"VIP Support: Handling ticket {ticket.ticket_id}")
                print("Resolution: VIP customer service, immediate account review")
                print("Ticket resolved by VIP Support\n")
            else:
                if self._next_handler:
                    self._next_handler.handle_request(ticket)
    
    # Insert VIP handler into existing chain
    vip_handler = VIPSupportHandler()
    support_system.level2.set_next_handler(vip_handler)
    vip_handler.set_next_handler(support_system.level3)
    
    # Test with VIP billing issue
    vip_ticket = SupportTicket("T007", Priority.HIGH, TicketType.BILLING, 
                              "VIP customer billing dispute")
    support_system.process_ticket(vip_ticket)

if __name__ == "__main__":
    main()
