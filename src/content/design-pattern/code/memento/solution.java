import java.util.*;

// Memento class - stores the internal state of TextEditor
class TextEditorMemento {
    private final String content;
    private final int cursorPosition;
    private final String selectionText;
    
    public TextEditorMemento(String content, int cursorPosition, String selectionText) {
        this.content = content;
        this.cursorPosition = cursorPosition;
        this.selectionText = selectionText;
    }
    
    public String getContent() { return content; }
    public int getCursorPosition() { return cursorPosition; }
    public String getSelectionText() { return selectionText; }
}

// Originator - creates and restores mementos
class TextEditor {
    private StringBuilder content;
    private int cursorPosition;
    private String selectionText;
    
    public TextEditor() {
        this.content = new StringBuilder();
        this.cursorPosition = 0;
        this.selectionText = "";
    }
    
    public void write(String text) {
        content.insert(cursorPosition, text);
        cursorPosition += text.length();
        selectionText = "";
    }
    
    public void delete(int characters) {
        int startPos = Math.max(0, cursorPosition - characters);
        content.delete(startPos, cursorPosition);
        cursorPosition = startPos;
        selectionText = "";
    }
    
    public void setCursorPosition(int position) {
        this.cursorPosition = Math.max(0, Math.min(position, content.length()));
    }
    
    public void selectText(int startPos, int endPos) {
        if (startPos >= 0 && endPos <= content.length() && startPos <= endPos) {
            this.selectionText = content.substring(startPos, endPos);
        }
    }
    
    // Create memento
    public TextEditorMemento createMemento() {
        return new TextEditorMemento(content.toString(), cursorPosition, selectionText);
    }
    
    // Restore from memento
    public void restoreFromMemento(TextEditorMemento memento) {
        this.content = new StringBuilder(memento.getContent());
        this.cursorPosition = memento.getCursorPosition();
        this.selectionText = memento.getSelectionText();
    }
    
    public String getContent() { return content.toString(); }
    public int getCursorPosition() { return cursorPosition; }
    public String getSelectionText() { return selectionText; }
    
    @Override
    public String toString() {
        return String.format("Content: '%s', Cursor: %d, Selection: '%s'", 
                content.toString(), cursorPosition, selectionText);
    }
}

// Caretaker - manages mementos and implements undo/redo
class EditorHistory {
    private final Stack<TextEditorMemento> undoStack;
    private final Stack<TextEditorMemento> redoStack;
    
    public EditorHistory() {
        this.undoStack = new Stack<>();
        this.redoStack = new Stack<>();
    }
    
    public void saveState(TextEditor editor) {
        undoStack.push(editor.createMemento());
        redoStack.clear(); // Clear redo stack when new action is performed
    }
    
    public void undo(TextEditor editor) {
        if (!undoStack.isEmpty()) {
            redoStack.push(editor.createMemento());
            TextEditorMemento memento = undoStack.pop();
            editor.restoreFromMemento(memento);
        }
    }
    
    public void redo(TextEditor editor) {
        if (!redoStack.isEmpty()) {
            undoStack.push(editor.createMemento());
            TextEditorMemento memento = redoStack.pop();
            editor.restoreFromMemento(memento);
        }
    }
    
    public boolean canUndo() { return !undoStack.isEmpty(); }
    public boolean canRedo() { return !redoStack.isEmpty(); }
}

// Client code demonstrating the Memento pattern
public class MementoPatternDemo {
    public static void main(String[] args) {
        TextEditor editor = new TextEditor();
        EditorHistory history = new EditorHistory();
        
        System.out.println("=== Text Editor with Undo/Redo Demo ===\n");
        
        // Initial state
        System.out.println("Initial: " + editor);
        
        // First operation: write text
        history.saveState(editor);
        editor.write("Hello ");
        System.out.println("After writing 'Hello ': " + editor);
        
        // Second operation: write more text
        history.saveState(editor);
        editor.write("World!");
        System.out.println("After writing 'World!': " + editor);
        
        // Third operation: move cursor and insert text
        history.saveState(editor);
        editor.setCursorPosition(6);
        editor.write("Beautiful ");
        System.out.println("After inserting 'Beautiful ': " + editor);
        
        // Fourth operation: select text
        history.saveState(editor);
        editor.selectText(6, 15);
        System.out.println("After selecting text: " + editor);
        
        System.out.println("\n=== Undo Operations ===");
        
        // Undo operations
        history.undo(editor);
        System.out.println("After undo 1: " + editor);
        
        history.undo(editor);
        System.out.println("After undo 2: " + editor);
        
        history.undo(editor);
        System.out.println("After undo 3: " + editor);
        
        System.out.println("\n=== Redo Operations ===");
        
        // Redo operations
        history.redo(editor);
        System.out.println("After redo 1: " + editor);
        
        history.redo(editor);
        System.out.println("After redo 2: " + editor);
        
        // Demonstrate that new operations clear redo stack
        System.out.println("\n=== New Operation Clears Redo Stack ===");
        editor.write(" How are you?");
        System.out.println("After new write operation: " + editor);
        System.out.println("Can redo: " + history.canRedo());
    }
}
