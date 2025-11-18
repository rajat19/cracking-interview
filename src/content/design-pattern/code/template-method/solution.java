// Abstract class defining the template method
abstract class DataProcessor {
    
    // Template method - defines the skeleton of the algorithm
    public final void processData() {
        System.out.println("=== STARTING DATA PROCESSING ===");
        
        // Step 1: Load data
        loadData();
        
        // Step 2: Validate data (optional hook)
        if (shouldValidateData()) {
            validateData();
        }
        
        // Step 3: Transform data
        transformData();
        
        // Step 4: Apply business rules (optional hook)
        if (shouldApplyBusinessRules()) {
            applyBusinessRules();
        }
        
        // Step 5: Save results
        saveResults();
        
        // Step 6: Cleanup (optional hook)
        cleanup();
        
        System.out.println("=== DATA PROCESSING COMPLETED ===\n");
    }
    
    // Abstract methods - must be implemented by subclasses
    protected abstract void loadData();
    protected abstract void transformData();
    protected abstract void saveResults();
    
    // Hook methods - can be overridden by subclasses (optional)
    protected boolean shouldValidateData() {
        return true; // Default behavior
    }
    
    protected void validateData() {
        System.out.println("📋 Validating data format and integrity...");
    }
    
    protected boolean shouldApplyBusinessRules() {
        return false; // Default behavior - skip business rules
    }
    
    protected void applyBusinessRules() {
        System.out.println("💼 Applying default business rules...");
    }
    
    protected void cleanup() {
        System.out.println("🧹 Performing default cleanup...");
    }
}

// Concrete implementation for CSV processing
class CSVDataProcessor extends DataProcessor {
    @Override
    protected void loadData() {
        System.out.println("📁 Loading data from CSV file...");
        System.out.println("   - Reading headers");
        System.out.println("   - Parsing rows");
        System.out.println("   - Loaded 1000 records");
    }
    
    @Override
    protected void transformData() {
        System.out.println("🔄 Transforming CSV data...");
        System.out.println("   - Converting strings to appropriate types");
        System.out.println("   - Normalizing date formats");
        System.out.println("   - Removing empty columns");
    }
    
    @Override
    protected void saveResults() {
        System.out.println("💾 Saving processed CSV data...");
        System.out.println("   - Writing to database table");
        System.out.println("   - Creating backup file");
    }
    
    @Override
    protected boolean shouldApplyBusinessRules() {
        return true; // CSV data needs business rule validation
    }
    
    @Override
    protected void applyBusinessRules() {
        System.out.println("💼 Applying CSV-specific business rules...");
        System.out.println("   - Checking for duplicate customer IDs");
        System.out.println("   - Validating email formats");
        System.out.println("   - Flagging suspicious transactions");
    }
}

// Concrete implementation for JSON processing
class JSONDataProcessor extends DataProcessor {
    @Override
    protected void loadData() {
        System.out.println("📁 Loading data from JSON API...");
        System.out.println("   - Making HTTP requests");
        System.out.println("   - Parsing JSON responses");
        System.out.println("   - Loaded 500 API objects");
    }
    
    @Override
    protected void transformData() {
        System.out.println("🔄 Transforming JSON data...");
        System.out.println("   - Flattening nested objects");
        System.out.println("   - Converting timestamps");
        System.out.println("   - Extracting relevant fields");
    }
    
    @Override
    protected void saveResults() {
        System.out.println("💾 Saving processed JSON data...");
        System.out.println("   - Writing to NoSQL database");
        System.out.println("   - Updating search index");
    }
    
    @Override
    protected boolean shouldValidateData() {
        return false; // JSON from trusted API, skip validation
    }
    
    @Override
    protected void cleanup() {
        System.out.println("🧹 JSON-specific cleanup...");
        System.out.println("   - Clearing API cache");
        System.out.println("   - Logging API usage statistics");
    }
}

// Concrete implementation for XML processing
class XMLDataProcessor extends DataProcessor {
    @Override
    protected void loadData() {
        System.out.println("📁 Loading data from XML file...");
        System.out.println("   - Parsing XML structure");
        System.out.println("   - Extracting elements and attributes");
        System.out.println("   - Loaded 750 XML nodes");
    }
    
    @Override
    protected void transformData() {
        System.out.println("🔄 Transforming XML data...");
        System.out.println("   - Converting XML to relational format");
        System.out.println("   - Handling CDATA sections");
        System.out.println("   - Resolving entity references");
    }
    
    @Override
    protected void saveResults() {
        System.out.println("💾 Saving processed XML data...");
        System.out.println("   - Writing to relational database");
        System.out.println("   - Generating summary report");
    }
    
    @Override
    protected void validateData() {
        System.out.println("📋 XML-specific validation...");
        System.out.println("   - Validating against XSD schema");
        System.out.println("   - Checking for malformed XML");
        System.out.println("   - Verifying required elements");
    }
    
    @Override
    protected boolean shouldApplyBusinessRules() {
        return true;
    }
    
    @Override
    protected void applyBusinessRules() {
        System.out.println("💼 Applying XML-specific business rules...");
        System.out.println("   - Checking data completeness");
        System.out.println("   - Validating business logic constraints");
        System.out.println("   - Cross-referencing with master data");
    }
}

// Demo class
public class TemplateMethodDemo {
    public static void main(String[] args) {
        System.out.println("=== TEMPLATE METHOD PATTERN DEMO ===\n");
        
        // Create different data processors
        DataProcessor[] processors = {
            new CSVDataProcessor(),
            new JSONDataProcessor(), 
            new XMLDataProcessor()
        };
        
        // Process data using each processor
        for (int i = 0; i < processors.length; i++) {
            System.out.println("PROCESSOR " + (i + 1) + ": " + 
                             processors[i].getClass().getSimpleName());
            processors[i].processData();
        }
        
        System.out.println("=== TEMPLATE METHOD BENEFITS ===");
        System.out.println("✓ Defines skeleton of algorithm in base class");
        System.out.println("✓ Subclasses override specific steps without changing structure");
        System.out.println("✓ Promotes code reuse and consistency");
        System.out.println("✓ Hook methods provide flexibility for optional behavior");
        System.out.println("✓ Follows Hollywood Principle: 'Don't call us, we'll call you'");
        System.out.println("✓ Eliminates code duplication across similar algorithms");
    }
}
