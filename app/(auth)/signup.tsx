
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { colors, commonStyles, buttonStyles } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';

export default function SignupScreen() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const { signUp } = useAuth();
  const router = useRouter();

  const handleSignup = async () => {
    if (!fullName || !email || !password || !confirmPassword) {
      alert('Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      alert('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);
    const { error } = await signUp(email, password, fullName);
    setLoading(false);

    if (!error) {
      // Show success modal with email verification instructions
      setShowSuccessModal(true);
    }
  };

  const handleCloseModal = () => {
    setShowSuccessModal(false);
    router.replace('/(auth)/login');
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <IconSymbol name="document.fill" size={64} color={colors.primary} style={styles.logo} />
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Sign up to get started</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Full Name</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your full name"
              placeholderTextColor={colors.textSecondary}
              value={fullName}
              onChangeText={setFullName}
              autoCapitalize="words"
              autoComplete="name"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your email"
              placeholderTextColor={colors.textSecondary}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              autoComplete="email"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Password</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={[styles.input, styles.passwordInput]}
                placeholder="Enter your password"
                placeholderTextColor={colors.textSecondary}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoComplete="password"
              />
              <Pressable
                style={styles.eyeIcon}
                onPress={() => setShowPassword(!showPassword)}
              >
                <IconSymbol
                  name={showPassword ? 'eye.slash.fill' : 'eye.fill'}
                  size={20}
                  color={colors.textSecondary}
                />
              </Pressable>
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Confirm Password</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={[styles.input, styles.passwordInput]}
                placeholder="Confirm your password"
                placeholderTextColor={colors.textSecondary}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showConfirmPassword}
                autoCapitalize="none"
                autoComplete="password"
              />
              <Pressable
                style={styles.eyeIcon}
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                <IconSymbol
                  name={showConfirmPassword ? 'eye.slash.fill' : 'eye.fill'}
                  size={20}
                  color={colors.textSecondary}
                />
              </Pressable>
            </View>
          </View>

          <Pressable
            style={[buttonStyles.primary, styles.signupButton, loading && styles.buttonDisabled]}
            onPress={handleSignup}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={colors.buttonText} />
            ) : (
              <Text style={buttonStyles.primaryText}>Sign Up</Text>
            )}
          </Pressable>

          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>Already have an account? </Text>
            <Pressable onPress={() => router.push('/(auth)/login')}>
              <Text style={styles.loginLink}>Sign In</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>

      {/* Success Modal */}
      <Modal
        visible={showSuccessModal}
        transparent
        animationType="fade"
        onRequestClose={handleCloseModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalIconContainer}>
              <IconSymbol name="envelope.badge.fill" size={64} color={colors.primary} />
            </View>
            
            <Text style={styles.modalTitle}>Check Your Email!</Text>
            
            <Text style={styles.modalText}>
              We&apos;ve sent a confirmation link to:
            </Text>
            
            <Text style={styles.modalEmail}>{email}</Text>
            
            <Text style={styles.modalText}>
              Please click the link in the email to verify your account and complete your registration.
            </Text>
            
            <View style={styles.modalNote}>
              <IconSymbol name="info.circle.fill" size={20} color={colors.accent} />
              <Text style={styles.modalNoteText}>
                Didn&apos;t receive the email? Check your spam folder or try signing up again.
              </Text>
            </View>
            
            <Pressable
              style={[buttonStyles.primary, styles.modalButton]}
              onPress={handleCloseModal}
            >
              <Text style={commonStyles.buttonText}>Got It!</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  logo: {
    marginBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  form: {
    width: '100%',
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: colors.surface || colors.card,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
  },
  passwordContainer: {
    position: 'relative',
  },
  passwordInput: {
    paddingRight: 48,
  },
  eyeIcon: {
    position: 'absolute',
    right: 16,
    top: 16,
  },
  signupButton: {
    marginTop: 8,
    marginBottom: 24,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginText: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  loginLink: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 32,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
    boxShadow: '0px 10px 40px rgba(0, 0, 0, 0.2)',
    elevation: 10,
  },
  modalIconContainer: {
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 16,
    textAlign: 'center',
  },
  modalText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 12,
  },
  modalEmail: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
    textAlign: 'center',
    marginBottom: 16,
  },
  modalNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.accent + '15',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    marginBottom: 24,
  },
  modalNoteText: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
    marginLeft: 12,
    flex: 1,
  },
  modalButton: {
    width: '100%',
  },
});
