"""
Prototype Pattern - Game Character Creation System
Creates new objects by cloning existing prototypes with deep and shallow copy demonstrations
"""

import copy
from abc import ABC, abstractmethod
from typing import Dict, List, Any
import time

class CharacterPrototype(ABC):
    """Abstract prototype interface for game characters"""
    
    @abstractmethod
    def clone(self):
        """Create a copy of this character"""
        pass
    
    @abstractmethod
    def display(self):
        """Display character information"""
        pass
    
    @abstractmethod
    def get_type(self):
        """Get character type"""
        pass

class Equipment:
    """Complex object representing character equipment"""
    
    def __init__(self):
        self.weapons = []
        self.armor = {}
        self.accessories = []
        self.inventory = {}
    
    def add_weapon(self, weapon):
        self.weapons.append(weapon)
    
    def set_armor(self, slot, armor):
        self.armor[slot] = armor
    
    def add_accessory(self, accessory):
        self.accessories.append(accessory)
    
    def add_to_inventory(self, item, quantity):
        if item in self.inventory:
            self.inventory[item] += quantity
        else:
            self.inventory[item] = quantity
    
    def __str__(self):
        return (f"Weapons: {len(self.weapons)}, Armor: {len(self.armor)}, "
                f"Accessories: {len(self.accessories)}, Inventory: {len(self.inventory)} items")

class Stats:
    """Character statistics that need deep copying"""
    
    def __init__(self, strength=10, agility=10, intelligence=10, vitality=10):
        self.base_stats = {
            'strength': strength,
            'agility': agility,
            'intelligence': intelligence,
            'vitality': vitality
        }
        self.modifiers = {}
        self.experience_history = []
    
    def add_modifier(self, stat, modifier):
        if stat in self.modifiers:
            self.modifiers[stat] += modifier
        else:
            self.modifiers[stat] = modifier
    
    def add_experience(self, amount, source):
        self.experience_history.append({'amount': amount, 'source': source, 'timestamp': time.time()})
    
    def get_effective_stat(self, stat):
        base = self.base_stats.get(stat, 0)
        modifier = self.modifiers.get(stat, 0)
        return base + modifier
    
    def __str__(self):
        stats_str = ', '.join([f"{k}: {self.get_effective_stat(k)}" for k in self.base_stats])
        return f"{stats_str} (XP History: {len(self.experience_history)} entries)"

class WarriorCharacter(CharacterPrototype):
    """Concrete warrior character prototype"""
    
    def __init__(self, name="Unnamed Warrior"):
        self.name = name
        self.character_class = "Warrior"
        self.level = 1
        self.stats = Stats(strength=18, agility=12, intelligence=8, vitality=16)
        self.equipment = Equipment()
        self.skills = []
        self.achievements = []
        
        # Initialize default equipment
        self.equipment.add_weapon("Iron Sword")
        self.equipment.set_armor("chest", "Chainmail")
        self.equipment.set_armor("legs", "Iron Greaves")
        self.equipment.add_to_inventory("Health Potion", 5)
        
        # Default skills
        self.skills = ["Sword Mastery", "Shield Block", "Rage"]
        
        # Add some experience
        self.stats.add_experience(100, "Character Creation")
    
    def clone(self):
        """Create a deep copy of this warrior"""
        print(f"🔄 Cloning Warrior: {self.name}")
        
        # Create new warrior with same name
        cloned = WarriorCharacter(f"{self.name} (Clone)")
        
        # Deep copy all complex objects
        cloned.level = self.level
        cloned.stats = copy.deepcopy(self.stats)
        cloned.equipment = copy.deepcopy(self.equipment)
        cloned.skills = copy.deepcopy(self.skills)
        cloned.achievements = copy.deepcopy(self.achievements)
        
        return cloned
    
    def display(self):
        print("⚔️ WARRIOR CHARACTER")
        print(f"├─ Name: {self.name}")
        print(f"├─ Class: {self.character_class}")
        print(f"├─ Level: {self.level}")
        print(f"├─ Stats: {self.stats}")
        print(f"├─ Equipment: {self.equipment}")
        print(f"├─ Skills: {', '.join(self.skills)}")
        print(f"└─ Achievements: {len(self.achievements)} unlocked")
    
    def get_type(self):
        return "Warrior"
    
    def level_up(self):
        self.level += 1
        self.stats.base_stats['strength'] += 2
        self.stats.base_stats['vitality'] += 2
        self.stats.add_experience(self.level * 100, f"Level {self.level}")
        
        if self.level == 5:
            self.skills.append("Berserker Rage")
        elif self.level == 10:
            self.skills.append("Guardian Shield")

