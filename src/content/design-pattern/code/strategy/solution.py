from abc import ABC, abstractmethod

# Strategy interface
class PaymentStrategy(ABC):
    @abstractmethod
    def pay(self, amount: float) -> None:
        pass
    
    @abstractmethod
    def validate(self) -> bool:
        pass

# Concrete Strategies
class CreditCardPayment(PaymentStrategy):
    def __init__(self, card_number: str, holder_name: str, cvv: str):
        self.card_number = card_number
        self.holder_name = holder_name
        self.cvv = cvv

    def validate(self) -> bool:
        return (self.card_number is not None and len(self.card_number) == 16 and 
                self.cvv is not None and len(self.cvv) == 3)

    def pay(self, amount: float) -> None:
        if self.validate():
            print(f"Processing credit card payment of ${amount}")
            print(f"Card: ****-****-****-{self.card_number[-4:]}")
            print(f"Holder: {self.holder_name}")
            print("Payment successful via Credit Card!")
        else:
            print("Invalid credit card details!")

class PayPalPayment(PaymentStrategy):
    def __init__(self, email: str, password: str):
        self.email = email
        self.password = password

    def validate(self) -> bool:
        return (self.email is not None and "@" in self.email and 
                self.password is not None and len(self.password) >= 6)

    def pay(self, amount: float) -> None:
        if self.validate():
            print("Connecting to PayPal...")
            print(f"Processing PayPal payment of ${amount}")
            print(f"Email: {self.email}")
            print("Payment successful via PayPal!")
        else:
            print("Invalid PayPal credentials!")

class BankTransferPayment(PaymentStrategy):
    def __init__(self, account_number: str, routing_number: str):
        self.account_number = account_number
        self.routing_number = routing_number

    def validate(self) -> bool:
        return (self.account_number is not None and len(self.account_number) >= 8 and 
                self.routing_number is not None and len(self.routing_number) == 9)

    def pay(self, amount: float) -> None:
        if self.validate():
            print("Initiating bank transfer...")
            print(f"Processing bank transfer of ${amount}")
            print(f"Account: ****{self.account_number[-4:]}")
            print("Payment successful via Bank Transfer!")
        else:
            print("Invalid bank account details!")

class CryptocurrencyPayment(PaymentStrategy):
    def __init__(self, wallet_address: str, private_key: str):
        self.wallet_address = wallet_address
        self.private_key = private_key

    def validate(self) -> bool:
        return (self.wallet_address is not None and len(self.wallet_address) >= 26 and 
                self.private_key is not None and len(self.private_key) >= 32)

    def pay(self, amount: float) -> None:
        if self.validate():
            print("Broadcasting cryptocurrency transaction...")
            print(f"Processing crypto payment of ${amount}")
            print(f"Wallet: {self.wallet_address[:6]}...")
            print("Payment successful via Cryptocurrency!")
        else:
            print("Invalid cryptocurrency wallet details!")

# Context class
class ShoppingCart:
    def __init__(self):
        self.payment_strategy = None
        self.total_amount = 0.0

    def set_payment_strategy(self, payment_strategy: PaymentStrategy) -> None:
        self.payment_strategy = payment_strategy

    def add_to_cart(self, item_price: float) -> None:
        self.total_amount += item_price
        print(f"Item added. Current total: ${self.total_amount}")

    def checkout(self) -> None:
        if self.payment_strategy is None:
            print("Please select a payment method!")
            return

        print("\n--- CHECKOUT PROCESS ---")
        print(f"Total amount: ${self.total_amount}")
        self.payment_strategy.pay(self.total_amount)
        print("Checkout completed!\n")
        self.total_amount = 0  # Reset cart after payment

    def get_total(self) -> float:
        return self.total_amount

def main():
    cart = ShoppingCart()

    # Add items to cart
    print("=== SHOPPING SESSION ===")
    cart.add_to_cart(29.99)
    cart.add_to_cart(15.50)
    cart.add_to_cart(75.25)

    # Try different payment strategies
    print("\n=== TRYING DIFFERENT PAYMENT METHODS ===")

    # Credit Card Payment
    cart.set_payment_strategy(CreditCardPayment("1234567890123456", "John Doe", "123"))
    cart.checkout()

    # Add more items
    cart.add_to_cart(99.99)
    cart.add_to_cart(45.00)

    # PayPal Payment
    cart.set_payment_strategy(PayPalPayment("john.doe@email.com", "securepass"))
    cart.checkout()

    # More items
    cart.add_to_cart(199.99)

    # Bank Transfer Payment
    cart.set_payment_strategy(BankTransferPayment("12345678901", "123456789"))
    cart.checkout()

    # Final purchase
    cart.add_to_cart(500.00)

    # Cryptocurrency Payment
    cart.set_payment_strategy(CryptocurrencyPayment("1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa", "L4rK3xfFSS2zQS9p4mz2zAXQHEsLF5HQmh32xPBq8ZlA"))
    cart.checkout()

    # Test invalid payment methods
    print("=== TESTING INVALID PAYMENT METHODS ===")
    cart.add_to_cart(25.00)
    
    # Invalid credit card
    cart.set_payment_strategy(CreditCardPayment("123", "Invalid User", "12"))
    cart.checkout()

if __name__ == "__main__":
    main()
