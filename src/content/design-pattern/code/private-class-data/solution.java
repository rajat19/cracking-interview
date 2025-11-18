/**
 * Private Class Data Pattern - Java Implementation
 * 
 * This pattern encapsulates class data into a separate private data class
 * to prevent unwanted modification and provide controlled access.
 * 
 * Example: BankAccount with sensitive financial data protection
 */

// BEFORE: Traditional approach - direct field access (vulnerable)
class VulnerableBankAccount {
    private String accountNumber;
    private String ownerName;
    private double balance;
    private String pin;
    
    public VulnerableBankAccount(String accountNumber, String ownerName, double balance, String pin) {
        this.accountNumber = accountNumber;
        this.ownerName = ownerName;
        this.balance = balance;
        this.pin = pin;
    }
    
    // Problem: Direct field access in methods can accidentally modify sensitive data
    public boolean validateTransaction(double amount) {
        // Accidentally modifying balance during validation
        if (this.balance >= amount) {
            this.balance -= amount; // Oops! This should only happen in actual transaction
            return true;
        }
        return false;
    }
    
    // Getters expose internal state directly
    public String getAccountNumber() { return accountNumber; }
    public double getBalance() { return balance; }
}

// AFTER: Private Class Data Pattern Implementation

// Step 1: Create immutable private data class
final class AccountData {
    private final String accountNumber;
    private final String ownerName;
    private final double balance;
    private final String pin;
    private final long lastTransactionTime;
    
    public AccountData(String accountNumber, String ownerName, double balance, String pin) {
        this.accountNumber = accountNumber;
        this.ownerName = ownerName;
        this.balance = balance;
        this.pin = pin;
        this.lastTransactionTime = System.currentTimeMillis();
    }
    
    // Private constructor for creating modified copies
    private AccountData(String accountNumber, String ownerName, double balance, String pin, long lastTransactionTime) {
        this.accountNumber = accountNumber;
        this.ownerName = ownerName;
        this.balance = balance;
        this.pin = pin;
        this.lastTransactionTime = lastTransactionTime;
    }
    
    // Controlled access methods
    public String getAccountNumber() { return accountNumber; }
    public String getOwnerName() { return ownerName; }
    public double getBalance() { return balance; }
    public long getLastTransactionTime() { return lastTransactionTime; }
    
    // Secure PIN validation without exposing the PIN
    public boolean validatePin(String inputPin) {
        return this.pin != null && this.pin.equals(inputPin);
    }
    
    // Create new instance with updated balance (immutability)
    public AccountData withNewBalance(double newBalance) {
        return new AccountData(accountNumber, ownerName, newBalance, pin, System.currentTimeMillis());
    }
    
    // Create masked account number for display
    public String getMaskedAccountNumber() {
        if (accountNumber.length() <= 4) return "****";
        return "****" + accountNumber.substring(accountNumber.length() - 4);
    }
}

// Step 2: Main class uses private data object
class SecureBankAccount {
    private AccountData accountData;
    
    public SecureBankAccount(String accountNumber, String ownerName, double initialBalance, String pin) {
        this.accountData = new AccountData(accountNumber, ownerName, initialBalance, pin);
    }
    
    // Secure transaction with PIN validation
    public boolean withdraw(double amount, String pin) {
        if (!accountData.validatePin(pin)) {
            System.out.println("Invalid PIN");
            return false;
        }
        
        if (accountData.getBalance() < amount) {
            System.out.println("Insufficient funds");
            return false;
        }
        
        // Create new account data with updated balance (immutable update)
        this.accountData = accountData.withNewBalance(accountData.getBalance() - amount);
        System.out.println("Withdrawal successful. New balance: $" + accountData.getBalance());
        return true;
    }
    
    public boolean deposit(double amount, String pin) {
        if (!accountData.validatePin(pin)) {
            System.out.println("Invalid PIN");
            return false;
        }
        
        if (amount <= 0) {
            System.out.println("Invalid amount");
            return false;
        }
        
        this.accountData = accountData.withNewBalance(accountData.getBalance() + amount);
        System.out.println("Deposit successful. New balance: $" + accountData.getBalance());
        return true;
    }
    
    // Safe validation that doesn't modify state
    public boolean validateTransaction(double amount) {
        return accountData.getBalance() >= amount;
    }
    
    // Controlled access to account information
    public String getAccountSummary() {
        return String.format("Account: %s, Owner: %s, Balance: $%.2f, Last Transaction: %s",
            accountData.getMaskedAccountNumber(),
            accountData.getOwnerName(),
            accountData.getBalance(),
            new java.util.Date(accountData.getLastTransactionTime())
        );
    }
    
    // No direct access to sensitive data like PIN or full account number
    public String getMaskedAccountNumber() {
        return accountData.getMaskedAccountNumber();
    }
    
    public double getBalance(String pin) {
        if (accountData.validatePin(pin)) {
            return accountData.getBalance();
        }
        throw new SecurityException("Invalid PIN for balance inquiry");
    }
}

// Demonstration class
public class PrivateClassDataDemo {
    public static void main(String[] args) {
        System.out.println("=== Private Class Data Pattern Demo ===\n");
        
        // Create secure bank account
        SecureBankAccount account = new SecureBankAccount("1234567890", "John Doe", 1000.0, "1234");
        
        // Display account summary
        System.out.println("Initial Account Summary:");
        System.out.println(account.getAccountSummary());
        System.out.println();
        
        // Valid transactions
        System.out.println("--- Valid Transactions ---");
        account.withdraw(100.0, "1234");
        account.deposit(50.0, "1234");
        System.out.println();
        
        // Invalid transactions
        System.out.println("--- Invalid Transactions ---");
        account.withdraw(200.0, "0000"); // Wrong PIN
        account.withdraw(2000.0, "1234"); // Insufficient funds
        System.out.println();
        
        // Safe validation
        System.out.println("--- Transaction Validation ---");
        System.out.println("Can withdraw $500? " + account.validateTransaction(500.0));
        System.out.println("Can withdraw $1000? " + account.validateTransaction(1000.0));
        System.out.println();
        
        // Final summary
        System.out.println("Final Account Summary:");
        System.out.println(account.getAccountSummary());
        
        // Demonstrate security
        System.out.println("\n--- Security Features ---");
        System.out.println("Masked Account Number: " + account.getMaskedAccountNumber());
        try {
            double balance = account.getBalance("1234");
            System.out.println("Balance with correct PIN: $" + balance);
        } catch (SecurityException e) {
            System.out.println("Security error: " + e.getMessage());
        }
        
        try {
            account.getBalance("0000"); // Wrong PIN
        } catch (SecurityException e) {
            System.out.println("Security error with wrong PIN: " + e.getMessage());
        }
    }
}

/*
Benefits of Private Class Data Pattern:

1. ENCAPSULATION: Sensitive data is completely encapsulated in private data class
2. IMMUTABILITY: Data objects are immutable, preventing accidental modification
3. CONTROLLED ACCESS: All data access goes through controlled methods
4. SECURITY: No direct access to sensitive information like PINs
5. CONSISTENCY: State changes are atomic and consistent
6. THREAD SAFETY: Immutable objects are inherently thread-safe
7. AUDIT TRAIL: Can easily add logging/auditing to data access methods

Use Cases:
- Financial systems with sensitive account data
- User profiles with personal information
- Configuration classes with system settings
- Any class where data integrity is critical
*/
