/**
 * Abstract Factory Pattern - GUI Framework Example
 * Creates families of related objects (Windows/Mac UI components) without specifying their concrete classes
 */

// Abstract products
interface Button {
    void click();
    void render();
}

interface Checkbox {
    void check();
    void render();
}

// Concrete Windows products
class WindowsButton implements Button {
    @Override
    public void click() {
        System.out.println("Windows button clicked - Opening file dialog");
    }
    
    @Override
    public void render() {
        System.out.println("Rendering Windows-style button with system theme");
    }
}

class WindowsCheckbox implements Checkbox {
    @Override
    public void check() {
        System.out.println("Windows checkbox toggled with system sound");
    }
    
    @Override
    public void render() {
        System.out.println("Rendering Windows-style checkbox with blue checkmark");
    }
}

// Concrete Mac products
class MacButton implements Button {
    @Override
    public void click() {
        System.out.println("Mac button clicked - Smooth animation effect");
    }
    
    @Override
    public void render() {
        System.out.println("Rendering Mac-style button with rounded corners");
    }
}

class MacCheckbox implements Checkbox {
    @Override
    public void check() {
        System.out.println("Mac checkbox toggled with subtle haptic feedback");
    }
    
    @Override
    public void render() {
        System.out.println("Rendering Mac-style checkbox with gradient effect");
    }
}

// Abstract Factory
interface GUIFactory {
    Button createButton();
    Checkbox createCheckbox();
}

// Concrete Factories
class WindowsFactory implements GUIFactory {
    @Override
    public Button createButton() {
        return new WindowsButton();
    }
    
    @Override
    public Checkbox createCheckbox() {
        return new WindowsCheckbox();
    }
}

class MacFactory implements GUIFactory {
    @Override
    public Button createButton() {
        return new MacButton();
    }
    
    @Override
    public Checkbox createCheckbox() {
        return new MacCheckbox();
    }
}

// Client application
class Application {
    private Button button;
    private Checkbox checkbox;
    
    public Application(GUIFactory factory) {
        this.button = factory.createButton();
        this.checkbox = factory.createCheckbox();
    }
    
    public void renderUI() {
        button.render();
        checkbox.render();
    }
    
    public void handleInteraction() {
        button.click();
        checkbox.check();
    }
}

public class AbstractFactoryDemo {
    public static void main(String[] args) {
        System.out.println("=== Abstract Factory Pattern Demo ===\n");
        
        // Determine OS and create appropriate factory
        String os = System.getProperty("os.name").toLowerCase();
        GUIFactory factory;
        
        if (os.contains("win")) {
            System.out.println("Creating Windows GUI Factory...");
            factory = new WindowsFactory();
        } else if (os.contains("mac")) {
            System.out.println("Creating Mac GUI Factory...");
            factory = new MacFactory();
        } else {
            System.out.println("Defaulting to Windows GUI Factory...");
            factory = new WindowsFactory();
        }
        
        // Create application with platform-specific components
        Application app = new Application(factory);
        
        System.out.println("\n--- Rendering UI Components ---");
        app.renderUI();
        
        System.out.println("\n--- User Interactions ---");
        app.handleInteraction();
        
        System.out.println("\n--- Testing Both Factories ---");
        
        // Demo both factories
        System.out.println("\nWindows Factory:");
        Application windowsApp = new Application(new WindowsFactory());
        windowsApp.renderUI();
        windowsApp.handleInteraction();
        
        System.out.println("\nMac Factory:");
        Application macApp = new Application(new MacFactory());
        macApp.renderUI();
        macApp.handleInteraction();
    }
}
