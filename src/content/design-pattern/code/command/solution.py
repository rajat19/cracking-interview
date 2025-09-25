"""
Command Pattern - Text Editor with Undo/Redo Functionality
Encapsulates requests as objects, allowing for undo/redo operations and command queuing
"""

from abc import ABC, abstractmethod
from typing import List, Deque
from collections import deque

class Command(ABC):
    """Abstract command interface"""
    
    @abstractmethod
    def execute(self) -> None:
        """Execute the command"""
        pass
    
    @abstractmethod
    def undo(self) -> None:
        """Undo the command"""
        pass
    
    @abstractmethod
    def get_description(self) -> str:
        """Get command description"""
        pass

class TextEditor:
    """Receiver class - Text Editor that performs the actual operations"""
    
    def __init__(self):
        self._content = ""
        self._cursor_position = 0
    
    def insert_text(self, text: str) -> None:
        """Insert text at cursor position"""
        self._content = (self._content[:self._cursor_position] + 
                        text + 
                        self._content[self._cursor_position:])
        print(f"Inserted: '{text}' at position {self._cursor_position}")
        self._cursor_position += len(text)
    
    def delete_text(self, length: int) -> None:
        """Delete text before cursor position"""
        if self._cursor_position >= length:
            self._content = (self._content[:self._cursor_position - length] + 
                           self._content[self._cursor_position:])
            self._cursor_position -= length
            print(f"Deleted {length} characters")
    
    def move_cursor(self, new_position: int) -> None:
        """Move cursor to new position"""
        if 0 <= new_position <= len(self._content):
            self._cursor_position = new_position
            print(f"Cursor moved to position {self._cursor_position}")
    
    @property
    def content(self) -> str:
        """Get current content"""
        return self._content
    
    @property
    def cursor_position(self) -> int:
        """Get current cursor position"""
        return self._cursor_position
    
    def display_content(self) -> None:
        """Display current content with cursor position"""
        print(f'Content: "{self._content}" (cursor at {self._cursor_position})')

# Concrete Command Classes
class InsertTextCommand(Command):
    """Command to insert text"""
    
    def __init__(self, editor: TextEditor, text: str):
        self._editor = editor
        self._text = text
        self._previous_position = 0
    
    def execute(self) -> None:
        self._previous_position = self._editor.cursor_position
        self._editor.insert_text(self._text)
    
    def undo(self) -> None:
        self._editor.move_cursor(self._previous_position + len(self._text))
        self._editor.delete_text(len(self._text))
        self._editor.move_cursor(self._previous_position)
    
    def get_description(self) -> str:
        return f"Insert '{self._text}'"

class DeleteTextCommand(Command):
    """Command to delete text"""
    
    def __init__(self, editor: TextEditor, length: int):
        self._editor = editor
        self._length = length
        self._deleted_text = ""
        self._previous_position = 0
    
    def execute(self) -> None:
        self._previous_position = self._editor.cursor_position
        if self._previous_position >= self._length:
            start = self._previous_position - self._length
            self._deleted_text = self._editor.content[start:self._previous_position]
            self._editor.delete_text(self._length)
    
    def undo(self) -> None:
        if self._deleted_text:
            self._editor.move_cursor(self._previous_position - self._length)
            self._editor.insert_text(self._deleted_text)
            self._editor.move_cursor(self._previous_position)
    
    def get_description(self) -> str:
        return f"Delete {self._length} characters"

class MoveCursorCommand(Command):
    """Command to move cursor"""
    
    def __init__(self, editor: TextEditor, new_position: int):
        self._editor = editor
        self._new_position = new_position
        self._previous_position = 0
    
    def execute(self) -> None:
        self._previous_position = self._editor.cursor_position
        self._editor.move_cursor(self._new_position)
    
    def undo(self) -> None:
        self._editor.move_cursor(self._previous_position)
    
    def get_description(self) -> str:
        return f"Move cursor to {self._new_position}"

class MacroCommand(Command):
    """Composite command that combines multiple commands"""
    
    def __init__(self, name: str):
        self._name = name
        self._commands: List[Command] = []
    
    def add_command(self, command: Command) -> None:
        """Add a command to the macro"""
        self._commands.append(command)
    
    def execute(self) -> None:
        print(f"Executing macro: {self._name}")
        for command in self._commands:
            command.execute()
    
    def undo(self) -> None:
        print(f"Undoing macro: {self._name}")
        # Undo commands in reverse order
        for command in reversed(self._commands):
            command.undo()
    
    def get_description(self) -> str:
        return f"Macro: {self._name} ({len(self._commands)} commands)"

