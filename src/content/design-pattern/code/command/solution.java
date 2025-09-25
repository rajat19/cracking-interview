// Command Pattern - Text Editor with Undo/Redo Functionality
// Encapsulates requests as objects, allowing for undo/redo operations and command queuing

import java.util.*;

// Command interface
interface Command {
    void execute();
    void undo();
    String getDescription();
}

// Receiver class - Text Editor
class TextEditor {
    private StringBuilder content;
    private int cursorPosition;
    
    public TextEditor() {
        this.content = new StringBuilder();
        this.cursorPosition = 0;
    }
    
    public void insertText(String text) {
        content.insert(cursorPosition, text);
        cursorPosition += text.length();
        System.out.println("Inserted: '" + text + "' at position " + (cursorPosition - text.length()));
    }
    
    public void deleteText(int length) {
        if (cursorPosition >= length) {
            content.delete(cursorPosition - length, cursorPosition);
            cursorPosition -= length;
            System.out.println("Deleted " + length + " characters");
        }
    }
    
    public void moveCursor(int newPosition) {
        if (newPosition >= 0 && newPosition <= content.length()) {
            cursorPosition = newPosition;
            System.out.println("Cursor moved to position " + cursorPosition);
        }
    }
    
    public String getContent() {
        return content.toString();
    }
    
    public int getCursorPosition() {
        return cursorPosition;
    }
    
    public void displayContent() {
        System.out.println("Content: \"" + content.toString() + "\" (cursor at " + cursorPosition + ")");
    }
}

// Concrete Commands
class InsertTextCommand implements Command {
    private TextEditor editor;
    private String text;
    private int previousPosition;
    
    public InsertTextCommand(TextEditor editor, String text) {
        this.editor = editor;
        this.text = text;
    }
    
    @Override
    public void execute() {
        previousPosition = editor.getCursorPosition();
        editor.insertText(text);
    }
    
    @Override
    public void undo() {
        editor.moveCursor(previousPosition + text.length());
        editor.deleteText(text.length());
        editor.moveCursor(previousPosition);
    }
    
    @Override
    public String getDescription() {
        return "Insert '" + text + "'";
    }
}

class DeleteTextCommand implements Command {
    private TextEditor editor;
    private int length;
    private String deletedText;
    private int previousPosition;
    
    public DeleteTextCommand(TextEditor editor, int length) {
        this.editor = editor;
        this.length = length;
    }
    
    @Override
    public void execute() {
        previousPosition = editor.getCursorPosition();
        String content = editor.getContent();
        if (previousPosition >= length) {
            deletedText = content.substring(previousPosition - length, previousPosition);
            editor.deleteText(length);
        }
    }
    
    @Override
    public void undo() {
        if (deletedText != null) {
            editor.moveCursor(previousPosition - length);
            editor.insertText(deletedText);
            editor.moveCursor(previousPosition);
        }
    }
    
    @Override
    public String getDescription() {
        return "Delete " + length + " characters";
    }
}

class MoveCursorCommand implements Command {
    private TextEditor editor;
    private int newPosition;
    private int previousPosition;
    
    public MoveCursorCommand(TextEditor editor, int newPosition) {
        this.editor = editor;
        this.newPosition = newPosition;
    }
    
    @Override
    public void execute() {
        previousPosition = editor.getCursorPosition();
        editor.moveCursor(newPosition);
    }
    
    @Override
    public void undo() {
        editor.moveCursor(previousPosition);
    }
    
    @Override
    public String getDescription() {
        return "Move cursor to " + newPosition;
    }
}

// Macro Command - combines multiple commands
class MacroCommand implements Command {
    private List<Command> commands;
    private String name;
    
    public MacroCommand(String name) {
        this.name = name;
        this.commands = new ArrayList<>();
    }
    
    public void addCommand(Command command) {
        commands.add(command);
    }
    
    @Override
    public void execute() {
        System.out.println("Executing macro: " + name);
        for (Command command : commands) {
            command.execute();
        }
    }
    
    @Override
    public void undo() {
        System.out.println("Undoing macro: " + name);
        for (int i = commands.size() - 1; i >= 0; i--) {
            commands.get(i).undo();
        }
    }
    
    @Override
    public String getDescription() {
        return "Macro: " + name + " (" + commands.size() + " commands)";
    }
}

// Invoker - Command Manager
class CommandManager {
    private Stack<Command> undoStack;
    private Stack<Command> redoStack;
    private Queue<Command> commandQueue;
    
    public CommandManager() {
        this.undoStack = new Stack<>();
        this.redoStack = new Stack<>();
        this.commandQueue = new LinkedList<>();
    }
    
