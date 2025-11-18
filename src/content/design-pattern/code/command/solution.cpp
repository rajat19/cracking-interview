// Command Pattern - Text Editor with Undo/Redo Functionality
// Encapsulates requests as objects, allowing for undo/redo operations and command queuing

#include <iostream>
#include <string>
#include <vector>
#include <stack>
#include <queue>
#include <memory>

// Abstract Command interface
class Command {
public:
    virtual ~Command() = default;
    virtual void execute() = 0;
    virtual void undo() = 0;
    virtual std::string getDescription() const = 0;
};

// Receiver class - Text Editor
class TextEditor {
private:
    std::string content;
    size_t cursorPosition;

public:
    TextEditor() : cursorPosition(0) {}
    
    void insertText(const std::string& text) {
        content.insert(cursorPosition, text);
        std::cout << "Inserted: '" << text << "' at position " << cursorPosition << std::endl;
        cursorPosition += text.length();
    }
    
    void deleteText(size_t length) {
        if (cursorPosition >= length) {
            content.erase(cursorPosition - length, length);
            cursorPosition -= length;
            std::cout << "Deleted " << length << " characters" << std::endl;
        }
    }
    
    void moveCursor(size_t newPosition) {
        if (newPosition <= content.length()) {
            cursorPosition = newPosition;
            std::cout << "Cursor moved to position " << cursorPosition << std::endl;
        }
    }
    
    const std::string& getContent() const {
        return content;
    }
    
    size_t getCursorPosition() const {
        return cursorPosition;
    }
    
    void displayContent() const {
        std::cout << "Content: \"" << content << "\" (cursor at " << cursorPosition << ")" << std::endl;
    }
};

// Concrete Commands
class InsertTextCommand : public Command {
private:
    TextEditor* editor;
    std::string text;
    size_t previousPosition;

public:
    InsertTextCommand(TextEditor* ed, const std::string& txt) 
        : editor(ed), text(txt), previousPosition(0) {}
    
    void execute() override {
        previousPosition = editor->getCursorPosition();
        editor->insertText(text);
    }
    
    void undo() override {
        editor->moveCursor(previousPosition + text.length());
        editor->deleteText(text.length());
        editor->moveCursor(previousPosition);
    }
    
    std::string getDescription() const override {
        return "Insert '" + text + "'";
    }
};

class DeleteTextCommand : public Command {
private:
    TextEditor* editor;
    size_t length;
    std::string deletedText;
    size_t previousPosition;

public:
    DeleteTextCommand(TextEditor* ed, size_t len) 
        : editor(ed), length(len), previousPosition(0) {}
    
    void execute() override {
        previousPosition = editor->getCursorPosition();
        const std::string& content = editor->getContent();
        if (previousPosition >= length) {
            deletedText = content.substr(previousPosition - length, length);
            editor->deleteText(length);
        }
    }
    
    void undo() override {
        if (!deletedText.empty()) {
            editor->moveCursor(previousPosition - length);
            editor->insertText(deletedText);
            editor->moveCursor(previousPosition);
        }
    }
    
    std::string getDescription() const override {
        return "Delete " + std::to_string(length) + " characters";
    }
};

class MoveCursorCommand : public Command {
private:
    TextEditor* editor;
    size_t newPosition;
    size_t previousPosition;

public:
    MoveCursorCommand(TextEditor* ed, size_t pos) 
        : editor(ed), newPosition(pos), previousPosition(0) {}
    
    void execute() override {
        previousPosition = editor->getCursorPosition();
        editor->moveCursor(newPosition);
    }
    
    void undo() override {
        editor->moveCursor(previousPosition);
    }
    
    std::string getDescription() const override {
        return "Move cursor to " + std::to_string(newPosition);
    }
};

// Macro Command - combines multiple commands
class MacroCommand : public Command {
private:
    std::vector<std::unique_ptr<Command>> commands;
    std::string name;

public:
    MacroCommand(const std::string& macroName) : name(macroName) {}
    
    void addCommand(std::unique_ptr<Command> command) {
        commands.push_back(std::move(command));
    }
    
    void execute() override {
        std::cout << "Executing macro: " << name << std::endl;
        for (auto& command : commands) {
            command->execute();
        }
    }
    
    void undo() override {
        std::cout << "Undoing macro: " << name << std::endl;
        // Undo commands in reverse order
        for (auto it = commands.rbegin(); it != commands.rend(); ++it) {
            (*it)->undo();
        }
    }
    
    std::string getDescription() const override {
        return "Macro: " + name + " (" + std::to_string(commands.size()) + " commands)";
    }
};

