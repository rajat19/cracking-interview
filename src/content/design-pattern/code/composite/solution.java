import java.util.*;

// Component interface
interface FileSystemComponent {
    void showDetails();
    int getSize();
}

// Leaf class - File
class File implements FileSystemComponent {
    private String name;
    private int size;

    public File(String name, int size) {
        this.name = name;
        this.size = size;
    }

    @Override
    public void showDetails() {
        System.out.println("File: " + name + " (Size: " + size + " KB)");
    }

    @Override
    public int getSize() {
        return size;
    }
}

// Composite class - Directory
class Directory implements FileSystemComponent {
    private String name;
    private List<FileSystemComponent> components;

    public Directory(String name) {
        this.name = name;
        this.components = new ArrayList<>();
    }

    public void addComponent(FileSystemComponent component) {
        components.add(component);
    }

    public void removeComponent(FileSystemComponent component) {
        components.remove(component);
    }

    @Override
    public void showDetails() {
        System.out.println("Directory: " + name + " (Total Size: " + getSize() + " KB)");
        for (FileSystemComponent component : components) {
            System.out.print("  ");
            component.showDetails();
        }
    }

    @Override
    public int getSize() {
        int totalSize = 0;
        for (FileSystemComponent component : components) {
            totalSize += component.getSize();
        }
        return totalSize;
    }
}

public class CompositePatternDemo {
    public static void main(String[] args) {
        // Create files
        File file1 = new File("document.txt", 10);
        File file2 = new File("image.png", 25);
        File file3 = new File("video.mp4", 100);
        File file4 = new File("presentation.ppt", 50);

        // Create directories
        Directory documents = new Directory("Documents");
        Directory media = new Directory("Media");
        Directory root = new Directory("Root");

        // Build the tree structure
        documents.addComponent(file1);
        documents.addComponent(file4);

        media.addComponent(file2);
        media.addComponent(file3);

        root.addComponent(documents);
        root.addComponent(media);

        // Display the entire structure
        root.showDetails();
    }
}
