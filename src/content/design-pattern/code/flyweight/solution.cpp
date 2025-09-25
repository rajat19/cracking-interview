#include <iostream>
#include <string>
#include <unordered_map>
#include <vector>
#include <memory>
#include <random>
#include <sstream>

// Flyweight interface
class CharacterFlyweight {
public:
    virtual ~CharacterFlyweight() = default;
    virtual void display(int x, int y, const std::string& color, int fontSize) const = 0;
};

// Concrete Flyweight - stores intrinsic state (character and font family)
class CharacterType : public CharacterFlyweight {
private:
    char character;
    std::string fontFamily;
    
public:
    CharacterType(char ch, const std::string& font) : character(ch), fontFamily(font) {}
    
    void display(int x, int y, const std::string& color, int fontSize) const override {
        std::cout << "Rendering '" << character << "' [" << fontFamily 
                  << "] at (" << x << "," << y << ") in " << color 
                  << " color, size " << fontSize << std::endl;
    }
    
    char getCharacter() const { return character; }
    const std::string& getFontFamily() const { return fontFamily; }
};

// Flyweight Factory - manages flyweight instances
class CharacterTypeFactory {
private:
    static std::unordered_map<std::string, std::shared_ptr<CharacterFlyweight>> flyweights;
    
public:
    static std::shared_ptr<CharacterFlyweight> getCharacterType(char character, const std::string& fontFamily) {
        std::string key = std::string(1, character) + "_" + fontFamily;
        
        if (flyweights.find(key) == flyweights.end()) {
            flyweights[key] = std::make_shared<CharacterType>(character, fontFamily);
            std::cout << "Creating new flyweight for: " << character << " (" << fontFamily << ")" << std::endl;
        }
        
        return flyweights[key];
    }
    
    static int getCreatedFlyweightsCount() {
        return flyweights.size();
    }
    
    static void printFlyweightStatistics() {
        std::cout << "\n=== Flyweight Statistics ===" << std::endl;
        std::cout << "Total flyweight instances created: " << flyweights.size() << std::endl;
        std::cout << "Memory saved by sharing intrinsic state!" << std::endl;
    }
};

// Initialize static member
std::unordered_map<std::string, std::shared_ptr<CharacterFlyweight>> CharacterTypeFactory::flyweights;

// Context - stores extrinsic state and references to flyweights
class Character {
private:
    std::shared_ptr<CharacterFlyweight> flyweight;
    int x, y;
    std::string color;
    int fontSize;
    
public:
    Character(char character, const std::string& fontFamily, int x, int y, 
              const std::string& color, int fontSize)
        : flyweight(CharacterTypeFactory::getCharacterType(character, fontFamily)),
          x(x), y(y), color(color), fontSize(fontSize) {}
    
    void display() const {
        flyweight->display(x, y, color, fontSize);
    }
};

// Document class that manages multiple characters
class Document {
private:
    std::vector<std::unique_ptr<Character>> characters;
    
public:
    void addCharacter(char character, const std::string& fontFamily, int x, int y, 
                     const std::string& color, int fontSize) {
        characters.push_back(std::make_unique<Character>(character, fontFamily, x, y, color, fontSize));
    }
    
    void render() const {
        std::cout << "\n=== Rendering Document ===" << std::endl;
        for (const auto& character : characters) {
            character->display();
        }
    }
    
    int getCharacterCount() const {
        return characters.size();
    }
};

// Alternative example: Forest simulation with Tree flyweights
class TreeFlyweight {
public:
    virtual ~TreeFlyweight() = default;
    virtual void render(int x, int y, const std::string& climate) const = 0;
};

class TreeType : public TreeFlyweight {
private:
    std::string name;
    std::string color;
    std::string texture;
    
public:
    TreeType(const std::string& name, const std::string& color, const std::string& texture)
        : name(name), color(color), texture(texture) {
        // Simulate loading heavy resources (textures, 3D models, etc.)
        std::cout << "Loading heavy resources for tree type: " << name << std::endl;
    }
    
    void render(int x, int y, const std::string& climate) const override {
        std::cout << "Rendering " << name << " tree at (" << x << "," << y 
                  << ") in " << climate << " climate [" << color 
                  << " color, " << texture << " texture]" << std::endl;
    }
};

class TreeTypeFactory {
private:
    static std::unordered_map<std::string, std::shared_ptr<TreeFlyweight>> treeTypes;
    
public:
    static std::shared_ptr<TreeFlyweight> getTreeType(const std::string& name, 
                                                      const std::string& color, 
                                                      const std::string& texture) {
        std::string key = name + "_" + color + "_" + texture;
        
        if (treeTypes.find(key) == treeTypes.end()) {
            treeTypes[key] = std::make_shared<TreeType>(name, color, texture);
        }
        
        return treeTypes[key];
    }
    
