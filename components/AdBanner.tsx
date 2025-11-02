
import React from 'react';
import { View, Text, StyleSheet, Pressable, Linking } from 'react-native';
import { IconSymbol } from '@/components/IconSymbol';
import { colors } from '@/styles/commonStyles';

interface AdBannerProps {
  position?: 'bottom' | 'top';
}

export default function AdBanner({ position = 'bottom' }: AdBannerProps) {
  const handleAdClick = () => {
    // In production, this would track ad clicks and open advertiser URL
    console.log('Ad clicked');
  };

  return (
    <View style={[styles.container, position === 'top' && styles.topPosition]}>
      <Pressable style={styles.adContent} onPress={handleAdClick}>
        <View style={styles.adBadge}>
          <Text style={styles.adBadgeText}>Ad</Text>
        </View>
        <View style={styles.adInfo}>
          <Text style={styles.adTitle}>📱 Upgrade to Premium</Text>
          <Text style={styles.adDescription}>Remove ads and unlock advanced features</Text>
        </View>
        <IconSymbol name="chevron.right" size={16} color={colors.textSecondary} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.card,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingHorizontal: 12,
    paddingVertical: 8,
    minHeight: 60,
    maxHeight: 80,
  },
  topPosition: {
    borderTopWidth: 0,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  adContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  adBadge: {
    backgroundColor: colors.warning + '30',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  adBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.warning,
    textTransform: 'uppercase',
  },
  adInfo: {
    flex: 1,
  },
  adTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },
  adDescription: {
    fontSize: 11,
    color: colors.textSecondary,
  },
});
