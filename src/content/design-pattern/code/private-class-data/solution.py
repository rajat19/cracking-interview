"""
Private Class Data Pattern - Python Implementation

This pattern encapsulates class data into a separate private data class
to prevent unwanted modification and provide controlled access.

Example: BankAccount with sensitive financial data protection
"""

import time
from dataclasses import dataclass, replace
from typing import Optional
import hashlib

# BEFORE: Traditional approach - direct attribute access (vulnerable)
class VulnerableBankAccount:
    def __init__(self, account_number: str, owner_name: str, balance: float, pin: str):
        self.account_number = account_number
        self.owner_name = owner_name
        self.balance = balance
        self.pin = pin
    
    def validate_transaction(self, amount: float) -> bool:
        # Problem: Direct attribute access can accidentally modify sensitive data
        if self.balance >= amount:
            self.balance -= amount  # Oops! This should only happen in actual transaction
            return True
        return False
    
    # Direct attribute exposure
    def get_balance(self) -> float:
        return self.balance

# AFTER: Private Class Data Pattern Implementation

# Step 1: Create immutable private data class using dataclass
@dataclass(frozen=True)  # frozen=True makes it immutable
class _AccountData:
    """Private data class for sensitive account information."""
    account_number: str
    owner_name: str
    balance: float
    _pin_hash: str
    last_transaction_time: float
    
    @classmethod
    def create(cls, account_number: str, owner_name: str, balance: float, pin: str) -> '_AccountData':
        """Factory method to create account data with hashed PIN."""
        pin_hash = hashlib.sha256(pin.encode()).hexdigest()
        return cls(
            account_number=account_number,
            owner_name=owner_name,
            balance=balance,
            _pin_hash=pin_hash,
            last_transaction_time=time.time()
        )
    
    def validate_pin(self, input_pin: str) -> bool:
        """Validate PIN without exposing the stored PIN hash."""
        input_hash = hashlib.sha256(input_pin.encode()).hexdigest()
        return self._pin_hash == input_hash
    
    def with_new_balance(self, new_balance: float) -> '_AccountData':
        """Create new instance with updated balance (maintaining immutability)."""
        return replace(self, balance=new_balance, last_transaction_time=time.time())
    
    def get_masked_account_number(self) -> str:
        """Return masked account number for display."""
        if len(self.account_number) <= 4:
            return "****"
        return "****" + self.account_number[-4:]
    
    def get_account_summary(self) -> str:
        """Get safe account summary without sensitive data."""
        return (f"Account: {self.get_masked_account_number()}, "
                f"Owner: {self.owner_name}, "
                f"Balance: ${self.balance:.2f}, "
                f"Last Transaction: {time.ctime(self.last_transaction_time)}")

# Step 2: Main class uses private data object
class SecureBankAccount:
    def __init__(self, account_number: str, owner_name: str, initial_balance: float, pin: str):
        self._account_data = _AccountData.create(account_number, owner_name, initial_balance, pin)
    
    def withdraw(self, amount: float, pin: str) -> bool:
        """Withdraw money with PIN validation."""
        if not self._account_data.validate_pin(pin):
            print("Invalid PIN")
            return False
        
        if self._account_data.balance < amount:
            print("Insufficient funds")
            return False
        
        if amount <= 0:
            print("Invalid amount")
            return False
        
        # Create new account data with updated balance (immutable update)
        new_balance = self._account_data.balance - amount
        self._account_data = self._account_data.with_new_balance(new_balance)
        print(f"Withdrawal successful. New balance: ${self._account_data.balance:.2f}")
        return True
    
    def deposit(self, amount: float, pin: str) -> bool:
        """Deposit money with PIN validation."""
        if not self._account_data.validate_pin(pin):
            print("Invalid PIN")
            return False
        
        if amount <= 0:
            print("Invalid amount")
            return False
        
        new_balance = self._account_data.balance + amount
        self._account_data = self._account_data.with_new_balance(new_balance)
        print(f"Deposit successful. New balance: ${self._account_data.balance:.2f}")
        return True
    
    def validate_transaction(self, amount: float) -> bool:
        """Safe validation that doesn't modify state."""
        return self._account_data.balance >= amount
    
    def get_account_summary(self) -> str:
        """Get account summary with controlled access."""
        return self._account_data.get_account_summary()
    
    def get_masked_account_number(self) -> str:
        """Get masked account number for display."""
        return self._account_data.get_masked_account_number()
    
    def get_balance(self, pin: str) -> float:
        """Get balance with PIN validation."""
        if self._account_data.validate_pin(pin):
            return self._account_data.balance
        raise SecurityError("Invalid PIN for balance inquiry")
    
    def get_owner_name(self) -> str:
        """Get owner name (non-sensitive data)."""
        return self._account_data.owner_name

