/**
 * Prototype Pattern - Document Management System Example
 * Creates new objects by cloning existing prototypes, supporting both shallow and deep copying
 */

import java.util.*;

// Prototype interface
interface DocumentPrototype extends Cloneable {
    DocumentPrototype clone();
    void display();
    String getType();
}

// Complex object that needs deep cloning
class DocumentMetadata implements Cloneable {
    private String author;
    private Date creationDate;
    private Map<String, String> tags;
    private List<String> reviewers;
    
    public DocumentMetadata(String author) {
        this.author = author;
        this.creationDate = new Date();
        this.tags = new HashMap<>();
        this.reviewers = new ArrayList<>();
    }
    
    // Copy constructor for deep cloning
    public DocumentMetadata(DocumentMetadata other) {
        this.author = other.author;
        this.creationDate = new Date(other.creationDate.getTime()); // Deep copy date
        this.tags = new HashMap<>(other.tags); // Deep copy map
        this.reviewers = new ArrayList<>(other.reviewers); // Deep copy list
    }
    
    @Override
    public DocumentMetadata clone() {
        return new DocumentMetadata(this);
    }
    
    // Getters and setters
    public String getAuthor() { return author; }
    public void setAuthor(String author) { this.author = author; }
    
    public Date getCreationDate() { return creationDate; }
    public void setCreationDate(Date creationDate) { this.creationDate = creationDate; }
    
    public Map<String, String> getTags() { return tags; }
    public void addTag(String key, String value) { this.tags.put(key, value); }
    
    public List<String> getReviewers() { return reviewers; }
    public void addReviewer(String reviewer) { this.reviewers.add(reviewer); }
    
    @Override
    public String toString() {
        return String.format("Author: %s, Created: %s, Tags: %d, Reviewers: %d", 
                           author, creationDate, tags.size(), reviewers.size());
    }
}

// Concrete prototype implementations
class TextDocument implements DocumentPrototype {
    private String title;
    private String content;
    private DocumentMetadata metadata;
    private String formatting; // Font, size, etc.
    
    public TextDocument(String title, String content, String author) {
        this.title = title;
        this.content = content;
        this.metadata = new DocumentMetadata(author);
        this.formatting = "Arial, 12pt";
        
        // Add default tags
        metadata.addTag("type", "text");
        metadata.addTag("format", "plain");
    }
    
    // Copy constructor for cloning
    private TextDocument(TextDocument other) {
        this.title = other.title;
        this.content = other.content;
        this.metadata = other.metadata.clone(); // Deep copy metadata
        this.formatting = other.formatting;
    }
    
    @Override
    public DocumentPrototype clone() {
        System.out.println("🔄 Cloning TextDocument: " + title);
        return new TextDocument(this);
    }
    
    @Override
    public void display() {
        System.out.println("📄 TEXT DOCUMENT");
        System.out.println("├─ Title: " + title);
        System.out.println("├─ Content: " + content.substring(0, Math.min(50, content.length())) + "...");
        System.out.println("├─ Formatting: " + formatting);
        System.out.println("└─ Metadata: " + metadata);
    }
    
    @Override
    public String getType() { return "TextDocument"; }
    
    // Specific methods for customization
    public void setTitle(String title) { this.title = title; }
    public void setContent(String content) { this.content = content; }
    public void setFormatting(String formatting) { this.formatting = formatting; }
    public DocumentMetadata getMetadata() { return metadata; }
}

class SpreadsheetDocument implements DocumentPrototype {
    private String title;
    private List<List<String>> data;
    private DocumentMetadata metadata;
    private Map<String, String> formulas;
    
    public SpreadsheetDocument(String title, String author) {
        this.title = title;
        this.data = new ArrayList<>();
        this.metadata = new DocumentMetadata(author);
        this.formulas = new HashMap<>();
        
        // Initialize with sample data
        List<String> headerRow = Arrays.asList("Name", "Age", "Department", "Salary");
        data.add(headerRow);
        
        // Add default tags
        metadata.addTag("type", "spreadsheet");
        metadata.addTag("format", "xlsx");
    }
    
    // Copy constructor for cloning
    private SpreadsheetDocument(SpreadsheetDocument other) {
        this.title = other.title;
        this.metadata = other.metadata.clone(); // Deep copy metadata
        this.formulas = new HashMap<>(other.formulas); // Deep copy formulas
        
        // Deep copy data structure
        this.data = new ArrayList<>();
        for (List<String> row : other.data) {
            this.data.add(new ArrayList<>(row));
        }
    }
    
    @Override
    public DocumentPrototype clone() {
        System.out.println("🔄 Cloning SpreadsheetDocument: " + title);
        return new SpreadsheetDocument(this);
    }
    
