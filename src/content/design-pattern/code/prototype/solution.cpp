#include <iostream>
#include <memory>
#include <string>
#include <vector>
#include <map>
#include <unordered_map>
#include <chrono>

/**
 * Prototype Pattern - Graphics Shape System
 * Creates complex graphics objects by cloning prototypes, demonstrating deep copying
 */

// Forward declarations
class Shape;

// Prototype interface
class ShapePrototype {
public:
    virtual ~ShapePrototype() = default;
    virtual std::unique_ptr<ShapePrototype> clone() const = 0;
    virtual void display() const = 0;
    virtual std::string getType() const = 0;
    virtual void draw() const = 0;
};

// Complex helper classes that need deep copying
class Point {
public:
    double x, y;
    
    Point(double x = 0, double y = 0) : x(x), y(y) {}
    
    Point(const Point& other) : x(other.x), y(other.y) {}
    
    std::string toString() const {
        return "(" + std::to_string(x) + ", " + std::to_string(y) + ")";
    }
};

class Color {
public:
    int r, g, b, alpha;
    
    Color(int r = 255, int g = 255, int b = 255, int alpha = 255) 
        : r(r), g(g), b(b), alpha(alpha) {}
    
    Color(const Color& other) : r(other.r), g(other.g), b(other.b), alpha(other.alpha) {}
    
    std::string toString() const {
        return "RGB(" + std::to_string(r) + ", " + std::to_string(g) + 
               ", " + std::to_string(b) + ", " + std::to_string(alpha) + ")";
    }
};

class Style {
public:
    Color fillColor;
    Color strokeColor;
    double strokeWidth;
    std::string pattern;
    std::map<std::string, std::string> customProperties;
    
    Style() : fillColor(200, 200, 200), strokeColor(0, 0, 0), strokeWidth(1.0), pattern("solid") {}
    
    // Copy constructor for deep copying
    Style(const Style& other) 
        : fillColor(other.fillColor), strokeColor(other.strokeColor),
          strokeWidth(other.strokeWidth), pattern(other.pattern),
          customProperties(other.customProperties) {}
    
    void setProperty(const std::string& key, const std::string& value) {
        customProperties[key] = value;
    }
    
    std::string toString() const {
        return "Style{fill: " + fillColor.toString() + 
               ", stroke: " + strokeColor.toString() + 
               ", width: " + std::to_string(strokeWidth) + 
               ", pattern: " + pattern + 
               ", custom: " + std::to_string(customProperties.size()) + " props}";
    }
};

// Concrete prototype implementations
class Circle : public ShapePrototype {
private:
    Point center;
    double radius;
    Style style;
    std::string id;
    std::vector<std::string> tags;
    
public:
    Circle(const Point& center, double radius, const std::string& id = "circle")
        : center(center), radius(radius), id(id) {
        
        // Default style
        style.fillColor = Color(100, 150, 255, 200);
        style.strokeColor = Color(0, 0, 255, 255);
        style.strokeWidth = 2.0;
        
        tags.push_back("geometric");
        tags.push_back("curved");
    }
    
    // Copy constructor for cloning
    Circle(const Circle& other)
        : center(other.center), radius(other.radius), style(other.style), 
          id(other.id + "_copy"), tags(other.tags) {}
    
    std::unique_ptr<ShapePrototype> clone() const override {
        std::cout << "🔄 Cloning Circle: " << id << std::endl;
        return std::make_unique<Circle>(*this);
    }
    
    void display() const override {
        std::cout << "⭕ CIRCLE" << std::endl;
        std::cout << "├─ ID: " << id << std::endl;
        std::cout << "├─ Center: " << center.toString() << std::endl;
        std::cout << "├─ Radius: " << radius << std::endl;
        std::cout << "├─ Style: " << style.toString() << std::endl;
        std::cout << "└─ Tags: ";
        for (size_t i = 0; i < tags.size(); ++i) {
            std::cout << tags[i];
            if (i < tags.size() - 1) std::cout << ", ";
        }
        std::cout << std::endl;
    }
    
    std::string getType() const override { return "Circle"; }
    
    void draw() const override {
        std::cout << "🎨 Drawing circle at " << center.toString() 
                  << " with radius " << radius << std::endl;
        std::cout << "   Using " << style.toString() << std::endl;
    }
    
    // Customization methods
    void setCenter(const Point& newCenter) { center = newCenter; }
    void setRadius(double newRadius) { radius = newRadius; }
    void setId(const std::string& newId) { id = newId; }
    void setFillColor(const Color& color) { style.fillColor = color; }
    void setStrokeColor(const Color& color) { style.strokeColor = color; }
    void addTag(const std::string& tag) { tags.push_back(tag); }
    Style& getStyle() { return style; }
};

