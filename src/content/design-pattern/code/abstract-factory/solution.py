"""
Abstract Factory Pattern - Database Factory Example
Creates families of related objects (database connections and queries) without specifying concrete classes
"""

from abc import ABC, abstractmethod
import platform

# Abstract products
class DatabaseConnection(ABC):
    @abstractmethod
    def connect(self):
        pass
    
    @abstractmethod
    def disconnect(self):
        pass

class QueryBuilder(ABC):
    @abstractmethod
    def select(self, table, columns="*"):
        pass
    
    @abstractmethod
    def insert(self, table, data):
        pass

# Concrete MySQL products
class MySQLConnection(DatabaseConnection):
    def __init__(self):
        self.host = "localhost"
        self.port = 3306
        
    def connect(self):
        print(f"Connected to MySQL database at {self.host}:{self.port}")
        print("Using MySQL-specific connection pooling and SSL encryption")
    
    def disconnect(self):
        print("Disconnected from MySQL database with proper cleanup")

class MySQLQueryBuilder(QueryBuilder):
    def select(self, table, columns="*"):
        query = f"SELECT {columns} FROM `{table}`"
        print(f"MySQL Query: {query} (with backticks for table names)")
        return query
    
    def insert(self, table, data):
        columns = ", ".join([f"`{col}`" for col in data.keys()])
        values = ", ".join([f"'{val}'" for val in data.values()])
        query = f"INSERT INTO `{table}` ({columns}) VALUES ({values})"
        print(f"MySQL Query: {query} (with backticks and MySQL syntax)")
        return query

# Concrete PostgreSQL products
class PostgreSQLConnection(DatabaseConnection):
    def __init__(self):
        self.host = "localhost"
        self.port = 5432
        
    def connect(self):
        print(f"Connected to PostgreSQL database at {self.host}:{self.port}")
        print("Using PostgreSQL-specific connection with advanced indexing")
    
    def disconnect(self):
        print("Disconnected from PostgreSQL database with transaction rollback")

class PostgreSQLQueryBuilder(QueryBuilder):
    def select(self, table, columns="*"):
        query = f"SELECT {columns} FROM \"{table}\""
        print(f"PostgreSQL Query: {query} (with double quotes for identifiers)")
        return query
    
    def insert(self, table, data):
        columns = ", ".join([f'"{col}"' for col in data.keys()])
        values = ", ".join([f"'{val}'" for val in data.values()])
        query = f"INSERT INTO \"{table}\" ({columns}) VALUES ({values})"
        print(f"PostgreSQL Query: {query} (with double quotes and PostgreSQL syntax)")
        return query

# Abstract Factory
class DatabaseFactory(ABC):
    @abstractmethod
    def create_connection(self):
        pass
    
    @abstractmethod
    def create_query_builder(self):
        pass

# Concrete Factories
class MySQLFactory(DatabaseFactory):
    def create_connection(self):
        return MySQLConnection()
    
    def create_query_builder(self):
        return MySQLQueryBuilder()

class PostgreSQLFactory(DatabaseFactory):
    def create_connection(self):
        return PostgreSQLConnection()
    
    def create_query_builder(self):
        return PostgreSQLQueryBuilder()

# Client application
class DatabaseManager:
    def __init__(self, factory: DatabaseFactory):
        self.connection = factory.create_connection()
        self.query_builder = factory.create_query_builder()
    
    def setup_database(self):
        print("Setting up database connection...")
        self.connection.connect()
    
    def perform_operations(self):
        print("\n--- Database Operations ---")
        
        # Select operation
        self.query_builder.select("users", "name, email")
        
        # Insert operation
        user_data = {"name": "John Doe", "email": "john@example.com", "age": "30"}
        self.query_builder.insert("users", user_data)
    
    def cleanup(self):
        print("\nCleaning up database connection...")
        self.connection.disconnect()

def main():
    print("=== Abstract Factory Pattern - Database Demo ===\n")
    
    # Configuration-based factory selection
    database_type = "postgresql"  # Could come from config file
    
    print(f"Selected database type: {database_type}")
    
    if database_type.lower() == "mysql":
        factory = MySQLFactory()
        print("Using MySQL Database Factory")
    elif database_type.lower() == "postgresql":
        factory = PostgreSQLFactory()
        print("Using PostgreSQL Database Factory")
    else:
        print("Unknown database type, defaulting to MySQL")
        factory = MySQLFactory()
    
    # Create database manager with appropriate factory
    db_manager = DatabaseManager(factory)
    
    try:
        db_manager.setup_database()
        db_manager.perform_operations()
    finally:
        db_manager.cleanup()
    
    print("\n--- Testing Both Database Types ---")
    
    # Demo both database types
    for db_type, factory_class in [("MySQL", MySQLFactory), ("PostgreSQL", PostgreSQLFactory)]:
        print(f"\n{db_type} Database:")
        factory = factory_class()
        manager = DatabaseManager(factory)
        manager.setup_database()
        manager.perform_operations()
        manager.cleanup()

if __name__ == "__main__":
    main()
