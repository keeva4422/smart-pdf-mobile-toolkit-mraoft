
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, Alert, Platform } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { IconSymbol } from '@/components/IconSymbol';
import { colors, commonStyles } from '@/styles/commonStyles';
import { usePDF } from '@/contexts/PDFContext';
import { PDFViewer } from '@/components/PDFViewer';
import { supabase } from '@/app/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import AdBanner from '@/components/AdBanner';

export default function ViewerScreen() {
  const router = useRouter();
  const { currentDocument } = usePDF();
  const { user } = useAuth();
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    if (!currentDocument) {
      router.replace('/(tabs)/(home)');
    }
  }, [currentDocument, router]);

  if (!currentDocument) {
    return null;
  }

  const handleLoadComplete = (numberOfPages: number) => {
    console.log(`PDF loaded with ${numberOfPages} pages`);
    setTotalPages(numberOfPages);
  };

  const handlePageChanged = (page: number, numberOfPages: number) => {
    console.log(`Page changed to ${page} of ${numberOfPages}`);
    setCurrentPage(page);
    setTotalPages(numberOfPages);
  };

  const handleOCR = () => {
    router.push('/ocr');
  };

  const handleEdit = () => {
    router.push('/edit');
  };

  const handleSummarize = () => {
    router.push('/summarize');
  };

  const handleShare = () => {
    Alert.alert('Share', 'Share functionality coming soon!');
  };

  const handleChat = () => {
    router.push('/chat');
  };

  const handleConverter = () => {
    router.push('/converter');
  };

  const handleAIFeatures = () => {
    router.push('/ai-features');
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: currentDocument.name,
          headerBackTitle: 'Back',
          headerLeft: () => (
            <Pressable
              style={styles.backButton}
              onPress={() => router.push('/(tabs)/(home)/')}
            >
              <IconSymbol name="house.fill" size={22} color={colors.primary} />
            </Pressable>
          ),
          headerRight: () => (
            <View style={styles.headerButtons}>
              <Pressable onPress={handleChat} style={styles.headerButton}>
                <IconSymbol name="message.fill" size={22} color={colors.primary} />
              </Pressable>
              <Pressable onPress={handleShare} style={styles.headerButton}>
                <IconSymbol name="square.and.arrow.up" size={22} color={colors.primary} />
              </Pressable>
            </View>
          ),
        }}
      />

      <View style={styles.viewerContainer}>
        <PDFViewer
          source={{ uri: currentDocument.uri }}
          onLoadComplete={handleLoadComplete}
          onPageChanged={handlePageChanged}
        />
      </View>

      {totalPages > 0 && (
        <View style={styles.pageIndicator}>
          <Text style={styles.pageText}>
            Page {currentPage} of {totalPages}
          </Text>
        </View>
      )}

      <View style={styles.actionBar}>
        <Pressable style={styles.actionButton} onPress={handleOCR}>
          <IconSymbol name="text.viewfinder" size={22} color={colors.primary} />
          <Text style={styles.actionButtonText}>OCR</Text>
        </Pressable>

        <Pressable style={styles.actionButton} onPress={handleEdit}>
          <IconSymbol name="pencil" size={22} color={colors.primary} />
          <Text style={styles.actionButtonText}>Edit</Text>
        </Pressable>

        <Pressable style={styles.actionButton} onPress={handleSummarize}>
          <IconSymbol name="doc.text" size={22} color={colors.primary} />
          <Text style={styles.actionButtonText}>Summarize</Text>
        </Pressable>

        <Pressable style={styles.actionButton} onPress={handleConverter}>
          <IconSymbol name="arrow.triangle.2.circlepath" size={22} color={colors.accent} />
          <Text style={styles.actionButtonText}>Convert</Text>
        </Pressable>

        <Pressable style={styles.actionButton} onPress={handleAIFeatures}>
          <IconSymbol name="sparkles" size={22} color={colors.secondary} />
          <Text style={styles.actionButtonText}>AI Tools</Text>
        </Pressable>
      </View>

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
  headerButtons: {
    flexDirection: 'row',
    gap: 12,
    marginRight: 8,
  },
  headerButton: {
    padding: 8,
  },
  viewerContainer: {
    flex: 1,
    backgroundColor: colors.card,
  },
  pageIndicator: {
    position: 'absolute',
    top: 16,
    alignSelf: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  pageText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  actionBar: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingVertical: 8,
    paddingHorizontal: 4,
    justifyContent: 'space-around',
    boxShadow: '0px -2px 8px rgba(0, 0, 0, 0.1)',
    elevation: 8,
  },
  actionButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    paddingHorizontal: 8,
    minWidth: 60,
  },
  actionButtonText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.text,
    marginTop: 4,
  },
});
