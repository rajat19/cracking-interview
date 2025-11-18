from abc import ABC, abstractmethod

# Component interface
class DataSource(ABC):
    @abstractmethod
    def write_data(self, data: str) -> None:
        pass
    
    @abstractmethod
    def read_data(self) -> str:
        pass

# Concrete Component
class FileDataSource(DataSource):
    def __init__(self, filename: str):
        self.filename = filename
    
    def write_data(self, data: str) -> None:
        print(f"Writing data to file: {self.filename} -> {data}")
    
    def read_data(self) -> str:
        return f"Data from file: {self.filename}"

# Base Decorator
class DataSourceDecorator(DataSource):
    def __init__(self, source: DataSource):
        self._wrappee = source
    
    def write_data(self, data: str) -> None:
        self._wrappee.write_data(data)
    
    def read_data(self) -> str:
        return self._wrappee.read_data()

# Concrete Decorators
class EncryptionDecorator(DataSourceDecorator):
    def write_data(self, data: str) -> None:
        encrypted_data = self._encrypt(data)
        super().write_data(encrypted_data)
    
    def read_data(self) -> str:
        data = super().read_data()
        return self._decrypt(data)
    
    def _encrypt(self, data: str) -> str:
        return f"encrypted({data})"
    
    def _decrypt(self, data: str) -> str:
        return data.replace("encrypted(", "").replace(")", "")

class CompressionDecorator(DataSourceDecorator):
    def write_data(self, data: str) -> None:
        compressed_data = self._compress(data)
        super().write_data(compressed_data)
    
    def read_data(self) -> str:
        data = super().read_data()
        return self._decompress(data)
    
    def _compress(self, data: str) -> str:
        return f"compressed({data})"
    
    def _decompress(self, data: str) -> str:
        return data.replace("compressed(", "").replace(")", "")

class LoggingDecorator(DataSourceDecorator):
    def write_data(self, data: str) -> None:
        print(f"[LOG] Writing data: {data}")
        super().write_data(data)
    
    def read_data(self) -> str:
        print("[LOG] Reading data")
        data = super().read_data()
        print(f"[LOG] Data read: {data}")
        return data

# Client code
def main():
    # Simple file data source
    source = FileDataSource("data.txt")
    source.write_data("Hello World")
    print(f"Read: {source.read_data()}")
    
    print("\n--- With Encryption ---")
    # Wrap with encryption
    encrypted_source = EncryptionDecorator(source)
    encrypted_source.write_data("Sensitive Data")
    print(f"Read: {encrypted_source.read_data()}")
    
    print("\n--- With Multiple Decorators ---")
    # Wrap with multiple decorators
    decorated_source = LoggingDecorator(
        CompressionDecorator(
            EncryptionDecorator(
                FileDataSource("secure_data.txt")
            )
        )
    )
    decorated_source.write_data("Large sensitive data")
    print(f"Read: {decorated_source.read_data()}")

if __name__ == "__main__":
    main()
