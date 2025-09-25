from abc import ABC, abstractmethod
from typing import List

# Component abstract class
class FileSystemComponent(ABC):
    @abstractmethod
    def show_details(self) -> None:
        pass
    
    @abstractmethod
    def get_size(self) -> int:
        pass

# Leaf class - File
class File(FileSystemComponent):
    def __init__(self, name: str, size: int):
        self.name = name
        self.size = size
    
    def show_details(self) -> None:
        print(f"File: {self.name} (Size: {self.size} KB)")
    
    def get_size(self) -> int:
        return self.size

# Composite class - Directory
class Directory(FileSystemComponent):
    def __init__(self, name: str):
        self.name = name
        self.components: List[FileSystemComponent] = []
    
    def add_component(self, component: FileSystemComponent) -> None:
        self.components.append(component)
    
    def remove_component(self, component: FileSystemComponent) -> None:
        self.components.remove(component)
    
    def show_details(self) -> None:
        print(f"Directory: {self.name} (Total Size: {self.get_size()} KB)")
        for component in self.components:
            print("  ", end="")
            component.show_details()
    
    def get_size(self) -> int:
        total_size = 0
        for component in self.components:
            total_size += component.get_size()
        return total_size

def main():
    # Create files
    file1 = File("document.txt", 10)
    file2 = File("image.png", 25)
    file3 = File("video.mp4", 100)
    file4 = File("presentation.ppt", 50)
    
    # Create directories
    documents = Directory("Documents")
    media = Directory("Media")
    root = Directory("Root")
    
    # Build the tree structure
    documents.add_component(file1)
    documents.add_component(file4)
    
    media.add_component(file2)
    media.add_component(file3)
    
    root.add_component(documents)
    root.add_component(media)
    
    # Display the entire structure
    root.show_details()

if __name__ == "__main__":
    main()
