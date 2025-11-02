
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator, Alert, TextInput } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { IconSymbol } from '@/components/IconSymbol';
import { colors, commonStyles, buttonStyles } from '@/styles/commonStyles';
import { usePDF } from '@/contexts/PDFContext';
import { supabase } from '@/app/integrations/supabase/client';

export default function SummarizeScreen() {
  const router = useRouter();
  const { currentDocument, ocrResults } = usePDF();
  const [processing, setProcessing] = useState(false);
  const [summary, setSummary] = useState('');
  const [provider, setProvider] = useState<'openrouter' | 'gemini'>('openrouter');
  const [error, setError] = useState('');

  if (!currentDocument) {
    router.replace('/(tabs)/(home)');
    return null;
  }

  const generateSummary = async () => {
    setProcessing(true);
    setError('');
    
    try {
      // Get text from OCR results or use placeholder
      let documentText = '';
      
      if (ocrResults && ocrResults.length > 0) {
        documentText = ocrResults.join('\n\n');
      } else {
        documentText = `Document: ${currentDocument.name}\n\nThis is a PDF document that needs to be processed with OCR first to extract text for summarization. Please run OCR on this document before generating a summary.`;
      }

      // Call the Supabase Edge Function
      const { data, error: functionError } = await supabase.functions.invoke('summarize-pdf', {
        body: {
          text: documentText,
          provider: provider,
          maxLength: 10000, // Limit text length to avoid token limits
        },
      });

      if (functionError) {
        throw functionError;
      }

      if (data.error) {
        throw new Error(data.error);
      }

      setSummary(data.summary);
      Alert.alert('Success', 'Summary generated successfully!');
    } catch (err: any) {
      console.error('Error generating summary:', err);
      const errorMessage = err.message || 'Failed to generate summary. Please try again.';
      setError(errorMessage);
      Alert.alert('Error', errorMessage);
    } finally {
      setProcessing(false);
    }
  };

  const handleExportSummary = () => {
    if (!summary) {
      Alert.alert('No Summary', 'Please generate a summary first.');
      return;
    }
    router.push('/export-summary');
  };

  const handleShare = () => {
    if (!summary) {
      Alert.alert('No Summary', 'Please generate a summary first.');
      return;
    }
    Alert.alert('Share', 'Share functionality coming soon!');
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Summarize PDF',
          headerBackTitle: 'Back',
          headerRight: () => (
            <Pressable onPress={handleShare} style={styles.headerButton}>
              <IconSymbol name="square.and.arrow.up" size={22} color={colors.primary} />
            </Pressable>
          ),
        }}
      />

      <View style={commonStyles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.infoCard}>
            <IconSymbol name="doc.text.magnifyingglass" size={48} color={colors.primary} />
            <Text style={styles.infoTitle}>AI-Powered Summarization</Text>
            <Text style={styles.infoText}>
              Generate concise summaries of your PDF documents using advanced AI technology.
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
                  {currentDocument.pageCount ? `${currentDocument.pageCount} pages` : 'PDF Document'}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>AI Provider</Text>
            <View style={styles.optionCard}>
              <View style={styles.optionButtons}>
                <Pressable 
                  style={[styles.optionButton, provider === 'openrouter' && styles.optionButtonActive]}
                  onPress={() => setProvider('openrouter')}
                >
                  <IconSymbol 
                    name="cpu" 
                    size={20} 
                    color={provider === 'openrouter' ? colors.primary : colors.textSecondary} 
                  />
                  <Text style={[
                    styles.optionButtonText, 
                    provider === 'openrouter' && styles.optionButtonTextActive
                  ]}>
                    OpenRouter
                  </Text>
                </Pressable>
                <Pressable 
                  style={[styles.optionButton, provider === 'gemini' && styles.optionButtonActive]}
                  onPress={() => setProvider('gemini')}
                >
                  <IconSymbol 
                    name="sparkles" 
                    size={20} 
                    color={provider === 'gemini' ? colors.primary : colors.textSecondary} 
                  />
                  <Text style={[
                    styles.optionButtonText, 
                    provider === 'gemini' && styles.optionButtonTextActive
                  ]}>
                    Gemini
                  </Text>
                </Pressable>
              </View>
            </View>
          </View>

          {!ocrResults || ocrResults.length === 0 ? (
            <View style={styles.warningCard}>
              <IconSymbol name="exclamationmark.triangle.fill" size={24} color={colors.warning} />
              <Text style={styles.warningText}>
                No text extracted yet. Run OCR first to extract text from your PDF for better summarization results.
              </Text>
              <Pressable
                style={[buttonStyles.accent, styles.ocrButton]}
                onPress={() => router.push('/ocr')}
              >
                <Text style={commonStyles.buttonText}>Run OCR</Text>
              </Pressable>
            </View>
          ) : null}

          {!processing && !summary && (
            <Pressable
              style={[buttonStyles.primary, styles.actionButton]}
              onPress={generateSummary}
            >
              <IconSymbol name="sparkles" size={20} color="#FFFFFF" style={styles.buttonIcon} />
              <Text style={commonStyles.buttonText}>Generate Summary</Text>
            </Pressable>
          )}

          {processing && (
            <View style={styles.progressCard}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={styles.progressText}>Generating summary with {provider === 'openrouter' ? 'OpenRouter' : 'Gemini'}...</Text>
              <Text style={styles.progressSubtext}>This may take a moment</Text>
            </View>
          )}

          {error && (
            <View style={styles.errorCard}>
              <IconSymbol name="xmark.circle.fill" size={24} color={colors.error} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {summary && (
            <View style={styles.resultSection}>
              <View style={styles.resultHeader}>
                <Text style={styles.sectionTitle}>Summary</Text>
                <View style={styles.resultBadge}>
                  <IconSymbol name="checkmark.circle.fill" size={16} color={colors.success} />
                  <Text style={styles.resultBadgeText}>Complete</Text>
                </View>
              </View>
              
              <View style={styles.summaryCard}>
                <ScrollView style={styles.summaryScroll} nestedScrollEnabled>
                  <Text style={styles.summaryText}>{summary}</Text>
                </ScrollView>
              </View>

              <View style={styles.actionRow}>
                <Pressable
                  style={[buttonStyles.accent, styles.halfButton]}
                  onPress={generateSummary}
                >
                  <IconSymbol name="arrow.clockwise" size={18} color="#FFFFFF" />
                  <Text style={[commonStyles.buttonText, styles.halfButtonText]}>Regenerate</Text>
                </Pressable>

                <Pressable
                  style={[buttonStyles.primary, styles.halfButton]}
                  onPress={handleExportSummary}
                >
                  <IconSymbol name="square.and.arrow.down" size={18} color="#FFFFFF" />
                  <Text style={[commonStyles.buttonText, styles.halfButtonText]}>Export</Text>
                </Pressable>
              </View>
            </View>
          )}

          <View style={styles.featureNote}>
            <IconSymbol name="info.circle" size={20} color={colors.success} />
            <Text style={styles.featureNoteText}>
              AI summarization is now powered by {provider === 'openrouter' ? 'OpenRouter' : 'Google Gemini'} API for accurate, intelligent summaries.
            </Text>
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
  headerButton: {
    padding: 8,
    marginRight: 8,
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
  optionCard: {
    ...commonStyles.card,
    marginHorizontal: 0,
  },
  optionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  optionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: colors.border,
  },
  optionButtonActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '10',
  },
  optionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  optionButtonTextActive: {
    color: colors.primary,
  },
  warningCard: {
    ...commonStyles.card,
    alignItems: 'center',
    marginHorizontal: 0,
    marginBottom: 20,
    backgroundColor: colors.warning + '15',
    borderWidth: 1,
    borderColor: colors.warning + '40',
  },
  warningText: {
    fontSize: 14,
    color: colors.text,
    textAlign: 'center',
    lineHeight: 20,
    marginVertical: 12,
  },
  ocrButton: {
    marginTop: 8,
    paddingHorizontal: 24,
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
    marginBottom: 4,
  },
  progressSubtext: {
    fontSize: 14,
    color: colors.textSecondary,
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
  errorText: {
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
  resultBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.success + '20',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  resultBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.success,
    marginLeft: 4,
  },
  summaryCard: {
    ...commonStyles.card,
    marginHorizontal: 0,
    maxHeight: 400,
  },
  summaryScroll: {
    maxHeight: 380,
  },
  summaryText: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 22,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  halfButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  halfButtonText: {
    fontSize: 14,
  },
  featureNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.success + '20',
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
