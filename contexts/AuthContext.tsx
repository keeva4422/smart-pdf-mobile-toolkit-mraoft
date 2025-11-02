
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/app/integrations/supabase/client';
import { Session, User } from '@supabase/supabase-js';
import { Alert } from 'react-native';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName?: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('Initial session:', session);
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log('Auth state changed:', _event, session);
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, fullName?: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: 'https://natively.dev/email-confirmed',
          data: {
            full_name: fullName || '',
          }
        }
      });

      if (error) {
        console.error('Sign up error:', error);
        return { error };
      }

      // Show email verification alert
      if (data.user && !data.session) {
        Alert.alert(
          'Verify Your Email',
          'Please check your email and click the verification link to complete your registration.',
          [{ text: 'OK' }]
        );
      }

      return { error: null };
    } catch (error) {
      console.error('Sign up exception:', error);
      return { error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Sign in error:', error);
        // Show user-friendly error message
        Alert.alert('Sign In Error', error.message || 'Failed to sign in. Please try again.');
        return { error };
      }

      return { error: null };
    } catch (error) {
      console.error('Sign in exception:', error);
      Alert.alert('Sign In Error', 'An unexpected error occurred. Please try again.');
      return { error };
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Sign out error:', error);
        Alert.alert('Sign Out Error', error.message || 'Failed to sign out.');
      }
    } catch (error) {
      console.error('Sign out exception:', error);
      Alert.alert('Sign Out Error', 'An unexpected error occurred.');
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: 'https://natively.dev/reset-password',
      });

      if (error) {
        console.error('Reset password error:', error);
        return { error };
      }

      Alert.alert(
        'Password Reset',
        'Check your email for a password reset link.',
        [{ text: 'OK' }]
      );

      return { error: null };
    } catch (error) {
      console.error('Reset password exception:', error);
      return { error };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        loading,
        signUp,
        signIn,
        signOut,
        resetPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
