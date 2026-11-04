import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useApp } from '../context/AppContext';
import { CustomCard } from '../components/CustomCard';
import { CustomButton } from '../components/CustomButton';

interface ProfileScreenProps {
  onNavigateToFavorites: () => void;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({
  onNavigateToFavorites,
}) => {
  const { user, logout, favorites } = useApp();
  const [isLoggingOut, setIsLoggingOut] = useState<boolean>(false);

  const handleLogout = (): void => {
    Alert.alert(
      'Sign Out Confirmation',
      'Are you sure you want to log out of Campus Event Manager?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            setIsLoggingOut(true);
            try {
              await logout();
            } catch (err) {
              Alert.alert(
                'Logout Error',
                err instanceof Error ? err.message : 'Failed to sign out.'
              );
            } finally {
              setIsLoggingOut(false);
            }
          },
        },
      ]
    );
  };

  const emailInitial = user?.email
    ? user.email.charAt(0).toUpperCase()
    : 'U';

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Profile Header Card */}
      <CustomCard style={styles.profileCard}>
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarText}>{emailInitial}</Text>
        </View>
        <Text style={styles.userName}>
          {user?.email ? user.email.split('@')[0] : 'Campus Student'}
        </Text>
        <Text style={styles.userEmail}>
          {user?.email || 'student@university.edu'}
        </Text>
        <View style={styles.statusBadge}>
          <Text style={styles.statusBadgeText}>✓ Firebase Authenticated</Text>
        </View>
      </CustomCard>

      {/* Account Info Card */}
      <CustomCard style={styles.infoCard}>
        <Text style={styles.cardHeader}>Account Details</Text>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Account UID</Text>
          <Text style={styles.infoValue} numberOfLines={1}>
            {user?.uid ? `${user.uid.substring(0, 14)}...` : 'N/A'}
          </Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Auth Provider</Text>
          <Text style={styles.infoValue}>Firebase Email/Password</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Campus Affiliation</Text>
          <Text style={styles.infoValue}>Undergraduate Student</Text>
        </View>
      </CustomCard>

      {/* Local Storage & Preferences Card */}
      <CustomCard style={styles.infoCard}>
        <Text style={styles.cardHeader}>Local Persistence (AsyncStorage)</Text>

        <TouchableOpacity
          style={styles.clickableRow}
          onPress={onNavigateToFavorites}
        >
          <View>
            <Text style={styles.infoLabel}>Saved Bookmarks</Text>
            <Text style={styles.infoSubtext}>Offline-cached event IDs</Text>
          </View>
          <View style={styles.rightTag}>
            <Text style={styles.rightTagText}>{favorites.length} Events →</Text>
          </View>
        </TouchableOpacity>

        <View style={styles.divider} />

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Storage Key</Text>
          <Text style={styles.infoValue}>@campus_event_manager_favs</Text>
        </View>
      </CustomCard>

      {/* About App Card */}
      <CustomCard style={styles.infoCard}>
        <Text style={styles.cardHeader}>System & Lab Info</Text>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Experiment</Text>
          <Text style={styles.infoValue}>E12 — Mini Mobile Application</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Architecture</Text>
          <Text style={styles.infoValue}>Context API + Axios + Firebase</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>App Version</Text>
          <Text style={styles.infoValue}>1.0.0 (Release Build)</Text>
        </View>
      </CustomCard>

      {/* Logout Action */}
      <View style={styles.logoutWrapper}>
        <CustomButton
          title="Sign Out of Campus Hub"
          variant="danger"
          onPress={handleLogout}
          isLoading={isLoggingOut}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  profileCard: {
    alignItems: 'center',
    padding: 24,
    marginBottom: 16,
  },
  avatarCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#4F46E5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarText: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  userName: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  userEmail: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
  },
  statusBadge: {
    marginTop: 10,
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#059669',
  },
  infoCard: {
    padding: 16,
    marginBottom: 16,
  },
  cardHeader: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  clickableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  infoLabel: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
  },
  infoSubtext: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 2,
  },
  infoValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1E293B',
  },
  rightTag: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  rightTagText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4F46E5',
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 12,
  },
  logoutWrapper: {
    marginTop: 8,
  },
});

export default ProfileScreen;
