
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PDFDocument } from '@/types/pdf';

const STORAGE_KEYS = {
  RECENT_FILES: '@smartpdf_recent_files',
  SETTINGS: '@smartpdf_settings',
  OCR_CACHE: '@smartpdf_ocr_cache',
};

export const storageUtils = {
  async getRecentFiles(): Promise<PDFDocument[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.RECENT_FILES);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting recent files:', error);
      return [];
    }
  },

  async addRecentFile(file: PDFDocument): Promise<void> {
    try {
      const recentFiles = await this.getRecentFiles();
      const existingIndex = recentFiles.findIndex(f => f.id === file.id);
      
      if (existingIndex !== -1) {
        recentFiles.splice(existingIndex, 1);
      }
      
      recentFiles.unshift({ ...file, lastOpened: Date.now() });
      
      // Keep only last 20 files
      const trimmedFiles = recentFiles.slice(0, 20);
      
      await AsyncStorage.setItem(STORAGE_KEYS.RECENT_FILES, JSON.stringify(trimmedFiles));
    } catch (error) {
      console.error('Error adding recent file:', error);
    }
  },

  async removeRecentFile(fileId: string): Promise<void> {
    try {
      const recentFiles = await this.getRecentFiles();
      const filtered = recentFiles.filter(f => f.id !== fileId);
      await AsyncStorage.setItem(STORAGE_KEYS.RECENT_FILES, JSON.stringify(filtered));
    } catch (error) {
      console.error('Error removing recent file:', error);
    }
  },

  async clearRecentFiles(): Promise<void> {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.RECENT_FILES);
    } catch (error) {
      console.error('Error clearing recent files:', error);
    }
  },

  async getSettings(): Promise<any> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.SETTINGS);
      return data ? JSON.parse(data) : {
        darkMode: false,
        autoOCR: false,
        ocrLanguage: 'eng',
      };
    } catch (error) {
      console.error('Error getting settings:', error);
      return {
        darkMode: false,
        autoOCR: false,
        ocrLanguage: 'eng',
      };
    }
  },

  async updateSettings(settings: any): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    } catch (error) {
      console.error('Error updating settings:', error);
    }
  },

  async cacheOCRResult(documentId: string, pageNumber: number, text: string): Promise<void> {
    try {
      const cacheKey = `${STORAGE_KEYS.OCR_CACHE}_${documentId}_${pageNumber}`;
      await AsyncStorage.setItem(cacheKey, text);
    } catch (error) {
      console.error('Error caching OCR result:', error);
    }
  },

  async getCachedOCRResult(documentId: string, pageNumber: number): Promise<string | null> {
    try {
      const cacheKey = `${STORAGE_KEYS.OCR_CACHE}_${documentId}_${pageNumber}`;
      return await AsyncStorage.getItem(cacheKey);
    } catch (error) {
      console.error('Error getting cached OCR result:', error);
      return null;
    }
  },
};
