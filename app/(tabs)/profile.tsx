
import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { IconSymbol } from "@/components/IconSymbol";
import { colors, commonStyles } from "@/styles/commonStyles";
import { View, Text, StyleSheet, ScrollView, Pressable, Switch, Alert, Platform } from "react-native";
import { storageUtils } from "@/utils/storage";
import { supabase } from "@/app/integrations/supabase/client";
import { Stack, useRouter } from "expo-router";

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
  const [settings, setSettings] = useState({
    notifications: true,
    autoSave: true,
    darkMode: false,
    offlineMode: true,
  });
  const [profile, setProfile] = useState<any>(null);

  const loadProfile = useCallback(async () => {
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
  }, [user]);

  useEffect(() => {
    loadSettings();
    loadProfile();
  }, [loadProfile]);

  const loadSettings = async () => {
    try {
      const savedSettings = await storageUtils.getSettings();
      if (savedSettings) {
        setSettings(savedSettings);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const updateSetting = async (key: string, value: any) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    await storageUtils.saveSettings(newSettings);
  };

  const handleClearCache = async () => {
    Alert.alert(
      'Clear Cache',
      'This will remove all cached OCR results and temporary files. Continue?',
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
            try {
              await storageUtils.clearRecentFiles();
              Alert.alert('Success', 'Recent files cleared');
            } catch (error) {
              console.error('Error clearing recent files:', error);
              Alert.alert('Error', 'Failed to clear recent files');
            }
          },
        },
      ]
    );
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

  const handleSettingPress = (item: SettingItem) => {
    if (item.onPress) {
      item.onPress();
    }
  };

  const renderSettingItem = (item: SettingItem) => {
    return (
      <Pressable
        key={item.id}
        style={styles.settingItem}
        onPress={() => handleSettingPress(item)}
      >
        <View style={styles.settingLeft}>
          <IconSymbol name={item.icon as any} size={24} color={colors.primary} />
          <Text style={styles.settingTitle}>{item.title}</Text>
        </View>
        {item.type === 'toggle' && (
          <Switch
            value={item.value}
            onValueChange={(value) => updateSetting(item.id, value)}
            trackColor={{ false: colors.border, true: colors.primary }}
            thumbColor={item.value ? colors.buttonText : colors.textSecondary}
          />
        )}
        {item.type === 'navigation' && (
          <IconSymbol name="chevron.right" size={20} color={colors.textSecondary} />
        )}
      </Pressable>
    );
  };

  const settingsItems: SettingItem[] = [
    {
      id: 'notifications',
      title: 'Notifications',
      icon: 'bell.fill',
      type: 'toggle',
      value: settings.notifications,
    },
    {
      id: 'autoSave',
      title: 'Auto-save Annotations',
      icon: 'arrow.down.doc.fill',
      type: 'toggle',
      value: settings.autoSave,
    },
    {
      id: 'darkMode',
      title: 'Dark Mode',
      icon: 'moon.fill',
      type: 'toggle',
      value: settings.darkMode,
    },
    {
      id: 'offlineMode',
      title: 'Offline Mode',
      icon: 'wifi.slash',
      type: 'toggle',
      value: settings.offlineMode,
    },
  ];

  const actionItems: SettingItem[] = [
    {
      id: 'clearCache',
      title: 'Clear Cache',
      icon: 'trash.fill',
      type: 'action',
      onPress: handleClearCache,
    },
    {
      id: 'clearRecent',
      title: 'Clear Recent Files',
      icon: 'clock.arrow.circlepath',
      type: 'action',
      onPress: handleClearRecent,
    },
    {
      id: 'signOut',
      title: 'Sign Out',
      icon: 'arrow.right.square',
      type: 'action',
      onPress: handleSignOut,
    },
  ];

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
          <View style={styles.profileAvatar}>
            <IconSymbol name="person.fill" size={48} color={colors.primary} />
          </View>
          <Text style={styles.profileName}>{profile?.full_name || 'User'}</Text>
          <Text style={styles.profileEmail}>{user?.email}</Text>
        </View>

        {/* Settings Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferences</Text>
          <View style={styles.settingsList}>
            {settingsItems.map(renderSettingItem)}
          </View>
        </View>

        {/* Actions Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Actions</Text>
          <View style={styles.settingsList}>
            {actionItems.map(renderSettingItem)}
          </View>
        </View>

        {/* App Info */}
        <View style={styles.appInfo}>
          <Text style={styles.appInfoText}>SmartPDF Toolkit v1.0.0</Text>
          <Text style={styles.appInfoSubtext}>Made with ❤️ for productivity</Text>
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
    paddingVertical: 24,
  },
  profileAvatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  profileName: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  settingsList: {
    backgroundColor: colors.card,
    borderRadius: 12,
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
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    color: colors.text,
    marginLeft: 12,
  },
  appInfo: {
    alignItems: 'center',
    marginTop: 24,
    paddingVertical: 20,
  },
  appInfoText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  appInfoSubtext: {
    fontSize: 12,
    color: colors.textSecondary,
  },
});
