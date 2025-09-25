#include <iostream>
#include <memory>
#include <string>

/**
 * Abstract Factory Pattern - Cross-Platform Graphics Framework
 * Creates families of related objects for different rendering engines
 */

// Abstract products
class Renderer {
public:
    virtual ~Renderer() = default;
    virtual void renderShape(const std::string& shape) = 0;
    virtual void setColor(const std::string& color) = 0;
};

class Window {
public:
    virtual ~Window() = default;
    virtual void create(int width, int height) = 0;
    virtual void show() = 0;
    virtual void close() = 0;
};

// Concrete OpenGL products
class OpenGLRenderer : public Renderer {
private:
    std::string currentColor = "white";
    
public:
    void renderShape(const std::string& shape) override {
        std::cout << "OpenGL: Rendering " << shape << " with hardware acceleration" << std::endl;
        std::cout << "OpenGL: Using vertex shaders and " << currentColor << " color" << std::endl;
    }
    
    void setColor(const std::string& color) override {
        currentColor = color;
        std::cout << "OpenGL: Setting color to " << color << " using RGB values" << std::endl;
    }
};

class OpenGLWindow : public Window {
private:
    int width, height;
    bool isOpen = false;
    
public:
    void create(int w, int h) override {
        width = w;
        height = h;
        std::cout << "OpenGL: Creating window " << width << "x" << height 
                  << " with double buffering" << std::endl;
    }
    
    void show() override {
        isOpen = true;
        std::cout << "OpenGL: Showing window with hardware-accelerated context" << std::endl;
    }
    
    void close() override {
        isOpen = false;
        std::cout << "OpenGL: Closing window and cleaning up OpenGL context" << std::endl;
    }
};

// Concrete DirectX products
class DirectXRenderer : public Renderer {
private:
    std::string currentColor = "white";
    
public:
    void renderShape(const std::string& shape) override {
        std::cout << "DirectX: Rendering " << shape << " with Direct3D pipeline" << std::endl;
        std::cout << "DirectX: Using HLSL shaders and " << currentColor << " color" << std::endl;
    }
    
    void setColor(const std::string& color) override {
        currentColor = color;
        std::cout << "DirectX: Setting color to " << color << " using DXGI format" << std::endl;
    }
};

class DirectXWindow : public Window {
private:
    int width, height;
    bool isOpen = false;
    
public:
    void create(int w, int h) override {
        width = w;
        height = h;
        std::cout << "DirectX: Creating window " << width << "x" << height 
                  << " with DXGI swap chain" << std::endl;
    }
    
    void show() override {
        isOpen = true;
        std::cout << "DirectX: Showing window with DirectX 12 context" << std::endl;
    }
    
    void close() override {
        isOpen = false;
        std::cout << "DirectX: Closing window and releasing DirectX resources" << std::endl;
    }
};

// Abstract Factory
class GraphicsFactory {
public:
    virtual ~GraphicsFactory() = default;
    virtual std::unique_ptr<Renderer> createRenderer() = 0;
    virtual std::unique_ptr<Window> createWindow() = 0;
};

// Concrete Factories
class OpenGLFactory : public GraphicsFactory {
public:
    std::unique_ptr<Renderer> createRenderer() override {
        return std::make_unique<OpenGLRenderer>();
    }
    
    std::unique_ptr<Window> createWindow() override {
        return std::make_unique<OpenGLWindow>();
    }
};

class DirectXFactory : public GraphicsFactory {
public:
    std::unique_ptr<Renderer> createRenderer() override {
        return std::make_unique<DirectXRenderer>();
    }
    
    std::unique_ptr<Window> createWindow() override {
        return std::make_unique<DirectXWindow>();
    }
};

// Client application
class GraphicsApplication {
private:
    std::unique_ptr<Renderer> renderer;
    std::unique_ptr<Window> window;
    
public:
    GraphicsApplication(std::unique_ptr<GraphicsFactory> factory) {
        renderer = factory->createRenderer();
        window = factory->createWindow();
    }
    
    void initialize() {
        std::cout << "Initializing graphics application..." << std::endl;
        window->create(800, 600);
        window->show();
    }
    
    void render() {
        std::cout << "\n--- Rendering Scene ---" << std::endl;
        
        renderer->setColor("blue");
        renderer->renderShape("triangle");
        
        renderer->setColor("red");
        renderer->renderShape("rectangle");
        
        renderer->setColor("green");
        renderer->renderShape("circle");
    }
    
    void cleanup() {
        std::cout << "\nCleaning up graphics resources..." << std::endl;
        window->close();
    }
};

int main() {
    std::cout << "=== Abstract Factory Pattern - Graphics Framework ===\n" << std::endl;
    
    // Platform detection (simplified)
    std::string platform;
    
#ifdef _WIN32
    platform = "Windows";
#else
    platform = "Linux";
#endif
    
    std::cout << "Detected platform: " << platform << std::endl;
    
    std::unique_ptr<GraphicsFactory> factory;
    
    if (platform == "Windows") {
        std::cout << "Creating DirectX Graphics Factory..." << std::endl;
        factory = std::make_unique<DirectXFactory>();
    } else {
        std::cout << "Creating OpenGL Graphics Factory..." << std::endl;
        factory = std::make_unique<OpenGLFactory>();
    }
    
    // Create and run application
    GraphicsApplication app(std::move(factory));
    
    app.initialize();
    app.render();
    app.cleanup();
    
    std::cout << "\n--- Testing Both Graphics APIs ---" << std::endl;
    
    // Demo both graphics systems
    std::cout << "\nOpenGL Graphics System:" << std::endl;
    auto openglFactory = std::make_unique<OpenGLFactory>();
    GraphicsApplication openglApp(std::move(openglFactory));
    openglApp.initialize();
    openglApp.render();
    openglApp.cleanup();
    
    std::cout << "\nDirectX Graphics System:" << std::endl;
    auto directxFactory = std::make_unique<DirectXFactory>();
    GraphicsApplication directxApp(std::move(directxFactory));
    directxApp.initialize();
    directxApp.render();
    directxApp.cleanup();
    
    return 0;
}