class MageCharacter(CharacterPrototype):
    """Concrete mage character prototype"""
    
    def __init__(self, name="Unnamed Mage"):
        self.name = name
        self.character_class = "Mage"
        self.level = 1
        self.stats = Stats(strength=6, agility=10, intelligence=18, vitality=12)
        self.equipment = Equipment()
        self.skills = []
        self.spells = []
        self.mana_pool = 100
        self.achievements = []
        
        # Initialize default equipment
        self.equipment.add_weapon("Oak Staff")
        self.equipment.set_armor("chest", "Apprentice Robes")
        self.equipment.add_accessory("Mana Crystal")
        self.equipment.add_to_inventory("Mana Potion", 10)
        
        # Default skills and spells
        self.skills = ["Spell Casting", "Mana Control", "Arcane Knowledge"]
        self.spells = ["Fireball", "Magic Missile", "Shield"]
        
        # Add some experience
        self.stats.add_experience(150, "Character Creation")
    
    def clone(self):
        """Create a deep copy of this mage"""
        print(f"🔄 Cloning Mage: {self.name}")
        
        # Create new mage with same name
        cloned = MageCharacter(f"{self.name} (Clone)")
        
        # Deep copy all complex objects
        cloned.level = self.level
        cloned.stats = copy.deepcopy(self.stats)
        cloned.equipment = copy.deepcopy(self.equipment)
        cloned.skills = copy.deepcopy(self.skills)
        cloned.spells = copy.deepcopy(self.spells)
        cloned.mana_pool = self.mana_pool
        cloned.achievements = copy.deepcopy(self.achievements)
        
        return cloned
    
    def display(self):
        print("🧙 MAGE CHARACTER")
        print(f"├─ Name: {self.name}")
        print(f"├─ Class: {self.character_class}")
        print(f"├─ Level: {self.level}")
        print(f"├─ Stats: {self.stats}")
        print(f"├─ Equipment: {self.equipment}")
        print(f"├─ Skills: {', '.join(self.skills)}")
        print(f"├─ Spells: {', '.join(self.spells)}")
        print(f"├─ Mana: {self.mana_pool}")
        print(f"└─ Achievements: {len(self.achievements)} unlocked")
    
    def get_type(self):
        return "Mage"
    
    def level_up(self):
        self.level += 1
        self.stats.base_stats['intelligence'] += 2
        self.stats.base_stats['vitality'] += 1
        self.mana_pool += 20
        self.stats.add_experience(self.level * 100, f"Level {self.level}")
        
        if self.level == 3:
            self.spells.append("Lightning Bolt")
        elif self.level == 5:
            self.spells.append("Teleport")
        elif self.level == 10:
            self.spells.append("Meteor")

