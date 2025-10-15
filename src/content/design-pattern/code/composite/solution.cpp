#include <iostream>
#include <vector>
#include <memory>
#include <string>

// Component abstract class
class FileSystemComponent {
public:
    virtual ~FileSystemComponent() = default;
    virtual void showDetails() const = 0;
    virtual int getSize() const = 0;
};

// Leaf class - File
class File : public FileSystemComponent {
private:
    std::string name;
    int size;

public:
    File(const std::string& name, int size) : name(name), size(size) {}

    void showDetails() const override {
        std::cout << "File: " << name << " (Size: " << size << " KB)" << std::endl;
    }

    int getSize() const override {
        return size;
    }
};

// Composite class - Directory
class Directory : public FileSystemComponent {
private:
    std::string name;
    std::vector<std::unique_ptr<FileSystemComponent>> components;

public:
    Directory(const std::string& name) : name(name) {}

    void addComponent(std::unique_ptr<FileSystemComponent> component) {
        components.push_back(std::move(component));
    }

    void showDetails() const override {
        std::cout << "Directory: " << name << " (Total Size: " << getSize() << " KB)" << std::endl;
        for (const auto& component : components) {
            std::cout << "  ";
            component->showDetails();
        }
    }

    int getSize() const override {
        int totalSize = 0;
        for (const auto& component : components) {
            totalSize += component->getSize();
        }
        return totalSize;
    }
};

int main() {
    // Create files
    auto file1 = std::make_unique<File>("document.txt", 10);
    auto file2 = std::make_unique<File>("image.png", 25);
    auto file3 = std::make_unique<File>("video.mp4", 100);
    auto file4 = std::make_unique<File>("presentation.ppt", 50);

    // Create directories
    auto documents = std::make_unique<Directory>("Documents");
    auto media = std::make_unique<Directory>("Media");
    auto root = std::make_unique<Directory>("Root");

    // Build the tree structure
    documents->addComponent(std::make_unique<File>("document.txt", 10));
    documents->addComponent(std::make_unique<File>("presentation.ppt", 50));

    media->addComponent(std::make_unique<File>("image.png", 25));
    media->addComponent(std::make_unique<File>("video.mp4", 100));

    root->addComponent(std::move(documents));
    root->addComponent(std::move(media));

    // Display the entire structure
    root->showDetails();

    return 0;
}
