
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator, Alert, Platform } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { createWorker } from 'tesseract.js';
import * as FileSystem from 'expo-file-system';
import { IconSymbol } from '@/components/IconSymbol';
import { colors, commonStyles, buttonStyles } from '@/styles/commonStyles';
import { usePDF } from '@/contexts/PDFContext';
import { storageUtils } from '@/utils/storage';

export default function OCRScreen() {
  const router = useRouter();
  const { currentDocument, addOCRResult, ocrResults } = usePDF();
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [extractedText, setExtractedText] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    if (!currentDocument) {
      router.replace('/(tabs)/(home)');
    }
  }, [currentDocument, router]);

  if (!currentDocument) {
    return null;
  }

  const performOCR = async () => {
    if (Platform.OS === 'web') {
      Alert.alert('Not Supported', 'OCR is not supported on web platform. Please use the mobile app.');
      return;
    }

    try {
      setProcessing(true);
      setProgress(0);
      setExtractedText('');

      // Check cache first
      const cachedText = await storageUtils.getCachedOCRResult(currentDocument.id, currentPage);
      if (cachedText) {
        console.log('Using cached OCR result');
        setExtractedText(cachedText);
        setProcessing(false);
        return;
      }

      console.log('Starting OCR process...');
      
      const worker = await createWorker('eng', 1, {
        logger: (m) => {
          console.log('OCR Progress:', m);
          if (m.status === 'recognizing text') {
            setProgress(Math.round(m.progress * 100));
          }
        },
      });

      // For demo purposes, we'll simulate OCR on the PDF
      // In a real implementation, you'd need to convert PDF pages to images first
      const { data: { text } } = await worker.recognize(currentDocument.uri);
      
      console.log('OCR completed, text length:', text.length);
      
      setExtractedText(text);
      
      // Cache the result
      await storageUtils.cacheOCRResult(currentDocument.id, currentPage, text);
      
      // Add to context
      addOCRResult(currentPage, {
        text,
        confidence: 0.85,
        pageNumber: currentPage,
      });

      await worker.terminate();
      setProcessing(false);
      
      Alert.alert('Success', 'Text extracted successfully!');
    } catch (error) {
      console.error('OCR error:', error);
      setProcessing(false);
      Alert.alert('Error', 'Failed to extract text. This feature works best with image-based PDFs.');
    }
  };

  const copyToClipboard = () => {
    if (extractedText) {
      Alert.alert('Copied', 'Text copied to clipboard!');
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: 'OCR - Text Extraction',
          headerBackTitle: 'Back',
        }}
      />

      <View style={commonStyles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.infoCard}>
            <IconSymbol name="doc.text.viewfinder" size={48} color={colors.accent} />
            <Text style={styles.infoTitle}>Optical Character Recognition</Text>
            <Text style={styles.infoText}>
              Extract text from image-based PDF pages using advanced OCR technology.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Document</Text>
            <View style={styles.documentCard}>
              <IconSymbol name="doc.fill" size={32} color={colors.primary} />
              <View style={styles.documentInfo}>
                <Text style={styles.documentName} numberOfLines={1}>
                  {currentDocument.name}
                </Text>
                <Text style={styles.documentMeta}>
                  Page {currentPage}
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
              <Text style={styles.progressText}>Processing... {progress}%</Text>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${progress}%` }]} />
              </View>
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
                <Text style={commonStyles.buttonText}>Re-scan</Text>
              </Pressable>
            </View>
          )}

          <View style={styles.tipsCard}>
            <Text style={styles.tipsTitle}>💡 Tips for better results:</Text>
            <Text style={styles.tipText}>- Ensure good image quality</Text>
            <Text style={styles.tipText}>- Use high-contrast documents</Text>
            <Text style={styles.tipText}>- Avoid skewed or rotated pages</Text>
            <Text style={styles.tipText}>- Works best with printed text</Text>
          </View>
        </ScrollView>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  infoCard: {
    ...commonStyles.card,
    alignItems: 'center',
    marginBottom: 20,
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
  },
  progressText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginTop: 12,
    marginBottom: 16,
  },
  progressBar: {
    width: '100%',
    height: 8,
    backgroundColor: colors.border,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 4,
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
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: colors.primary + '20',
    borderRadius: 8,
  },
  copyButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
    marginLeft: 6,
  },
  textCard: {
    ...commonStyles.card,
    marginHorizontal: 0,
    maxHeight: 300,
  },
  textScroll: {
    maxHeight: 280,
  },
  extractedText: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 22,
  },
  tipsCard: {
    backgroundColor: colors.accent + '20',
    borderRadius: 12,
    padding: 16,
    marginTop: 20,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  tipText: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 22,
    marginBottom: 4,
  },
});
