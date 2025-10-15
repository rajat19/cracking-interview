/**
 * Private Class Data Pattern - C++ Implementation
 * 
 * This pattern encapsulates class data into a separate private data class
 * to prevent unwanted modification and provide controlled access.
 * 
 * Example: BankAccount with sensitive financial data protection
 */

#include <iostream>
#include <string>
#include <memory>
#include <chrono>
#include <ctime>
#include <iomanip>
#include <sstream>
#include <stdexcept>

// BEFORE: Traditional approach - direct member access (vulnerable)
class VulnerableBankAccount {
private:
    std::string accountNumber;
    std::string ownerName;
    double balance;
    std::string pin;

public:
    VulnerableBankAccount(const std::string& accountNumber, const std::string& ownerName, 
                         double balance, const std::string& pin)
        : accountNumber(accountNumber), ownerName(ownerName), balance(balance), pin(pin) {}
    
    // Problem: Direct member access can accidentally modify sensitive data
    bool validateTransaction(double amount) {
        if (this->balance >= amount) {
            this->balance -= amount; // Oops! This should only happen in actual transaction
            return true;
        }
        return false;
    }
    
    // Direct access to internal state
    double getBalance() const { return balance; }
    std::string getAccountNumber() const { return accountNumber; }
};

// AFTER: Private Class Data Pattern Implementation

// Step 1: Create immutable private data class
class AccountData {
private:
    const std::string accountNumber;
    const std::string ownerName;
    const double balance;
    const std::string pin;
    const std::chrono::system_clock::time_point lastTransactionTime;

public:
    // Constructor
    AccountData(const std::string& accountNumber, const std::string& ownerName,
                double balance, const std::string& pin)
        : accountNumber(accountNumber), ownerName(ownerName), balance(balance),
          pin(pin), lastTransactionTime(std::chrono::system_clock::now()) {}

    // Copy constructor for creating modified instances
    AccountData(const std::string& accountNumber, const std::string& ownerName,
                double balance, const std::string& pin,
                const std::chrono::system_clock::time_point& lastTransactionTime)
        : accountNumber(accountNumber), ownerName(ownerName), balance(balance),
          pin(pin), lastTransactionTime(lastTransactionTime) {}

    // Controlled access methods
    std::string getAccountNumber() const { return accountNumber; }
    std::string getOwnerName() const { return ownerName; }
    double getBalance() const { return balance; }
    std::chrono::system_clock::time_point getLastTransactionTime() const { return lastTransactionTime; }

    // Secure PIN validation without exposing the PIN
    bool validatePin(const std::string& inputPin) const {
        return !pin.empty() && pin == inputPin;
    }

    // Create new instance with updated balance (immutability)
    std::unique_ptr<AccountData> withNewBalance(double newBalance) const {
        return std::make_unique<AccountData>(accountNumber, ownerName, newBalance, pin,
                                           std::chrono::system_clock::now());
    }

    // Create masked account number for display
    std::string getMaskedAccountNumber() const {
        if (accountNumber.length() <= 4) return "****";
        return "****" + accountNumber.substr(accountNumber.length() - 4);
    }

    // Get account summary without sensitive data
    std::string getAccountSummary() const {
        std::ostringstream oss;
        auto time_t = std::chrono::system_clock::to_time_t(lastTransactionTime);
        oss << "Account: " << getMaskedAccountNumber()
            << ", Owner: " << ownerName
            << ", Balance: $" << std::fixed << std::setprecision(2) << balance
            << ", Last Transaction: " << std::put_time(std::localtime(&time_t), "%Y-%m-%d %H:%M:%S");
        return oss.str();
    }
};

// Step 2: Main class uses private data object
class SecureBankAccount {
private:
    std::unique_ptr<AccountData> accountData;

public:
    SecureBankAccount(const std::string& accountNumber, const std::string& ownerName,
                     double initialBalance, const std::string& pin)
        : accountData(std::make_unique<AccountData>(accountNumber, ownerName, initialBalance, pin)) {}

