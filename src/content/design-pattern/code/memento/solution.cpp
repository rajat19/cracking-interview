#include <iostream>
#include <string>
#include <stack>
#include <vector>
#include <memory>
#include <algorithm>

// Memento class - stores the internal state of TextEditor
class TextEditorMemento {
private:
    std::string content;
    int cursorPosition;
    std::string selectionText;
    
public:
    TextEditorMemento(const std::string& content, int cursorPosition, const std::string& selectionText)
        : content(content), cursorPosition(cursorPosition), selectionText(selectionText) {}
    
    const std::string& getContent() const { return content; }
    int getCursorPosition() const { return cursorPosition; }
    const std::string& getSelectionText() const { return selectionText; }
};

// Originator - creates and restores mementos
class TextEditor {
private:
    std::string content;
    int cursorPosition;
    std::string selectionText;
    
public:
    TextEditor() : content(""), cursorPosition(0), selectionText("") {}
    
    void write(const std::string& text) {
        content.insert(cursorPosition, text);
        cursorPosition += text.length();
        selectionText = "";
    }
    
    void deleteChars(int characters) {
        int startPos = std::max(0, cursorPosition - characters);
        content.erase(startPos, cursorPosition - startPos);
        cursorPosition = startPos;
        selectionText = "";
    }
    
    void setCursorPosition(int position) {
        cursorPosition = std::max(0, std::min(position, static_cast<int>(content.length())));
    }
    
    void selectText(int startPos, int endPos) {
        if (startPos >= 0 && endPos <= content.length() && startPos <= endPos) {
            selectionText = content.substr(startPos, endPos - startPos);
        }
    }
    
    // Create memento
    std::shared_ptr<TextEditorMemento> createMemento() const {
        return std::make_shared<TextEditorMemento>(content, cursorPosition, selectionText);
    }
    
    // Restore from memento
    void restoreFromMemento(const std::shared_ptr<TextEditorMemento>& memento) {
        content = memento->getContent();
        cursorPosition = memento->getCursorPosition();
        selectionText = memento->getSelectionText();
    }
    
    const std::string& getContent() const { return content; }
    int getCursorPosition() const { return cursorPosition; }
    const std::string& getSelectionText() const { return selectionText; }
    
    std::string toString() const {
        return "Content: '" + content + "', Cursor: " + std::to_string(cursorPosition) + 
               ", Selection: '" + selectionText + "'";
    }
};

// Caretaker - manages mementos and implements undo/redo
class EditorHistory {
private:
    std::stack<std::shared_ptr<TextEditorMemento>> undoStack;
    std::stack<std::shared_ptr<TextEditorMemento>> redoStack;
    
public:
    void saveState(TextEditor& editor) {
        undoStack.push(editor.createMemento());
        // Clear redo stack when new action is performed
        while (!redoStack.empty()) {
            redoStack.pop();
        }
    }
    
    void undo(TextEditor& editor) {
        if (!undoStack.empty()) {
            redoStack.push(editor.createMemento());
            auto memento = undoStack.top();
            undoStack.pop();
            editor.restoreFromMemento(memento);
        }
    }
    
    void redo(TextEditor& editor) {
        if (!redoStack.empty()) {
            undoStack.push(editor.createMemento());
            auto memento = redoStack.top();
            redoStack.pop();
            editor.restoreFromMemento(memento);
        }
    }
    
    bool canUndo() const { return !undoStack.empty(); }
    bool canRedo() const { return !redoStack.empty(); }
};

// Alternative example: Game State Management
struct GameStateMemento {
    int level;
    int score;
    int health;
    std::vector<std::string> inventory;
    
    GameStateMemento(int l, int s, int h, const std::vector<std::string>& inv)
        : level(l), score(s), health(h), inventory(inv) {}
};

class GameState {
private:
    int level;
    int score;
    int health;
    std::vector<std::string> inventory;
    
public:
    GameState() : level(1), score(0), health(100) {}
    
    void playLevel(int points, int healthLost, const std::vector<std::string>& items) {
        level++;
        score += points;
        health -= healthLost;
        inventory.insert(inventory.end(), items.begin(), items.end());
    }
    