    static int getTreeTypesCount() {
        return treeTypes.size();
    }
};

// Initialize static member
std::unordered_map<std::string, std::shared_ptr<TreeFlyweight>> TreeTypeFactory::treeTypes;

class Tree {
private:
    std::shared_ptr<TreeFlyweight> treeType;
    int x, y;
    std::string climate;
    
public:
    Tree(const std::string& name, const std::string& color, const std::string& texture,
         int x, int y, const std::string& climate)
        : treeType(TreeTypeFactory::getTreeType(name, color, texture)),
          x(x), y(y), climate(climate) {}
    
    void render() const {
        treeType->render(x, y, climate);
    }
};

class Forest {
private:
    std::vector<std::unique_ptr<Tree>> trees;
    
public:
    void plantTree(const std::string& name, const std::string& color, 
                   const std::string& texture, int x, int y, const std::string& climate) {
        trees.push_back(std::make_unique<Tree>(name, color, texture, x, y, climate));
    }
    
    void render() const {
        std::cout << "\n=== Rendering Forest ===" << std::endl;
        for (const auto& tree : trees) {
            tree->render();
        }
    }
    
    int getTreeCount() const {
        return trees.size();
    }
};

// Web Browser Font Example
class FontFlyweight {
private:
    std::string family;
    int size;
    std::string style;
    
public:
    FontFlyweight(const std::string& family, int size, const std::string& style)
        : family(family), size(size), style(style) {
        // Simulate loading font file (expensive operation)
        std::cout << "Loading font: " << family << "-" << size << "-" << style << std::endl;
    }
    
    void renderText(const std::string& text, int x, int y, const std::string& color) const {
        std::cout << "Rendering '" << text << "' with " << family << " " << size 
                  << "pt " << style << " at (" << x << "," << y << ") in " << color << std::endl;
    }
};

class FontFactory {
private:
    static std::unordered_map<std::string, std::shared_ptr<FontFlyweight>> fonts;
    
public:
    static std::shared_ptr<FontFlyweight> getFont(const std::string& family, int size, const std::string& style) {
        std::ostringstream keyStream;
        keyStream << family << "-" << size << "-" << style;
        std::string key = keyStream.str();
        
        if (fonts.find(key) == fonts.end()) {
            fonts[key] = std::make_shared<FontFlyweight>(family, size, style);
        }
        
        return fonts[key];
    }
    
    static int getFontCount() {
        return fonts.size();
    }
};

// Initialize static member
std::unordered_map<std::string, std::shared_ptr<FontFlyweight>> FontFactory::fonts;

class TextElement {
private:
    std::string text;
    std::shared_ptr<FontFlyweight> font;
    int x, y;
    std::string color;
    
public:
    TextElement(const std::string& text, const std::string& fontFamily, int fontSize, 
                const std::string& fontStyle, int x, int y, const std::string& color)
        : text(text), font(FontFactory::getFont(fontFamily, fontSize, fontStyle)),
          x(x), y(y), color(color) {}
    
    void render() const {
        font->renderText(text, x, y, color);
    }
};

class WebPage {
private:
    std::vector<std::unique_ptr<TextElement>> textElements;
    
public:
    void addText(const std::string& text, const std::string& fontFamily, int fontSize,
                 const std::string& fontStyle, int x, int y, const std::string& color) {
        textElements.push_back(std::make_unique<TextElement>(text, fontFamily, fontSize, fontStyle, x, y, color));
    }
    
    void render() const {
        std::cout << "\n=== Rendering Web Page ===" << std::endl;
        for (const auto& element : textElements) {
            element->render();
        }
    }
    
    int getTextCount() const {
        return textElements.size();
    }
};