    // Copy constructor
    SecureBankAccount(const SecureBankAccount& other)
        : accountData(std::make_unique<AccountData>(*other.accountData)) {}

    // Move constructor
    SecureBankAccount(SecureBankAccount&& other) noexcept
        : accountData(std::move(other.accountData)) {}

    // Assignment operators
    SecureBankAccount& operator=(const SecureBankAccount& other) {
        if (this != &other) {
            accountData = std::make_unique<AccountData>(*other.accountData);
        }
        return *this;
    }

    SecureBankAccount& operator=(SecureBankAccount&& other) noexcept {
        if (this != &other) {
            accountData = std::move(other.accountData);
        }
        return *this;
    }

    // Secure transaction with PIN validation
    bool withdraw(double amount, const std::string& pin) {
        if (!accountData->validatePin(pin)) {
            std::cout << "Invalid PIN" << std::endl;
            return false;
        }

        if (accountData->getBalance() < amount) {
            std::cout << "Insufficient funds" << std::endl;
            return false;
        }

        if (amount <= 0) {
            std::cout << "Invalid amount" << std::endl;
            return false;
        }

        // Create new account data with updated balance (immutable update)
        accountData = accountData->withNewBalance(accountData->getBalance() - amount);
        std::cout << "Withdrawal successful. New balance: $" 
                  << std::fixed << std::setprecision(2) << accountData->getBalance() << std::endl;
        return true;
    }

    bool deposit(double amount, const std::string& pin) {
        if (!accountData->validatePin(pin)) {
            std::cout << "Invalid PIN" << std::endl;
            return false;
        }

        if (amount <= 0) {
            std::cout << "Invalid amount" << std::endl;
            return false;
        }

        accountData = accountData->withNewBalance(accountData->getBalance() + amount);
        std::cout << "Deposit successful. New balance: $"
                  << std::fixed << std::setprecision(2) << accountData->getBalance() << std::endl;
        return true;
    }

    // Safe validation that doesn't modify state
    bool validateTransaction(double amount) const {
        return accountData->getBalance() >= amount;
    }

    // Controlled access to account information
    std::string getAccountSummary() const {
        return accountData->getAccountSummary();
    }

    std::string getMaskedAccountNumber() const {
        return accountData->getMaskedAccountNumber();
    }

    std::string getOwnerName() const {
        return accountData->getOwnerName();
    }

    double getBalance(const std::string& pin) const {
        if (accountData->validatePin(pin)) {
            return accountData->getBalance();
        }
        throw std::runtime_error("Invalid PIN for balance inquiry");
    }

    // Transfer functionality
    bool transferTo(SecureBankAccount& recipient, double amount, const std::string& pin) {
        if (!accountData->validatePin(pin)) {
            std::cout << "Invalid PIN for transfer" << std::endl;
            return false;
        }

        if (!validateTransaction(amount)) {
            std::cout << "Insufficient funds for transfer" << std::endl;
            return false;
        }

        // Perform withdrawal
        accountData = accountData->withNewBalance(accountData->getBalance() - amount);
        
        // Perform deposit to recipient (simplified - in real system would need recipient's PIN)
        recipient.accountData = recipient.accountData->withNewBalance(
            recipient.accountData->getBalance() + amount);

        std::cout << "Transfer of $" << std::fixed << std::setprecision(2) 
                  << amount << " completed successfully" << std::endl;
        return true;
    }
};

// Alternative implementation using PIMPL idiom (Pointer to Implementation)
class PimplBankAccount {
private:
    class Impl; // Forward declaration
    std::unique_ptr<Impl> pImpl; // Pointer to implementation

public:
    // Constructor
    PimplBankAccount(const std::string& accountNumber, const std::string& ownerName,
                    double initialBalance, const std::string& pin);
    
    // Destructor
    ~PimplBankAccount();
    