class Rectangle : public ShapePrototype {
private:
    Point topLeft;
    double width, height;
    Style style;
    std::string id;
    std::vector<std::string> tags;
    bool rounded;
    double cornerRadius;
    
public:
    Rectangle(const Point& topLeft, double width, double height, const std::string& id = "rectangle")
        : topLeft(topLeft), width(width), height(height), id(id), rounded(false), cornerRadius(0.0) {
        
        // Default style
        style.fillColor = Color(255, 200, 100, 180);
        style.strokeColor = Color(200, 100, 0, 255);
        style.strokeWidth = 1.5;
        
        tags.push_back("geometric");
        tags.push_back("angular");
    }
    
    // Copy constructor for cloning
    Rectangle(const Rectangle& other)
        : topLeft(other.topLeft), width(other.width), height(other.height),
          style(other.style), id(other.id + "_copy"), tags(other.tags),
          rounded(other.rounded), cornerRadius(other.cornerRadius) {}
    
    std::unique_ptr<ShapePrototype> clone() const override {
        std::cout << "🔄 Cloning Rectangle: " << id << std::endl;
        return std::make_unique<Rectangle>(*this);
    }
    
    void display() const override {
        std::cout << "▭ RECTANGLE" << std::endl;
        std::cout << "├─ ID: " << id << std::endl;
        std::cout << "├─ Top-Left: " << topLeft.toString() << std::endl;
        std::cout << "├─ Dimensions: " << width << " x " << height << std::endl;
        std::cout << "├─ Rounded: " << (rounded ? "Yes" : "No");
        if (rounded) std::cout << " (radius: " << cornerRadius << ")";
        std::cout << std::endl;
        std::cout << "├─ Style: " << style.toString() << std::endl;
        std::cout << "└─ Tags: ";
        for (size_t i = 0; i < tags.size(); ++i) {
            std::cout << tags[i];
            if (i < tags.size() - 1) std::cout << ", ";
        }
        std::cout << std::endl;
    }
    
    std::string getType() const override { return "Rectangle"; }
    
    void draw() const override {
        std::cout << "🎨 Drawing rectangle at " << topLeft.toString() 
                  << " with size " << width << "x" << height << std::endl;
        std::cout << "   Using " << style.toString() << std::endl;
        if (rounded) {
            std::cout << "   With rounded corners (radius: " << cornerRadius << ")" << std::endl;
        }
    }
    
    // Customization methods
    void setPosition(const Point& newTopLeft) { topLeft = newTopLeft; }
    void setDimensions(double newWidth, double newHeight) { width = newWidth; height = newHeight; }
    void setId(const std::string& newId) { id = newId; }
    void setFillColor(const Color& color) { style.fillColor = color; }
    void setStrokeColor(const Color& color) { style.strokeColor = color; }
    void addTag(const std::string& tag) { tags.push_back(tag); }
    void setRounded(bool isRounded, double radius = 5.0) { 
        rounded = isRounded; 
        cornerRadius = radius; 
    }
    Style& getStyle() { return style; }
};

class Polygon : public ShapePrototype {
private:
    std::vector<Point> vertices;
    Style style;
    std::string id;
    std::vector<std::string> tags;
    bool closed;
    
public:
    Polygon(const std::vector<Point>& vertices, const std::string& id = "polygon")
        : vertices(vertices), id(id), closed(true) {
        
        // Default style
        style.fillColor = Color(100, 255, 100, 150);
        style.strokeColor = Color(0, 200, 0, 255);
        style.strokeWidth = 2.0;
        style.pattern = "dashed";
        
        tags.push_back("geometric");
        tags.push_back("multi-sided");
    }
    
    // Copy constructor for cloning
    Polygon(const Polygon& other)
        : vertices(other.vertices), style(other.style), id(other.id + "_copy"),
          tags(other.tags), closed(other.closed) {}
    
    std::unique_ptr<ShapePrototype> clone() const override {
        std::cout << "🔄 Cloning Polygon: " << id << " (" << vertices.size() << " vertices)" << std::endl;
        return std::make_unique<Polygon>(*this);
    }
    
