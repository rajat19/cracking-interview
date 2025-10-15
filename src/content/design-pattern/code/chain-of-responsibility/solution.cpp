// Chain of Responsibility Pattern - Support Ticket System
// Handles different types of support requests through a chain of handlers

#include <iostream>
#include <string>
#include <memory>
#include <vector>

// Enums for ticket properties
enum class Priority {
    LOW,
    MEDIUM,
    HIGH,
    CRITICAL
};

enum class TicketType {
    TECHNICAL,
    BILLING,
    GENERAL
};

// Support ticket class
class SupportTicket {
private:
    std::string ticketId;
    Priority priority;
    TicketType type;
    std::string description;

public:
    SupportTicket(const std::string& id, Priority p, TicketType t, const std::string& desc)
        : ticketId(id), priority(p), type(t), description(desc) {}
    
    // Getters
    std::string getTicketId() const { return ticketId; }
    Priority getPriority() const { return priority; }
    TicketType getType() const { return type; }
    std::string getDescription() const { return description; }
    
    std::string toString() const {
        std::string priorityStr = (priority == Priority::LOW) ? "LOW" :
                                 (priority == Priority::MEDIUM) ? "MEDIUM" :
                                 (priority == Priority::HIGH) ? "HIGH" : "CRITICAL";
        
        std::string typeStr = (type == TicketType::TECHNICAL) ? "TECHNICAL" :
                             (type == TicketType::BILLING) ? "BILLING" : "GENERAL";
        
        return "Ticket[" + ticketId + "]: " + typeStr + " - " + priorityStr + " (" + description + ")";
    }
};

// Abstract handler class
class SupportHandler {
protected:
    std::shared_ptr<SupportHandler> nextHandler;

public:
    virtual ~SupportHandler() = default;
    
    void setNextHandler(std::shared_ptr<SupportHandler> handler) {
        nextHandler = handler;
    }
    
    virtual void handleRequest(const SupportTicket& ticket) = 0;
};

// Level 1 Support Handler - handles basic issues
class Level1SupportHandler : public SupportHandler {
public:
    void handleRequest(const SupportTicket& ticket) override {
        if (ticket.getPriority() == Priority::LOW && 
            ticket.getType() == TicketType::GENERAL) {
            std::cout << "Level 1 Support: Handling ticket " << ticket.getTicketId() << std::endl;
            std::cout << "Resolution: Provided FAQ link and basic troubleshooting" << std::endl;
            std::cout << "Ticket resolved by Level 1 Support\n" << std::endl;
        } else {
            std::cout << "Level 1 Support: Escalating ticket " << ticket.getTicketId() << std::endl;
            if (nextHandler) {
                nextHandler->handleRequest(ticket);
            }
        }
    }
};

// Level 2 Support Handler - handles technical and medium priority issues
class Level2SupportHandler : public SupportHandler {
public:
    void handleRequest(const SupportTicket& ticket) override {
        if ((ticket.getPriority() == Priority::MEDIUM && 
             ticket.getType() == TicketType::TECHNICAL) ||
            (ticket.getPriority() == Priority::LOW && 
             ticket.getType() == TicketType::BILLING)) {
            std::cout << "Level 2 Support: Handling ticket " << ticket.getTicketId() << std::endl;
            std::cout << "Resolution: Technical analysis completed, solution provided" << std::endl;
            std::cout << "Ticket resolved by Level 2 Support\n" << std::endl;
        } else {
            std::cout << "Level 2 Support: Escalating ticket " << ticket.getTicketId() << std::endl;
            if (nextHandler) {
                nextHandler->handleRequest(ticket);
            }
        }
    }
};

// Level 3 Support Handler - handles high priority and critical issues
class Level3SupportHandler : public SupportHandler {
public:
    void handleRequest(const SupportTicket& ticket) override {
        if (ticket.getPriority() == Priority::HIGH || 
            ticket.getPriority() == Priority::CRITICAL) {
            std::cout << "Level 3 Support: Handling ticket " << ticket.getTicketId() << std::endl;
            std::cout << "Resolution: Senior engineer assigned, comprehensive solution provided" << std::endl;
            std::cout << "Ticket resolved by Level 3 Support\n" << std::endl;
        } else {
            std::cout << "Level 3 Support: Escalating ticket " << ticket.getTicketId() << std::endl;
            if (nextHandler) {
                nextHandler->handleRequest(ticket);
            }
        }
    }
};