// Invoker - Command Manager
class CommandManager {
private:
    std::stack<std::unique_ptr<Command>> undoStack;
    std::stack<std::unique_ptr<Command>> redoStack;
    std::queue<std::unique_ptr<Command>> commandQueue;

public:
    void executeCommand(std::unique_ptr<Command> command) {
        command->execute();
        std::cout << "Command executed: " << command->getDescription() << std::endl;
        undoStack.push(std::move(command));
        
        // Clear redo stack when new command is executed
        while (!redoStack.empty()) {
            redoStack.pop();
        }
    }
    
    void undo() {
        if (!undoStack.empty()) {
            auto command = std::move(undoStack.top());
            undoStack.pop();
            std::cout << "Undid: " << command->getDescription() << std::endl;
            command->undo();
            redoStack.push(std::move(command));
        } else {
            std::cout << "Nothing to undo" << std::endl;
        }
    }
    
    void redo() {
        if (!redoStack.empty()) {
            auto command = std::move(redoStack.top());
            redoStack.pop();
            std::cout << "Redid: " << command->getDescription() << std::endl;
            command->execute();
            undoStack.push(std::move(command));
        } else {
            std::cout << "Nothing to redo" << std::endl;
        }
    }
    
    void queueCommand(std::unique_ptr<Command> command) {
        std::cout << "Queued command: " << command->getDescription() << std::endl;
        commandQueue.push(std::move(command));
    }
    
    void executeQueuedCommands() {
        std::cout << "Executing queued commands..." << std::endl;
        while (!commandQueue.empty()) {
            auto command = std::move(commandQueue.front());
            commandQueue.pop();
            executeCommand(std::move(command));
        }
    }
};

// Demonstration
int main() {
    std::cout << "=== Command Pattern - Text Editor Demo ===\n" << std::endl;
    
    // Create receiver and invoker
    TextEditor editor;
    CommandManager commandManager;
    
    std::cout << "1. Basic Command Operations:" << std::endl;
    editor.displayContent();
    
    // Create and execute commands
    commandManager.executeCommand(std::make_unique<InsertTextCommand>(&editor, "Hello"));
    editor.displayContent();
    
    commandManager.executeCommand(std::make_unique<InsertTextCommand>(&editor, " "));
    editor.displayContent();
    
    commandManager.executeCommand(std::make_unique<InsertTextCommand>(&editor, "World"));
    editor.displayContent();
    
    commandManager.executeCommand(std::make_unique<InsertTextCommand>(&editor, "!"));
    editor.displayContent();
    
    std::cout << "\n2. Undo Operations:" << std::endl;
    commandManager.undo();
    editor.displayContent();
    
    commandManager.undo();
    editor.displayContent();
    
    std::cout << "\n3. Redo Operations:" << std::endl;
    commandManager.redo();
    editor.displayContent();
    
    commandManager.redo();
    editor.displayContent();
    
    std::cout << "\n4. Cursor Movement and Deletion:" << std::endl;
    commandManager.executeCommand(std::make_unique<MoveCursorCommand>(&editor, 5));
    editor.displayContent();
    
    commandManager.executeCommand(std::make_unique<DeleteTextCommand>(&editor, 3));
    editor.displayContent();
    
    std::cout << "\n5. Macro Command (Insert signature):" << std::endl;
    auto insertSignature = std::make_unique<MacroCommand>("Insert Signature");
    insertSignature->addCommand(std::make_unique<MoveCursorCommand>(&editor, editor.getContent().length()));
    insertSignature->addCommand(std::make_unique<InsertTextCommand>(&editor, "\\n\\nBest regards,\\nJohn Doe"));
    
    commandManager.executeCommand(std::move(insertSignature));
    editor.displayContent();
    
    std::cout << "\n6. Undo Macro:" << std::endl;
    commandManager.undo();
    editor.displayContent();
    
    std::cout << "\n7. Command Queuing:" << std::endl;
    commandManager.queueCommand(std::make_unique<InsertTextCommand>(&editor, "\\nPS: "));
    commandManager.queueCommand(std::make_unique<InsertTextCommand>(&editor, "This is a postscript."));
    commandManager.executeQueuedCommands();
    editor.displayContent();
    
    std::cout << "\n=== Command Pattern Benefits ===" << std::endl;
    std::cout << "1. Decoupling: Invoker doesn't need to know about receiver implementation" << std::endl;
    std::cout << "2. Undo/Redo: Commands can be reversed, enabling undo functionality" << std::endl;
    std::cout << "3. Logging: Commands can be logged for auditing or replay" << std::endl;
    std::cout << "4. Queuing: Commands can be queued and executed later" << std::endl;
    std::cout << "5. Macro Commands: Multiple commands can be combined into composite commands" << std::endl;
    std::cout << "6. Remote Execution: Commands can be serialized and sent over network" << std::endl;
    
    return 0;
}