# Alternative implementation using properties and private attributes
class AlternativeSecureAccount:
    """Alternative implementation using Python's property decorators."""
    
    def __init__(self, account_number: str, owner_name: str, initial_balance: float, pin: str):
        # Use name mangling for additional privacy
        self.__data = _AccountData.create(account_number, owner_name, initial_balance, pin)
    
    @property
    def owner_name(self) -> str:
        """Read-only access to owner name."""
        return self.__data.owner_name
    
    @property
    def masked_account_number(self) -> str:
        """Read-only access to masked account number."""
        return self.__data.get_masked_account_number()
    
    def __validate_pin(self, pin: str) -> bool:
        """Private method for PIN validation."""
        return self.__data.validate_pin(pin)
    
    def transfer_to(self, other_account: 'AlternativeSecureAccount', amount: float, pin: str) -> bool:
        """Transfer money to another account."""
        if not self.__validate_pin(pin):
            print("Invalid PIN")
            return False
        
        if not self.validate_transaction(amount):
            print("Insufficient funds for transfer")
            return False
        
        # Perform transfer (simplified - in real system would be atomic)
        new_balance = self.__data.balance - amount
        self.__data = self.__data.with_new_balance(new_balance)
        
        # In real system, this would also update the recipient account
        print(f"Transfer of ${amount:.2f} completed")
        return True
    
    def validate_transaction(self, amount: float) -> bool:
        """Public method for transaction validation."""
        return self.__data.balance >= amount

# Custom exception for security errors
class SecurityError(Exception):
    """Raised when security validation fails."""
    pass

# Demonstration function
def demonstrate_private_class_data_pattern():
    """Demonstrate the Private Class Data pattern with examples."""
    print("=== Private Class Data Pattern Demo ===\n")
    
    # Create secure bank account
    account = SecureBankAccount("1234567890", "Alice Johnson", 1500.0, "9876")
    
    # Display initial account summary
    print("Initial Account Summary:")
    print(account.get_account_summary())
    print()
    
    # Valid transactions
    print("--- Valid Transactions ---")
    account.withdraw(200.0, "9876")
    account.deposit(100.0, "9876")
    print()
    
    # Invalid transactions
    print("--- Invalid Transactions ---")
    account.withdraw(300.0, "0000")  # Wrong PIN
    account.withdraw(2000.0, "9876")  # Insufficient funds
    print()
    
    # Safe validation
    print("--- Transaction Validation ---")
    print(f"Can withdraw $500? {account.validate_transaction(500.0)}")
    print(f"Can withdraw $2000? {account.validate_transaction(2000.0)}")
    print()
    
    # Security demonstration
    print("--- Security Features ---")
    print(f"Masked Account Number: {account.get_masked_account_number()}")
    print(f"Owner Name: {account.get_owner_name()}")
    
    try:
        balance = account.get_balance("9876")
        print(f"Balance with correct PIN: ${balance:.2f}")
    except SecurityError as e:
        print(f"Security error: {e}")
    
    try:
        account.get_balance("0000")  # Wrong PIN
    except SecurityError as e:
        print(f"Security error with wrong PIN: {e}")
    
    print()
    
    # Alternative implementation demo
    print("--- Alternative Implementation ---")
    alt_account = AlternativeSecureAccount("9876543210", "Bob Smith", 2000.0, "1111")
    print(f"Owner: {alt_account.owner_name}")
    print(f"Masked Account: {alt_account.masked_account_number}")
    alt_account.transfer_to(account, 100.0, "1111")
    
    # Final summaries
    print("\n--- Final Account Summaries ---")
    print("Main Account:")
    print(account.get_account_summary())

