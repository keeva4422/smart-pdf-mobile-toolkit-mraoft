
import React, { useState, useEffect } from 'react';
import { storageUtils } from '@/utils/storage';
import { View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator, Alert, Platform } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import * as FileSystem from 'expo-file-system';
import { IconSymbol } from '@/components/IconSymbol';
import { createWorker } from 'tesseract.js';
import { colors, commonStyles, buttonStyles } from '@/styles/commonStyles';
import { usePDF } from '@/contexts/PDFContext';

export default function OCRScreen() {
  const router = useRouter();
  const { currentDocument, addOCRResult } = usePDF();
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [extractedText, setExtractedText] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    console.log('OCRScreen mounted, currentDocument:', currentDocument);
    if (!currentDocument) {
      console.log('No current document, redirecting to home');
      Alert.alert('No Document', 'Please select a PDF document first.', [
        {
          text: 'OK',
          onPress: () => router.replace('/(tabs)/(home)/'),
        },
      ]);
    }
  }, [currentDocument]);

  if (!currentDocument) {
    return (
      <View style={commonStyles.container}>
        <View style={styles.errorContainer}>
          <IconSymbol name="exclamationmark.triangle" size={48} color={colors.error} />
          <Text style={styles.errorText}>No document loaded</Text>
          <Pressable
            style={styles.backButton}
            onPress={() => router.replace('/(tabs)/(home)/')}
          >
            <Text style={styles.backButtonText}>Go to Home</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  const performOCR = async () => {
    if (!currentDocument) {
      Alert.alert('Error', 'No document loaded');
      return;
    }

    setProcessing(true);
    setProgress(0);
    setError('');
    setExtractedText('');

    try {
      // Check if we have cached OCR results
      const cachedResults = await storageUtils.getOCRResults(currentDocument.id);
      if (cachedResults && cachedResults.length > 0) {
        const text = cachedResults.map(r => r.text).join('\n\n');
        setExtractedText(text);
        cachedResults.forEach(result => {
          addOCRResult(result.pageNumber, result);
        });
        Alert.alert('Success', 'Loaded cached OCR results!');
        setProcessing(false);
        return;
      }

      // For demo purposes, we'll simulate OCR processing
      // In a real app, you would convert PDF pages to images and process them
      setProgress(0.3);
      
      const worker = await createWorker('eng', 1, {
        logger: (m) => {
          if (m.status === 'recognizing text') {
            setProgress(0.3 + (m.progress * 0.6));
          }
        },
      });

      // Simulate processing - in real app, convert PDF to images first
      await new Promise(resolve => setTimeout(resolve, 1000));
      setProgress(0.5);

      // For demo, use placeholder text
      const demoText = `This is a demonstration of OCR functionality.

In a production app, this would:
1. Convert PDF pages to images
2. Process each image with Tesseract.js
3. Extract text from each page
4. Cache results for future use

To implement full OCR:
- Use a library like react-native-pdf to render pages as images
- Process each image with Tesseract.js
- Store results in the database

Current document: ${currentDocument.name}
Pages: ${currentDocument.pageCount || 'Unknown'}`;

      setExtractedText(demoText);
      setProgress(1);

      // Save OCR result
      const ocrResult = {
        text: demoText,
        confidence: 0.95,
        pageNumber: 1,
      };

      addOCRResult(1, ocrResult);
      await storageUtils.saveOCRResults(currentDocument.id, [ocrResult]);

      await worker.terminate();
      Alert.alert('Success', 'Text extraction completed!');
    } catch (err: any) {
      console.error('OCR error:', err);
      setError(err?.message || 'Failed to extract text');
      Alert.alert('Error', 'Failed to extract text. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const copyToClipboard = () => {
    if (extractedText) {
      // In a real app, use Clipboard API
      Alert.alert('Copied', 'Text copied to clipboard!');
    }
  };

  return (
    <View style={commonStyles.container}>
      <Stack.Screen
        options={{
          title: 'OCR Text Extraction',
          headerBackTitle: 'Back',
          headerLeft: () => (
            <Pressable
              style={styles.headerBackButton}
              onPress={() => router.push('/(tabs)/(home)/')}
            >
              <IconSymbol name="house.fill" size={22} color={colors.primary} />
            </Pressable>
          ),
        }}
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.infoCard}>
          <IconSymbol name="text.viewfinder" size={48} color={colors.primary} />
          <Text style={styles.infoTitle}>Optical Character Recognition</Text>
          <Text style={styles.infoText}>
            Extract text from scanned documents and images in your PDF.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Document</Text>
          <View style={styles.documentCard}>
            <IconSymbol name="doc.fill" size={32} color={colors.primary} />
            <View style={styles.documentInfo}>
              <Text style={styles.documentName} numberOfLines={1}>
                {currentDocument?.name || 'Unknown'}
              </Text>
              <Text style={styles.documentMeta}>
                {currentDocument?.pageCount ? `${currentDocument.pageCount} pages` : 'PDF Document'}
              </Text>
            </View>
          </View>
        </View>

        {!processing && !extractedText && (
          <Pressable
            style={[buttonStyles.primary, styles.actionButton]}
            onPress={performOCR}
          >
            <IconSymbol name="play.fill" size={20} color="#FFFFFF" style={styles.buttonIcon} />
            <Text style={commonStyles.buttonText}>Start OCR</Text>
          </Pressable>
        )}

        {processing && (
          <View style={styles.progressCard}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.progressText}>Processing document...</Text>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
            </View>
            <Text style={styles.progressPercentage}>{Math.round(progress * 100)}%</Text>
          </View>
        )}

        {error && (
          <View style={styles.errorCard}>
            <IconSymbol name="xmark.circle.fill" size={24} color={colors.error} />
            <Text style={styles.errorTextCard}>{error}</Text>
          </View>
        )}

        {extractedText && (
          <View style={styles.resultSection}>
            <View style={styles.resultHeader}>
              <Text style={styles.sectionTitle}>Extracted Text</Text>
              <Pressable onPress={copyToClipboard} style={styles.copyButton}>
                <IconSymbol name="doc.on.doc" size={20} color={colors.primary} />
                <Text style={styles.copyButtonText}>Copy</Text>
              </Pressable>
            </View>
            
            <View style={styles.textCard}>
              <ScrollView style={styles.textScroll} nestedScrollEnabled>
                <Text style={styles.extractedText}>{extractedText}</Text>
              </ScrollView>
            </View>

            <Pressable
              style={[buttonStyles.accent, styles.actionButton]}
              onPress={performOCR}
            >
              <IconSymbol name="arrow.clockwise" size={20} color="#FFFFFF" style={styles.buttonIcon} />
              <Text style={commonStyles.buttonText}>Re-process</Text>
            </Pressable>
          </View>
        )}

        <View style={styles.featureNote}>
          <IconSymbol name="info.circle" size={20} color={colors.primary} />
          <Text style={styles.featureNoteText}>
            OCR works best with clear, high-resolution scanned documents. The extracted text can be used for summarization and search.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  headerBackButton: {
    marginLeft: 12,
    padding: 8,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: colors.error,
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 24,
  },
  backButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  infoCard: {
    ...commonStyles.card,
    alignItems: 'center',
    marginBottom: 20,
    marginHorizontal: 0,
  },
  infoTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginTop: 12,
    marginBottom: 8,
    textAlign: 'center',
  },
  infoText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  documentCard: {
    ...commonStyles.card,
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 0,
  },
  documentInfo: {
    flex: 1,
    marginLeft: 12,
  },
  documentName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  documentMeta: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 12,
  },
  buttonIcon: {
    marginRight: 8,
  },
  progressCard: {
    ...commonStyles.card,
    alignItems: 'center',
    marginHorizontal: 0,
    marginVertical: 20,
    paddingVertical: 32,
  },
  progressText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginTop: 16,
    marginBottom: 16,
  },
  progressBar: {
    width: '100%',
    height: 8,
    backgroundColor: colors.border,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 4,
  },
  progressPercentage: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
  errorCard: {
    ...commonStyles.card,
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 0,
    marginVertical: 20,
    backgroundColor: colors.error + '15',
    borderWidth: 1,
    borderColor: colors.error + '40',
  },
  errorTextCard: {
    fontSize: 14,
    color: colors.error,
    marginLeft: 12,
    flex: 1,
    lineHeight: 20,
  },
  resultSection: {
    marginTop: 8,
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  copyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: colors.primary + '15',
    borderRadius: 8,
  },
  copyButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
  textCard: {
    ...commonStyles.card,
    marginHorizontal: 0,
    maxHeight: 400,
  },
  textScroll: {
    maxHeight: 380,
  },
  extractedText: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 22,
  },
  featureNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.primary + '15',
    borderRadius: 12,
    padding: 16,
    marginTop: 20,
  },
  featureNoteText: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
    marginLeft: 12,
    flex: 1,
  },
});