class CommandManager:
    """Invoker class that manages command execution, undo, and redo"""
    
    def __init__(self):
        self._undo_stack: List[Command] = []
        self._redo_stack: List[Command] = []
        self._command_queue: Deque[Command] = deque()
    
    def execute_command(self, command: Command) -> None:
        """Execute a command and add to undo stack"""
        command.execute()
        self._undo_stack.append(command)
        self._redo_stack.clear()  # Clear redo stack when new command is executed
        print(f"Command executed: {command.get_description()}")
    
    def undo(self) -> None:
        """Undo the last command"""
        if self._undo_stack:
            command = self._undo_stack.pop()
            command.undo()
            self._redo_stack.append(command)
            print(f"Undid: {command.get_description()}")
        else:
            print("Nothing to undo")
    
    def redo(self) -> None:
        """Redo the last undone command"""
        if self._redo_stack:
            command = self._redo_stack.pop()
            command.execute()
            self._undo_stack.append(command)
            print(f"Redid: {command.get_description()}")
        else:
            print("Nothing to redo")
    
    def queue_command(self, command: Command) -> None:
        """Add command to queue for batch execution"""
        self._command_queue.append(command)
        print(f"Queued command: {command.get_description()}")
    
    def execute_queued_commands(self) -> None:
        """Execute all queued commands"""
        print("Executing queued commands...")
        while self._command_queue:
            command = self._command_queue.popleft()
            self.execute_command(command)
    
    def show_history(self) -> None:
        """Show command execution history"""
        print("Command History:")
        if not self._undo_stack:
            print("  No commands in history")
        else:
            for i, command in enumerate(reversed(self._undo_stack), 1):
                print(f"  {i}. {command.get_description()}")

def main():
    """Demonstrate the Command pattern"""
    print("=== Command Pattern - Text Editor Demo ===\n")
    
    # Create receiver and invoker
    editor = TextEditor()
    command_manager = CommandManager()
    
    print("1. Basic Command Operations:")
    editor.display_content()
    
    # Create and execute commands
    insert_hello = InsertTextCommand(editor, "Hello")
    insert_space = InsertTextCommand(editor, " ")
    insert_world = InsertTextCommand(editor, "World")
    insert_exclamation = InsertTextCommand(editor, "!")
    
    command_manager.execute_command(insert_hello)
    editor.display_content()
    
    command_manager.execute_command(insert_space)
    editor.display_content()
    
    command_manager.execute_command(insert_world)
    editor.display_content()
    
    command_manager.execute_command(insert_exclamation)
    editor.display_content()
    
    print("\n2. Undo Operations:")
    command_manager.undo()
    editor.display_content()
    
    command_manager.undo()
    editor.display_content()
    
    print("\n3. Redo Operations:")
    command_manager.redo()
    editor.display_content()
    
    command_manager.redo()
    editor.display_content()
    
    print("\n4. Cursor Movement and Deletion:")
    move_cursor = MoveCursorCommand(editor, 5)
    command_manager.execute_command(move_cursor)
    editor.display_content()
    
    delete_command = DeleteTextCommand(editor, 3)
    command_manager.execute_command(delete_command)
    editor.display_content()
    
    print("\n5. Command History:")
    command_manager.show_history()
    
    print("\n6. Macro Command (Insert signature):")
    insert_signature = MacroCommand("Insert Signature")
    insert_signature.add_command(MoveCursorCommand(editor, len(editor.content)))
    insert_signature.add_command(InsertTextCommand(editor, "\n\nBest regards,\nJohn Doe"))
    
    command_manager.execute_command(insert_signature)
    editor.display_content()
    
    print("\n7. Undo Macro:")
    command_manager.undo()
    editor.display_content()
    
    print("\n8. Command Queuing:")
    command_manager.queue_command(InsertTextCommand(editor, "\nPS: "))
    command_manager.queue_command(InsertTextCommand(editor, "This is a postscript."))
    command_manager.execute_queued_commands()
    editor.display_content()
    
    print("\n9. Advanced Macro with Mixed Commands:")
    format_text = MacroCommand("Format Text")
    format_text.add_command(MoveCursorCommand(editor, 0))
    format_text.add_command(InsertTextCommand(editor, "*** "))
    format_text.add_command(MoveCursorCommand(editor, len(editor.content)))
    format_text.add_command(InsertTextCommand(editor, " ***"))
    
    command_manager.execute_command(format_text)
    editor.display_content()
    
    print("\n10. Final Command History:")
    command_manager.show_history()
    
    print("\n=== Command Pattern Benefits ===")
    print("1. Decoupling: Invoker doesn't need to know about receiver implementation")
    print("2. Undo/Redo: Commands can be reversed, enabling undo functionality")
    print("3. Logging: Commands can be logged for auditing or replay")
    print("4. Queuing: Commands can be queued and executed later")
    print("5. Macro Commands: Multiple commands can be combined into composite commands")
    print("6. Remote Execution: Commands can be serialized and sent over network")

if __name__ == "__main__":
    main()
