
import React, { useEffect, useState, useCallback } from 'react';
import { PDFDocument } from '@/types/pdf';
import { colors, commonStyles, buttonStyles } from '@/styles/commonStyles';
import { View, Text, StyleSheet, ScrollView, Pressable, Alert, Platform } from 'react-native';
import { usePDF } from '@/contexts/PDFContext';
import { useAuth } from '@/contexts/AuthContext';
import { Stack, useRouter } from 'expo-router';
import * as DocumentPicker from 'expo-document-picker';
import { RecentFileCard } from '@/components/RecentFileCard';
import { IconSymbol } from '@/components/IconSymbol';
import { supabase } from '@/app/integrations/supabase/client';

export default function HomeScreen() {
  const { currentDocument, recentFiles, setCurrentDocument, loadRecentFiles, addRecentFile, removeRecentFile } = usePDF();
  const { user, signOut } = useAuth();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const router = useRouter();

  const loadUserDocuments = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('pdf_documents')
        .select('*')
        .order('last_opened', { ascending: false })
        .limit(10);

      if (error) {
        console.error('Error loading documents:', error);
        return;
      }

      console.log('Loaded documents:', data);
    } catch (error) {
      console.error('Exception loading documents:', error);
    }
  }, [user]);

  useEffect(() => {
    loadRecentFiles();
    loadUserDocuments();
  }, [loadRecentFiles, loadUserDocuments]);

  const handleOpenPDF = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
        copyToCacheDirectory: true,
      });

      if (result.canceled) {
        console.log('Document picker cancelled');
        return;
      }

      const file = result.assets[0];
      const pdfDoc: PDFDocument = {
        id: Date.now().toString(),
        name: file.name,
        uri: file.uri,
        size: file.size || 0,
        mimeType: 'application/pdf',
        dateAdded: Date.now(),
        pageCount: 0,
        lastOpened: Date.now(),
      };

      setCurrentDocument(pdfDoc);
      await addRecentFile(pdfDoc);

      // Save to Supabase if user is logged in
      if (user) {
        try {
          const { error } = await supabase
            .from('pdf_documents')
            .insert({
              user_id: user.id,
              name: pdfDoc.name,
              uri: pdfDoc.uri,
              size: pdfDoc.size,
              page_count: pdfDoc.pageCount,
            });

          if (error) {
            console.error('Error saving document to Supabase:', error);
          }
        } catch (error) {
          console.error('Exception saving document:', error);
        }
      }

      router.push('/viewer');
    } catch (error) {
      console.error('Error picking document:', error);
      Alert.alert('Error', 'Failed to open PDF file');
    }
  };

  const handleFilePress = (file: PDFDocument) => {
    setCurrentDocument(file);
    router.push('/viewer');
  };

  const handleDeleteFile = async (fileId: string) => {
    Alert.alert(
      'Delete File',
      'Are you sure you want to remove this file from recent files?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            // Delete from local storage
            await removeRecentFile(fileId);

            // Delete from Supabase if user is logged in
            if (user) {
              try {
                const { error } = await supabase
                  .from('pdf_documents')
                  .delete()
                  .eq('id', fileId);

                if (error) {
                  console.error('Error deleting document from Supabase:', error);
                }
              } catch (error) {
                console.error('Exception deleting document:', error);
              }
            }

            loadRecentFiles();
          },
        },
      ]
    );
  };

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    // TODO: Implement dark mode toggle
  };

  const handleSignOut = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            await signOut();
            router.replace('/(auth)/login');
          },
        },
      ]
    );
  };

  const handleOpenChat = () => {
    router.push('/chat');
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: 'SmartPDF Toolkit',
          headerShown: true,
          headerStyle: {
            backgroundColor: colors.background,
          },
          headerTintColor: colors.text,
          headerShadowVisible: false,
          headerRight: () => (
            <Pressable onPress={handleOpenChat} style={styles.chatButton}>
              <IconSymbol name="message.fill" size={24} color={colors.primary} />
            </Pressable>
          ),
        }}
      />

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Welcome Section */}
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeText}>Welcome back!</Text>
          <Text style={styles.userEmail}>{user?.email}</Text>
        </View>

        {/* AI Assistant Banner */}
        <Pressable style={styles.aiBanner} onPress={handleOpenChat}>
          <View style={styles.aiBannerIcon}>
            <IconSymbol name="sparkles" size={32} color={colors.accent} />
          </View>
          <View style={styles.aiBannerContent}>
            <Text style={styles.aiBannerTitle}>AI Assistant</Text>
            <Text style={styles.aiBannerText}>
              Get help with document analysis, summaries, and more
            </Text>
          </View>
          <IconSymbol name="chevron.right" size={20} color={colors.textSecondary} />
        </Pressable>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Pressable style={[buttonStyles.primary, styles.openButton]} onPress={handleOpenPDF}>
            <IconSymbol name="plus.circle.fill" size={24} color={colors.buttonText} />
            <Text style={[buttonStyles.primaryText, styles.openButtonText]}>Open PDF</Text>
          </Pressable>
        </View>

        {/* Recent Files */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Files</Text>
            {recentFiles.length > 0 && (
              <Pressable onPress={loadRecentFiles}>
                <IconSymbol name="arrow.clockwise" size={20} color={colors.primary} />
              </Pressable>
            )}
          </View>

          {recentFiles.length === 0 ? (
            <View style={styles.emptyState}>
              <IconSymbol name="document" size={48} color={colors.textSecondary} />
              <Text style={styles.emptyStateText}>No recent files</Text>
              <Text style={styles.emptyStateSubtext}>Open a PDF to get started</Text>
            </View>
          ) : (
            <View style={styles.filesList}>
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
        </View>

        {/* Features Overview */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Features</Text>
          <View style={styles.featuresGrid}>
            <View style={styles.featureCard}>
              <IconSymbol name="eye.fill" size={32} color={colors.primary} />
              <Text style={styles.featureTitle}>View PDFs</Text>
              <Text style={styles.featureDescription}>
                Open and navigate through PDF documents
              </Text>
            </View>

            <View style={styles.featureCard}>
              <IconSymbol name="text.viewfinder" size={32} color={colors.primary} />
              <Text style={styles.featureTitle}>OCR</Text>
              <Text style={styles.featureDescription}>
                Extract text from scanned documents
              </Text>
            </View>

            <View style={styles.featureCard}>
              <IconSymbol name="pencil" size={32} color={colors.primary} />
              <Text style={styles.featureTitle}>Edit</Text>
              <Text style={styles.featureDescription}>
                Annotate and highlight PDFs
              </Text>
            </View>

            <View style={styles.featureCard}>
              <IconSymbol name="doc.text.fill" size={32} color={colors.primary} />
              <Text style={styles.featureTitle}>Summarize</Text>
              <Text style={styles.featureDescription}>
                AI-powered document summaries
              </Text>
            </View>
          </View>
        </View>

        {/* Sign Out Button */}
        <View style={styles.section}>
          <Pressable style={[buttonStyles.secondary, styles.signOutButton]} onPress={handleSignOut}>
            <IconSymbol name="arrow.right.square" size={20} color={colors.buttonText} />
            <Text style={[buttonStyles.primaryText, styles.signOutText]}>Sign Out</Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  chatButton: {
    marginRight: 16,
    padding: 8,
  },
  welcomeSection: {
    marginBottom: 24,
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  aiBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.accent + '15',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: colors.accent + '30',
  },
  aiBannerIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  aiBannerContent: {
    flex: 1,
  },
  aiBannerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  aiBannerText: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
  },
  openButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  openButtonText: {
    marginLeft: 8,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    backgroundColor: colors.surface,
    borderRadius: 16,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginTop: 16,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
  },
  filesList: {
    gap: 12,
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  featureCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginTop: 12,
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  signOutText: {
    marginLeft: 8,
  },
});
