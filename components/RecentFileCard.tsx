
import React from 'react';
import { View, Text, StyleSheet, Pressable, Platform } from 'react-native';
import { IconSymbol } from '@/components/IconSymbol';
import { colors, commonStyles } from '@/styles/commonStyles';
import { PDFDocument } from '@/types/pdf';

interface RecentFileCardProps {
  file: PDFDocument;
  onPress: () => void;
  onDelete: () => void;
}

export const RecentFileCard: React.FC<RecentFileCardProps> = ({ file, onPress, onDelete }) => {
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const formatDate = (timestamp: number): string => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        pressed && styles.cardPressed,
      ]}
      onPress={onPress}
    >
      <View style={styles.iconContainer}>
        <IconSymbol name="doc.fill" size={32} color={colors.primary} />
      </View>
      
      <View style={styles.content}>
        <Text style={styles.fileName} numberOfLines={1}>
          {file.name}
        </Text>
        <View style={styles.metaRow}>
          <Text style={styles.metaText}>
            {formatFileSize(file.size)}
          </Text>
          {file.pageCount && (
            <>
              <Text style={styles.metaSeparator}>•</Text>
              <Text style={styles.metaText}>
                {file.pageCount} pages
              </Text>
            </>
          )}
          {file.lastOpened && (
            <>
              <Text style={styles.metaSeparator}>•</Text>
              <Text style={styles.metaText}>
                {formatDate(file.lastOpened)}
              </Text>
            </>
          )}
        </View>
      </View>

      <Pressable
        style={styles.deleteButton}
        onPress={(e) => {
          e.stopPropagation();
          onDelete();
        }}
      >
        <IconSymbol name="trash" size={20} color={colors.error} />
      </Pressable>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    ...commonStyles.card,
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginVertical: 6,
  },
  cardPressed: {
    opacity: 0.7,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  content: {
    flex: 1,
  },
  fileName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  metaSeparator: {
    fontSize: 12,
    color: colors.textSecondary,
    marginHorizontal: 6,
  },
  deleteButton: {
    padding: 8,
    marginLeft: 8,
  },
});
