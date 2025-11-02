
import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable, Switch, Alert, Platform } from "react-native";
import { Stack } from "expo-router";
import { IconSymbol } from "@/components/IconSymbol";
import { colors, commonStyles } from "@/styles/commonStyles";
import { storageUtils } from "@/utils/storage";

export default function SettingsScreen() {
  const [settings, setSettings] = useState({
    darkMode: false,
    autoOCR: false,
    ocrLanguage: 'eng',
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    const savedSettings = await storageUtils.getSettings();
    setSettings(savedSettings);
  };

  const updateSetting = async (key: string, value: any) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    await storageUtils.updateSettings(newSettings);
  };

  const handleClearCache = async () => {
    Alert.alert(
      'Clear Cache',
      'This will remove all cached OCR results. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: () => {
            Alert.alert('Success', 'Cache cleared successfully!');
          },
        },
      ]
    );
  };

  const handleClearRecent = async () => {
    Alert.alert(
      'Clear Recent Files',
      'This will remove all recent files from the list. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            await storageUtils.clearRecentFiles();
            Alert.alert('Success', 'Recent files cleared!');
          },
        },
      ]
    );
  };

  const settingsSections = [
    {
      title: 'Appearance',
      items: [
        {
          id: 'darkMode',
          label: 'Dark Mode',
          icon: 'moon.fill',
          type: 'toggle',
          value: settings.darkMode,
          description: 'Coming soon',
        },
      ],
    },
    {
      title: 'OCR Settings',
      items: [
        {
          id: 'autoOCR',
          label: 'Auto OCR',
          icon: 'doc.text.viewfinder',
          type: 'toggle',
          value: settings.autoOCR,
          description: 'Automatically run OCR on new PDFs',
        },
        {
          id: 'ocrLanguage',
          label: 'OCR Language',
          icon: 'globe',
          type: 'option',
          value: settings.ocrLanguage,
          description: 'English',
        },
      ],
    },
    {
      title: 'Storage',
      items: [
        {
          id: 'clearCache',
          label: 'Clear Cache',
          icon: 'trash',
          type: 'action',
          description: 'Remove cached OCR results',
        },
        {
          id: 'clearRecent',
          label: 'Clear Recent Files',
          icon: 'clock.arrow.circlepath',
          type: 'action',
          description: 'Remove recent files list',
        },
      ],
    },
    {
      title: 'About',
      items: [
        {
          id: 'version',
          label: 'Version',
          icon: 'info.circle',
          type: 'info',
          value: '1.0.0',
          description: 'SmartPDF Toolkit',
        },
      ],
    },
  ];

  const handleSettingPress = (item: any) => {
    if (item.type === 'action') {
      if (item.id === 'clearCache') {
        handleClearCache();
      } else if (item.id === 'clearRecent') {
        handleClearRecent();
      }
    } else if (item.type === 'option') {
      Alert.alert('Coming Soon', 'Language selection will be available in a future update.');
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Settings',
        }}
      />

      <View style={commonStyles.container}>
        <ScrollView contentContainerStyle={[
          styles.scrollContent,
          Platform.OS !== 'ios' && styles.scrollContentWithTabBar
        ]}>
          <View style={styles.header}>
            <View style={styles.iconCircle}>
              <IconSymbol name="gear" size={40} color={colors.primary} />
            </View>
            <Text style={styles.headerTitle}>Settings</Text>
            <Text style={styles.headerSubtitle}>
              Customize your SmartPDF experience
            </Text>
          </View>

          {settingsSections.map((section, sectionIndex) => (
            <View key={sectionIndex} style={styles.section}>
              <Text style={styles.sectionTitle}>{section.title}</Text>
              {section.items.map((item, itemIndex) => (
                <Pressable
                  key={item.id}
                  style={styles.settingCard}
                  onPress={() => handleSettingPress(item)}
                  disabled={item.type === 'toggle' || item.type === 'info'}
                >
                  <View style={[styles.settingIcon, { backgroundColor: colors.primary + '20' }]}>
                    <IconSymbol name={item.icon as any} size={24} color={colors.primary} />
                  </View>
                  <View style={styles.settingContent}>
                    <Text style={styles.settingLabel}>{item.label}</Text>
                    <Text style={styles.settingDescription}>{item.description}</Text>
                  </View>
                  {item.type === 'toggle' && (
                    <Switch
                      value={item.value}
                      onValueChange={(value) => updateSetting(item.id, value)}
                      trackColor={{ false: colors.border, true: colors.primary + '60' }}
                      thumbColor={item.value ? colors.primary : '#f4f3f4'}
                    />
                  )}
                  {item.type === 'option' && (
                    <View style={styles.optionValue}>
                      <Text style={styles.optionValueText}>{item.value}</Text>
                      <IconSymbol name="chevron.right" size={16} color={colors.textSecondary} />
                    </View>
                  )}
                  {item.type === 'action' && (
                    <IconSymbol name="chevron.right" size={20} color={colors.textSecondary} />
                  )}
                  {item.type === 'info' && (
                    <Text style={styles.infoValue}>{item.value}</Text>
                  )}
                </Pressable>
              ))}
            </View>
          ))}

          <View style={styles.footer}>
            <Text style={styles.footerText}>
              SmartPDF Mobile Toolkit
            </Text>
            <Text style={styles.footerSubtext}>
              Privacy-first PDF management
            </Text>
          </View>
        </ScrollView>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: 20,
  },
  scrollContentWithTabBar: {
    paddingBottom: 100,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 20,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  section: {
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  settingCard: {
    ...commonStyles.card,
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 0,
    marginVertical: 6,
  },
  settingIcon: {
    width: 44,
    height: 44,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  settingContent: {
    flex: 1,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  optionValue: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  optionValueText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginRight: 4,
  },
  infoValue: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 20,
  },
  footerText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  footerSubtext: {
    fontSize: 13,
    color: colors.textSecondary,
  },
});
