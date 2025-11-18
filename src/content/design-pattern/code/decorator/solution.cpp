#include <iostream>
#include <string>
#include <memory>

// Component interface
class DataSource {
public:
    virtual ~DataSource() = default;
    virtual void writeData(const std::string& data) = 0;
    virtual std::string readData() = 0;
};

// Concrete Component
class FileDataSource : public DataSource {
private:
    std::string filename;
    
public:
    FileDataSource(const std::string& filename) : filename(filename) {}
    
    void writeData(const std::string& data) override {
        std::cout << "Writing data to file: " << filename << " -> " << data << std::endl;
    }
    
    std::string readData() override {
        return "Data from file: " + filename;
    }
};

// Base Decorator
class DataSourceDecorator : public DataSource {
protected:
    std::unique_ptr<DataSource> wrappee;
    
public:
    DataSourceDecorator(std::unique_ptr<DataSource> source) : wrappee(std::move(source)) {}
    
    void writeData(const std::string& data) override {
        wrappee->writeData(data);
    }
    
    std::string readData() override {
        return wrappee->readData();
    }
};

// Concrete Decorators
class EncryptionDecorator : public DataSourceDecorator {
private:
    std::string encrypt(const std::string& data) {
        return "encrypted(" + data + ")";
    }
    
    std::string decrypt(const std::string& data) {
        std::string result = data;
        size_t start = result.find("encrypted(");
        if (start != std::string::npos) {
            result.erase(start, 10); // Remove "encrypted("
            size_t end = result.find_last_of(')');
            if (end != std::string::npos) {
                result.erase(end, 1); // Remove ")"
            }
        }
        return result;
    }
    
public:
    EncryptionDecorator(std::unique_ptr<DataSource> source) : DataSourceDecorator(std::move(source)) {}
    
    void writeData(const std::string& data) override {
        std::string encryptedData = encrypt(data);
        DataSourceDecorator::writeData(encryptedData);
    }
    
    std::string readData() override {
        std::string data = DataSourceDecorator::readData();
        return decrypt(data);
    }
};

class CompressionDecorator : public DataSourceDecorator {
private:
    std::string compress(const std::string& data) {
        return "compressed(" + data + ")";
    }
    
    std::string decompress(const std::string& data) {
        std::string result = data;
        size_t start = result.find("compressed(");
        if (start != std::string::npos) {
            result.erase(start, 11); // Remove "compressed("
            size_t end = result.find_last_of(')');
            if (end != std::string::npos) {
                result.erase(end, 1); // Remove ")"
            }
        }
        return result;
    }
    
public:
    CompressionDecorator(std::unique_ptr<DataSource> source) : DataSourceDecorator(std::move(source)) {}
    
    void writeData(const std::string& data) override {
        std::string compressedData = compress(data);
        DataSourceDecorator::writeData(compressedData);
    }
    
    std::string readData() override {
        std::string data = DataSourceDecorator::readData();
        return decompress(data);
    }
};

int main() {
    // Simple file data source
    auto source = std::make_unique<FileDataSource>("data.txt");
    source->writeData("Hello World");
    std::cout << "Read: " << source->readData() << std::endl;
    
    std::cout << "\n--- With Encryption ---" << std::endl;
    // Wrap with encryption
    auto encryptedSource = std::make_unique<EncryptionDecorator>(
        std::make_unique<FileDataSource>("data.txt")
    );
    encryptedSource->writeData("Sensitive Data");
    std::cout << "Read: " << encryptedSource->readData() << std::endl;
    
    std::cout << "\n--- With Compression and Encryption ---" << std::endl;
    // Wrap with both compression and encryption
    auto decoratedSource = std::make_unique<CompressionDecorator>(
        std::make_unique<EncryptionDecorator>(
            std::make_unique<FileDataSource>("secure_data.txt")
        )
    );
    decoratedSource->writeData("Large sensitive data");
    std::cout << "Read: " << decoratedSource->readData() << std::endl;
    
    return 0;
}
