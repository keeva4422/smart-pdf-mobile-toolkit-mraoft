
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, Alert, Platform } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { PDFViewer } from '@/components/PDFViewer';
import { IconSymbol } from '@/components/IconSymbol';
import { colors, commonStyles } from '@/styles/commonStyles';
import { usePDF } from '@/contexts/PDFContext';

export default function ViewerScreen() {
  const router = useRouter();
  const { currentDocument, setCurrentDocument } = usePDF();
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    if (!currentDocument) {
      router.replace('/(tabs)/(home)');
    }
  }, [currentDocument]);

  if (!currentDocument) {
    return null;
  }

  const handleLoadComplete = (numberOfPages: number) => {
    console.log('PDF loaded with', numberOfPages, 'pages');
    setTotalPages(numberOfPages);
  };

  const handlePageChanged = (page: number, numberOfPages: number) => {
    setCurrentPage(page);
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

  return (
    <>
      <Stack.Screen
        options={{
          title: currentDocument.name,
          headerBackTitle: 'Back',
          headerRight: () => (
            <Pressable onPress={handleShare} style={styles.headerButton}>
              <IconSymbol name="square.and.arrow.up" size={22} color={colors.primary} />
            </Pressable>
          ),
        }}
      />

      <View style={commonStyles.container}>
        <PDFViewer
          uri={currentDocument.uri}
          onLoadComplete={handleLoadComplete}
          onPageChanged={handlePageChanged}
        />

        <View style={styles.toolbar}>
          <Pressable style={styles.toolButton} onPress={handleOCR}>
            <IconSymbol name="doc.text.viewfinder" size={24} color={colors.card} />
            <Text style={styles.toolButtonText}>OCR</Text>
          </Pressable>

          <Pressable style={styles.toolButton} onPress={handleEdit}>
            <IconSymbol name="pencil.tip.crop.circle" size={24} color={colors.card} />
            <Text style={styles.toolButtonText}>Edit</Text>
          </Pressable>

          <Pressable style={styles.toolButton} onPress={handleSummarize}>
            <IconSymbol name="doc.text.magnifyingglass" size={24} color={colors.card} />
            <Text style={styles.toolButtonText}>Summarize</Text>
          </Pressable>
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  headerButton: {
    padding: 8,
    marginRight: 8,
  },
  toolbar: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 40 : 20,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: colors.primary,
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 8,
    boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.2)',
    elevation: 8,
  },
  toolButton: {
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  toolButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.card,
    marginTop: 4,
  },
});
