// Visitor interface
interface DocumentVisitor {
    void visit(PDFDocument pdf);
    void visit(WordDocument word);
    void visit(ExcelDocument excel);
}

// Element interface
interface Document {
    void accept(DocumentVisitor visitor);
    String getName();
    int getSize();
}

// Concrete Elements
class PDFDocument implements Document {
    private String name;
    private int pages;
    private int size;

    public PDFDocument(String name, int pages, int size) {
        this.name = name;
        this.pages = pages;
        this.size = size;
    }

    @Override
    public void accept(DocumentVisitor visitor) {
        visitor.visit(this);
    }

    @Override
    public String getName() { return name; }

    @Override
    public int getSize() { return size; }

    public int getPages() { return pages; }
}

class WordDocument implements Document {
    private String name;
    private int wordCount;
    private int size;

    public WordDocument(String name, int wordCount, int size) {
        this.name = name;
        this.wordCount = wordCount;
        this.size = size;
    }

    @Override
    public void accept(DocumentVisitor visitor) {
        visitor.visit(this);
    }

    @Override
    public String getName() { return name; }

    @Override
    public int getSize() { return size; }

    public int getWordCount() { return wordCount; }
}

class ExcelDocument implements Document {
    private String name;
    private int sheetCount;
    private int size;

    public ExcelDocument(String name, int sheetCount, int size) {
        this.name = name;
        this.sheetCount = sheetCount;
        this.size = size;
    }

    @Override
    public void accept(DocumentVisitor visitor) {
        visitor.visit(this);
    }

    @Override
    public String getName() { return name; }

    @Override
    public int getSize() { return size; }

    public int getSheetCount() { return sheetCount; }
}

// Concrete Visitors
class DocumentReportVisitor implements DocumentVisitor {
    private int totalSize = 0;
    private int documentCount = 0;

    @Override
    public void visit(PDFDocument pdf) {
        System.out.println("PDF Report: " + pdf.getName() + " - " + pdf.getPages() + " pages, " + pdf.getSize() + " KB");
        totalSize += pdf.getSize();
        documentCount++;
    }

    @Override
    public void visit(WordDocument word) {
        System.out.println("Word Report: " + word.getName() + " - " + word.getWordCount() + " words, " + word.getSize() + " KB");
        totalSize += word.getSize();
        documentCount++;
    }

    @Override
    public void visit(ExcelDocument excel) {
        System.out.println("Excel Report: " + excel.getName() + " - " + excel.getSheetCount() + " sheets, " + excel.getSize() + " KB");
        totalSize += excel.getSize();
        documentCount++;
    }

    public void printSummary() {
        System.out.println("\n=== SUMMARY ===");
        System.out.println("Total Documents: " + documentCount);
        System.out.println("Total Size: " + totalSize + " KB");
    }
}

class DocumentCompressionVisitor implements DocumentVisitor {
    @Override
    public void visit(PDFDocument pdf) {
        System.out.println("Compressing PDF: " + pdf.getName() + " - Compression ratio: 15%");
    }

    @Override
    public void visit(WordDocument word) {
        System.out.println("Compressing Word: " + word.getName() + " - Compression ratio: 25%");
    }

    @Override
    public void visit(ExcelDocument excel) {
        System.out.println("Compressing Excel: " + excel.getName() + " - Compression ratio: 30%");
    }
}

public class VisitorPatternDemo {
    public static void main(String[] args) {
        // Create document collection
        Document[] documents = {
            new PDFDocument("Annual Report.pdf", 50, 1200),
            new WordDocument("Meeting Minutes.docx", 2500, 800),
            new ExcelDocument("Budget 2024.xlsx", 12, 1500),
            new PDFDocument("User Manual.pdf", 100, 2000),
            new WordDocument("Project Proposal.docx", 5000, 1100)
        };

        System.out.println("=== GENERATING REPORTS ===");
        DocumentReportVisitor reportVisitor = new DocumentReportVisitor();
        for (Document doc : documents) {
            doc.accept(reportVisitor);
        }
        reportVisitor.printSummary();

        System.out.println("\n=== COMPRESSING DOCUMENTS ===");
        DocumentCompressionVisitor compressionVisitor = new DocumentCompressionVisitor();
        for (Document doc : documents) {
            doc.accept(compressionVisitor);
        }
    }
}
