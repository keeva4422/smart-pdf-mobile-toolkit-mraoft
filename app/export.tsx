
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Alert } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import * as Sharing from 'expo-sharing';
import { IconSymbol } from '@/components/IconSymbol';
import { colors, commonStyles, buttonStyles } from '@/styles/commonStyles';
import { usePDF } from '@/contexts/PDFContext';

export default function ExportScreen() {
  const router = useRouter();
  const { currentDocument, annotations } = usePDF();
  const [exporting, setExporting] = useState(false);

  if (!currentDocument) {
    router.replace('/(tabs)/(home)');
    return null;
  }

  const handleExportPDF = async () => {
    setExporting(true);
    
    // Simulate export process
    setTimeout(async () => {
      setExporting(false);
      Alert.alert(
        'Export Complete',
        'Your edited PDF has been saved successfully!',
        [
          { text: 'OK', onPress: () => router.back() }
        ]
      );
    }, 1500);
  };

  const handleShare = async () => {
    try {
      const isAvailable = await Sharing.isAvailableAsync();
      if (!isAvailable) {
        Alert.alert('Error', 'Sharing is not available on this device');
        return;
      }
      
      Alert.alert('Share', 'Share functionality will be available in the full version!');
    } catch (error) {
      console.error('Share error:', error);
      Alert.alert('Error', 'Failed to share file');
    }
  };

  const exportOptions = [
    {
      id: 'pdf',
      title: 'Export as PDF',
      description: 'Save with all annotations',
      icon: 'doc.fill',
      color: colors.primary,
    },
    {
      id: 'share',
      title: 'Share Document',
      description: 'Send via WhatsApp, Email, etc.',
      icon: 'square.and.arrow.up',
      color: colors.accent,
    },
    {
      id: 'cloud',
      title: 'Save to Cloud',
      description: 'Upload to Google Drive or iCloud',
      icon: 'icloud.and.arrow.up',
      color: colors.secondary,
    },
  ];

  const handleOptionPress = (optionId: string) => {
    switch (optionId) {
      case 'pdf':
        handleExportPDF();
        break;
      case 'share':
        handleShare();
        break;
      case 'cloud':
        Alert.alert('Cloud Storage', 'Cloud storage integration coming soon!');
        break;
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Export PDF',
          headerBackTitle: 'Back',
        }}
      />

      <View style={commonStyles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.infoCard}>
            <IconSymbol name="square.and.arrow.down" size={48} color={colors.success} />
            <Text style={styles.infoTitle}>Export Your Document</Text>
            <Text style={styles.infoText}>
              Save or share your edited PDF with annotations and highlights.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Document Preview</Text>
            <View style={styles.previewCard}>
              <IconSymbol name="doc.fill" size={40} color={colors.primary} />
              <View style={styles.previewInfo}>
                <Text style={styles.previewName} numberOfLines={1}>
                  {currentDocument.name}
                </Text>
                <Text style={styles.previewMeta}>
                  {annotations.length} annotation{annotations.length !== 1 ? 's' : ''}
                </Text>
              </View>
              <View style={styles.previewBadge}>
                <IconSymbol name="checkmark.circle.fill" size={20} color={colors.success} />
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Export Options</Text>
            {exportOptions.map((option) => (
              <Pressable
                key={option.id}
                style={styles.optionCard}
                onPress={() => handleOptionPress(option.id)}
              >
                <View style={[styles.optionIcon, { backgroundColor: option.color + '20' }]}>
                  <IconSymbol name={option.icon as any} size={28} color={option.color} />
                </View>
                <View style={styles.optionContent}>
                  <Text style={styles.optionTitle}>{option.title}</Text>
                  <Text style={styles.optionDescription}>{option.description}</Text>
                </View>
                <IconSymbol name="chevron.right" size={20} color={colors.textSecondary} />
              </Pressable>
            ))}
          </View>

          <View style={styles.statsCard}>
            <Text style={styles.statsTitle}>Export Statistics</Text>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{currentDocument.pageCount || '—'}</Text>
                <Text style={styles.statLabel}>Pages</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{annotations.length}</Text>
                <Text style={styles.statLabel}>Annotations</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>
                  {(currentDocument.size / (1024 * 1024)).toFixed(1)}
                </Text>
                <Text style={styles.statLabel}>MB</Text>
              </View>
            </View>
          </View>

          <View style={styles.featureNote}>
            <IconSymbol name="info.circle" size={20} color={colors.accent} />
            <Text style={styles.featureNoteText}>
              Exported PDFs will include all your annotations, highlights, and edits. Original files remain unchanged.
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
  previewCard: {
    ...commonStyles.card,
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 0,
  },
  previewInfo: {
    flex: 1,
    marginLeft: 12,
  },
  previewName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  previewMeta: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  previewBadge: {
    marginLeft: 12,
  },
  optionCard: {
    ...commonStyles.card,
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 0,
    marginBottom: 12,
  },
  optionIcon: {
    width: 56,
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  statsCard: {
    ...commonStyles.card,
    marginHorizontal: 0,
  },
  statsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
    textAlign: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    textTransform: 'uppercase',
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: colors.border,
  },
  featureNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.accent + '20',
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
  },
  featureNoteText: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
    marginLeft: 12,
    flex: 1,
  },
});
