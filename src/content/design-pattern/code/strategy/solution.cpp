#include <iostream>
#include <string>
#include <memory>

// Strategy interface
class PaymentStrategy {
public:
    virtual ~PaymentStrategy() = default;
    virtual void pay(double amount) = 0;
    virtual bool validate() = 0;
};

// Concrete Strategies
class CreditCardPayment : public PaymentStrategy {
private:
    std::string cardNumber;
    std::string holderName;
    std::string cvv;

public:
    CreditCardPayment(const std::string& cardNumber, const std::string& holderName, const std::string& cvv)
        : cardNumber(cardNumber), holderName(holderName), cvv(cvv) {}

    bool validate() override {
        return !cardNumber.empty() && cardNumber.length() == 16 && 
               !cvv.empty() && cvv.length() == 3;
    }

    void pay(double amount) override {
        if (validate()) {
            std::cout << "Processing credit card payment of $" << amount << std::endl;
            std::cout << "Card: ****-****-****-" << cardNumber.substr(12) << std::endl;
            std::cout << "Holder: " << holderName << std::endl;
            std::cout << "Payment successful via Credit Card!" << std::endl;
        } else {
            std::cout << "Invalid credit card details!" << std::endl;
        }
    }
};

class PayPalPayment : public PaymentStrategy {
private:
    std::string email;
    std::string password;

public:
    PayPalPayment(const std::string& email, const std::string& password)
        : email(email), password(password) {}

    bool validate() override {
        return !email.empty() && email.find('@') != std::string::npos && 
               !password.empty() && password.length() >= 6;
    }

    void pay(double amount) override {
        if (validate()) {
            std::cout << "Connecting to PayPal..." << std::endl;
            std::cout << "Processing PayPal payment of $" << amount << std::endl;
            std::cout << "Email: " << email << std::endl;
            std::cout << "Payment successful via PayPal!" << std::endl;
        } else {
            std::cout << "Invalid PayPal credentials!" << std::endl;
        }
    }
};

class BankTransferPayment : public PaymentStrategy {
private:
    std::string accountNumber;
    std::string routingNumber;

public:
    BankTransferPayment(const std::string& accountNumber, const std::string& routingNumber)
        : accountNumber(accountNumber), routingNumber(routingNumber) {}

    bool validate() override {
        return !accountNumber.empty() && accountNumber.length() >= 8 && 
               !routingNumber.empty() && routingNumber.length() == 9;
    }

    void pay(double amount) override {
        if (validate()) {
            std::cout << "Initiating bank transfer..." << std::endl;
            std::cout << "Processing bank transfer of $" << amount << std::endl;
            std::cout << "Account: ****" << accountNumber.substr(accountNumber.length() - 4) << std::endl;
            std::cout << "Payment successful via Bank Transfer!" << std::endl;
        } else {
            std::cout << "Invalid bank account details!" << std::endl;
        }
    }
};

// Context class
class ShoppingCart {
private:
    std::unique_ptr<PaymentStrategy> paymentStrategy;
    double totalAmount;

public:
    ShoppingCart() : totalAmount(0.0) {}

    void setPaymentStrategy(std::unique_ptr<PaymentStrategy> strategy) {
        paymentStrategy = std::move(strategy);
    }

    void addToCart(double itemPrice) {
        totalAmount += itemPrice;
        std::cout << "Item added. Current total: $" << totalAmount << std::endl;
    }

    void checkout() {
        if (!paymentStrategy) {
            std::cout << "Please select a payment method!" << std::endl;
            return;
        }

        std::cout << "\n--- CHECKOUT PROCESS ---" << std::endl;
        std::cout << "Total amount: $" << totalAmount << std::endl;
        paymentStrategy->pay(totalAmount);
        std::cout << "Checkout completed!\n" << std::endl;
        totalAmount = 0; // Reset cart after payment
    }

    double getTotal() const {
        return totalAmount;
    }
};

int main() {
    ShoppingCart cart;

    // Add items to cart
    std::cout << "=== SHOPPING SESSION ===" << std::endl;
    cart.addToCart(29.99);
    cart.addToCart(15.50);
    cart.addToCart(75.25);

    // Try different payment strategies
    std::cout << "\n=== TRYING DIFFERENT PAYMENT METHODS ===" << std::endl;

    // Credit Card Payment
    cart.setPaymentStrategy(std::make_unique<CreditCardPayment>("1234567890123456", "John Doe", "123"));
    cart.checkout();

    // Add more items
    cart.addToCart(99.99);
    cart.addToCart(45.00);

    // PayPal Payment
    cart.setPaymentStrategy(std::make_unique<PayPalPayment>("john.doe@email.com", "securepass"));
    cart.checkout();

    // More items
    cart.addToCart(199.99);

    // Bank Transfer Payment
    cart.setPaymentStrategy(std::make_unique<BankTransferPayment>("12345678901", "123456789"));
    cart.checkout();

    // Test invalid payment methods
    std::cout << "=== TESTING INVALID PAYMENT METHODS ===" << std::endl;
    cart.addToCart(25.00);
    
    // Invalid credit card
    cart.setPaymentStrategy(std::make_unique<CreditCardPayment>("123", "Invalid User", "12"));
    cart.checkout();

    return 0;
}
