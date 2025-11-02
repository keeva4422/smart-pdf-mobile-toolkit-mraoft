
import { IconSymbol } from "@/components/IconSymbol";
import { storageUtils } from "@/utils/storage";
import { colors, commonStyles } from "@/styles/commonStyles";
import React, { useState, useEffect } from "react";
import { Stack, useRouter } from "expo-router";
import { View, Text, StyleSheet, ScrollView, Pressable, Switch, Alert, Platform } from "react-native";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/app/integrations/supabase/client";

interface SettingItem {
  id: string;
  title: string;
  icon: string;
  type: 'toggle' | 'navigation' | 'action';
  value?: boolean;
  onPress?: () => void;
}

export default function SettingsScreen() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const [darkMode, setDarkMode] = useState(false);
  const [autoOCR, setAutoOCR] = useState(true);
  const [highQualityOCR, setHighQualityOCR] = useState(false);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    loadSettings();
    loadProfile();
  }, []);

  const loadProfile = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error loading profile:', error);
        return;
      }

      setProfile(data);
    } catch (error) {
      console.error('Exception loading profile:', error);
    }
  };

  const loadSettings = async () => {
    try {
      const settings = await storageUtils.getSettings();
      setDarkMode(settings.darkMode || false);
      setAutoOCR(settings.autoOCR !== false);
      setHighQualityOCR(settings.highQualityOCR || false);
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const updateSetting = async (key: string, value: any) => {
    try {
      await storageUtils.saveSetting(key, value);
      console.log(`Setting ${key} updated to ${value}`);
    } catch (error) {
      console.error('Error updating setting:', error);
    }
  };

  const handleClearCache = () => {
    Alert.alert(
      'Clear Cache',
      'This will clear all cached OCR results. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            try {
              await storageUtils.clearCache();
              Alert.alert('Success', 'Cache cleared successfully');
            } catch (error) {
              console.error('Error clearing cache:', error);
              Alert.alert('Error', 'Failed to clear cache');
            }
          },
        },
      ]
    );
  };

  const handleClearRecent = () => {
    Alert.alert(
      'Clear Recent Files',
      'This will remove all recent files from the list. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            try {
              await storageUtils.clearRecentFiles();
              Alert.alert('Success', 'Recent files cleared successfully');
            } catch (error) {
              console.error('Error clearing recent files:', error);
              Alert.alert('Error', 'Failed to clear recent files');
            }
          },
        },
      ]
    );
  };

  const handleSignOut = () => {
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

  const handleSettingPress = (item: SettingItem) => {
    if (item.onPress) {
      item.onPress();
    }
  };

  const appearanceSettings: SettingItem[] = [
    {
      id: 'darkMode',
      title: 'Dark Mode',
      icon: 'moon.fill',
      type: 'toggle',
      value: darkMode,
      onPress: () => {
        const newValue = !darkMode;
        setDarkMode(newValue);
        updateSetting('darkMode', newValue);
      },
    },
  ];

  const ocrSettings: SettingItem[] = [
    {
      id: 'autoOCR',
      title: 'Auto OCR',
      icon: 'text.viewfinder',
      type: 'toggle',
      value: autoOCR,
      onPress: () => {
        const newValue = !autoOCR;
        setAutoOCR(newValue);
        updateSetting('autoOCR', newValue);
      },
    },
    {
      id: 'highQualityOCR',
      title: 'High Quality OCR',
      icon: 'sparkles',
      type: 'toggle',
      value: highQualityOCR,
      onPress: () => {
        const newValue = !highQualityOCR;
        setHighQualityOCR(newValue);
        updateSetting('highQualityOCR', newValue);
      },
    },
  ];

  const storageSettings: SettingItem[] = [
    {
      id: 'clearCache',
      title: 'Clear Cache',
      icon: 'trash',
      type: 'action',
      onPress: handleClearCache,
    },
    {
      id: 'clearRecent',
      title: 'Clear Recent Files',
      icon: 'trash',
      type: 'action',
      onPress: handleClearRecent,
    },
  ];

  const accountSettings: SettingItem[] = [
    {
      id: 'signOut',
      title: 'Sign Out',
      icon: 'arrow.right.square',
      type: 'action',
      onPress: handleSignOut,
    },
  ];

  const renderSettingItem = (item: SettingItem) => {
    return (
      <Pressable
        key={item.id}
        style={styles.settingItem}
        onPress={() => handleSettingPress(item)}
      >
        <View style={styles.settingLeft}>
          <IconSymbol name={item.icon} size={24} color={colors.text} />
          <Text style={styles.settingTitle}>{item.title}</Text>
        </View>
        {item.type === 'toggle' && (
          <Switch
            value={item.value}
            onValueChange={() => handleSettingPress(item)}
            trackColor={{ false: colors.border, true: colors.primary }}
            thumbColor={colors.buttonText}
          />
        )}
        {item.type === 'navigation' && (
          <IconSymbol name="chevron.right" size={20} color={colors.textSecondary} />
        )}
      </Pressable>
    );
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Settings',
          headerShown: true,
          headerStyle: {
            backgroundColor: colors.background,
          },
          headerTintColor: colors.text,
          headerShadowVisible: false,
        }}
      />

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Profile Section */}
        <View style={styles.profileSection}>
          <View style={styles.avatarContainer}>
            <IconSymbol name="person.circle.fill" size={80} color={colors.primary} />
          </View>
          <Text style={styles.profileName}>{profile?.full_name || 'User'}</Text>
          <Text style={styles.profileEmail}>{user?.email}</Text>
        </View>

        {/* Appearance Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Appearance</Text>
          <View style={styles.settingsGroup}>
            {appearanceSettings.map(renderSettingItem)}
          </View>
        </View>

        {/* OCR Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>OCR Settings</Text>
          <View style={styles.settingsGroup}>
            {ocrSettings.map(renderSettingItem)}
          </View>
        </View>

        {/* Storage Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Storage</Text>
          <View style={styles.settingsGroup}>
            {storageSettings.map(renderSettingItem)}
          </View>
        </View>

        {/* Account Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <View style={styles.settingsGroup}>
            {accountSettings.map(renderSettingItem)}
          </View>
        </View>

        {/* App Info */}
        <View style={styles.appInfo}>
          <Text style={styles.appInfoText}>SmartPDF Toolkit v1.0.0</Text>
          <Text style={styles.appInfoText}>© 2025 All rights reserved</Text>
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
  profileSection: {
    alignItems: 'center',
    marginBottom: 32,
    paddingVertical: 20,
  },
  avatarContainer: {
    marginBottom: 16,
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
    paddingLeft: 4,
  },
  settingsGroup: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  settingTitle: {
    fontSize: 16,
    color: colors.text,
  },
  appInfo: {
    alignItems: 'center',
    marginTop: 32,
    paddingVertical: 20,
  },
  appInfoText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 4,
  },
});