# Additional example: Configuration class with private data
@dataclass(frozen=True)
class _ConfigData:
    """Private configuration data."""
    database_url: str
    api_key: str
    max_connections: int
    debug_mode: bool
    created_at: float
    
    def get_safe_config(self) -> dict:
        """Return configuration without sensitive data."""
        return {
            'max_connections': self.max_connections,
            'debug_mode': self.debug_mode,
            'created_at': time.ctime(self.created_at)
        }

class SecureConfiguration:
    """Secure configuration class using private class data pattern."""
    
    def __init__(self, database_url: str, api_key: str, max_connections: int = 10, debug_mode: bool = False):
        self._config_data = _ConfigData(
            database_url=database_url,
            api_key=api_key,
            max_connections=max_connections,
            debug_mode=debug_mode,
            created_at=time.time()
        )
    
    def get_database_connection_string(self, admin_key: str) -> str:
        """Get database URL with admin authentication."""
        if admin_key != "admin_secret_key":
            raise SecurityError("Invalid admin key")
        return self._config_data.database_url
    
    def get_api_key(self, service_token: str) -> str:
        """Get API key with service authentication."""
        if service_token != "service_token_123":
            raise SecurityError("Invalid service token")
        return self._config_data.api_key
    
    def get_public_config(self) -> dict:
        """Get non-sensitive configuration data."""
        return self._config_data.get_safe_config()
    
    @property
    def max_connections(self) -> int:
        """Public read-only access to max connections."""
        return self._config_data.max_connections
    
    @property
    def debug_mode(self) -> bool:
        """Public read-only access to debug mode."""
        return self._config_data.debug_mode

if __name__ == "__main__":
    demonstrate_private_class_data_pattern()
    
    print("\n=== Configuration Example ===")
    config = SecureConfiguration("postgresql://localhost:5432/db", "secret_api_key_123", 20, True)
    
    print("Public config:", config.get_public_config())
    print(f"Max connections: {config.max_connections}")
    print(f"Debug mode: {config.debug_mode}")
    
    # Secure access to sensitive data
    try:
        db_url = config.get_database_connection_string("admin_secret_key")
        print("Database URL obtained successfully (not displaying for security)")
    except SecurityError as e:
        print(f"Security error: {e}")

"""
Benefits of Private Class Data Pattern in Python:

1. ENCAPSULATION: Sensitive data is encapsulated in private data classes
2. IMMUTABILITY: Using @dataclass(frozen=True) ensures immutability
3. CONTROLLED ACCESS: All data access goes through validated methods
4. SECURITY: No direct access to sensitive information like PINs or API keys
5. CONSISTENCY: State changes are atomic and consistent
6. THREAD SAFETY: Immutable objects are inherently thread-safe
7. PYTHONIC: Uses dataclasses, properties, and name mangling effectively

Python-specific features used:
- @dataclass(frozen=True) for immutable data classes
- Property decorators for controlled access
- Name mangling (__attribute) for additional privacy
- Type hints for better code documentation
- Custom exceptions for security validation

Use Cases:
- Financial systems with sensitive account data
- User profiles with personal information  
- Configuration classes with secrets and credentials
- Any class where data integrity and security is critical
"""
