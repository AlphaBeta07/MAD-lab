import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { useApp } from '../context/AppContext';
import { CustomInput } from '../components/CustomInput';
import { CustomButton } from '../components/CustomButton';
import { CustomCard } from '../components/CustomCard';

interface LoginScreenProps {
  onNavigateToRegister: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  onNavigateToRegister,
}) => {
  const { login, resetPassword } = useApp();

  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [showForgot, setShowForgot] = useState<boolean>(false);
  const [forgotEmail, setForgotEmail] = useState<string>('');
  const [isResetting, setIsResetting] = useState<boolean>(false);

  const validateEmail = (val: string): boolean => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim());
  };

  const handleLogin = async (): Promise<void> => {
    setErrorMessage(null);
    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      setErrorMessage('Please enter your campus email address.');
      return;
    }
    if (!validateEmail(trimmedEmail)) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }
    if (!password) {
      setErrorMessage('Please enter your password.');
      return;
    }

    setIsSubmitting(true);
    try {
      await login(trimmedEmail, password);
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : 'Invalid login credentials.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForgotPassword = async (): Promise<void> => {
    const trimmed = forgotEmail.trim();
    if (!trimmed || !validateEmail(trimmed)) {
      Alert.alert('Invalid Email', 'Please enter a valid registered email.');
      return;
    }

    setIsResetting(true);
    try {
      await resetPassword(trimmed);
      Alert.alert(
        'Reset Email Sent',
        `A password reset link was sent to ${trimmed}. Please check your inbox.`,
        [
          {
            text: 'OK',
            onPress: () => {
              setShowForgot(false);
              setForgotEmail('');
            },
          },
        ]
      );
    } catch (err) {
      Alert.alert(
        'Reset Error',
        err instanceof Error ? err.message : 'Failed to send reset link.'
      );
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <Text style={styles.badge}>🎓 Campus Event Manager</Text>
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>
            Sign in to discover and save exciting university events
          </Text>
        </View>

        <CustomCard style={styles.card}>
          <Text style={styles.cardTitle}>Sign In</Text>

          {errorMessage && (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>⚠️ {errorMessage}</Text>
            </View>
          )}

          <CustomInput
            label="Campus Email"
            placeholder="student@university.edu"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={(t) => {
              setEmail(t);
              setErrorMessage(null);
            }}
          />

          <CustomInput
            label="Password"
            placeholder="Enter your password"
            isPassword
            autoCapitalize="none"
            value={password}
            onChangeText={(t) => {
              setPassword(t);
              setErrorMessage(null);
            }}
          />

          <TouchableOpacity
            style={styles.forgotBtn}
            onPress={() => setShowForgot(true)}
          >
            <Text style={styles.forgotText}>Forgot password?</Text>
          </TouchableOpacity>

          <CustomButton
            title="Sign In"
            onPress={handleLogin}
            isLoading={isSubmitting}
            style={styles.submitBtn}
          />

          <View style={styles.switchRow}>
            <Text style={styles.switchText}>Don't have an account? </Text>
            <TouchableOpacity onPress={onNavigateToRegister}>
              <Text style={styles.switchLink}>Create one</Text>
            </TouchableOpacity>
          </View>
        </CustomCard>

        {showForgot && (
          <CustomCard style={styles.forgotCard}>
            <Text style={styles.forgotTitle}>Reset Password</Text>
            <Text style={styles.forgotDesc}>
              Enter your email address and Firebase will dispatch a reset link.
            </Text>
            <CustomInput
              label="Registered Email"
              placeholder="student@university.edu"
              keyboardType="email-address"
              autoCapitalize="none"
              value={forgotEmail}
              onChangeText={setForgotEmail}
            />
            <View style={styles.forgotBtnRow}>
              <CustomButton
                title="Cancel"
                variant="outline"
                onPress={() => setShowForgot(false)}
                style={styles.forgotActionBtn}
              />
              <CustomButton
                title="Send Link"
                onPress={handleForgotPassword}
                isLoading={isResetting}
                style={styles.forgotActionBtn}
              />
            </View>
          </CustomCard>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scroll: {
    padding: 20,
    paddingTop: 30,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  badge: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4F46E5',
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    marginBottom: 8,
    overflow: 'hidden',
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 18,
  },
  card: {
    padding: 20,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 16,
  },
  errorBox: {
    backgroundColor: '#FEF2F2',
    borderLeftWidth: 3,
    borderLeftColor: '#DC2626',
    padding: 10,
    borderRadius: 8,
    marginBottom: 14,
  },
  errorText: {
    color: '#991B1B',
    fontSize: 12,
    fontWeight: '500',
  },
  forgotBtn: {
    alignSelf: 'flex-end',
    marginBottom: 16,
    marginTop: -4,
  },
  forgotText: {
    color: '#4F46E5',
    fontSize: 12,
    fontWeight: '600',
  },
  submitBtn: {
    marginTop: 4,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 18,
  },
  switchText: {
    fontSize: 13,
    color: '#64748B',
  },
  switchLink: {
    fontSize: 13,
    fontWeight: '700',
    color: '#4F46E5',
  },
  forgotCard: {
    marginTop: 16,
    borderColor: '#C7D2FE',
    borderLeftWidth: 4,
    borderLeftColor: '#4F46E5',
  },
  forgotTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 4,
  },
  forgotDesc: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 12,
    lineHeight: 18,
  },
  forgotBtnRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
  forgotActionBtn: {
    flex: 1,
    minHeight: 40,
  },
});

export default LoginScreen;
