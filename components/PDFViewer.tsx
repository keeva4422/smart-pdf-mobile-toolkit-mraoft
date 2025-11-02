
import React, { useState, useRef } from 'react';
import { View, StyleSheet, ActivityIndicator, Text, Dimensions, Platform } from 'react-native';
import Pdf from 'react-native-pdf';
import { colors } from '@/styles/commonStyles';

interface PDFViewerProps {
  uri: string;
  onLoadComplete?: (numberOfPages: number) => void;
  onPageChanged?: (page: number, numberOfPages: number) => void;
  onError?: (error: any) => void;
}

export const PDFViewer: React.FC<PDFViewerProps> = ({
  uri,
  onLoadComplete,
  onPageChanged,
  onError,
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  const handleLoadComplete = (numberOfPages: number, filePath: string) => {
    console.log('PDF loaded successfully:', numberOfPages, 'pages');
    setLoading(false);
    setTotalPages(numberOfPages);
    onLoadComplete?.(numberOfPages);
  };

  const handlePageChanged = (page: number, numberOfPages: number) => {
    console.log('Page changed:', page, 'of', numberOfPages);
    setCurrentPage(page);
    onPageChanged?.(page, numberOfPages);
  };

  const handleError = (error: any) => {
    console.error('PDF loading error:', error);
    setLoading(false);
    setError('Failed to load PDF. Please try again.');
    onError?.(error);
  };

  if (Platform.OS === 'web') {
    return (
      <View style={styles.container}>
        <View style={styles.webNotSupported}>
          <Text style={styles.webNotSupportedText}>
            PDF viewing is not fully supported on web in this environment.
          </Text>
          <Text style={styles.webNotSupportedSubtext}>
            Please use the mobile app for the best experience.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading PDF...</Text>
        </View>
      )}
      
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {!error && (
        <>
          <Pdf
            source={{ uri }}
            style={styles.pdf}
            onLoadComplete={handleLoadComplete}
            onPageChanged={handlePageChanged}
            onError={handleError}
            trustAllCerts={false}
            enablePaging={true}
            spacing={10}
            fitPolicy={0}
          />
          
          {!loading && totalPages > 0 && (
            <View style={styles.pageIndicator}>
              <Text style={styles.pageIndicatorText}>
                Page {currentPage} of {totalPages}
              </Text>
            </View>
          )}
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  pdf: {
    flex: 1,
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
    zIndex: 10,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: colors.text,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: colors.error,
    textAlign: 'center',
  },
  pageIndicator: {
    position: 'absolute',
    bottom: 20,
    alignSelf: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  pageIndicatorText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  webNotSupported: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  webNotSupportedText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  webNotSupportedSubtext: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