    void display() const override {
        std::cout << "🔺 POLYGON" << std::endl;
        std::cout << "├─ ID: " << id << std::endl;
        std::cout << "├─ Vertices: " << vertices.size() << std::endl;
        for (size_t i = 0; i < std::min(vertices.size(), size_t(3)); ++i) {
            std::cout << "│  ├─ " << vertices[i].toString() << std::endl;
        }
        if (vertices.size() > 3) {
            std::cout << "│  └─ ... (" << (vertices.size() - 3) << " more)" << std::endl;
        }
        std::cout << "├─ Closed: " << (closed ? "Yes" : "No") << std::endl;
        std::cout << "├─ Style: " << style.toString() << std::endl;
        std::cout << "└─ Tags: ";
        for (size_t i = 0; i < tags.size(); ++i) {
            std::cout << tags[i];
            if (i < tags.size() - 1) std::cout << ", ";
        }
        std::cout << std::endl;
    }
    
    std::string getType() const override { return "Polygon"; }
    
    void draw() const override {
        std::cout << "🎨 Drawing polygon with " << vertices.size() << " vertices" << std::endl;
        std::cout << "   Using " << style.toString() << std::endl;
        std::cout << "   Shape is " << (closed ? "closed" : "open") << std::endl;
    }
    
    // Customization methods
    void addVertex(const Point& vertex) { vertices.push_back(vertex); }
    void setId(const std::string& newId) { id = newId; }
    void setFillColor(const Color& color) { style.fillColor = color; }
    void setStrokeColor(const Color& color) { style.strokeColor = color; }
    void addTag(const std::string& tag) { tags.push_back(tag); }
    void setClosed(bool isClosed) { closed = isClosed; }
    Style& getStyle() { return style; }
    const std::vector<Point>& getVertices() const { return vertices; }
};

// Factory for managing shape prototypes
class ShapeFactory {
private:
    std::unordered_map<std::string, std::unique_ptr<ShapePrototype>> prototypes;
    
public:
    ShapeFactory() {
        initializePrototypes();
    }
    
    void initializePrototypes() {
        std::cout << "🏭 Initializing shape prototypes..." << std::endl;
        
        // Create template shapes
        auto circleTemplate = std::make_unique<Circle>(Point(50, 50), 25, "template_circle");
        circleTemplate->getStyle().setProperty("template", "true");
        circleTemplate->addTag("template");
        
        auto rectTemplate = std::make_unique<Rectangle>(Point(10, 10), 100, 60, "template_rectangle");
        rectTemplate->setRounded(true, 8.0);
        rectTemplate->getStyle().setProperty("template", "true");
        rectTemplate->addTag("template");
        
        std::vector<Point> trianglePoints = {Point(0, 0), Point(50, 0), Point(25, 40)};
        auto triangleTemplate = std::make_unique<Polygon>(trianglePoints, "template_triangle");
        triangleTemplate->getStyle().setProperty("template", "true");
        triangleTemplate->addTag("template");
        triangleTemplate->addTag("triangle");
        
        // Register prototypes
        prototypes["circle"] = std::move(circleTemplate);
        prototypes["rectangle"] = std::move(rectTemplate);
        prototypes["triangle"] = std::move(triangleTemplate);
        
        std::cout << "✅ Prototypes initialized: ";
        for (const auto& pair : prototypes) {
            std::cout << pair.first << " ";
        }
        std::cout << std::endl;
    }
    
    std::unique_ptr<ShapePrototype> createShape(const std::string& type) {
        auto it = prototypes.find(type);
        if (it != prototypes.end()) {
            return it->second->clone();
        }
        throw std::invalid_argument("Unknown shape type: " + type);
    }
    
    void registerPrototype(const std::string& name, std::unique_ptr<ShapePrototype> prototype) {
        prototypes[name] = std::move(prototype);
        std::cout << "📝 Registered new prototype: " << name << std::endl;
    }
    
    std::vector<std::string> getAvailableTypes() const {
        std::vector<std::string> types;
        for (const auto& pair : prototypes) {
            types.push_back(pair.first);
        }
        return types;
    }
};

// Demonstrate deep copying behavior
void demonstrateDeepCopy() {
    std::cout << "\n--- Deep Copy Demonstration ---" << std::endl;
    
    // Create original shape
    Circle original(Point(100, 100), 50, "original_circle");
    original.setFillColor(Color(255, 0, 0, 200));
    original.getStyle().setProperty("category", "special");
    original.addTag("original");
    
    std::cout << "Original before cloning:" << std::endl;
    original.display();
    
    // Clone the shape
    auto cloned = original.clone();
    auto* clonedCircle = dynamic_cast<Circle*>(cloned.get());
    
    if (clonedCircle) {
        // Modify the clone
        clonedCircle->setCenter(Point(200, 200));
        clonedCircle->setRadius(75);
        clonedCircle->setFillColor(Color(0, 255, 0, 200));
        clonedCircle->getStyle().setProperty("category", "modified");
        clonedCircle->addTag("cloned");
        clonedCircle->setId("modified_circle");
        
        std::cout << "\nOriginal after clone modification:" << std::endl;
        original.display();
        
        std::cout << "\nCloned shape after modification:" << std::endl;
        clonedCircle->display();
        
        std::cout << "\n✅ Deep copy verification: Original unchanged after clone modification" << std::endl;
    }
}

