
import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
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
  return (
    <View style={styles.container}>
      <View style={styles.webNotSupported}>
        <Text style={styles.icon}>📄</Text>
        <Text style={styles.webNotSupportedText}>
          PDF viewing is not fully supported on web in this environment.
        </Text>
        <Text style={styles.webNotSupportedSubtext}>
          Please use the mobile app (iOS or Android) for the best PDF viewing experience.
        </Text>
        <View style={styles.infoBox}>
          <Text style={styles.infoText}>
            The native PDF viewer requires platform-specific modules that are only available on iOS and Android devices.
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  webNotSupported: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  icon: {
    fontSize: 64,
    marginBottom: 20,
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
    marginBottom: 20,
  },
  infoBox: {
    backgroundColor: colors.card,
    padding: 16,
    borderRadius: 12,
    marginTop: 12,
    maxWidth: 400,
  },
  infoText: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
});
