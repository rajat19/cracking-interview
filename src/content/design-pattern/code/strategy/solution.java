// Strategy interface
interface PaymentStrategy {
    void pay(double amount);
    boolean validate();
}

// Concrete Strategies
class CreditCardPayment implements PaymentStrategy {
    private String cardNumber;
    private String holderName;
    private String cvv;

    public CreditCardPayment(String cardNumber, String holderName, String cvv) {
        this.cardNumber = cardNumber;
        this.holderName = holderName;
        this.cvv = cvv;
    }

    @Override
    public boolean validate() {
        // Simple validation logic
        return cardNumber != null && cardNumber.length() == 16 && 
               cvv != null && cvv.length() == 3;
    }

    @Override
    public void pay(double amount) {
        if (validate()) {
            System.out.println("Processing credit card payment of $" + amount);
            System.out.println("Card: ****-****-****-" + cardNumber.substring(12));
            System.out.println("Holder: " + holderName);
            System.out.println("Payment successful via Credit Card!");
        } else {
            System.out.println("Invalid credit card details!");
        }
    }
}

class PayPalPayment implements PaymentStrategy {
    private String email;
    private String password;

    public PayPalPayment(String email, String password) {
        this.email = email;
        this.password = password;
    }

    @Override
    public boolean validate() {
        return email != null && email.contains("@") && 
               password != null && password.length() >= 6;
    }

    @Override
    public void pay(double amount) {
        if (validate()) {
            System.out.println("Connecting to PayPal...");
            System.out.println("Processing PayPal payment of $" + amount);
            System.out.println("Email: " + email);
            System.out.println("Payment successful via PayPal!");
        } else {
            System.out.println("Invalid PayPal credentials!");
        }
    }
}

class BankTransferPayment implements PaymentStrategy {
    private String accountNumber;
    private String routingNumber;

    public BankTransferPayment(String accountNumber, String routingNumber) {
        this.accountNumber = accountNumber;
        this.routingNumber = routingNumber;
    }

    @Override
    public boolean validate() {
        return accountNumber != null && accountNumber.length() >= 8 && 
               routingNumber != null && routingNumber.length() == 9;
    }

    @Override
    public void pay(double amount) {
        if (validate()) {
            System.out.println("Initiating bank transfer...");
            System.out.println("Processing bank transfer of $" + amount);
            System.out.println("Account: ****" + accountNumber.substring(accountNumber.length() - 4));
            System.out.println("Payment successful via Bank Transfer!");
        } else {
            System.out.println("Invalid bank account details!");
        }
    }
}

class CryptocurrencyPayment implements PaymentStrategy {
    private String walletAddress;
    private String privateKey;

    public CryptocurrencyPayment(String walletAddress, String privateKey) {
        this.walletAddress = walletAddress;
        this.privateKey = privateKey;
    }

    @Override
    public boolean validate() {
        return walletAddress != null && walletAddress.length() >= 26 && 
               privateKey != null && privateKey.length() >= 32;
    }

    @Override
    public void pay(double amount) {
        if (validate()) {
            System.out.println("Broadcasting cryptocurrency transaction...");
            System.out.println("Processing crypto payment of $" + amount);
            System.out.println("Wallet: " + walletAddress.substring(0, 6) + "...");
            System.out.println("Payment successful via Cryptocurrency!");
        } else {
            System.out.println("Invalid cryptocurrency wallet details!");
        }
    }
}

// Context class
class ShoppingCart {
    private PaymentStrategy paymentStrategy;
    private double totalAmount;

    public void setPaymentStrategy(PaymentStrategy paymentStrategy) {
        this.paymentStrategy = paymentStrategy;
    }

    public void addToCart(double itemPrice) {
        totalAmount += itemPrice;
        System.out.println("Item added. Current total: $" + totalAmount);
    }

    public void checkout() {
        if (paymentStrategy == null) {
            System.out.println("Please select a payment method!");
            return;
        }

        System.out.println("\n--- CHECKOUT PROCESS ---");
        System.out.println("Total amount: $" + totalAmount);
        paymentStrategy.pay(totalAmount);
        System.out.println("Checkout completed!\n");
        totalAmount = 0; // Reset cart after payment
    }

    public double getTotal() {
        return totalAmount;
    }
}

public class StrategyPatternDemo {
    public static void main(String[] args) {
        ShoppingCart cart = new ShoppingCart();

        // Add items to cart
        System.out.println("=== SHOPPING SESSION ===");
        cart.addToCart(29.99);
        cart.addToCart(15.50);
        cart.addToCart(75.25);

        // Try different payment strategies
        System.out.println("\n=== TRYING DIFFERENT PAYMENT METHODS ===");

        // Credit Card Payment
        cart.setPaymentStrategy(new CreditCardPayment("1234567890123456", "John Doe", "123"));
        cart.checkout();

        // Add more items
        cart.addToCart(99.99);
        cart.addToCart(45.00);

        // PayPal Payment
        cart.setPaymentStrategy(new PayPalPayment("john.doe@email.com", "securepass"));
        cart.checkout();

        // More items
        cart.addToCart(199.99);

        // Bank Transfer Payment
        cart.setPaymentStrategy(new BankTransferPayment("12345678901", "123456789"));
        cart.checkout();

        // Final purchase
        cart.addToCart(500.00);

        // Cryptocurrency Payment
        cart.setPaymentStrategy(new CryptocurrencyPayment("1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa", "L4rK3xfFSS2zQS9p4mz2zAXQHEsLF5HQmh32xPBq8ZlA"));
        cart.checkout();

        // Test invalid payment methods
        System.out.println("=== TESTING INVALID PAYMENT METHODS ===");
        cart.addToCart(25.00);
        
        // Invalid credit card
        cart.setPaymentStrategy(new CreditCardPayment("123", "Invalid User", "12"));
        cart.checkout();
    }
}