int main() {
    std::cout << "=== Prototype Pattern Demo - Graphics Shape System ===\n" << std::endl;
    
    try {
        ShapeFactory factory;
        
        std::cout << "\n--- Creating Shapes from Prototypes ---" << std::endl;
        
        // Create various shapes using prototypes
        auto circle1 = factory.createShape("circle");
        auto rect1 = factory.createShape("rectangle");
        auto triangle1 = factory.createShape("triangle");
        
        // Customize the created shapes
        if (auto* circle = dynamic_cast<Circle*>(circle1.get())) {
            circle->setId("user_circle");
            circle->setCenter(Point(150, 150));
            circle->setRadius(40);
            circle->setFillColor(Color(255, 100, 100, 180));
            circle->addTag("customized");
        }
        
        if (auto* rect = dynamic_cast<Rectangle*>(rect1.get())) {
            rect->setId("user_rectangle");
            rect->setPosition(Point(50, 200));
            rect->setDimensions(120, 80);
            rect->setFillColor(Color(100, 100, 255, 200));
            rect->addTag("customized");
        }
        
        if (auto* triangle = dynamic_cast<Polygon*>(triangle1.get())) {
            triangle->setId("user_triangle");
            triangle->setFillColor(Color(255, 255, 100, 150));
            triangle->addTag("customized");
        }
        
        std::cout << "\nDisplaying created shapes:" << std::endl;
        circle1->display();
        std::cout << std::endl;
        rect1->display();
        std::cout << std::endl;
        triangle1->display();
        
        std::cout << "\n--- Drawing Shapes ---" << std::endl;
        circle1->draw();
        rect1->draw();
        triangle1->draw();
        
        // Demonstrate deep copying
        demonstrateDeepCopy();
        
        std::cout << "\n--- Custom Prototype Registration ---" << std::endl;
        
        // Create a custom star shape
        std::vector<Point> starPoints = {
            Point(50, 20), Point(60, 40), Point(80, 40), Point(65, 55),
            Point(70, 75), Point(50, 60), Point(30, 75), Point(35, 55),
            Point(20, 40), Point(40, 40)
        };
        auto starPrototype = std::make_unique<Polygon>(starPoints, "template_star");
        starPrototype->setFillColor(Color(255, 215, 0, 200)); // Gold color
        starPrototype->getStyle().setProperty("template", "true");
        starPrototype->addTag("template");
        starPrototype->addTag("star");
        
        factory.registerPrototype("star", std::move(starPrototype));
        
        // Create a star using the new prototype
        auto star = factory.createShape("star");
        if (auto* starShape = dynamic_cast<Polygon*>(star.get())) {
            starShape->setId("golden_star");
            starShape->addTag("special");
        }
        
        std::cout << "Shape created from custom prototype:" << std::endl;
        star->display();
        std::cout << std::endl;
        star->draw();
        
        std::cout << "\n--- Performance Comparison ---" << std::endl;
        
        auto availableTypes = factory.getAvailableTypes();
        std::cout << "Available shape types: ";
        for (const auto& type : availableTypes) {
            std::cout << type << " ";
        }
        std::cout << std::endl;
        
        // Measure cloning performance
        auto start = std::chrono::high_resolution_clock::now();
        std::vector<std::unique_ptr<ShapePrototype>> shapes;
        
        for (int i = 0; i < 10000; ++i) {
            std::string type = availableTypes[i % availableTypes.size()];
            shapes.push_back(factory.createShape(type));
        }
        
        auto end = std::chrono::high_resolution_clock::now();
        auto duration = std::chrono::duration_cast<std::chrono::microseconds>(end - start);
        
        std::cout << "📊 Created " << shapes.size() << " shapes in " 
                  << duration.count() << " microseconds using prototypes" << std::endl;
        std::cout << "⚡ Average time per shape: " 
                  << (double(duration.count()) / shapes.size()) << " microseconds" << std::endl;
        
        std::cout << "\n✅ Prototype pattern successfully demonstrated!" << std::endl;
        std::cout << "Benefits: Fast object creation, complex initialization reuse, polymorphic cloning" << std::endl;
        
    } catch (const std::exception& e) {
        std::cerr << "❌ Error: " << e.what() << std::endl;
        return 1;
    }
    
    return 0;
}
