// Component interface
interface DataSource {
    void writeData(String data);
    String readData();
}

// Concrete Component
class FileDataSource implements DataSource {
    private String filename;
    
    public FileDataSource(String filename) {
        this.filename = filename;
    }
    
    @Override
    public void writeData(String data) {
        System.out.println("Writing data to file: " + filename + " -> " + data);
    }
    
    @Override
    public String readData() {
        return "Data from file: " + filename;
    }
}

// Base Decorator
abstract class DataSourceDecorator implements DataSource {
    protected DataSource wrappee;
    
    public DataSourceDecorator(DataSource source) {
        this.wrappee = source;
    }
    
    @Override
    public void writeData(String data) {
        wrappee.writeData(data);
    }
    
    @Override
    public String readData() {
        return wrappee.readData();
    }
}

// Concrete Decorators
class EncryptionDecorator extends DataSourceDecorator {
    public EncryptionDecorator(DataSource source) {
        super(source);
    }
    
    @Override
    public void writeData(String data) {
        String encryptedData = encrypt(data);
        super.writeData(encryptedData);
    }
    
    @Override
    public String readData() {
        String data = super.readData();
        return decrypt(data);
    }
    
    private String encrypt(String data) {
        return "encrypted(" + data + ")";
    }
    
    private String decrypt(String data) {
        return data.replace("encrypted(", "").replace(")", "");
    }
}

class CompressionDecorator extends DataSourceDecorator {
    public CompressionDecorator(DataSource source) {
        super(source);
    }
    
    @Override
    public void writeData(String data) {
        String compressedData = compress(data);
        super.writeData(compressedData);
    }
    
    @Override
    public String readData() {
        String data = super.readData();
        return decompress(data);
    }
    
    private String compress(String data) {
        return "compressed(" + data + ")";
    }
    
    private String decompress(String data) {
        return data.replace("compressed(", "").replace(")", "");
    }
}

// Client code
public class DecoratorPatternDemo {
    public static void main(String[] args) {
        // Simple file data source
        DataSource source = new FileDataSource("data.txt");
        source.writeData("Hello World");
        System.out.println("Read: " + source.readData());
        
        System.out.println("\n--- With Encryption ---");
        // Wrap with encryption
        DataSource encryptedSource = new EncryptionDecorator(source);
        encryptedSource.writeData("Sensitive Data");
        System.out.println("Read: " + encryptedSource.readData());
        
        System.out.println("\n--- With Compression and Encryption ---");
        // Wrap with both compression and encryption
        DataSource decoratedSource = new CompressionDecorator(
            new EncryptionDecorator(
                new FileDataSource("secure_data.txt")
            )
        );
        decoratedSource.writeData("Large sensitive data");
        System.out.println("Read: " + decoratedSource.readData());
    }
}
