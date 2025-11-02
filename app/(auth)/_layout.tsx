
import React, { useEffect } from 'react';
import { Stack, useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';

export default function AuthLayout() {
  const { session, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && session) {
      // User is authenticated, redirect to home
      router.replace('/(tabs)/(home)/');
    }
  }, [session, loading, router]);

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="login" />
      <Stack.Screen name="signup" />
      <Stack.Screen name="forgot-password" />
    </Stack>
  );
}
