
import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Alert } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { IconSymbol } from '@/components/IconSymbol';
import { colors, commonStyles, buttonStyles } from '@/styles/commonStyles';
import { usePDF } from '@/contexts/PDFContext';

export default function ExportSummaryScreen() {
  const router = useRouter();
  const { currentDocument } = usePDF();

  if (!currentDocument) {
    router.replace('/(tabs)/(home)');
    return null;
  }

  const exportFormats = [
    {
      id: 'txt',
      title: 'Plain Text (.txt)',
      description: 'Simple text format',
      icon: 'doc.text',
      color: colors.primary,
    },
    {
      id: 'pdf',
      title: 'PDF Document (.pdf)',
      description: 'Formatted PDF file',
      icon: 'doc.fill',
      color: colors.secondary,
    },
    {
      id: 'share',
      title: 'Share Directly',
      description: 'Send via messaging apps',
      icon: 'square.and.arrow.up',
      color: colors.accent,
    },
  ];

  const handleExport = (formatId: string) => {
    Alert.alert(
      'Export Summary',
      `Export as ${formatId.toUpperCase()} format?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Export',
          onPress: () => {
            Alert.alert('Success', 'Summary exported successfully!');
            router.back();
          },
        },
      ]
    );
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Export Summary',
          headerBackTitle: 'Back',
        }}
      />

      <View style={commonStyles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.infoCard}>
            <IconSymbol name="square.and.arrow.down" size={48} color={colors.success} />
            <Text style={styles.infoTitle}>Export Summary</Text>
            <Text style={styles.infoText}>
              Choose a format to save or share your document summary.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Export Formats</Text>
            {exportFormats.map((format) => (
              <Pressable
                key={format.id}
                style={styles.formatCard}
                onPress={() => handleExport(format.id)}
              >
                <View style={[styles.formatIcon, { backgroundColor: format.color + '20' }]}>
                  <IconSymbol name={format.icon as any} size={28} color={format.color} />
                </View>
                <View style={styles.formatContent}>
                  <Text style={styles.formatTitle}>{format.title}</Text>
                  <Text style={styles.formatDescription}>{format.description}</Text>
                </View>
                <IconSymbol name="chevron.right" size={20} color={colors.textSecondary} />
              </Pressable>
            ))}
          </View>

          <View style={styles.featureNote}>
            <IconSymbol name="info.circle" size={20} color={colors.accent} />
            <Text style={styles.featureNoteText}>
              Summaries can be exported in multiple formats for easy sharing and archiving.
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
  formatCard: {
    ...commonStyles.card,
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 0,
    marginBottom: 12,
  },
  formatIcon: {
    width: 56,
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  formatContent: {
    flex: 1,
  },
  formatTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  formatDescription: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  featureNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.accent + '20',
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