    // Copy and move operations
    PimplBankAccount(const PimplBankAccount& other);
    PimplBankAccount(PimplBankAccount&& other) noexcept;
    PimplBankAccount& operator=(const PimplBankAccount& other);
    PimplBankAccount& operator=(PimplBankAccount&& other) noexcept;
    
    // Public interface
    bool withdraw(double amount, const std::string& pin);
    bool deposit(double amount, const std::string& pin);
    bool validateTransaction(double amount) const;
    std::string getAccountSummary() const;
    std::string getMaskedAccountNumber() const;
    double getBalance(const std::string& pin) const;
};

// Implementation class (would typically be in .cpp file)
class PimplBankAccount::Impl {
public:
    std::unique_ptr<AccountData> accountData;
    
    Impl(const std::string& accountNumber, const std::string& ownerName,
         double initialBalance, const std::string& pin)
        : accountData(std::make_unique<AccountData>(accountNumber, ownerName, initialBalance, pin)) {}
};

// PimplBankAccount method implementations
PimplBankAccount::PimplBankAccount(const std::string& accountNumber, const std::string& ownerName,
                                  double initialBalance, const std::string& pin)
    : pImpl(std::make_unique<Impl>(accountNumber, ownerName, initialBalance, pin)) {}

PimplBankAccount::~PimplBankAccount() = default;

PimplBankAccount::PimplBankAccount(const PimplBankAccount& other)
    : pImpl(std::make_unique<Impl>(*other.pImpl)) {}

PimplBankAccount::PimplBankAccount(PimplBankAccount&& other) noexcept = default;

PimplBankAccount& PimplBankAccount::operator=(const PimplBankAccount& other) {
    if (this != &other) {
        pImpl = std::make_unique<Impl>(*other.pImpl);
    }
    return *this;
}

PimplBankAccount& PimplBankAccount::operator=(PimplBankAccount&& other) noexcept = default;

bool PimplBankAccount::withdraw(double amount, const std::string& pin) {
    if (!pImpl->accountData->validatePin(pin)) {
        std::cout << "Invalid PIN" << std::endl;
        return false;
    }
    
    if (pImpl->accountData->getBalance() < amount || amount <= 0) {
        std::cout << "Invalid transaction" << std::endl;
        return false;
    }
    
    pImpl->accountData = pImpl->accountData->withNewBalance(pImpl->accountData->getBalance() - amount);
    std::cout << "PIMPL Withdrawal successful. New balance: $" 
              << std::fixed << std::setprecision(2) << pImpl->accountData->getBalance() << std::endl;
    return true;
}

bool PimplBankAccount::deposit(double amount, const std::string& pin) {
    if (!pImpl->accountData->validatePin(pin) || amount <= 0) {
        std::cout << "Invalid transaction" << std::endl;
        return false;
    }
    
    pImpl->accountData = pImpl->accountData->withNewBalance(pImpl->accountData->getBalance() + amount);
    return true;
}

bool PimplBankAccount::validateTransaction(double amount) const {
    return pImpl->accountData->getBalance() >= amount;
}

std::string PimplBankAccount::getAccountSummary() const {
    return pImpl->accountData->getAccountSummary();
}

std::string PimplBankAccount::getMaskedAccountNumber() const {
    return pImpl->accountData->getMaskedAccountNumber();
}

double PimplBankAccount::getBalance(const std::string& pin) const {
    if (pImpl->accountData->validatePin(pin)) {
        return pImpl->accountData->getBalance();
    }
    throw std::runtime_error("Invalid PIN for balance inquiry");
}

