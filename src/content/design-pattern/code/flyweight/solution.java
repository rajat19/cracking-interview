import java.util.*;

// Flyweight interface
interface CharacterFlyweight {
    void display(int x, int y, String color, int fontSize);
}

// Concrete Flyweight - stores intrinsic state (character and font family)
class CharacterType implements CharacterFlyweight {
    private final char character;
    private final String fontFamily;
    
    public CharacterType(char character, String fontFamily) {
        this.character = character;
        this.fontFamily = fontFamily;
    }
    
    @Override
    public void display(int x, int y, String color, int fontSize) {
        // Simulate rendering character with extrinsic properties
        System.out.printf("Rendering '%c' [%s] at (%d,%d) in %s color, size %d%n", 
                character, fontFamily, x, y, color, fontSize);
    }
    
    public char getCharacter() { return character; }
    public String getFontFamily() { return fontFamily; }
}

// Flyweight Factory - manages flyweight instances
class CharacterTypeFactory {
    private static final Map<String, CharacterFlyweight> flyweights = new HashMap<>();
    
    public static CharacterFlyweight getCharacterType(char character, String fontFamily) {
        String key = character + "_" + fontFamily;
        
        if (!flyweights.containsKey(key)) {
            flyweights.put(key, new CharacterType(character, fontFamily));
            System.out.println("Creating new flyweight for: " + character + " (" + fontFamily + ")");
        }
        
        return flyweights.get(key);
    }
    
    public static int getCreatedFlyweightsCount() {
        return flyweights.size();
    }
    
    public static void printFlyweightStatistics() {
        System.out.println("\n=== Flyweight Statistics ===");
        System.out.println("Total flyweight instances created: " + flyweights.size());
        System.out.println("Memory saved by sharing intrinsic state!");
    }
}

// Context - stores extrinsic state and references to flyweights
class Character {
    private final CharacterFlyweight flyweight;
    private final int x, y;
    private final String color;
    private final int fontSize;
    
    public Character(char character, String fontFamily, int x, int y, String color, int fontSize) {
        this.flyweight = CharacterTypeFactory.getCharacterType(character, fontFamily);
        this.x = x;
        this.y = y;
        this.color = color;
        this.fontSize = fontSize;
    }
    
    public void display() {
        flyweight.display(x, y, color, fontSize);
    }
}

// Document class that manages multiple characters
class Document {
    private final List<Character> characters = new ArrayList<>();
    
    public void addCharacter(char character, String fontFamily, int x, int y, String color, int fontSize) {
        characters.add(new Character(character, fontFamily, x, y, color, fontSize));
    }
    
    public void render() {
        System.out.println("\n=== Rendering Document ===");
        for (Character character : characters) {
            character.display();
        }
    }
    
    public int getCharacterCount() {
        return characters.size();
    }
}

// Alternative example: Forest simulation with Tree flyweights
interface TreeFlyweight {
    void render(int x, int y, String climate);
}

class TreeType implements TreeFlyweight {
    private final String name;
    private final String color;
    private final String texture;
    
    public TreeType(String name, String color, String texture) {
        this.name = name;
        this.color = color;
        this.texture = texture;
        // Simulate loading heavy resources (textures, 3D models, etc.)
        System.out.println("Loading heavy resources for tree type: " + name);
    }
    
    @Override
    public void render(int x, int y, String climate) {
        System.out.printf("Rendering %s tree at (%d,%d) in %s climate [%s color, %s texture]%n",
                name, x, y, climate, color, texture);
    }
}

class TreeTypeFactory {
    private static final Map<String, TreeFlyweight> treeTypes = new HashMap<>();
    
    public static TreeFlyweight getTreeType(String name, String color, String texture) {
        String key = name + "_" + color + "_" + texture;
        
        if (!treeTypes.containsKey(key)) {
            treeTypes.put(key, new TreeType(name, color, texture));
        }
        
        return treeTypes.get(key);
    }
    
    public static int getTreeTypesCount() {
        return treeTypes.size();
    }
}

class Tree {
    private final TreeFlyweight treeType;
    private final int x, y;
    private final String climate;
    
    public Tree(String name, String color, String texture, int x, int y, String climate) {
        this.treeType = TreeTypeFactory.getTreeType(name, color, texture);
        this.x = x;
        this.y = y;
        this.climate = climate;
    }
    