    @Override
    public void display() {
        System.out.println("📊 SPREADSHEET DOCUMENT");
        System.out.println("├─ Title: " + title);
        System.out.println("├─ Rows: " + data.size());
        System.out.println("├─ Columns: " + (data.isEmpty() ? 0 : data.get(0).size()));
        System.out.println("├─ Formulas: " + formulas.size());
        System.out.println("└─ Metadata: " + metadata);
    }
    
    @Override
    public String getType() { return "SpreadsheetDocument"; }
    
    public void setTitle(String title) { this.title = title; }
    public void addRow(List<String> row) { this.data.add(row); }
    public void addFormula(String cell, String formula) { this.formulas.put(cell, formula); }
    public DocumentMetadata getMetadata() { return metadata; }
}

class PresentationDocument implements DocumentPrototype {
    private String title;
    private List<String> slides;
    private DocumentMetadata metadata;
    private String theme;
    private Map<Integer, String> slideNotes;
    
    public PresentationDocument(String title, String author) {
        this.title = title;
        this.slides = new ArrayList<>();
        this.metadata = new DocumentMetadata(author);
        this.theme = "Professional Blue";
        this.slideNotes = new HashMap<>();
        
        // Add default slides
        slides.add("Title Slide");
        slides.add("Agenda");
        slides.add("Content");
        
        // Add default tags
        metadata.addTag("type", "presentation");
        metadata.addTag("format", "pptx");
    }
    
    // Copy constructor for cloning
    private PresentationDocument(PresentationDocument other) {
        this.title = other.title;
        this.metadata = other.metadata.clone(); // Deep copy metadata
        this.theme = other.theme;
        this.slides = new ArrayList<>(other.slides); // Deep copy slides
        this.slideNotes = new HashMap<>(other.slideNotes); // Deep copy notes
    }
    
    @Override
    public DocumentPrototype clone() {
        System.out.println("🔄 Cloning PresentationDocument: " + title);
        return new PresentationDocument(this);
    }
    
    @Override
    public void display() {
        System.out.println("🎨 PRESENTATION DOCUMENT");
        System.out.println("├─ Title: " + title);
        System.out.println("├─ Slides: " + slides.size());
        System.out.println("├─ Theme: " + theme);
        System.out.println("├─ Notes: " + slideNotes.size() + " slides have notes");
        System.out.println("└─ Metadata: " + metadata);
    }
    
    @Override
    public String getType() { return "PresentationDocument"; }
    
    public void setTitle(String title) { this.title = title; }
    public void addSlide(String slide) { this.slides.add(slide); }
    public void setTheme(String theme) { this.theme = theme; }
    public void addSlideNote(int slideIndex, String note) { this.slideNotes.put(slideIndex, note); }
    public DocumentMetadata getMetadata() { return metadata; }
}

// Document factory using prototypes
class DocumentFactory {
    private Map<String, DocumentPrototype> prototypes;
    
    public DocumentFactory() {
        this.prototypes = new HashMap<>();
        initializePrototypes();
    }
    
    private void initializePrototypes() {
        System.out.println("🏭 Initializing document prototypes...");
        
        // Create template documents
        TextDocument textTemplate = new TextDocument("Sample Text Document", 
            "This is a sample text document that can be used as a template for creating new documents.", 
            "System");
        textTemplate.getMetadata().addTag("template", "true");
        textTemplate.getMetadata().addReviewer("Admin");
        
        SpreadsheetDocument spreadsheetTemplate = new SpreadsheetDocument("Sample Spreadsheet", "System");
        spreadsheetTemplate.getMetadata().addTag("template", "true");
        spreadsheetTemplate.addRow(Arrays.asList("John Doe", "30", "Engineering", "75000"));
        spreadsheetTemplate.addFormula("E2", "D2*0.1");
        
        PresentationDocument presentationTemplate = new PresentationDocument("Sample Presentation", "System");
        presentationTemplate.getMetadata().addTag("template", "true");
        presentationTemplate.addSlideNote(0, "Welcome everyone to the presentation");
        
        // Register prototypes
        prototypes.put("text", textTemplate);
        prototypes.put("spreadsheet", spreadsheetTemplate);
        prototypes.put("presentation", presentationTemplate);
        
        System.out.println("✅ Prototypes initialized: " + prototypes.keySet());
    }
    
    public DocumentPrototype createDocument(String type) {
        DocumentPrototype prototype = prototypes.get(type.toLowerCase());
        if (prototype != null) {
            return prototype.clone();
        }
        throw new IllegalArgumentException("Unknown document type: " + type);
    }
    
    public void registerPrototype(String name, DocumentPrototype prototype) {
        prototypes.put(name, prototype);
        System.out.println("📝 Registered new prototype: " + name);
    }
    
    public Set<String> getAvailableTypes() {
        return prototypes.keySet();
    }
}

