#include <iostream>
#include <vector>
#include <memory>
#include <string>

// Forward declarations
class PDFDocument;
class WordDocument;
class ExcelDocument;

// Visitor interface
class DocumentVisitor {
public:
    virtual ~DocumentVisitor() = default;
    virtual void visit(const PDFDocument& pdf) = 0;
    virtual void visit(const WordDocument& word) = 0;
    virtual void visit(const ExcelDocument& excel) = 0;
};

// Element interface
class Document {
public:
    virtual ~Document() = default;
    virtual void accept(DocumentVisitor& visitor) const = 0;
    virtual std::string getName() const = 0;
    virtual int getSize() const = 0;
};

// Concrete Elements
class PDFDocument : public Document {
private:
    std::string name;
    int pages;
    int size;

public:
    PDFDocument(const std::string& name, int pages, int size)
        : name(name), pages(pages), size(size) {}

    void accept(DocumentVisitor& visitor) const override {
        visitor.visit(*this);
    }

    std::string getName() const override { return name; }
    int getSize() const override { return size; }
    int getPages() const { return pages; }
};

class WordDocument : public Document {
private:
    std::string name;
    int wordCount;
    int size;

public:
    WordDocument(const std::string& name, int wordCount, int size)
        : name(name), wordCount(wordCount), size(size) {}

    void accept(DocumentVisitor& visitor) const override {
        visitor.visit(*this);
    }

    std::string getName() const override { return name; }
    int getSize() const override { return size; }
    int getWordCount() const { return wordCount; }
};

class ExcelDocument : public Document {
private:
    std::string name;
    int sheetCount;
    int size;

public:
    ExcelDocument(const std::string& name, int sheetCount, int size)
        : name(name), sheetCount(sheetCount), size(size) {}

    void accept(DocumentVisitor& visitor) const override {
        visitor.visit(*this);
    }

    std::string getName() const override { return name; }
    int getSize() const override { return size; }
    int getSheetCount() const { return sheetCount; }
};

// Concrete Visitors
class DocumentReportVisitor : public DocumentVisitor {
private:
    int totalSize = 0;
    int documentCount = 0;

public:
    void visit(const PDFDocument& pdf) override {
        std::cout << "PDF Report: " << pdf.getName() << " - " << pdf.getPages() 
                  << " pages, " << pdf.getSize() << " KB" << std::endl;
        totalSize += pdf.getSize();
        documentCount++;
    }

    void visit(const WordDocument& word) override {
        std::cout << "Word Report: " << word.getName() << " - " << word.getWordCount() 
                  << " words, " << word.getSize() << " KB" << std::endl;
        totalSize += word.getSize();
        documentCount++;
    }

    void visit(const ExcelDocument& excel) override {
        std::cout << "Excel Report: " << excel.getName() << " - " << excel.getSheetCount() 
                  << " sheets, " << excel.getSize() << " KB" << std::endl;
        totalSize += excel.getSize();
        documentCount++;
    }

    void printSummary() const {
        std::cout << "\n=== SUMMARY ===" << std::endl;
        std::cout << "Total Documents: " << documentCount << std::endl;
        std::cout << "Total Size: " << totalSize << " KB" << std::endl;
    }
};

class DocumentCompressionVisitor : public DocumentVisitor {
public:
    void visit(const PDFDocument& pdf) override {
        std::cout << "Compressing PDF: " << pdf.getName() << " - Compression ratio: 15%" << std::endl;
    }

    void visit(const WordDocument& word) override {
        std::cout << "Compressing Word: " << word.getName() << " - Compression ratio: 25%" << std::endl;
    }

    void visit(const ExcelDocument& excel) override {
        std::cout << "Compressing Excel: " << excel.getName() << " - Compression ratio: 30%" << std::endl;
    }
};

int main() {
    // Create document collection
    std::vector<std::unique_ptr<Document>> documents;
    documents.push_back(std::make_unique<PDFDocument>("Annual Report.pdf", 50, 1200));
    documents.push_back(std::make_unique<WordDocument>("Meeting Minutes.docx", 2500, 800));
    documents.push_back(std::make_unique<ExcelDocument>("Budget 2024.xlsx", 12, 1500));
    documents.push_back(std::make_unique<PDFDocument>("User Manual.pdf", 100, 2000));
    documents.push_back(std::make_unique<WordDocument>("Project Proposal.docx", 5000, 1100));

    std::cout << "=== GENERATING REPORTS ===" << std::endl;
    DocumentReportVisitor reportVisitor;
    for (const auto& doc : documents) {
        doc->accept(reportVisitor);
    }
    reportVisitor.printSummary();

    std::cout << "\n=== COMPRESSING DOCUMENTS ===" << std::endl;
    DocumentCompressionVisitor compressionVisitor;
    for (const auto& doc : documents) {
        doc->accept(compressionVisitor);
    }

    return 0;
}
