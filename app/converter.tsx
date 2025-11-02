
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Alert, ActivityIndicator } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { IconSymbol } from '@/components/IconSymbol';
import { colors, commonStyles, buttonStyles } from '@/styles/commonStyles';
import { usePDF } from '@/contexts/PDFContext';
import AdBanner from '@/components/AdBanner';

export default function ConverterScreen() {
  const router = useRouter();
  const { currentDocument } = usePDF();
  const [converting, setConverting] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState<string | null>(null);

  if (!currentDocument) {
    router.replace('/(tabs)/(home)/');
    return null;
  }

  const conversionFormats = [
    {
      id: 'txt',
      title: 'Plain Text',
      description: 'Convert to .TXT format',
      icon: 'doc.text',
      color: colors.primary,
      extension: '.txt',
    },
    {
      id: 'docx',
      title: 'Word Document',
      description: 'Convert to .DOCX format',
      icon: 'doc.richtext',
      color: '#2B579A',
      extension: '.docx',
    },
    {
      id: 'pdf',
      title: 'PDF (Optimized)',
      description: 'Compress and optimize PDF',
      icon: 'doc.fill',
      color: colors.error,
      extension: '.pdf',
    },
    {
      id: 'html',
      title: 'HTML',
      description: 'Convert to web format',
      icon: 'globe',
      color: colors.accent,
      extension: '.html',
    },
    {
      id: 'markdown',
      title: 'Markdown',
      description: 'Convert to .MD format',
      icon: 'text.alignleft',
      color: colors.secondary,
      extension: '.md',
    },
    {
      id: 'epub',
      title: 'EPUB',
      description: 'Convert to eBook format',
      icon: 'book.fill',
      color: '#FF6B35',
      extension: '.epub',
    },
  ];

  const handleConvert = async (formatId: string) => {
    setSelectedFormat(formatId);
    setConverting(true);

    // Simulate conversion process
    setTimeout(() => {
      setConverting(false);
      Alert.alert(
        'Conversion Complete',
        `Your document has been converted to ${formatId.toUpperCase()} format successfully!`,
        [
          {
            text: 'Download',
            onPress: () => {
              Alert.alert('Success', 'File downloaded to your device');
            },
          },
          {
            text: 'Share',
            onPress: () => {
              Alert.alert('Share', 'Share functionality will open here');
            },
          },
        ]
      );
      setSelectedFormat(null);
    }, 2500);
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Document Converter',
          headerBackTitle: 'Back',
          headerLeft: () => (
            <Pressable
              style={styles.backButton}
              onPress={() => router.push('/(tabs)/(home)/')}
            >
              <IconSymbol name="house.fill" size={22} color={colors.primary} />
            </Pressable>
          ),
        }}
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.infoCard}>
          <IconSymbol name="arrow.triangle.2.circlepath" size={48} color={colors.accent} />
          <Text style={styles.infoTitle}>Multi-Format Converter</Text>
          <Text style={styles.infoText}>
            Convert your PDF document to various formats for different use cases.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Current Document</Text>
          <View style={styles.documentCard}>
            <IconSymbol name="doc.fill" size={32} color={colors.primary} />
            <View style={styles.documentInfo}>
              <Text style={styles.documentName} numberOfLines={1}>
                {currentDocument.name}
              </Text>
              <Text style={styles.documentMeta}>
                {(currentDocument.size / (1024 * 1024)).toFixed(2)} MB
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Convert To</Text>
          <View style={styles.formatsGrid}>
            {conversionFormats.map((format) => (
              <Pressable
                key={format.id}
                style={[
                  styles.formatCard,
                  selectedFormat === format.id && converting && styles.formatCardActive,
                ]}
                onPress={() => handleConvert(format.id)}
                disabled={converting}
              >
                <View style={[styles.formatIcon, { backgroundColor: format.color + '20' }]}>
                  <IconSymbol name={format.icon as any} size={28} color={format.color} />
                </View>
                <Text style={styles.formatTitle}>{format.title}</Text>
                <Text style={styles.formatDescription}>{format.description}</Text>
                <Text style={styles.formatExtension}>{format.extension}</Text>
                
                {selectedFormat === format.id && converting && (
                  <View style={styles.convertingOverlay}>
                    <ActivityIndicator size="small" color={colors.primary} />
                  </View>
                )}
              </Pressable>
            ))}
          </View>
        </View>

        {converting && (
          <View style={styles.progressCard}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.progressText}>Converting document...</Text>
            <Text style={styles.progressSubtext}>This may take a moment</Text>
          </View>
        )}

        <View style={styles.featureNote}>
          <IconSymbol name="info.circle" size={20} color={colors.success} />
          <Text style={styles.featureNoteText}>
            All conversions are processed securely. Original files remain unchanged.
          </Text>
        </View>
      </ScrollView>

      <AdBanner position="bottom" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  backButton: {
    marginLeft: 12,
    padding: 8,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
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
    marginBottom: 24,
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
  formatsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  formatCard: {
    width: '48%',
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.08)',
    elevation: 2,
    position: 'relative',
  },
  formatCardActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '10',
  },
  formatIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  formatTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
    textAlign: 'center',
  },
  formatDescription: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 8,
  },
  formatExtension: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.primary,
    backgroundColor: colors.primary + '15',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  convertingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
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
  featureNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.success + '20',
    borderRadius: 12,
    padding: 16,
  },
  featureNoteText: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
    marginLeft: 12,
    flex: 1,
  },
});
