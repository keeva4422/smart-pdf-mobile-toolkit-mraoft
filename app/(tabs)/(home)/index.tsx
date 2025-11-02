
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Alert, Platform } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import * as DocumentPicker from 'expo-document-picker';
import { IconSymbol } from '@/components/IconSymbol';
import { RecentFileCard } from '@/components/RecentFileCard';
import { colors, commonStyles, buttonStyles } from '@/styles/commonStyles';
import { usePDF } from '@/contexts/PDFContext';
import { PDFDocument } from '@/types/pdf';

export default function HomeScreen() {
  const router = useRouter();
  const { recentFiles, loadRecentFiles, addRecentFile, removeRecentFile, setCurrentDocument } = usePDF();
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    loadRecentFiles();
  }, []);

  const handleOpenPDF = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
        copyToCacheDirectory: true,
      });

      console.log('Document picker result:', result);

      if (result.canceled) {
        console.log('Document picker was cancelled');
        return;
      }

      if (result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        const pdfDoc: PDFDocument = {
          id: Date.now().toString(),
          name: asset.name,
          uri: asset.uri,
          size: asset.size || 0,
          mimeType: asset.mimeType || 'application/pdf',
          dateAdded: Date.now(),
        };

        console.log('PDF document created:', pdfDoc);
        
        await addRecentFile(pdfDoc);
        setCurrentDocument(pdfDoc);
        router.push('/viewer');
      }
    } catch (error) {
      console.error('Error picking document:', error);
      Alert.alert('Error', 'Failed to open PDF file. Please try again.');
    }
  };

  const handleFilePress = (file: PDFDocument) => {
    console.log('Opening file:', file.name);
    setCurrentDocument(file);
    addRecentFile(file);
    router.push('/viewer');
  };

  const handleDeleteFile = (fileId: string) => {
    Alert.alert(
      'Delete File',
      'Remove this file from recent files?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => removeRecentFile(fileId),
        },
      ]
    );
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    Alert.alert('Dark Mode', 'Dark mode toggle is coming soon!');
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: 'SmartPDF Toolkit',
          headerRight: () => (
            <Pressable onPress={toggleDarkMode} style={styles.headerButton}>
              <IconSymbol
                name={darkMode ? 'sun.max.fill' : 'moon.fill'}
                size={22}
                color={colors.primary}
              />
            </Pressable>
          ),
        }}
      />
      
      <View style={commonStyles.container}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.heroSection}>
            <View style={styles.iconCircle}>
              <IconSymbol name="doc.text.fill" size={48} color={colors.primary} />
            </View>
            <Text style={styles.heroTitle}>SmartPDF Toolkit</Text>
            <Text style={styles.heroSubtitle}>
              View, scan, edit, and summarize PDFs on your mobile device
            </Text>
          </View>

          <View style={styles.actionSection}>
            <Pressable
              style={[buttonStyles.primary, styles.primaryButton]}
              onPress={handleOpenPDF}
            >
              <IconSymbol name="doc.badge.plus" size={24} color="#FFFFFF" style={styles.buttonIcon} />
              <Text style={styles.primaryButtonText}>Open PDF</Text>
            </Pressable>

            <View style={styles.featureGrid}>
              <View style={styles.featureCard}>
                <IconSymbol name="doc.text.viewfinder" size={32} color={colors.accent} />
                <Text style={styles.featureTitle}>OCR</Text>
                <Text style={styles.featureDescription}>Extract text from images</Text>
              </View>

              <View style={styles.featureCard}>
                <IconSymbol name="pencil.tip.crop.circle" size={32} color={colors.secondary} />
                <Text style={styles.featureTitle}>Edit</Text>
                <Text style={styles.featureDescription}>Annotate & highlight</Text>
              </View>

              <View style={styles.featureCard}>
                <IconSymbol name="doc.text.magnifyingglass" size={32} color={colors.primary} />
                <Text style={styles.featureTitle}>Summarize</Text>
                <Text style={styles.featureDescription}>AI-powered summaries</Text>
              </View>

              <View style={styles.featureCard}>
                <IconSymbol name="square.and.arrow.up" size={32} color={colors.success} />
                <Text style={styles.featureTitle}>Export</Text>
                <Text style={styles.featureDescription}>Share & save</Text>
              </View>
            </View>
          </View>

          {recentFiles.length > 0 && (
            <View style={styles.recentSection}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Recent Files</Text>
                <Text style={styles.sectionCount}>{recentFiles.length}</Text>
              </View>
              
              {recentFiles.map((file) => (
                <RecentFileCard
                  key={file.id}
                  file={file}
                  onPress={() => handleFilePress(file)}
                  onDelete={() => handleDeleteFile(file.id)}
                />
              ))}
            </View>
          )}

          {recentFiles.length === 0 && (
            <View style={styles.emptyState}>
              <IconSymbol name="doc.text" size={64} color={colors.textSecondary} />
              <Text style={styles.emptyStateText}>No recent files</Text>
              <Text style={styles.emptyStateSubtext}>
                Open a PDF to get started
              </Text>
            </View>
          )}
        </ScrollView>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: Platform.OS === 'ios' ? 20 : 100,
  },
  heroSection: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 20,
  },
  iconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  heroSubtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  actionSection: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  buttonIcon: {
    marginRight: 8,
  },
  primaryButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  featureGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  featureCard: {
    width: '48%',
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.08)',
    elevation: 2,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginTop: 8,
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  recentSection: {
    marginTop: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  sectionCount: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
    backgroundColor: colors.primary + '20',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
    paddingHorizontal: 20,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginTop: 16,
    marginBottom: 4,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  headerButton: {
    padding: 8,
    marginRight: 8,
  },
});
