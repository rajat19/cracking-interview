#include <iostream>
#include <string>
#include <vector>
#include <memory>

// Abstract class defining the template method
class DataProcessor {
public:
    virtual ~DataProcessor() = default;
    
    // Template method - defines the skeleton of the algorithm
    void processData() {
        std::cout << "=== STARTING DATA PROCESSING ===" << std::endl;
        
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
        
        std::cout << "=== DATA PROCESSING COMPLETED ===\n" << std::endl;
    }
    
protected:
    // Abstract methods - must be implemented by subclasses
    virtual void loadData() = 0;
    virtual void transformData() = 0;
    virtual void saveResults() = 0;
    
    // Hook methods - can be overridden by subclasses (optional)
    virtual bool shouldValidateData() {
        return true; // Default behavior
    }
    
    virtual void validateData() {
        std::cout << "📋 Validating data format and integrity..." << std::endl;
    }
    
    virtual bool shouldApplyBusinessRules() {
        return false; // Default behavior - skip business rules
    }
    
    virtual void applyBusinessRules() {
        std::cout << "💼 Applying default business rules..." << std::endl;
    }
    
    virtual void cleanup() {
        std::cout << "🧹 Performing default cleanup..." << std::endl;
    }
};

// Concrete implementation for CSV processing
class CSVDataProcessor : public DataProcessor {
protected:
    void loadData() override {
        std::cout << "📁 Loading data from CSV file..." << std::endl;
        std::cout << "   - Reading headers" << std::endl;
        std::cout << "   - Parsing rows" << std::endl;
        std::cout << "   - Loaded 1000 records" << std::endl;
    }
    
    void transformData() override {
        std::cout << "🔄 Transforming CSV data..." << std::endl;
        std::cout << "   - Converting strings to appropriate types" << std::endl;
        std::cout << "   - Normalizing date formats" << std::endl;
        std::cout << "   - Removing empty columns" << std::endl;
    }
    
    void saveResults() override {
        std::cout << "💾 Saving processed CSV data..." << std::endl;
        std::cout << "   - Writing to database table" << std::endl;
        std::cout << "   - Creating backup file" << std::endl;
    }
    
    bool shouldApplyBusinessRules() override {
        return true; // CSV data needs business rule validation
    }
    
    void applyBusinessRules() override {
        std::cout << "💼 Applying CSV-specific business rules..." << std::endl;
        std::cout << "   - Checking for duplicate customer IDs" << std::endl;
        std::cout << "   - Validating email formats" << std::endl;
        std::cout << "   - Flagging suspicious transactions" << std::endl;
    }
};

// Concrete implementation for JSON processing
class JSONDataProcessor : public DataProcessor {
protected:
    void loadData() override {
        std::cout << "📁 Loading data from JSON API..." << std::endl;
        std::cout << "   - Making HTTP requests" << std::endl;
        std::cout << "   - Parsing JSON responses" << std::endl;
        std::cout << "   - Loaded 500 API objects" << std::endl;
    }
    
    void transformData() override {
        std::cout << "🔄 Transforming JSON data..." << std::endl;
        std::cout << "   - Flattening nested objects" << std::endl;
        std::cout << "   - Converting timestamps" << std::endl;
        std::cout << "   - Extracting relevant fields" << std::endl;
    }
    
    void saveResults() override {
        std::cout << "💾 Saving processed JSON data..." << std::endl;
        std::cout << "   - Writing to NoSQL database" << std::endl;
        std::cout << "   - Updating search index" << std::endl;
    }
    
    bool shouldValidateData() override {
        return false; // JSON from trusted API, skip validation
    }
    
    void cleanup() override {
        std::cout << "🧹 JSON-specific cleanup..." << std::endl;
        std::cout << "   - Clearing API cache" << std::endl;
        std::cout << "   - Logging API usage statistics" << std::endl;
    }
};

// Concrete implementation for XML processing
class XMLDataProcessor : public DataProcessor {
protected:
    void loadData() override {
        std::cout << "📁 Loading data from XML file..." << std::endl;
        std::cout << "   - Parsing XML structure" << std::endl;
        std::cout << "   - Extracting elements and attributes" << std::endl;
        std::cout << "   - Loaded 750 XML nodes" << std::endl;
    }
    
    void transformData() override {
        std::cout << "🔄 Transforming XML data..." << std::endl;
        std::cout << "   - Converting XML to relational format" << std::endl;
        std::cout << "   - Handling CDATA sections" << std::endl;
        std::cout << "   - Resolving entity references" << std::endl;
    }
    
    void saveResults() override {
        std::cout << "💾 Saving processed XML data..." << std::endl;
        std::cout << "   - Writing to relational database" << std::endl;
        std::cout << "   - Generating summary report" << std::endl;
    }
    
    void validateData() override {
        std::cout << "📋 XML-specific validation..." << std::endl;
        std::cout << "   - Validating against XSD schema" << std::endl;
        std::cout << "   - Checking for malformed XML" << std::endl;
        std::cout << "   - Verifying required elements" << std::endl;
    }
    
    bool shouldApplyBusinessRules() override {
        return true;
    }
    
    void applyBusinessRules() override {
        std::cout << "💼 Applying XML-specific business rules..." << std::endl;
        std::cout << "   - Checking data completeness" << std::endl;
        std::cout << "   - Validating business logic constraints" << std::endl;
        std::cout << "   - Cross-referencing with master data" << std::endl;
    }
};

int main() {
    std::cout << "=== TEMPLATE METHOD PATTERN DEMO ===\n" << std::endl;
    
    // Create different data processors
    std::vector<std::unique_ptr<DataProcessor>> processors;
    processors.push_back(std::make_unique<CSVDataProcessor>());
    processors.push_back(std::make_unique<JSONDataProcessor>());
    processors.push_back(std::make_unique<XMLDataProcessor>());
    
    // Process data using each processor
    for (size_t i = 0; i < processors.size(); i++) {
        std::cout << "PROCESSOR " << (i + 1) << ": " << typeid(*processors[i]).name() << std::endl;
        processors[i]->processData();
    }
    
    std::cout << "=== TEMPLATE METHOD BENEFITS ===" << std::endl;
    std::cout << "✓ Defines skeleton of algorithm in base class" << std::endl;
    std::cout << "✓ Subclasses override specific steps without changing structure" << std::endl;
    std::cout << "✓ Promotes code reuse and consistency" << std::endl;
    std::cout << "✓ Hook methods provide flexibility for optional behavior" << std::endl;
    std::cout << "✓ Follows Hollywood Principle: 'Don't call us, we'll call you'" << std::endl;
    std::cout << "✓ Eliminates code duplication across similar algorithms" << std::endl;
    
    return 0;
}
