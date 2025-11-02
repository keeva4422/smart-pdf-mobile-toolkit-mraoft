
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Alert } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { IconSymbol } from '@/components/IconSymbol';
import { colors, commonStyles, buttonStyles } from '@/styles/commonStyles';
import { usePDF } from '@/contexts/PDFContext';

export default function EditScreen() {
  const router = useRouter();
  const { currentDocument, annotations } = usePDF();
  const [selectedTool, setSelectedTool] = useState<'highlight' | 'text' | 'eraser' | null>(null);

  if (!currentDocument) {
    router.replace('/(tabs)/(home)');
    return null;
  }

  const tools = [
    { id: 'highlight', name: 'Highlight', icon: 'highlighter', color: colors.highlight },
    { id: 'text', name: 'Text', icon: 'text.cursor', color: colors.primary },
    { id: 'eraser', name: 'Eraser', icon: 'eraser.fill', color: colors.error },
  ];

  const handleToolSelect = (toolId: string) => {
    setSelectedTool(toolId as any);
    Alert.alert('Tool Selected', `${toolId} tool is now active. This feature is coming soon!`);
  };

  const handleUndo = () => {
    Alert.alert('Undo', 'Undo functionality coming soon!');
  };

  const handleRedo = () => {
    Alert.alert('Redo', 'Redo functionality coming soon!');
  };

  const handleSave = () => {
    Alert.alert('Save', 'Your edits will be saved. This feature is coming soon!');
  };

  const handleExport = () => {
    router.push('/export');
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Edit PDF',
          headerBackTitle: 'Back',
          headerRight: () => (
            <Pressable onPress={handleSave} style={styles.headerButton}>
              <Text style={styles.saveButtonText}>Save</Text>
            </Pressable>
          ),
        }}
      />

      <View style={commonStyles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.infoCard}>
            <IconSymbol name="pencil.tip.crop.circle" size={48} color={colors.secondary} />
            <Text style={styles.infoTitle}>PDF Editor</Text>
            <Text style={styles.infoText}>
              Annotate, highlight, and add comments to your PDF document.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Editing Tools</Text>
            <View style={styles.toolsGrid}>
              {tools.map((tool) => (
                <Pressable
                  key={tool.id}
                  style={[
                    styles.toolCard,
                    selectedTool === tool.id && styles.toolCardActive,
                  ]}
                  onPress={() => handleToolSelect(tool.id)}
                >
                  <IconSymbol name={tool.icon as any} size={32} color={tool.color} />
                  <Text style={styles.toolName}>{tool.name}</Text>
                </Pressable>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Actions</Text>
            <View style={styles.actionsRow}>
              <Pressable style={styles.actionButton} onPress={handleUndo}>
                <IconSymbol name="arrow.uturn.backward" size={24} color={colors.primary} />
                <Text style={styles.actionText}>Undo</Text>
              </Pressable>

              <Pressable style={styles.actionButton} onPress={handleRedo}>
                <IconSymbol name="arrow.uturn.forward" size={24} color={colors.primary} />
                <Text style={styles.actionText}>Redo</Text>
              </Pressable>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Document Info</Text>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>File Name:</Text>
              <Text style={styles.infoValue} numberOfLines={1}>
                {currentDocument.name}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Annotations:</Text>
              <Text style={styles.infoValue}>{annotations.length}</Text>
            </View>
          </View>

          <Pressable
            style={[buttonStyles.primary, styles.exportButton]}
            onPress={handleExport}
          >
            <IconSymbol name="square.and.arrow.down" size={20} color="#FFFFFF" style={styles.buttonIcon} />
            <Text style={commonStyles.buttonText}>Export Edited PDF</Text>
          </Pressable>

          <View style={styles.featureNote}>
            <IconSymbol name="info.circle" size={20} color={colors.accent} />
            <Text style={styles.featureNoteText}>
              Full editing features are under development. Stay tuned for updates!
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
    marginRight: 16,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
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
  toolsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  toolCard: {
    width: '31%',
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.08)',
    elevation: 2,
  },
  toolCardActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '10',
  },
  toolName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginTop: 8,
    textAlign: 'center',
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  actionButton: {
    alignItems: 'center',
    padding: 16,
    backgroundColor: colors.card,
    borderRadius: 12,
    width: '45%',
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.08)',
    elevation: 2,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginTop: 8,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  infoValue: {
    fontSize: 14,
    color: colors.text,
    flex: 1,
    textAlign: 'right',
    marginLeft: 12,
  },
  exportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
  },
  buttonIcon: {
    marginRight: 8,
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