    std::shared_ptr<GameStateMemento> createSavePoint() const {
        return std::make_shared<GameStateMemento>(level, score, health, inventory);
    }
    
    void loadFromSavePoint(const std::shared_ptr<GameStateMemento>& savePoint) {
        level = savePoint->level;
        score = savePoint->score;
        health = savePoint->health;
        inventory = savePoint->inventory;
    }
    
    std::string toString() const {
        std::string inventoryStr = "";
        for (size_t i = 0; i < inventory.size(); ++i) {
            if (i > 0) inventoryStr += ", ";
            inventoryStr += inventory[i];
        }
        
        return "Level: " + std::to_string(level) + 
               ", Score: " + std::to_string(score) + 
               ", Health: " + std::to_string(health) + 
               ", Inventory: [" + inventoryStr + "]";
    }
    
    int getHealth() const { return health; }
};

void demoTextEditor() {
    std::cout << "=== Text Editor with Undo/Redo Demo ===\n\n";
    
    TextEditor editor;
    EditorHistory history;
    
    // Initial state
    std::cout << "Initial: " << editor.toString() << std::endl;
    
    // First operation: write text
    history.saveState(editor);
    editor.write("Hello ");
    std::cout << "After writing 'Hello ': " << editor.toString() << std::endl;
    
    // Second operation: write more text
    history.saveState(editor);
    editor.write("World!");
    std::cout << "After writing 'World!': " << editor.toString() << std::endl;
    
    // Third operation: move cursor and insert text
    history.saveState(editor);
    editor.setCursorPosition(6);
    editor.write("Beautiful ");
    std::cout << "After inserting 'Beautiful ': " << editor.toString() << std::endl;
    
    // Fourth operation: select text
    history.saveState(editor);
    editor.selectText(6, 15);
    std::cout << "After selecting text: " << editor.toString() << std::endl;
    
    std::cout << "\n=== Undo Operations ===\n";
    
    // Undo operations
    history.undo(editor);
    std::cout << "After undo 1: " << editor.toString() << std::endl;
    
    history.undo(editor);
    std::cout << "After undo 2: " << editor.toString() << std::endl;
    
    history.undo(editor);
    std::cout << "After undo 3: " << editor.toString() << std::endl;
    
    std::cout << "\n=== Redo Operations ===\n";
    
    // Redo operations
    history.redo(editor);
    std::cout << "After redo 1: " << editor.toString() << std::endl;
    
    history.redo(editor);
    std::cout << "After redo 2: " << editor.toString() << std::endl;
    
    // Demonstrate that new operations clear redo stack
    std::cout << "\n=== New Operation Clears Redo Stack ===\n";
    editor.write(" How are you?");
    std::cout << "After new write operation: " << editor.toString() << std::endl;
    std::cout << "Can redo: " << (history.canRedo() ? "true" : "false") << std::endl;
}

void demoGameSaveSystem() {
    std::cout << "\n\n=== Game Save System Demo ===\n\n";
    
    GameState game;
    std::vector<std::shared_ptr<GameStateMemento>> savePoints;
    
    std::cout << "Initial game state: " << game.toString() << std::endl;
    
    // Play level 1
    savePoints.push_back(game.createSavePoint());
    game.playLevel(100, 10, {"sword", "potion"});
    std::cout << "After level 2: " << game.toString() << std::endl;
    
    // Play level 2
    savePoints.push_back(game.createSavePoint());
    game.playLevel(150, 20, {"shield", "key"});
    std::cout << "After level 3: " << game.toString() << std::endl;
    
    // Play level 3 (difficult level)
    savePoints.push_back(game.createSavePoint());
    game.playLevel(50, 80, {"gem"});
    std::cout << "After level 4 (tough level): " << game.toString() << std::endl;
    
    // Player health is low, load from previous save
    std::cout << "\nPlayer health too low! Loading from save point..." << std::endl;
    game.loadFromSavePoint(savePoints.back());  // Load from last save
    std::cout << "After loading save: " << game.toString() << std::endl;
    
    // Try different strategy
    game.playLevel(200, 30, {"magic_scroll", "armor"});
    std::cout << "After level 4 (better strategy): " << game.toString() << std::endl;
}

int main() {
    demoTextEditor();
    demoGameSaveSystem();
    return 0;
}
