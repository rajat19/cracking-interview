from abc import ABC, abstractmethod
from typing import List

# Abstract class defining the template method
class DataProcessor(ABC):
    
    def process_data(self) -> None:
        """Template method - defines the skeleton of the algorithm"""
        print("=== STARTING DATA PROCESSING ===")
        
        # Step 1: Load data
        self.load_data()
        
        # Step 2: Validate data (optional hook)
        if self.should_validate_data():
            self.validate_data()
        
        # Step 3: Transform data
        self.transform_data()
        
        # Step 4: Apply business rules (optional hook)
        if self.should_apply_business_rules():
            self.apply_business_rules()
        
        # Step 5: Save results
        self.save_results()
        
        # Step 6: Cleanup (optional hook)
        self.cleanup()
        
        print("=== DATA PROCESSING COMPLETED ===\n")
    
    # Abstract methods - must be implemented by subclasses
    @abstractmethod
    def load_data(self) -> None:
        pass
    
    @abstractmethod
    def transform_data(self) -> None:
        pass
    
    @abstractmethod
    def save_results(self) -> None:
        pass
    
    # Hook methods - can be overridden by subclasses (optional)
    def should_validate_data(self) -> bool:
        return True  # Default behavior
    
    def validate_data(self) -> None:
        print("📋 Validating data format and integrity...")
    
    def should_apply_business_rules(self) -> bool:
        return False  # Default behavior - skip business rules
    
    def apply_business_rules(self) -> None:
        print("💼 Applying default business rules...")
    
    def cleanup(self) -> None:
        print("🧹 Performing default cleanup...")

# Concrete implementation for CSV processing
class CSVDataProcessor(DataProcessor):
    def load_data(self) -> None:
        print("📁 Loading data from CSV file...")
        print("   - Reading headers")
        print("   - Parsing rows")
        print("   - Loaded 1000 records")
    
    def transform_data(self) -> None:
        print("🔄 Transforming CSV data...")
        print("   - Converting strings to appropriate types")
        print("   - Normalizing date formats")
        print("   - Removing empty columns")
    
    def save_results(self) -> None:
        print("💾 Saving processed CSV data...")
        print("   - Writing to database table")
        print("   - Creating backup file")
    
    def should_apply_business_rules(self) -> bool:
        return True  # CSV data needs business rule validation
    
    def apply_business_rules(self) -> None:
        print("💼 Applying CSV-specific business rules...")
        print("   - Checking for duplicate customer IDs")
        print("   - Validating email formats")
        print("   - Flagging suspicious transactions")

# Concrete implementation for JSON processing
class JSONDataProcessor(DataProcessor):
    def load_data(self) -> None:
        print("📁 Loading data from JSON API...")
        print("   - Making HTTP requests")
        print("   - Parsing JSON responses")
        print("   - Loaded 500 API objects")
    
    def transform_data(self) -> None:
        print("🔄 Transforming JSON data...")
        print("   - Flattening nested objects")
        print("   - Converting timestamps")
        print("   - Extracting relevant fields")
    
    def save_results(self) -> None:
        print("💾 Saving processed JSON data...")
        print("   - Writing to NoSQL database")
        print("   - Updating search index")
    
    def should_validate_data(self) -> bool:
        return False  # JSON from trusted API, skip validation
    
    def cleanup(self) -> None:
        print("🧹 JSON-specific cleanup...")
        print("   - Clearing API cache")
        print("   - Logging API usage statistics")

# Concrete implementation for XML processing
class XMLDataProcessor(DataProcessor):
    def load_data(self) -> None:
        print("📁 Loading data from XML file...")
        print("   - Parsing XML structure")
        print("   - Extracting elements and attributes")
        print("   - Loaded 750 XML nodes")
    
    def transform_data(self) -> None:
        print("🔄 Transforming XML data...")
        print("   - Converting XML to relational format")
        print("   - Handling CDATA sections")
        print("   - Resolving entity references")
    
    def save_results(self) -> None:
        print("💾 Saving processed XML data...")
        print("   - Writing to relational database")
        print("   - Generating summary report")
    
    def validate_data(self) -> None:
        print("📋 XML-specific validation...")
        print("   - Validating against XSD schema")
        print("   - Checking for malformed XML")
        print("   - Verifying required elements")
    
    def should_apply_business_rules(self) -> bool:
        return True
    
    def apply_business_rules(self) -> None:
        print("💼 Applying XML-specific business rules...")
        print("   - Checking data completeness")
        print("   - Validating business logic constraints")
        print("   - Cross-referencing with master data")

def main():
    print("=== TEMPLATE METHOD PATTERN DEMO ===\n")
    
    # Create different data processors
    processors: List[DataProcessor] = [
        CSVDataProcessor(),
        JSONDataProcessor(),
        XMLDataProcessor()
    ]
    
    # Process data using each processor
    for i, processor in enumerate(processors, 1):
        print(f"PROCESSOR {i}: {processor.__class__.__name__}")
        processor.process_data()
    
    print("=== TEMPLATE METHOD BENEFITS ===")
    print("✓ Defines skeleton of algorithm in base class")
    print("✓ Subclasses override specific steps without changing structure")
    print("✓ Promotes code reuse and consistency")
    print("✓ Hook methods provide flexibility for optional behavior")
    print("✓ Follows Hollywood Principle: 'Don't call us, we'll call you'")
    print("✓ Eliminates code duplication across similar algorithms")

if __name__ == "__main__":
    main()
