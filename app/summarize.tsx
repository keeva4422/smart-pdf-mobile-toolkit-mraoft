
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator, Alert, TextInput } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { IconSymbol } from '@/components/IconSymbol';
import { colors, commonStyles, buttonStyles } from '@/styles/commonStyles';
import { usePDF } from '@/contexts/PDFContext';

export default function SummarizeScreen() {
  const router = useRouter();
  const { currentDocument, ocrResults } = usePDF();
  const [processing, setProcessing] = useState(false);
  const [summary, setSummary] = useState('');
  const [pageRange, setPageRange] = useState({ start: 1, end: 1 });

  if (!currentDocument) {
    router.replace('/(tabs)/(home)');
    return null;
  }

  const generateSummary = async () => {
    setProcessing(true);
    
    // Simulate AI summarization
    setTimeout(() => {
      const mockSummary = `This document "${currentDocument.name}" contains important information across multiple pages. 

Key Points:
- The document discusses various topics related to the subject matter
- Important findings and conclusions are presented
- Recommendations and next steps are outlined

Summary:
The content provides a comprehensive overview of the topic, with detailed analysis and supporting evidence. The document is well-structured and presents information in a clear, logical manner.

This is a demonstration summary. In the full version, this would use AI to generate actual summaries from the document text.`;
      
      setSummary(mockSummary);
      setProcessing(false);
      Alert.alert('Success', 'Summary generated successfully!');
    }, 2000);
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
            <Text style={styles.sectionTitle}>Options</Text>
            <View style={styles.optionCard}>
              <Text style={styles.optionLabel}>Summarize:</Text>
              <View style={styles.optionButtons}>
                <Pressable style={[styles.optionButton, styles.optionButtonActive]}>
                  <Text style={[styles.optionButtonText, styles.optionButtonTextActive]}>
                    Full Document
                  </Text>
                </Pressable>
                <Pressable style={styles.optionButton}>
                  <Text style={styles.optionButtonText}>Selected Pages</Text>
                </Pressable>
              </View>
            </View>
          </View>

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
              <Text style={styles.progressText}>Generating summary...</Text>
              <Text style={styles.progressSubtext}>This may take a moment</Text>
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
            <IconSymbol name="info.circle" size={20} color={colors.accent} />
            <Text style={styles.featureNoteText}>
              This demo uses simulated AI. The full version will integrate with ApyHub API or local summarization models for accurate results.
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
  optionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  optionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  optionButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
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
    backgroundColor: colors.accent + '20',
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
