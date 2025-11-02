
import React, { createContext, useContext, useState, useCallback } from 'react';
import { PDFDocument, OCRResult, PDFAnnotation } from '@/types/pdf';
import { storageUtils } from '@/utils/storage';

interface Annotation {
  id: string;
  type: 'highlight' | 'text' | 'drawing';
  page: number;
  x: number;
  y: number;
  width?: number;
  height?: number;
  text?: string;
  color: string;
  timestamp: number;
}

interface PDFContextType {
  currentDocument: PDFDocument | null;
  recentFiles: PDFDocument[];
  ocrResults: Map<number, OCRResult>;
  annotations: Annotation[];
  setCurrentDocument: (doc: PDFDocument | null) => void;
  addRecentFile: (file: PDFDocument) => Promise<void>;
  removeRecentFile: (fileId: string) => Promise<void>;
  loadRecentFiles: () => Promise<void>;
  addOCRResult: (pageNumber: number, result: OCRResult) => void;
  setAnnotations: (annotations: Annotation[]) => void;
  addAnnotation: (annotation: Annotation) => void;
  removeAnnotation: (annotationId: string) => void;
  clearAnnotations: () => void;
}

const PDFContext = createContext<PDFContextType | undefined>(undefined);

export const PDFProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentDocument, setCurrentDocument] = useState<PDFDocument | null>(null);
  const [recentFiles, setRecentFiles] = useState<PDFDocument[]>([]);
  const [ocrResults, setOCRResults] = useState<Map<number, OCRResult>>(new Map());
  const [annotations, setAnnotations] = useState<Annotation[]>([]);

  const loadRecentFiles = useCallback(async () => {
    const files = await storageUtils.getRecentFiles();
    setRecentFiles(files);
  }, []);

  const addRecentFile = useCallback(async (file: PDFDocument) => {
    await storageUtils.addRecentFile(file);
    await loadRecentFiles();
  }, [loadRecentFiles]);

  const removeRecentFile = useCallback(async (fileId: string) => {
    await storageUtils.removeRecentFile(fileId);
    await loadRecentFiles();
  }, [loadRecentFiles]);

  const addOCRResult = useCallback((pageNumber: number, result: OCRResult) => {
    setOCRResults(prev => {
      const newMap = new Map(prev);
      newMap.set(pageNumber, result);
      return newMap;
    });
  }, []);

  const addAnnotation = useCallback((annotation: Annotation) => {
    setAnnotations(prev => [...prev, annotation]);
  }, []);

  const removeAnnotation = useCallback((annotationId: string) => {
    setAnnotations(prev => prev.filter(a => a.id !== annotationId));
  }, []);

  const clearAnnotations = useCallback(() => {
    setAnnotations([]);
  }, []);

  return (
    <PDFContext.Provider
      value={{
        currentDocument,
        recentFiles,
        ocrResults,
        annotations,
        setCurrentDocument,
        addRecentFile,
        removeRecentFile,
        loadRecentFiles,
        addOCRResult,
        setAnnotations,
        addAnnotation,
        removeAnnotation,
        clearAnnotations,
      }}
    >
      {children}
    </PDFContext.Provider>
  );
};

export const usePDF = () => {
  const context = useContext(PDFContext);
  if (!context) {
    throw new Error('usePDF must be used within PDFProvider');
  }
  return context;
};
