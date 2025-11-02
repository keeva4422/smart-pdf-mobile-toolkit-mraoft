
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { WidgetProvider } from "@/contexts/WidgetContext";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import {
  DarkTheme,
  DefaultTheme,
  Theme,
  ThemeProvider,
} from "@react-navigation/native";
import { PDFProvider } from "@/contexts/PDFContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { useNetworkState } from "expo-network";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";
import React, { useEffect } from "react";
import { Stack, router } from "expo-router";
import { SystemBars } from "react-native-edge-to-edge";
import { Button } from "@/components/button";
import { useColorScheme, Alert } from "react-native";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

// Global error handler
if (typeof ErrorUtils !== 'undefined') {
  const originalHandler = ErrorUtils.getGlobalHandler();
  ErrorUtils.setGlobalHandler((error, isFatal) => {
    console.error('Global error caught:', error);
    if (originalHandler) {
      originalHandler(error, isFatal);
    }
  });
}

export default function RootLayout() {
  const { isConnected } = useNetworkState();
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
        <AuthProvider>
          <PDFProvider>
            <WidgetProvider>
              <SystemBars style="auto" />
              <StatusBar style="auto" />
              <Stack
                screenOptions={{
                  headerShown: false,
                }}
              >
                <Stack.Screen name="index" options={{ headerShown: false }} />
                <Stack.Screen name="(auth)" options={{ headerShown: false }} />
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                <Stack.Screen name="viewer" options={{ headerShown: true }} />
                <Stack.Screen name="ocr" options={{ headerShown: true }} />
                <Stack.Screen name="edit" options={{ headerShown: true }} />
                <Stack.Screen name="summarize" options={{ headerShown: true }} />
                <Stack.Screen name="chat" options={{ headerShown: true }} />
                <Stack.Screen name="converter" options={{ headerShown: true }} />
                <Stack.Screen name="ai-features" options={{ headerShown: true }} />
                <Stack.Screen name="export" options={{ headerShown: true }} />
                <Stack.Screen name="export-summary" options={{ headerShown: true }} />
                <Stack.Screen
                  name="modal"
                  options={{
                    presentation: "modal",
                    animation: "slide_from_bottom",
                  }}
                />
                <Stack.Screen
                  name="formsheet"
                  options={{
                    presentation: "formSheet",
                    sheetAllowedDetents: [0.5, 1],
                  }}
                />
                <Stack.Screen
                  name="transparent-modal"
                  options={{
                    presentation: "transparentModal",
                    animation: "fade",
                  }}
                />
              </Stack>
            </WidgetProvider>
          </PDFProvider>
        </AuthProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