class RogueCharacter(CharacterPrototype):
    """Concrete rogue character prototype"""
    
    def __init__(self, name="Unnamed Rogue"):
        self.name = name
        self.character_class = "Rogue"
        self.level = 1
        self.stats = Stats(strength=12, agility=18, intelligence=14, vitality=10)
        self.equipment = Equipment()
        self.skills = []
        self.stealth_level = 50
        self.achievements = []
        
        # Initialize default equipment
        self.equipment.add_weapon("Steel Dagger")
        self.equipment.add_weapon("Throwing Knives")
        self.equipment.set_armor("chest", "Leather Armor")
        self.equipment.add_accessory("Lockpicks")
        self.equipment.add_to_inventory("Smoke Bomb", 3)
        
        # Default skills
        self.skills = ["Stealth", "Lockpicking", "Backstab", "Trap Detection"]
        
        # Add some experience
        self.stats.add_experience(120, "Character Creation")
    
    def clone(self):
        """Create a deep copy of this rogue"""
        print(f"🔄 Cloning Rogue: {self.name}")
        
        # Create new rogue with same name
        cloned = RogueCharacter(f"{self.name} (Clone)")
        
        # Deep copy all complex objects
        cloned.level = self.level
        cloned.stats = copy.deepcopy(self.stats)
        cloned.equipment = copy.deepcopy(self.equipment)
        cloned.skills = copy.deepcopy(self.skills)
        cloned.stealth_level = self.stealth_level
        cloned.achievements = copy.deepcopy(self.achievements)
        
        return cloned
    
    def display(self):
        print("🗡️ ROGUE CHARACTER")
        print(f"├─ Name: {self.name}")
        print(f"├─ Class: {self.character_class}")
        print(f"├─ Level: {self.level}")
        print(f"├─ Stats: {self.stats}")
        print(f"├─ Equipment: {self.equipment}")
        print(f"├─ Skills: {', '.join(self.skills)}")
        print(f"├─ Stealth: {self.stealth_level}%")
        print(f"└─ Achievements: {len(self.achievements)} unlocked")
    
    def get_type(self):
        return "Rogue"
    
    def level_up(self):
        self.level += 1
        self.stats.base_stats['agility'] += 2
        self.stats.base_stats['intelligence'] += 1
        self.stealth_level += 5
        self.stats.add_experience(self.level * 100, f"Level {self.level}")
        
        if self.level == 4:
            self.skills.append("Dual Wield")
        elif self.level == 8:
            self.skills.append("Shadow Clone")

class CharacterFactory:
    """Factory for creating characters using prototypes"""
    
    def __init__(self):
        self.prototypes = {}
        self._initialize_prototypes()
    
    def _initialize_prototypes(self):
        """Initialize default character prototypes"""
        print("🏭 Initializing character prototypes...")
        
        # Create template characters
        warrior_template = WarriorCharacter("Template Warrior")
        warrior_template.level = 5
        warrior_template.level_up()  # Add level 5 skill
        warrior_template.equipment.add_to_inventory("Gold", 500)
        warrior_template.achievements.append("Template Character")
        
        mage_template = MageCharacter("Template Mage")
        mage_template.level = 3
        mage_template.level_up()  # Add level 3 spell
        mage_template.equipment.add_to_inventory("Gold", 300)
        mage_template.achievements.append("Template Character")
        
        rogue_template = RogueCharacter("Template Rogue")
        rogue_template.level = 4
        rogue_template.level_up()  # Add level 4 skill
        rogue_template.equipment.add_to_inventory("Gold", 400)
        rogue_template.achievements.append("Template Character")
        
        # Register prototypes
        self.prototypes['warrior'] = warrior_template
        self.prototypes['mage'] = mage_template
        self.prototypes['rogue'] = rogue_template
        
        print(f"✅ Prototypes initialized: {list(self.prototypes.keys())}")
    
    def create_character(self, character_type, name=None):
        """Create a new character by cloning a prototype"""
        prototype = self.prototypes.get(character_type.lower())
        if not prototype:
            raise ValueError(f"Unknown character type: {character_type}")
        
        cloned_character = prototype.clone()
        if name:
            cloned_character.name = name
        
        return cloned_character
    
    def register_prototype(self, name, prototype):
        """Register a new character prototype"""
        self.prototypes[name] = prototype
        print(f"📝 Registered new prototype: {name}")
    
    def get_available_types(self):
        """Get list of available character types"""
        return list(self.prototypes.keys())

