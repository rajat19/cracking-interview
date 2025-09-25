from typing import Optional, List

class TextEditorMemento:
    """Memento class that stores the internal state of TextEditor"""
    
    def __init__(self, content: str, cursor_position: int, selection_text: str):
        self._content = content
        self._cursor_position = cursor_position
        self._selection_text = selection_text
    
    @property
    def content(self) -> str:
        return self._content
    
    @property
    def cursor_position(self) -> int:
        return self._cursor_position
    
    @property
    def selection_text(self) -> str:
        return self._selection_text


class TextEditor:
    """Originator class that creates and restores mementos"""
    
    def __init__(self):
        self._content = ""
        self._cursor_position = 0
        self._selection_text = ""
    
    def write(self, text: str) -> None:
        """Write text at current cursor position"""
        self._content = (self._content[:self._cursor_position] + 
                        text + 
                        self._content[self._cursor_position:])
        self._cursor_position += len(text)
        self._selection_text = ""
    
    def delete(self, characters: int) -> None:
        """Delete specified number of characters before cursor"""
        start_pos = max(0, self._cursor_position - characters)
        self._content = (self._content[:start_pos] + 
                        self._content[self._cursor_position:])
        self._cursor_position = start_pos
        self._selection_text = ""
    
    def set_cursor_position(self, position: int) -> None:
        """Set cursor position"""
        self._cursor_position = max(0, min(position, len(self._content)))
    
    def select_text(self, start_pos: int, end_pos: int) -> None:
        """Select text between start and end positions"""
        if (0 <= start_pos <= end_pos <= len(self._content)):
            self._selection_text = self._content[start_pos:end_pos]
    
    def create_memento(self) -> TextEditorMemento:
        """Create memento with current state"""
        return TextEditorMemento(self._content, self._cursor_position, self._selection_text)
    
    def restore_from_memento(self, memento: TextEditorMemento) -> None:
        """Restore state from memento"""
        self._content = memento.content
        self._cursor_position = memento.cursor_position
        self._selection_text = memento.selection_text
    
    @property
    def content(self) -> str:
        return self._content
    
    @property
    def cursor_position(self) -> int:
        return self._cursor_position
    
    @property
    def selection_text(self) -> str:
        return self._selection_text
    
    def __str__(self) -> str:
        return f"Content: '{self._content}', Cursor: {self._cursor_position}, Selection: '{self._selection_text}'"


class EditorHistory:
    """Caretaker class that manages mementos and implements undo/redo"""
    
    def __init__(self):
        self._undo_stack: List[TextEditorMemento] = []
        self._redo_stack: List[TextEditorMemento] = []
    
    def save_state(self, editor: TextEditor) -> None:
        """Save current editor state"""
        self._undo_stack.append(editor.create_memento())
        self._redo_stack.clear()  # Clear redo stack when new action is performed
    
    def undo(self, editor: TextEditor) -> None:
        """Undo last operation"""
        if self._undo_stack:
            self._redo_stack.append(editor.create_memento())
            memento = self._undo_stack.pop()
            editor.restore_from_memento(memento)
    
    def redo(self, editor: TextEditor) -> None:
        """Redo last undone operation"""
        if self._redo_stack:
            self._undo_stack.append(editor.create_memento())
            memento = self._redo_stack.pop()
            editor.restore_from_memento(memento)
    
    def can_undo(self) -> bool:
        """Check if undo is possible"""
        return bool(self._undo_stack)
    
    def can_redo(self) -> bool:
        """Check if redo is possible"""
        return bool(self._redo_stack)


class GameState:
    """Alternative example: Game state management"""
    
    def __init__(self):
        self.level = 1
        self.score = 0
        self.health = 100
        self.inventory = []
    
    def play_level(self, points: int, health_lost: int, items: List[str]) -> None:
        """Simulate playing a level"""
        self.level += 1
        self.score += points
        self.health -= health_lost
        self.inventory.extend(items)
    
    def create_save_point(self):
        """Create a save point (memento)"""
        return {
            'level': self.level,
            'score': self.score,
            'health': self.health,
            'inventory': self.inventory.copy()
        }
    
    def load_from_save_point(self, save_point: dict) -> None:
        """Load game state from save point"""
        self.level = save_point['level']
        self.score = save_point['score']
        self.health = save_point['health']
        self.inventory = save_point['inventory'].copy()
    
    def __str__(self) -> str:
        return f"Level: {self.level}, Score: {self.score}, Health: {self.health}, Inventory: {self.inventory}"


def demo_text_editor():
    """Demonstrate text editor with undo/redo functionality"""
    editor = TextEditor()
    history = EditorHistory()
    
    print("=== Text Editor with Undo/Redo Demo ===\n")
    
    # Initial state
    print(f"Initial: {editor}")
    
    # First operation: write text
    history.save_state(editor)
    editor.write("Hello ")
    print(f"After writing 'Hello ': {editor}")
    
    # Second operation: write more text
    history.save_state(editor)
    editor.write("World!")
    print(f"After writing 'World!': {editor}")
    
    # Third operation: move cursor and insert text
    history.save_state(editor)
    editor.set_cursor_position(6)
    editor.write("Beautiful ")
    print(f"After inserting 'Beautiful ': {editor}")
    
    # Fourth operation: select text
    history.save_state(editor)
    editor.select_text(6, 15)
    print(f"After selecting text: {editor}")
    
    print("\n=== Undo Operations ===")
    
    # Undo operations
    history.undo(editor)
    print(f"After undo 1: {editor}")
    
    history.undo(editor)
    print(f"After undo 2: {editor}")
    
    history.undo(editor)
    print(f"After undo 3: {editor}")
    
    print("\n=== Redo Operations ===")
    
    # Redo operations
    history.redo(editor)
    print(f"After redo 1: {editor}")
    
    history.redo(editor)
    print(f"After redo 2: {editor}")
    
    # Demonstrate that new operations clear redo stack
    print("\n=== New Operation Clears Redo Stack ===")
    editor.write(" How are you?")
    print(f"After new write operation: {editor}")
    print(f"Can redo: {history.can_redo()}")


def demo_game_save_system():
    """Demonstrate game save system"""
    print("\n\n=== Game Save System Demo ===\n")
    
    game = GameState()
    save_points = []
    
    print(f"Initial game state: {game}")
    
    # Play level 1
    save_points.append(game.create_save_point())
    game.play_level(100, 10, ["sword", "potion"])
    print(f"After level 2: {game}")
    
    # Play level 2
    save_points.append(game.create_save_point())
    game.play_level(150, 20, ["shield", "key"])
    print(f"After level 3: {game}")
    
    # Play level 3 (difficult level)
    save_points.append(game.create_save_point())
    game.play_level(50, 80, ["gem"])
    print(f"After level 4 (tough level): {game}")
    
    # Player died, load from previous save
    print(f"\nPlayer health too low! Loading from save point...")
    game.load_from_save_point(save_points[-1])  # Load from last save
    print(f"After loading save: {game}")
    
    # Try different strategy
    game.play_level(200, 30, ["magic_scroll", "armor"])
    print(f"After level 4 (better strategy): {game}")


if __name__ == "__main__":
    demo_text_editor()
    demo_game_save_system()