// Manager Handler - handles billing issues and unresolved tickets
class ManagerHandler : public SupportHandler {
public:
    void handleRequest(const SupportTicket& ticket) override {
        std::cout << "Manager: Handling ticket " << ticket.getTicketId() << std::endl;
        if (ticket.getType() == TicketType::BILLING) {
            std::cout << "Resolution: Billing dispute resolved, account adjusted" << std::endl;
        } else {
            std::cout << "Resolution: Escalated to specialized team, priority handling assigned" << std::endl;
        }
        std::cout << "Ticket resolved by Manager\n" << std::endl;
    }
};

// Support ticket system class
class SupportTicketSystem {
private:
    std::shared_ptr<SupportHandler> level1;
    std::shared_ptr<SupportHandler> level2;
    std::shared_ptr<SupportHandler> level3;
    std::shared_ptr<SupportHandler> manager;

public:
    SupportTicketSystem() {
        // Create the chain of handlers
        level1 = std::make_shared<Level1SupportHandler>();
        level2 = std::make_shared<Level2SupportHandler>();
        level3 = std::make_shared<Level3SupportHandler>();
        manager = std::make_shared<ManagerHandler>();
        
        // Set up the chain
        level1->setNextHandler(level2);
        level2->setNextHandler(level3);
        level3->setNextHandler(manager);
    }
    
    void processTicket(const SupportTicket& ticket) {
        std::cout << "Processing: " << ticket.toString() << std::endl;
        level1->handleRequest(ticket);
    }
};

// Main demonstration
int main() {
    std::cout << "=== Support Ticket System - Chain of Responsibility Pattern ===\n" << std::endl;
    
    // Create support ticket system
    SupportTicketSystem supportSystem;
    
    // Create different types of support tickets
    std::vector<SupportTicket> tickets = {
        SupportTicket("T001", Priority::LOW, TicketType::GENERAL, 
                     "How to reset password?"),
        SupportTicket("T002", Priority::MEDIUM, TicketType::TECHNICAL, 
                     "Application crashes on startup"),
        SupportTicket("T003", Priority::HIGH, TicketType::TECHNICAL, 
                     "Database connection issues"),
        SupportTicket("T004", Priority::CRITICAL, TicketType::TECHNICAL, 
                     "System down - production outage"),
        SupportTicket("T005", Priority::MEDIUM, TicketType::BILLING, 
                     "Incorrect charges on account"),
        SupportTicket("T006", Priority::HIGH, TicketType::BILLING, 
                     "Unauthorized transaction dispute")
    };
    
    // Process each ticket through the chain
    for (const auto& ticket : tickets) {
        supportSystem.processTicket(ticket);
    }
    
    std::cout << "=== Chain of Responsibility Benefits ===" << std::endl;
    std::cout << "1. Decoupling: Senders don't know which handler will process the request" << std::endl;
    std::cout << "2. Flexibility: Easy to add/remove handlers without changing client code" << std::endl;
    std::cout << "3. Responsibility: Each handler has a single responsibility" << std::endl;
    std::cout << "4. Dynamic: Chain can be configured at runtime" << std::endl;
    
    // Demonstrate dynamic chain modification
    std::cout << "\n=== Dynamic Chain Example ===" << std::endl;
    
    // Create a separate chain for VIP customers
    auto vipHandler = std::make_shared<Level3SupportHandler>();
    auto managerHandler = std::make_shared<ManagerHandler>();
    vipHandler->setNextHandler(managerHandler);
    
    SupportTicket vipTicket("T007", Priority::MEDIUM, TicketType::TECHNICAL, 
                           "VIP customer needs immediate assistance");
    
    std::cout << "VIP Chain Processing: " << vipTicket.toString() << std::endl;
    vipHandler->handleRequest(vipTicket);
    
    return 0;
}
