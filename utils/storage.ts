
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PDFDocument, OCRResult } from '@/types/pdf';

const KEYS = {
  RECENT_FILES: '@smartpdf_recent_files',
  OCR_CACHE: '@smartpdf_ocr_cache',
  SETTINGS: '@smartpdf_settings',
};

export const storageUtils = {
  // Recent Files
  async getRecentFiles(): Promise<PDFDocument[]> {
    try {
      const data = await AsyncStorage.getItem(KEYS.RECENT_FILES);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting recent files:', error);
      return [];
    }
  },

  async addRecentFile(file: PDFDocument): Promise<void> {
    try {
      const files = await this.getRecentFiles();
      const filtered = files.filter(f => f.id !== file.id);
      const updated = [file, ...filtered].slice(0, 10); // Keep only 10 most recent
      await AsyncStorage.setItem(KEYS.RECENT_FILES, JSON.stringify(updated));
    } catch (error) {
      console.error('Error adding recent file:', error);
    }
  },

  async removeRecentFile(fileId: string): Promise<void> {
    try {
      const files = await this.getRecentFiles();
      const filtered = files.filter(f => f.id !== fileId);
      await AsyncStorage.setItem(KEYS.RECENT_FILES, JSON.stringify(filtered));
    } catch (error) {
      console.error('Error removing recent file:', error);
    }
  },

  async clearRecentFiles(): Promise<void> {
    try {
      await AsyncStorage.removeItem(KEYS.RECENT_FILES);
    } catch (error) {
      console.error('Error clearing recent files:', error);
    }
  },

  // OCR Cache
  async getOCRResults(documentId: string): Promise<OCRResult[] | null> {
    try {
      const data = await AsyncStorage.getItem(`${KEYS.OCR_CACHE}_${documentId}`);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error getting OCR results:', error);
      return null;
    }
  },

  async saveOCRResults(documentId: string, results: OCRResult[]): Promise<void> {
    try {
      await AsyncStorage.setItem(`${KEYS.OCR_CACHE}_${documentId}`, JSON.stringify(results));
    } catch (error) {
      console.error('Error saving OCR results:', error);
    }
  },

  async clearCache(): Promise<void> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter(key => key.startsWith(KEYS.OCR_CACHE));
      await AsyncStorage.multiRemove(cacheKeys);
    } catch (error) {
      console.error('Error clearing cache:', error);
    }
  },

  // Settings
  async getSettings(): Promise<any> {
    try {
      const data = await AsyncStorage.getItem(KEYS.SETTINGS);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error getting settings:', error);
      return null;
    }
  },

  async saveSettings(settings: any): Promise<void> {
    try {
      await AsyncStorage.setItem(KEYS.SETTINGS, JSON.stringify(settings));
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  },
};
