
export interface PDFDocument {
  id: string;
  name: string;
  uri: string;
  size: number;
  mimeType: string;
  dateAdded: number;
  lastOpened?: number;
  pageCount?: number;
  thumbnail?: string;
}

export interface OCRResult {
  text: string;
  confidence: number;
  pageNumber: number;
}

export interface PDFAnnotation {
  id: string;
  pageNumber: number;
  type: 'highlight' | 'text' | 'comment';
  content: string;
  position: {
    x: number;
    y: number;
    width?: number;
    height?: number;
  };
  color?: string;
  timestamp: number;
}

export interface PDFSummary {
  id: string;
  documentId: string;
  text: string;
  pageRange: {
    start: number;
    end: number;
  };
  timestamp: number;
}