def demonstrate_shallow_vs_deep_copy():
    """Demonstrate the difference between shallow and deep copying"""
    print("\n--- Shallow vs Deep Copy Demonstration ---")
    
    original = WarriorCharacter("Original Warrior")
    original.equipment.add_to_inventory("Magic Sword", 1)
    original.stats.add_modifier("strength", 5)
    
    # Shallow copy (problematic)
    shallow_copy = copy.copy(original)
    shallow_copy.name = "Shallow Copy Warrior"
    
    # Deep copy (correct)
    deep_copy = copy.deepcopy(original)
    deep_copy.name = "Deep Copy Warrior"
    
    print("Original before modification:")
    print(f"  Equipment inventory: {original.equipment.inventory}")
    print(f"  Stats modifiers: {original.stats.modifiers}")
    
    # Modify shallow copy's complex objects
    shallow_copy.equipment.add_to_inventory("Cursed Item", 1)
    shallow_copy.stats.add_modifier("strength", -10)
    
    # Modify deep copy's complex objects
    deep_copy.equipment.add_to_inventory("Blessed Item", 1)
    deep_copy.stats.add_modifier("strength", 10)
    
    print("\nAfter modifications:")
    print("Original:")
    print(f"  Equipment inventory: {original.equipment.inventory}")
    print(f"  Stats modifiers: {original.stats.modifiers}")
    
    print("Shallow Copy:")
    print(f"  Equipment inventory: {shallow_copy.equipment.inventory}")
    print(f"  Stats modifiers: {shallow_copy.stats.modifiers}")
    
    print("Deep Copy:")
    print(f"  Equipment inventory: {deep_copy.equipment.inventory}")
    print(f"  Stats modifiers: {deep_copy.stats.modifiers}")
    
    print("\n⚠️  Notice: Shallow copy modifications affected the original!")
    print("✅ Deep copy modifications are independent of the original.")

def main():
    print("=== Prototype Pattern Demo - Game Character System ===\n")
    
    factory = CharacterFactory()
    
    print("\n--- Creating Characters from Prototypes ---")
    
    # Create characters using prototypes
    warrior = factory.create_character("warrior", "Conan the Barbarian")
    mage = factory.create_character("mage", "Gandalf the Grey")
    rogue = factory.create_character("rogue", "Robin Hood")
    
    print("\nDisplaying created characters:")
    warrior.display()
    print()
    mage.display()
    print()
    rogue.display()
    
    print("\n--- Testing Independent Modification ---")
    
    # Create another warrior and modify it independently
    warrior2 = factory.create_character("warrior", "Aragorn")
    warrior2.level_up()
    warrior2.level_up()
    warrior2.equipment.add_weapon("Legendary Sword")
    warrior2.equipment.add_to_inventory("Dragon Scale", 1)
    warrior2.achievements.append("Dragon Slayer")
    
    print("Original warrior after creating and modifying warrior2:")
    warrior.display()
    print("\nModified warrior2:")
    warrior2.display()
    
    print("\n✅ Independent modification verified!")
    
    # Demonstrate shallow vs deep copy
    demonstrate_shallow_vs_deep_copy()
    
    print("\n--- Custom Prototype Registration ---")
    
    # Create a custom paladin character
    paladin = WarriorCharacter("Template Paladin")
    paladin.character_class = "Paladin"
    paladin.stats.base_stats['intelligence'] = 14  # Higher than warrior
    paladin.equipment.add_weapon("Holy Sword")
    paladin.equipment.set_armor("chest", "Plate Mail")
    paladin.skills.append("Divine Magic")
    paladin.skills.append("Heal")
    paladin.achievements.append("Holy Warrior")
    
    factory.register_prototype("paladin", paladin)
    
    # Create a paladin using the new prototype
    custom_paladin = factory.create_character("paladin", "Sir Galahad")
    print("Character created from custom prototype:")
    custom_paladin.display()
    
    print("\n--- Performance Comparison ---")
    
    print(f"Available character types: {factory.get_available_types()}")
    
    # Measure cloning performance
    start_time = time.time()
    characters = []
    
    for i in range(1000):
        char_type = ['warrior', 'mage', 'rogue'][i % 3]
        character = factory.create_character(char_type, f"Player{i}")
        characters.append(character)
    
    end_time = time.time()
    
    print(f"📊 Created {len(characters)} characters in {end_time - start_time:.4f}s using prototypes")
    print(f"⚡ Average time per character: {(end_time - start_time) / len(characters):.6f}s")
    
    print("\n✅ Prototype pattern successfully demonstrated!")
    print("Benefits: Fast object creation, template-based instantiation, independent copies")

if __name__ == "__main__":
    main()
