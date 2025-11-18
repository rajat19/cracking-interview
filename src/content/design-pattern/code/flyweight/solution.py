from typing import Dict, List
import random

class CharacterFlyweight:
    """Flyweight interface for character rendering"""
    
    def display(self, x: int, y: int, color: str, font_size: int) -> None:
        pass


class CharacterType(CharacterFlyweight):
    """Concrete Flyweight - stores intrinsic state (character and font family)"""
    
    def __init__(self, character: str, font_family: str):
        self._character = character
        self._font_family = font_family
    
    def display(self, x: int, y: int, color: str, font_size: int) -> None:
        """Render character with extrinsic properties"""
        print(f"Rendering '{self._character}' [{self._font_family}] at ({x},{y}) in {color} color, size {font_size}")
    
    @property
    def character(self) -> str:
        return self._character
    
    @property
    def font_family(self) -> str:
        return self._font_family


class CharacterTypeFactory:
    """Flyweight Factory - manages flyweight instances"""
    
    _flyweights: Dict[str, CharacterFlyweight] = {}
    
    @classmethod
    def get_character_type(cls, character: str, font_family: str) -> CharacterFlyweight:
        key = f"{character}_{font_family}"
        
        if key not in cls._flyweights:
            cls._flyweights[key] = CharacterType(character, font_family)
            print(f"Creating new flyweight for: {character} ({font_family})")
        
        return cls._flyweights[key]
    
    @classmethod
    def get_created_flyweights_count(cls) -> int:
        return len(cls._flyweights)
    
    @classmethod
    def print_flyweight_statistics(cls) -> None:
        print("\n=== Flyweight Statistics ===")
        print(f"Total flyweight instances created: {len(cls._flyweights)}")
        print("Memory saved by sharing intrinsic state!")


class Character:
    """Context - stores extrinsic state and references to flyweights"""
    
    def __init__(self, character: str, font_family: str, x: int, y: int, color: str, font_size: int):
        self._flyweight = CharacterTypeFactory.get_character_type(character, font_family)
        self._x = x
        self._y = y
        self._color = color
        self._font_size = font_size
    
    def display(self) -> None:
        self._flyweight.display(self._x, self._y, self._color, self._font_size)


class Document:
    """Document class that manages multiple characters"""
    
    def __init__(self):
        self._characters: List[Character] = []
    
    def add_character(self, character: str, font_family: str, x: int, y: int, color: str, font_size: int) -> None:
        self._characters.append(Character(character, font_family, x, y, color, font_size))
    
    def render(self) -> None:
        print("\n=== Rendering Document ===")
        for character in self._characters:
            character.display()
    
    def get_character_count(self) -> int:
        return len(self._characters)


# Alternative example: Forest simulation with Tree flyweights
class TreeFlyweight:
    """Flyweight interface for tree rendering"""
    
    def render(self, x: int, y: int, climate: str) -> None:
        pass


class TreeType(TreeFlyweight):
    """Concrete flyweight for tree types"""
    
    def __init__(self, name: str, color: str, texture: str):
        self._name = name
        self._color = color
        self._texture = texture
        # Simulate loading heavy resources (textures, 3D models, etc.)
        print(f"Loading heavy resources for tree type: {name}")
    
    def render(self, x: int, y: int, climate: str) -> None:
        print(f"Rendering {self._name} tree at ({x},{y}) in {climate} climate [{self._color} color, {self._texture} texture]")


class TreeTypeFactory:
    """Factory for managing tree type flyweights"""
    
    _tree_types: Dict[str, TreeFlyweight] = {}
    
    @classmethod
    def get_tree_type(cls, name: str, color: str, texture: str) -> TreeFlyweight:
        key = f"{name}_{color}_{texture}"
        
        if key not in cls._tree_types:
            cls._tree_types[key] = TreeType(name, color, texture)
        
        return cls._tree_types[key]
    
    @classmethod
    def get_tree_types_count(cls) -> int:
        return len(cls._tree_types)


class Tree:
    """Context class for individual trees"""
    
    def __init__(self, name: str, color: str, texture: str, x: int, y: int, climate: str):
        self._tree_type = TreeTypeFactory.get_tree_type(name, color, texture)
        self._x = x
        self._y = y
        self._climate = climate
    
    def render(self) -> None:
        self._tree_type.render(self._x, self._y, self._climate)


class Forest:
    """Forest that manages multiple trees"""
    
    def __init__(self):
        self._trees: List[Tree] = []
    
    def plant_tree(self, name: str, color: str, texture: str, x: int, y: int, climate: str) -> None:
        self._trees.append(Tree(name, color, texture, x, y, climate))
    
    def render(self) -> None:
        print("\n=== Rendering Forest ===")
        for tree in self._trees:
            tree.render()
    
    def get_tree_count(self) -> int:
        return len(self._trees)


# Web Browser Example: Sharing Font Objects
class FontFlyweight:
    """Flyweight for font resources"""
    
    def __init__(self, family: str, size: int, style: str):
        self.family = family
        self.size = size
        self.style = style
        # Simulate loading font file (expensive operation)
        print(f"Loading font: {family}-{size}-{style}")
    
    def render_text(self, text: str, x: int, y: int, color: str) -> None:
        print(f"Rendering '{text}' with {self.family} {self.size}pt {self.style} at ({x},{y}) in {color}")


class FontFactory:
    """Factory for managing font flyweights"""
    
    _fonts: Dict[str, FontFlyweight] = {}
    
    @classmethod
    def get_font(cls, family: str, size: int, style: str) -> FontFlyweight:
        key = f"{family}-{size}-{style}"
        
        if key not in cls._fonts:
            cls._fonts[key] = FontFlyweight(family, size, style)
        
        return cls._fonts[key]
    
    @classmethod
    def get_font_count(cls) -> int:
        return len(cls._fonts)