// Client code demonstrating the pattern
public class PrototypePatternDemo {
    public static void main(String[] args) {
        System.out.println("=== Prototype Pattern Demo - Document Management ===\n");
        
        DocumentFactory factory = new DocumentFactory();
        
        System.out.println("\n--- Creating Documents from Prototypes ---");
        
        // Create various documents using prototypes
        DocumentPrototype doc1 = factory.createDocument("text");
        if (doc1 instanceof TextDocument) {
            TextDocument textDoc = (TextDocument) doc1;
            textDoc.setTitle("Project Requirements");
            textDoc.setContent("This document outlines the requirements for the new project management system.");
            textDoc.getMetadata().setAuthor("Alice Johnson");
            textDoc.getMetadata().addReviewer("Bob Smith");
        }
        
        DocumentPrototype doc2 = factory.createDocument("spreadsheet");
        if (doc2 instanceof SpreadsheetDocument) {
            SpreadsheetDocument spreadsheet = (SpreadsheetDocument) doc2;
            spreadsheet.setTitle("Employee Database");
            spreadsheet.addRow(Arrays.asList("Jane Smith", "28", "Marketing", "65000"));
            spreadsheet.addRow(Arrays.asList("Mike Johnson", "35", "Sales", "70000"));
            spreadsheet.getMetadata().setAuthor("HR Department");
        }
        
        DocumentPrototype doc3 = factory.createDocument("presentation");
        if (doc3 instanceof PresentationDocument) {
            PresentationDocument presentation = (PresentationDocument) doc3;
            presentation.setTitle("Q4 Business Review");
            presentation.addSlide("Financial Summary");
            presentation.addSlide("Market Analysis");
            presentation.setTheme("Corporate Green");
            presentation.getMetadata().setAuthor("Executive Team");
        }
        
        System.out.println("\n--- Displaying Created Documents ---");
        
        doc1.display();
        System.out.println();
        doc2.display();
        System.out.println();
        doc3.display();
        
        System.out.println("\n--- Testing Deep Copy Behavior ---");
        
        // Test that cloning creates independent objects
        DocumentPrototype originalText = factory.createDocument("text");
        DocumentPrototype clonedText = originalText.clone();
        
        if (originalText instanceof TextDocument && clonedText instanceof TextDocument) {
            TextDocument original = (TextDocument) originalText;
            TextDocument cloned = (TextDocument) clonedText;
            
            System.out.println("Original document before modification:");
            original.display();
            
            // Modify the cloned document
            cloned.setTitle("Modified Clone");
            cloned.getMetadata().setAuthor("Different Author");
            cloned.getMetadata().addTag("modified", "true");
            cloned.getMetadata().addReviewer("New Reviewer");
            
            System.out.println("\nOriginal document after clone modification:");
            original.display();
            System.out.println("\nCloned document after modification:");
            cloned.display();
            
            System.out.println("\n✅ Deep copy verification: Original unchanged after clone modification");
        }
        
        System.out.println("\n--- Custom Prototype Registration ---");
        
        // Create and register a custom prototype
        TextDocument customTemplate = new TextDocument("Meeting Notes Template", 
            "Date: [DATE]\nAttendees: [ATTENDEES]\nAgenda:\n1. [ITEM1]\n2. [ITEM2]\nAction Items:\n- [ACTION1]", 
            "Template System");
        customTemplate.getMetadata().addTag("category", "meeting");
        customTemplate.setFormatting("Courier New, 11pt");
        
        factory.registerPrototype("meeting-notes", customTemplate);
        
        // Use the custom prototype
        DocumentPrototype meetingDoc = factory.createDocument("meeting-notes");
        if (meetingDoc instanceof TextDocument) {
            TextDocument meeting = (TextDocument) meetingDoc;
            meeting.setTitle("Weekly Team Meeting - March 15");
            meeting.getMetadata().setAuthor("Project Manager");
        }
        
        System.out.println("\nDocument created from custom prototype:");
        meetingDoc.display();
        
        System.out.println("\n--- Performance Comparison ---");
        
        System.out.println("Available document types: " + factory.getAvailableTypes());
        
        // Simulate creating multiple documents quickly using prototypes
        long startTime = System.currentTimeMillis();
        List<DocumentPrototype> documents = new ArrayList<>();
        
        for (int i = 0; i < 100; i++) {
            documents.add(factory.createDocument("text"));
            documents.add(factory.createDocument("spreadsheet"));
            documents.add(factory.createDocument("presentation"));
        }
        
        long endTime = System.currentTimeMillis();
        System.out.println("📊 Created " + documents.size() + " documents in " + (endTime - startTime) + "ms using prototypes");
        
        System.out.println("\n✅ Prototype pattern successfully demonstrated!");
        System.out.println("Benefits: Fast object creation, reduced initialization cost, template-based creation");
    }
}