void demoTextFormatting() {
    std::cout << "=== Text Formatting System Demo ===\n" << std::endl;
    
    Document document;
    
    // Create a document with repeated characters
    std::string text = "Hello World! This is a flyweight pattern demo.";
    std::vector<std::string> fonts = {"Arial", "Times New Roman", "Helvetica"};
    std::vector<std::string> colors = {"black", "red", "blue"};
    std::vector<int> fontSizes = {12, 14, 16};
    
    int x = 0, y = 0;
    for (char c : text) {
        if (c != ' ') {
            std::string font = fonts[x % fonts.size()];
            std::string color = colors[x % colors.size()];
            int fontSize = fontSizes[x % fontSizes.size()];
            
            document.addCharacter(c, font, x * 10, y * 20, color, fontSize);
        }
        x++;
        if (x > 40) {
            x = 0;
            y++;
        }
    }
    
    document.render();
    
    std::cout << "\n=== Memory Efficiency Analysis ===" << std::endl;
    std::cout << "Total characters in document: " << document.getCharacterCount() << std::endl;
    CharacterTypeFactory::printFlyweightStatistics();
    
    std::cout << "\nWithout Flyweight pattern:" << std::endl;
    std::cout << "Memory usage would be: " << document.getCharacterCount() << " character objects" << std::endl;
    std::cout << "With Flyweight pattern:" << std::endl;
    std::cout << "Memory usage is: " << CharacterTypeFactory::getCreatedFlyweightsCount() 
              << " flyweight objects + " << document.getCharacterCount() << " context objects" << std::endl;
    
    double memorySaved = (double)(document.getCharacterCount() - CharacterTypeFactory::getCreatedFlyweightsCount()) / 
                        document.getCharacterCount() * 100;
    std::cout << "Memory efficiency: " << memorySaved << "% reduction in intrinsic state objects" << std::endl;
}

void demoForestSimulation() {
    std::cout << "\n\n=== Forest Simulation Demo ===\n" << std::endl;
    
    Forest forest;
    std::mt19937 rng(42); // Fixed seed for reproducible results
    
    // Plant many trees with repeated types
    std::vector<std::string> treeNames = {"Oak", "Pine", "Birch", "Maple"};
    std::vector<std::string> colors = {"Green", "Dark Green", "Light Green"};
    std::vector<std::string> textures = {"Rough", "Smooth", "Textured"};
    std::vector<std::string> climates = {"Temperate", "Cold", "Mild"};
    
    std::cout << "Planting 20 trees...\n" << std::endl;
    
    for (int i = 0; i < 20; i++) {
        std::string name = treeNames[rng() % treeNames.size()];
        std::string color = colors[rng() % colors.size()];
        std::string texture = textures[rng() % textures.size()];
        std::string climate = climates[rng() % climates.size()];
        
        int x = rng() % 100;
        int y = rng() % 100;
        
        forest.plantTree(name, color, texture, x, y, climate);
    }
    
    forest.render();
    
    std::cout << "\n=== Forest Memory Analysis ===" << std::endl;
    std::cout << "Total trees in forest: " << forest.getTreeCount() << std::endl;
    std::cout << "Tree type flyweights created: " << TreeTypeFactory::getTreeTypesCount() << std::endl;
    
    double treeMemorySaved = (double)(forest.getTreeCount() - TreeTypeFactory::getTreeTypesCount()) / 
                            forest.getTreeCount() * 100;
    std::cout << "Memory efficiency: " << treeMemorySaved << "% reduction in tree type objects" << std::endl;
    std::cout << "\nEach tree type flyweight contains heavy resources (textures, 3D models)" << std::endl;
    std::cout << "Sharing these flyweights saves significant memory!" << std::endl;
}

void demoWebPage() {
    std::cout << "\n\n=== Web Page Font Rendering Demo ===\n" << std::endl;
    
    WebPage webpage;
    
    // Add various text elements
    webpage.addText("Welcome to Our Website", "Arial", 24, "bold", 10, 10, "black");
    webpage.addText("This is a subtitle", "Arial", 18, "normal", 10, 50, "gray");
    webpage.addText("Body text paragraph 1", "Times New Roman", 12, "normal", 10, 100, "black");
    webpage.addText("Body text paragraph 2", "Times New Roman", 12, "normal", 10, 130, "black");
    webpage.addText("Important Notice", "Arial", 14, "bold", 10, 180, "red");
    webpage.addText("Footer text", "Helvetica", 10, "italic", 10, 220, "gray");
    
    // Add more elements with repeated fonts
    for (int i = 0; i < 5; i++) {
        webpage.addText("List item " + std::to_string(i + 1), "Arial", 12, "normal", 30, 250 + i * 20, "black");
    }
    
    webpage.render();
    
    std::cout << "\n=== Font Flyweight Statistics ===" << std::endl;
    std::cout << "Total text elements: " << webpage.getTextCount() << std::endl;
    std::cout << "Font flyweights created: " << FontFactory::getFontCount() << std::endl;
    std::cout << "Each font flyweight represents a loaded font file that can be reused!" << std::endl;
}

int main() {
    demoTextFormatting();
    demoForestSimulation();
    demoWebPage();
    return 0;
}
