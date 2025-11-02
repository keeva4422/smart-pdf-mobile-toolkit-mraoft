
import { PDFViewer } from '@/components/PDFViewer';
import React, { useState, useEffect } from 'react';
import { colors, commonStyles } from '@/styles/commonStyles';
import { View, Text, StyleSheet, Pressable, Alert, Platform } from 'react-native';
import { usePDF } from '@/contexts/PDFContext';
import { useAuth } from '@/contexts/AuthContext';
import { Stack, useRouter } from 'expo-router';
import { IconSymbol } from '@/components/IconSymbol';
import { supabase } from '@/app/integrations/supabase/client';

export default function ViewerScreen() {
  const { currentDocument } = usePDF();
  const { user } = useAuth();
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const router = useRouter();

  useEffect(() => {
    if (!currentDocument) {
      Alert.alert('No Document', 'Please select a PDF file first');
      router.back();
    }
  }, [currentDocument]);

  const handleLoadComplete = (numberOfPages: number) => {
    console.log(`PDF loaded with ${numberOfPages} pages`);
    setTotalPages(numberOfPages);

    // Update page count in Supabase if user is logged in
    if (user && currentDocument) {
      supabase
        .from('pdf_documents')
        .update({ page_count: numberOfPages })
        .eq('uri', currentDocument.uri)
        .eq('user_id', user.id)
        .then(({ error }) => {
          if (error) {
            console.error('Error updating page count:', error);
          }
        });
    }
  };

  const handlePageChanged = (page: number, numberOfPages: number) => {
    console.log(`Page changed to ${page} of ${numberOfPages}`);
    setCurrentPage(page);
    setTotalPages(numberOfPages);
  };

  const handleOCR = () => {
    console.log('Navigate to OCR screen');
    router.push('/ocr');
  };

  const handleEdit = () => {
    console.log('Navigate to Edit screen');
    router.push('/edit');
  };

  const handleSummarize = () => {
    console.log('Navigate to Summarize screen');
    router.push('/summarize');
  };

  const handleShare = () => {
    console.log('Share PDF');
    Alert.alert('Share', 'Share functionality coming soon!');
  };

  if (!currentDocument) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: currentDocument.name,
          headerShown: true,
          headerStyle: {
            backgroundColor: colors.background,
          },
          headerTintColor: colors.text,
          headerShadowVisible: false,
          headerBackTitle: 'Back',
        }}
      />

      <View style={styles.viewerContainer}>
        <PDFViewer
          source={{ uri: currentDocument.uri }}
          onLoadComplete={handleLoadComplete}
          onPageChanged={handlePageChanged}
        />
      </View>

      {/* Page indicator */}
      {totalPages > 0 && (
        <View style={styles.pageIndicator}>
          <Text style={styles.pageText}>
            Page {currentPage} of {totalPages}
          </Text>
        </View>
      )}

      {/* Action buttons */}
      <View style={styles.actionBar}>
        <Pressable style={styles.actionButton} onPress={handleOCR}>
          <IconSymbol name="text.viewfinder" size={24} color={colors.text} />
          <Text style={styles.actionButtonText}>OCR</Text>
        </Pressable>

        <Pressable style={styles.actionButton} onPress={handleEdit}>
          <IconSymbol name="pencil" size={24} color={colors.text} />
          <Text style={styles.actionButtonText}>Edit</Text>
        </Pressable>

        <Pressable style={styles.actionButton} onPress={handleSummarize}>
          <IconSymbol name="doc.text.fill" size={24} color={colors.text} />
          <Text style={styles.actionButtonText}>Summarize</Text>
        </Pressable>

        <Pressable style={styles.actionButton} onPress={handleShare}>
          <IconSymbol name="square.and.arrow.up" size={24} color={colors.text} />
          <Text style={styles.actionButtonText}>Share</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  viewerContainer: {
    flex: 1,
  },
  pageIndicator: {
    position: 'absolute',
    top: 100,
    right: 20,
    backgroundColor: colors.surface,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    ...commonStyles.shadow,
  },
  pageText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  actionBar: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    justifyContent: 'space-around',
  },
  actionButton: {
    alignItems: 'center',
    padding: 8,
    minWidth: 70,
  },
  actionButtonText: {
    fontSize: 12,
    color: colors.text,
    marginTop: 4,
  },
});