// Demonstration function
void demonstratePrivateClassDataPattern() {
    std::cout << "=== Private Class Data Pattern Demo ===" << std::endl << std::endl;
    
    // Create secure bank account
    SecureBankAccount account("1234567890", "Charlie Brown", 2000.0, "5678");
    
    // Display initial account summary
    std::cout << "Initial Account Summary:" << std::endl;
    std::cout << account.getAccountSummary() << std::endl << std::endl;
    
    // Valid transactions
    std::cout << "--- Valid Transactions ---" << std::endl;
    account.withdraw(300.0, "5678");
    account.deposit(150.0, "5678");
    std::cout << std::endl;
    
    // Invalid transactions
    std::cout << "--- Invalid Transactions ---" << std::endl;
    account.withdraw(500.0, "0000"); // Wrong PIN
    account.withdraw(3000.0, "5678"); // Insufficient funds
    std::cout << std::endl;
    
    // Safe validation
    std::cout << "--- Transaction Validation ---" << std::endl;
    std::cout << "Can withdraw $800? " << (account.validateTransaction(800.0) ? "Yes" : "No") << std::endl;
    std::cout << "Can withdraw $2500? " << (account.validateTransaction(2500.0) ? "Yes" : "No") << std::endl;
    std::cout << std::endl;
    
    // Security demonstration
    std::cout << "--- Security Features ---" << std::endl;
    std::cout << "Masked Account Number: " << account.getMaskedAccountNumber() << std::endl;
    std::cout << "Owner Name: " << account.getOwnerName() << std::endl;
    
    try {
        double balance = account.getBalance("5678");
        std::cout << "Balance with correct PIN: $" << std::fixed << std::setprecision(2) << balance << std::endl;
    } catch (const std::runtime_error& e) {
        std::cout << "Security error: " << e.what() << std::endl;
    }
    
    try {
        account.getBalance("0000"); // Wrong PIN
    } catch (const std::runtime_error& e) {
        std::cout << "Security error with wrong PIN: " << e.what() << std::endl;
    }
    
    std::cout << std::endl;
    
    // Transfer demonstration
    std::cout << "--- Transfer Operation ---" << std::endl;
    SecureBankAccount recipient("0987654321", "Diana Prince", 500.0, "9999");
    std::cout << "Before transfer:" << std::endl;
    std::cout << "Sender: " << account.getAccountSummary() << std::endl;
    std::cout << "Recipient: " << recipient.getAccountSummary() << std::endl;
    
    account.transferTo(recipient, 200.0, "5678");
    
    std::cout << "After transfer:" << std::endl;
    std::cout << "Sender: " << account.getAccountSummary() << std::endl;
    std::cout << "Recipient: " << recipient.getAccountSummary() << std::endl;
    std::cout << std::endl;
    
    // PIMPL demonstration
    std::cout << "--- PIMPL Implementation ---" << std::endl;
    PimplBankAccount pimplAccount("1111222233", "Eve Wilson", 1000.0, "1122");
    std::cout << "PIMPL Account: " << pimplAccount.getAccountSummary() << std::endl;
    pimplAccount.withdraw(100.0, "1122");
    std::cout << "Final PIMPL Account: " << pimplAccount.getAccountSummary() << std::endl;
}

int main() {
    demonstratePrivateClassDataPattern();
    return 0;
}

/*
Benefits of Private Class Data Pattern in C++:

1. ENCAPSULATION: Sensitive data is completely encapsulated in private data class
2. IMMUTABILITY: Data objects can be made const and immutable
3. CONTROLLED ACCESS: All data access goes through validated methods
4. SECURITY: No direct access to sensitive information like PINs
5. CONSISTENCY: State changes are atomic and consistent
6. MEMORY SAFETY: Uses smart pointers for automatic memory management
7. CONST CORRECTNESS: Proper const methods for read-only operations
8. PIMPL COMPATIBILITY: Works well with Pointer to Implementation idiom

C++-specific features used:
- const members for immutability
- std::unique_ptr for automatic memory management
- Move semantics for efficient transfers
- RAII for resource management
- const correctness throughout
- Exception handling for security validation
- Copy and move constructors/assignment operators

Use Cases:
- Financial systems with sensitive account data
- User profiles with personal information
- Configuration classes with system settings
- Game state management with protected player data
- Any class where data integrity and security is critical

Comparison with PIMPL:
- Private Class Data: Focuses on data encapsulation and immutability
- PIMPL: Focuses on compilation firewall and interface stability
- Both can be combined for maximum benefit
*/