    public void render() {
        treeType.render(x, y, climate);
    }
}

class Forest {
    private final List<Tree> trees = new ArrayList<>();
    
    public void plantTree(String name, String color, String texture, int x, int y, String climate) {
        trees.add(new Tree(name, color, texture, x, y, climate));
    }
    
    public void render() {
        System.out.println("\n=== Rendering Forest ===");
        for (Tree tree : trees) {
            tree.render();
        }
    }
    
    public int getTreeCount() {
        return trees.size();
    }
}

// Client code demonstrating the Flyweight pattern
public class FlyweightPatternDemo {
    public static void main(String[] args) {
        demoTextFormatting();
        demoForestSimulation();
    }
    
    private static void demoTextFormatting() {
        System.out.println("=== Text Formatting System Demo ===\n");
        
        Document document = new Document();
        
        // Create a document with repeated characters
        String text = "Hello World! This is a flyweight pattern demo.";
        String[] fonts = {"Arial", "Times New Roman", "Helvetica"};
        String[] colors = {"black", "red", "blue"};
        int[] fontSizes = {12, 14, 16};
        
        int x = 0, y = 0;
        for (char c : text.toCharArray()) {
            if (c != ' ') {
                String font = fonts[x % fonts.length];
                String color = colors[x % colors.length];
                int fontSize = fontSizes[x % fontSizes.length];
                
                document.addCharacter(c, font, x * 10, y * 20, color, fontSize);
            }
            x++;
            if (x > 40) {
                x = 0;
                y++;
            }
        }
        
        document.render();
        
        System.out.println("\n=== Memory Efficiency Analysis ===");
        System.out.println("Total characters in document: " + document.getCharacterCount());
        CharacterTypeFactory.printFlyweightStatistics();
        
        System.out.println("\nWithout Flyweight pattern:");
        System.out.println("Memory usage would be: " + document.getCharacterCount() + " character objects");
        System.out.println("With Flyweight pattern:");
        System.out.println("Memory usage is: " + CharacterTypeFactory.getCreatedFlyweightsCount() + " flyweight objects + " + 
                          document.getCharacterCount() + " context objects");
        
        double memorySaved = (double)(document.getCharacterCount() - CharacterTypeFactory.getCreatedFlyweightsCount()) / 
                           document.getCharacterCount() * 100;
        System.out.printf("Memory efficiency: %.1f%% reduction in intrinsic state objects%n", memorySaved);
    }
    
    private static void demoForestSimulation() {
        System.out.println("\n\n=== Forest Simulation Demo ===\n");
        
        Forest forest = new Forest();
        Random random = new Random(42); // Fixed seed for reproducible results
        
        // Plant many trees with repeated types
        String[] treeNames = {"Oak", "Pine", "Birch", "Maple"};
        String[] colors = {"Green", "Dark Green", "Light Green"};
        String[] textures = {"Rough", "Smooth", "Textured"};
        String[] climates = {"Temperate", "Cold", "Mild"};
        
        System.out.println("Planting 20 trees...\n");
        
        for (int i = 0; i < 20; i++) {
            String name = treeNames[random.nextInt(treeNames.length)];
            String color = colors[random.nextInt(colors.length)];
            String texture = textures[random.nextInt(textures.length)];
            String climate = climates[random.nextInt(climates.length)];
            
            int x = random.nextInt(100);
            int y = random.nextInt(100);
            
            forest.plantTree(name, color, texture, x, y, climate);
        }
        
        forest.render();
        
        System.out.println("\n=== Forest Memory Analysis ===");
        System.out.println("Total trees in forest: " + forest.getTreeCount());
        System.out.println("Tree type flyweights created: " + TreeTypeFactory.getTreeTypesCount());
        
        double treeMemorySaved = (double)(forest.getTreeCount() - TreeTypeFactory.getTreeTypesCount()) / 
                                forest.getTreeCount() * 100;
        System.out.printf("Memory efficiency: %.1f%% reduction in tree type objects%n", treeMemorySaved);
        System.out.println("\nEach tree type flyweight contains heavy resources (textures, 3D models)");
        System.out.println("Sharing these flyweights saves significant memory!");
    }
}
