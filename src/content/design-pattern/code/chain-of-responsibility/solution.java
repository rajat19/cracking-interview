// Chain of Responsibility Pattern - Support Ticket System
// Handles different types of support requests through a chain of handlers

import java.util.*;

// Abstract handler class
abstract class SupportHandler {
    protected SupportHandler nextHandler;
    
    public void setNextHandler(SupportHandler nextHandler) {
        this.nextHandler = nextHandler;
    }
    
    public abstract void handleRequest(SupportTicket ticket);
}

// Support ticket class
class SupportTicket {
    public enum Priority {
        LOW, MEDIUM, HIGH, CRITICAL
    }
    
    public enum Type {
        TECHNICAL, BILLING, GENERAL
    }
    
    private String ticketId;
    private Priority priority;
    private Type type;
    private String description;
    
    public SupportTicket(String ticketId, Priority priority, Type type, String description) {
        this.ticketId = ticketId;
        this.priority = priority;
        this.type = type;
        this.description = description;
    }
    
    // Getters
    public String getTicketId() { return ticketId; }
    public Priority getPriority() { return priority; }
    public Type getType() { return type; }
    public String getDescription() { return description; }
    
    @Override
    public String toString() {
        return String.format("Ticket[%s]: %s - %s (%s)", 
                           ticketId, type, priority, description);
    }
}

// Level 1 Support Handler - handles basic issues
class Level1SupportHandler extends SupportHandler {
    @Override
    public void handleRequest(SupportTicket ticket) {
        if (ticket.getPriority() == SupportTicket.Priority.LOW && 
            ticket.getType() == SupportTicket.Type.GENERAL) {
            System.out.println("Level 1 Support: Handling ticket " + ticket.getTicketId());
            System.out.println("Resolution: Provided FAQ link and basic troubleshooting");
            System.out.println("Ticket resolved by Level 1 Support\n");
        } else {
            System.out.println("Level 1 Support: Escalating ticket " + ticket.getTicketId());
            if (nextHandler != null) {
                nextHandler.handleRequest(ticket);
            }
        }
    }
}

// Level 2 Support Handler - handles technical and medium priority issues
class Level2SupportHandler extends SupportHandler {
    @Override
    public void handleRequest(SupportTicket ticket) {
        if ((ticket.getPriority() == SupportTicket.Priority.MEDIUM && 
             ticket.getType() == SupportTicket.Type.TECHNICAL) ||
            (ticket.getPriority() == SupportTicket.Priority.LOW && 
             ticket.getType() == SupportTicket.Type.BILLING)) {
            System.out.println("Level 2 Support: Handling ticket " + ticket.getTicketId());
            System.out.println("Resolution: Technical analysis completed, solution provided");
            System.out.println("Ticket resolved by Level 2 Support\n");
        } else {
            System.out.println("Level 2 Support: Escalating ticket " + ticket.getTicketId());
            if (nextHandler != null) {
                nextHandler.handleRequest(ticket);
            }
        }
    }
}

// Level 3 Support Handler - handles high priority and critical issues
class Level3SupportHandler extends SupportHandler {
    @Override
    public void handleRequest(SupportTicket ticket) {
        if (ticket.getPriority() == SupportTicket.Priority.HIGH || 
            ticket.getPriority() == SupportTicket.Priority.CRITICAL) {
            System.out.println("Level 3 Support: Handling ticket " + ticket.getTicketId());
            System.out.println("Resolution: Senior engineer assigned, comprehensive solution provided");
            System.out.println("Ticket resolved by Level 3 Support\n");
        } else {
            System.out.println("Level 3 Support: Escalating ticket " + ticket.getTicketId());
            if (nextHandler != null) {
                nextHandler.handleRequest(ticket);
            }
        }
    }
}

// Manager Handler - handles billing issues and unresolved tickets
class ManagerHandler extends SupportHandler {
    @Override
    public void handleRequest(SupportTicket ticket) {
        System.out.println("Manager: Handling ticket " + ticket.getTicketId());
        if (ticket.getType() == SupportTicket.Type.BILLING) {
            System.out.println("Resolution: Billing dispute resolved, account adjusted");
        } else {
            System.out.println("Resolution: Escalated to specialized team, priority handling assigned");
        }
        System.out.println("Ticket resolved by Manager\n");
    }
}

// Main demonstration class
public class ChainOfResponsibilityDemo {
    public static void main(String[] args) {
        // Create the chain of handlers
        SupportHandler level1 = new Level1SupportHandler();
        SupportHandler level2 = new Level2SupportHandler();
        SupportHandler level3 = new Level3SupportHandler();
        SupportHandler manager = new ManagerHandler();
        
        // Set up the chain
        level1.setNextHandler(level2);
        level2.setNextHandler(level3);
        level3.setNextHandler(manager);
        
        System.out.println("=== Support Ticket System - Chain of Responsibility Pattern ===\n");
        
        // Create different types of support tickets
        List<SupportTicket> tickets = Arrays.asList(
            new SupportTicket("T001", SupportTicket.Priority.LOW, 
                            SupportTicket.Type.GENERAL, "How to reset password?"),
            new SupportTicket("T002", SupportTicket.Priority.MEDIUM, 
                            SupportTicket.Type.TECHNICAL, "Application crashes on startup"),
            new SupportTicket("T003", SupportTicket.Priority.HIGH, 
                            SupportTicket.Type.TECHNICAL, "Database connection issues"),
            new SupportTicket("T004", SupportTicket.Priority.CRITICAL, 
                            SupportTicket.Type.TECHNICAL, "System down - production outage"),
            new SupportTicket("T005", SupportTicket.Priority.MEDIUM, 
                            SupportTicket.Type.BILLING, "Incorrect charges on account")
        );
        
        // Process each ticket through the chain
        for (SupportTicket ticket : tickets) {
            System.out.println("Processing: " + ticket);
            level1.handleRequest(ticket);
        }
        
        System.out.println("=== Chain of Responsibility Benefits ===");
        System.out.println("1. Decoupling: Senders don't know which handler will process the request");
        System.out.println("2. Flexibility: Easy to add/remove handlers without changing client code");
        System.out.println("3. Responsibility: Each handler has a single responsibility");
        System.out.println("4. Dynamic: Chain can be configured at runtime");
    }
}
