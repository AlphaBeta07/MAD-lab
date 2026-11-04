import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Alert,
} from 'react-native';
import { useAuth } from '../context/AuthContext';

export const HomeScreen: React.FC = () => {
  const { user, logout } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState<boolean>(false);

  const handleLogout = (): void => {
    Alert.alert('Sign Out', 'Are you sure you want to log out of your session?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          setIsLoggingOut(true);
          try {
            await logout();
          } catch (err) {
            const msg =
              err instanceof Error ? err.message : 'Failed to sign out. Try again.';
            Alert.alert('Error', msg);
          } finally {
            setIsLoggingOut(false);
          }
        },
      },
    ]);
  };

  const creationTime = user?.metadata?.creationTime
    ? new Date(user.metadata.creationTime).toLocaleString()
    : 'Active Session';

  const lastSignInTime = user?.metadata?.lastSignInTime
    ? new Date(user.metadata.lastSignInTime).toLocaleString()
    : 'Just now';

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Header Banner */}
      <View style={styles.header}>
        <View style={styles.statusBadge}>
          <Text style={styles.statusBadgeText}>🟢 Authenticated Session</Text>
        </View>
        <Text style={styles.welcomeTitle}>Welcome Back!</Text>
        <Text style={styles.userEmail}>{user?.email || 'Authenticated User'}</Text>
      </View>

      {/* User Credentials Card */}
      <View style={styles.card}>
        <Text style={styles.cardHeading}>Account Information</Text>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>User ID (UID):</Text>
          <Text style={styles.infoValue} numberOfLines={1} ellipsizeMode="middle">
            {user?.uid || 'N/A'}
          </Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Email:</Text>
          <Text style={styles.infoValue}>{user?.email || 'N/A'}</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Account Created:</Text>
          <Text style={styles.infoValue}>{creationTime}</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Last Sign In:</Text>
          <Text style={styles.infoValue}>{lastSignInTime}</Text>
        </View>
      </View>

      {/* Features Verified Card */}
      <View style={styles.featuresCard}>
        <Text style={styles.featuresHeading}>
          🧪 Experiment 10 Capabilities Active
        </Text>
        <Text style={styles.featureItem}>
          ✅ Email & Password User Registration
        </Text>
        <Text style={styles.featureItem}>
          ✅ Secure Login with Error Translation
        </Text>
        <Text style={styles.featureItem}>
          ✅ Self-Service Password Reset via Email
        </Text>
        <Text style={styles.featureItem}>
          ✅ Persistent Session across App Restarts
        </Text>
        <Text style={styles.featureItem}>
          ✅ Real-time onAuthStateChanged Listener
        </Text>
      </View>

      {/* Logout Action */}
      <TouchableOpacity
        style={[styles.logoutButton, isLoggingOut && styles.buttonDisabled]}
        onPress={handleLogout}
        activeOpacity={0.8}
        disabled={isLoggingOut}
      >
        {isLoggingOut ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={styles.logoutButtonText}>🚪 Sign Out</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingTop: 30,
    paddingBottom: 40,
    backgroundColor: '#F8FAFC',
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  statusBadge: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#86EFAC',
  },
  statusBadgeText: {
    color: '#166534',
    fontSize: 12,
    fontWeight: '700',
  },
  welcomeTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.5,
  },
  userEmail: {
    fontSize: 15,
    color: '#4F46E5',
    fontWeight: '600',
    marginTop: 4,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  cardHeading: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  infoLabel: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
    flex: 1,
  },
  infoValue: {
    fontSize: 13,
    color: '#0F172A',
    fontWeight: '600',
    flex: 1.5,
    textAlign: 'right',
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 8,
  },
  featuresCard: {
    backgroundColor: '#EEF2FF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    borderLeftWidth: 4,
    borderLeftColor: '#4F46E5',
  },
  featuresHeading: {
    fontSize: 14,
    fontWeight: '700',
    color: '#312E81',
    marginBottom: 8,
  },
  featureItem: {
    fontSize: 12,
    color: '#3730A3',
    lineHeight: 20,
    fontWeight: '500',
  },
  logoutButton: {
    backgroundColor: '#DC2626',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#DC2626',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  logoutButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});

export default HomeScreen;