class TextElement:
    """Text element that uses font flyweight"""
    
    def __init__(self, text: str, font_family: str, font_size: int, font_style: str, 
                 x: int, y: int, color: str):
        self._text = text
        self._font = FontFactory.get_font(font_family, font_size, font_style)
        self._x = x
        self._y = y
        self._color = color
    
    def render(self) -> None:
        self._font.render_text(self._text, self._x, self._y, self._color)


class WebPage:
    """Web page containing multiple text elements"""
    
    def __init__(self):
        self._text_elements: List[TextElement] = []
    
    def add_text(self, text: str, font_family: str, font_size: int, font_style: str,
                 x: int, y: int, color: str) -> None:
        self._text_elements.append(TextElement(text, font_family, font_size, font_style, x, y, color))
    
    def render(self) -> None:
        print("\n=== Rendering Web Page ===")
        for element in self._text_elements:
            element.render()
    
    def get_text_count(self) -> int:
        return len(self._text_elements)


def demo_text_formatting():
    """Demonstrate text formatting system with flyweight pattern"""
    print("=== Text Formatting System Demo ===\n")
    
    document = Document()
    
    # Create a document with repeated characters
    text = "Hello World! This is a flyweight pattern demo."
    fonts = ["Arial", "Times New Roman", "Helvetica"]
    colors = ["black", "red", "blue"]
    font_sizes = [12, 14, 16]
    
    x, y = 0, 0
    for char in text:
        if char != ' ':
            font = fonts[x % len(fonts)]
            color = colors[x % len(colors)]
            font_size = font_sizes[x % len(font_sizes)]
            
            document.add_character(char, font, x * 10, y * 20, color, font_size)
        
        x += 1
        if x > 40:
            x = 0
            y += 1
    
    document.render()
    
    print("\n=== Memory Efficiency Analysis ===")
    print(f"Total characters in document: {document.get_character_count()}")
    CharacterTypeFactory.print_flyweight_statistics()
    
    print("\nWithout Flyweight pattern:")
    print(f"Memory usage would be: {document.get_character_count()} character objects")
    print("With Flyweight pattern:")
    print(f"Memory usage is: {CharacterTypeFactory.get_created_flyweights_count()} flyweight objects + {document.get_character_count()} context objects")
    
    memory_saved = (document.get_character_count() - CharacterTypeFactory.get_created_flyweights_count()) / document.get_character_count() * 100
    print(f"Memory efficiency: {memory_saved:.1f}% reduction in intrinsic state objects")


def demo_forest_simulation():
    """Demonstrate forest simulation with tree flyweights"""
    print("\n\n=== Forest Simulation Demo ===\n")
    
    forest = Forest()
    random.seed(42)  # Fixed seed for reproducible results
    
    # Plant many trees with repeated types
    tree_names = ["Oak", "Pine", "Birch", "Maple"]
    colors = ["Green", "Dark Green", "Light Green"]
    textures = ["Rough", "Smooth", "Textured"]
    climates = ["Temperate", "Cold", "Mild"]
    
    print("Planting 20 trees...\n")
    
    for i in range(20):
        name = random.choice(tree_names)
        color = random.choice(colors)
        texture = random.choice(textures)
        climate = random.choice(climates)
        
        x = random.randint(0, 99)
        y = random.randint(0, 99)
        
        forest.plant_tree(name, color, texture, x, y, climate)
    
    forest.render()
    
    print("\n=== Forest Memory Analysis ===")
    print(f"Total trees in forest: {forest.get_tree_count()}")
    print(f"Tree type flyweights created: {TreeTypeFactory.get_tree_types_count()}")
    
    tree_memory_saved = (forest.get_tree_count() - TreeTypeFactory.get_tree_types_count()) / forest.get_tree_count() * 100
    print(f"Memory efficiency: {tree_memory_saved:.1f}% reduction in tree type objects")
    print("\nEach tree type flyweight contains heavy resources (textures, 3D models)")
    print("Sharing these flyweights saves significant memory!")


def demo_web_page():
    """Demonstrate web page with font flyweights"""
    print("\n\n=== Web Page Font Rendering Demo ===\n")
    
    webpage = WebPage()
    
    # Add various text elements
    webpage.add_text("Welcome to Our Website", "Arial", 24, "bold", 10, 10, "black")
    webpage.add_text("This is a subtitle", "Arial", 18, "normal", 10, 50, "gray")
    webpage.add_text("Body text paragraph 1", "Times New Roman", 12, "normal", 10, 100, "black")
    webpage.add_text("Body text paragraph 2", "Times New Roman", 12, "normal", 10, 130, "black")
    webpage.add_text("Important Notice", "Arial", 14, "bold", 10, 180, "red")
    webpage.add_text("Footer text", "Helvetica", 10, "italic", 10, 220, "gray")
    
    # Add more elements with repeated fonts
    for i in range(5):
        webpage.add_text(f"List item {i+1}", "Arial", 12, "normal", 30, 250 + i*20, "black")
    
    webpage.render()
    
    print(f"\n=== Font Flyweight Statistics ===")
    print(f"Total text elements: {webpage.get_text_count()}")
    print(f"Font flyweights created: {FontFactory.get_font_count()}")
    print("Each font flyweight represents a loaded font file that can be reused!")


if __name__ == "__main__":
    demo_text_formatting()
    demo_forest_simulation()
    demo_web_page()
