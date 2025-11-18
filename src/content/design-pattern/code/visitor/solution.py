from abc import ABC, abstractmethod
from typing import List

# Forward references for type hints
from __future__ import annotations

# Visitor interface
class DocumentVisitor(ABC):
    @abstractmethod
    def visit_pdf(self, pdf: PDFDocument) -> None:
        pass
    
    @abstractmethod
    def visit_word(self, word: WordDocument) -> None:
        pass
    
    @abstractmethod
    def visit_excel(self, excel: ExcelDocument) -> None:
        pass

# Element interface
class Document(ABC):
    @abstractmethod
    def accept(self, visitor: DocumentVisitor) -> None:
        pass
    
    @abstractmethod
    def get_name(self) -> str:
        pass
    
    @abstractmethod
    def get_size(self) -> int:
        pass

# Concrete Elements
class PDFDocument(Document):
    def __init__(self, name: str, pages: int, size: int):
        self._name = name
        self._pages = pages
        self._size = size
    
    def accept(self, visitor: DocumentVisitor) -> None:
        visitor.visit_pdf(self)
    
    def get_name(self) -> str:
        return self._name
    
    def get_size(self) -> int:
        return self._size
    
    def get_pages(self) -> int:
        return self._pages

class WordDocument(Document):
    def __init__(self, name: str, word_count: int, size: int):
        self._name = name
        self._word_count = word_count
        self._size = size
    
    def accept(self, visitor: DocumentVisitor) -> None:
        visitor.visit_word(self)
    
    def get_name(self) -> str:
        return self._name
    
    def get_size(self) -> int:
        return self._size
    
    def get_word_count(self) -> int:
        return self._word_count

class ExcelDocument(Document):
    def __init__(self, name: str, sheet_count: int, size: int):
        self._name = name
        self._sheet_count = sheet_count
        self._size = size
    
    def accept(self, visitor: DocumentVisitor) -> None:
        visitor.visit_excel(self)
    
    def get_name(self) -> str:
        return self._name
    
    def get_size(self) -> int:
        return self._size
    
    def get_sheet_count(self) -> int:
        return self._sheet_count

# Concrete Visitors
class DocumentReportVisitor(DocumentVisitor):
    def __init__(self):
        self._total_size = 0
        self._document_count = 0
    
    def visit_pdf(self, pdf: PDFDocument) -> None:
        print(f"PDF Report: {pdf.get_name()} - {pdf.get_pages()} pages, {pdf.get_size()} KB")
        self._total_size += pdf.get_size()
        self._document_count += 1
    
    def visit_word(self, word: WordDocument) -> None:
        print(f"Word Report: {word.get_name()} - {word.get_word_count()} words, {word.get_size()} KB")
        self._total_size += word.get_size()
        self._document_count += 1
    
    def visit_excel(self, excel: ExcelDocument) -> None:
        print(f"Excel Report: {excel.get_name()} - {excel.get_sheet_count()} sheets, {excel.get_size()} KB")
        self._total_size += excel.get_size()
        self._document_count += 1
    
    def print_summary(self) -> None:
        print("\n=== SUMMARY ===")
        print(f"Total Documents: {self._document_count}")
        print(f"Total Size: {self._total_size} KB")

class DocumentCompressionVisitor(DocumentVisitor):
    def visit_pdf(self, pdf: PDFDocument) -> None:
        print(f"Compressing PDF: {pdf.get_name()} - Compression ratio: 15%")
    
    def visit_word(self, word: WordDocument) -> None:
        print(f"Compressing Word: {word.get_name()} - Compression ratio: 25%")
    
    def visit_excel(self, excel: ExcelDocument) -> None:
        print(f"Compressing Excel: {excel.get_name()} - Compression ratio: 30%")

def main():
    # Create document collection
    documents: List[Document] = [
        PDFDocument("Annual Report.pdf", 50, 1200),
        WordDocument("Meeting Minutes.docx", 2500, 800),
        ExcelDocument("Budget 2024.xlsx", 12, 1500),
        PDFDocument("User Manual.pdf", 100, 2000),
        WordDocument("Project Proposal.docx", 5000, 1100)
    ]

    print("=== GENERATING REPORTS ===")
    report_visitor = DocumentReportVisitor()
    for doc in documents:
        doc.accept(report_visitor)
    report_visitor.print_summary()

    print("\n=== COMPRESSING DOCUMENTS ===")
    compression_visitor = DocumentCompressionVisitor()
    for doc in documents:
        doc.accept(compression_visitor)

if __name__ == "__main__":
    main()