    public void executeCommand(Command command) {
        command.execute();
        undoStack.push(command);
        redoStack.clear(); // Clear redo stack when new command is executed
        System.out.println("Command executed: " + command.getDescription());
    }
    
    public void undo() {
        if (!undoStack.isEmpty()) {
            Command command = undoStack.pop();
            command.undo();
            redoStack.push(command);
            System.out.println("Undid: " + command.getDescription());
        } else {
            System.out.println("Nothing to undo");
        }
    }
    
    public void redo() {
        if (!redoStack.isEmpty()) {
            Command command = redoStack.pop();
            command.execute();
            undoStack.push(command);
            System.out.println("Redid: " + command.getDescription());
        } else {
            System.out.println("Nothing to redo");
        }
    }
    
    public void queueCommand(Command command) {
        commandQueue.offer(command);
        System.out.println("Queued command: " + command.getDescription());
    }
    
    public void executeQueuedCommands() {
        System.out.println("Executing queued commands...");
        while (!commandQueue.isEmpty()) {
            Command command = commandQueue.poll();
            executeCommand(command);
        }
    }
    
    public void showHistory() {
        System.out.println("Command History:");
        if (undoStack.isEmpty()) {
            System.out.println("  No commands in history");
        } else {
            for (int i = undoStack.size() - 1; i >= 0; i--) {
                System.out.println("  " + (undoStack.size() - i) + ". " + 
                                 undoStack.get(i).getDescription());
            }
        }
    }
}

// Main demonstration class
public class CommandPatternDemo {
    public static void main(String[] args) {
        System.out.println("=== Command Pattern - Text Editor Demo ===\n");
        
        // Create receiver and invoker
        TextEditor editor = new TextEditor();
        CommandManager commandManager = new CommandManager();
        
        System.out.println("1. Basic Command Operations:");
        editor.displayContent();
        
        // Create and execute commands
        Command insertHello = new InsertTextCommand(editor, "Hello");
        Command insertSpace = new InsertTextCommand(editor, " ");
        Command insertWorld = new InsertTextCommand(editor, "World");
        Command insertExclamation = new InsertTextCommand(editor, "!");
        
        commandManager.executeCommand(insertHello);
        editor.displayContent();
        
        commandManager.executeCommand(insertSpace);
        editor.displayContent();
        
        commandManager.executeCommand(insertWorld);
        editor.displayContent();
        
        commandManager.executeCommand(insertExclamation);
        editor.displayContent();
        
        System.out.println("\n2. Undo Operations:");
        commandManager.undo();
        editor.displayContent();
        
        commandManager.undo();
        editor.displayContent();
        
        System.out.println("\n3. Redo Operations:");
        commandManager.redo();
        editor.displayContent();
        
        commandManager.redo();
        editor.displayContent();
        
        System.out.println("\n4. Cursor Movement and Deletion:");
        Command moveCursor = new MoveCursorCommand(editor, 5);
        commandManager.executeCommand(moveCursor);
        editor.displayContent();
        
        Command deleteCommand = new DeleteTextCommand(editor, 3);
        commandManager.executeCommand(deleteCommand);
        editor.displayContent();
        
        System.out.println("\n5. Command History:");
        commandManager.showHistory();
        
        System.out.println("\n6. Macro Command (Insert signature):");
        MacroCommand insertSignature = new MacroCommand("Insert Signature");
        insertSignature.addCommand(new MoveCursorCommand(editor, editor.getContent().length()));
        insertSignature.addCommand(new InsertTextCommand(editor, "\n\nBest regards,\nJohn Doe"));
        
        commandManager.executeCommand(insertSignature);
        editor.displayContent();
        
        System.out.println("\n7. Undo Macro:");
        commandManager.undo();
        editor.displayContent();
        
        System.out.println("\n8. Command Queuing:");
        commandManager.queueCommand(new InsertTextCommand(editor, "\nPS: "));
        commandManager.queueCommand(new InsertTextCommand(editor, "This is a postscript."));
        commandManager.executeQueuedCommands();
        editor.displayContent();
        
        System.out.println("\n=== Command Pattern Benefits ===");
        System.out.println("1. Decoupling: Invoker doesn't need to know about receiver implementation");
        System.out.println("2. Undo/Redo: Commands can be reversed, enabling undo functionality");
        System.out.println("3. Logging: Commands can be logged for auditing or replay");
        System.out.println("4. Queuing: Commands can be queued and executed later");
        System.out.println("5. Macro Commands: Multiple commands can be combined into composite commands");
        System.out.println("6. Remote Execution: Commands can be serialized and sent over network");
    }
}
