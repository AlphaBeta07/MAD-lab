import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  ListRenderItem,
  ScrollView,
} from 'react-native';
import { fetchUsers, fetchUsersWithAxios } from '../services/userApi';

// Local TypeScript interfaces for the JSONPlaceholder User schema
interface Address {
  city?: string;
  street?: string;
  suite?: string;
  zipcode?: string;
}

interface Company {
  name?: string;
  catchPhrase?: string;
  bs?: string;
}

interface User {
  id: number;
  name: string;
  username: string;
  email: string;
  phone: string;
  website: string;
  address?: Address;
  company?: Company;
}

type RequestMethod = 'fetch' | 'axios';

export const ApiDemoScreen: React.FC = () => {
  // State hooks for data, loading, error, and active method
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selectedMethod, setSelectedMethod] = useState<RequestMethod>('fetch');
  const [requestLatency, setRequestLatency] = useState<number | null>(null);
  const [showComparison, setShowComparison] = useState<boolean>(true);

  // Ref to avoid state updates on unmounted component
  const isMountedRef = useRef<boolean>(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Centralized data loading function supporting both Fetch and Axios
  const loadUsersData = useCallback(async (method: RequestMethod) => {
    setIsLoading(true);
    setErrorMessage(null);
    setSelectedMethod(method);

    const startTime = Date.now();

    try {
      let data: User[];
      if (method === 'fetch') {
        data = (await fetchUsers()) as User[];
      } else {
        data = (await fetchUsersWithAxios()) as User[];
      }

      if (isMountedRef.current) {
        setUsers(data);
        setRequestLatency(Date.now() - startTime);
        setIsLoading(false);
      }
    } catch (error) {
      if (isMountedRef.current) {
        setErrorMessage(
          error instanceof Error
            ? error.message
            : 'An unexpected error occurred while fetching data.'
        );
        setIsLoading(false);
      }
    }
  }, []);

  // Load initial data on mount using Fetch API
  useEffect(() => {
    loadUsersData('fetch');
  }, [loadUsersData]);

  // Render individual user card
  const renderUserItem: ListRenderItem<User> = ({ item }) => {
    return (
      <View style={styles.card}>
        {/* Card Header: Avatar ID and Names */}
        <View style={styles.cardHeader}>
          <View style={styles.idBadge}>
            <Text style={styles.idBadgeText}>#{item.id}</Text>
          </View>
          <View style={styles.nameContainer}>
            <Text style={styles.userName}>{item.name}</Text>
            <Text style={styles.userHandle}>@{item.username}</Text>
          </View>
        </View>

        {/* Card Body: Details */}
        <View style={styles.cardDivider} />

        <View style={styles.detailRow}>
          <Text style={styles.detailIcon}>📧</Text>
          <Text style={styles.detailText} numberOfLines={1}>
            {item.email}
          </Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.detailIcon}>📞</Text>
          <Text style={styles.detailText} numberOfLines={1}>
            {item.phone}
          </Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.detailIcon}>🌐</Text>
          <Text style={styles.detailText} numberOfLines={1}>
            {item.website}
          </Text>
        </View>

        {item.company?.name && (
          <View style={styles.detailRow}>
            <Text style={styles.detailIcon}>🏢</Text>
            <Text style={styles.detailText} numberOfLines={1}>
              {item.company.name}
            </Text>
          </View>
        )}

        {item.address?.city && (
          <View style={styles.detailRow}>
            <Text style={styles.detailIcon}>📍</Text>
            <Text style={styles.detailText} numberOfLines={1}>
              {item.address.city}
            </Text>
          </View>
        )}
      </View>
    );
  };

  // Render header component containing buttons, indicators, and comparison card
  const renderListHeader = () => (
    <View style={styles.headerContainer}>
      {/* Action Buttons */}
      <View style={styles.buttonGroup}>
        <TouchableOpacity
          style={[
            styles.methodButton,
            selectedMethod === 'fetch' && styles.methodButtonActive,
          ]}
          onPress={() => loadUsersData('fetch')}
          activeOpacity={0.7}
          disabled={isLoading}
        >
          <Text
            style={[
              styles.methodButtonText,
              selectedMethod === 'fetch' && styles.methodButtonTextActive,
            ]}
          >
           Fetch Users
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.methodButton,
            selectedMethod === 'axios' && styles.methodButtonActive,
          ]}
          onPress={() => loadUsersData('axios')}
          activeOpacity={0.7}
          disabled={isLoading}
        >
          <Text
            style={[
              styles.methodButtonText,
              selectedMethod === 'axios' && styles.methodButtonTextActive,
            ]}
          >
            Load with Axios
          </Text>
        </TouchableOpacity>
      </View>

      {/* Status & Method Badge */}
      <View style={styles.statusRow}>
        <View style={styles.statusPill}>
          <Text style={styles.statusPillLabel}>Active Method:</Text>
          <Text style={styles.statusPillValue}>
            {selectedMethod === 'fetch' ? 'Fetch API (Native)' : 'Axios (Library)'}
          </Text>
        </View>

        {requestLatency !== null && (
          <View style={styles.latencyPill}>
            <Text style={styles.latencyText}>⏱️ {requestLatency} ms</Text>
          </View>
        )}

        <View style={styles.countPill}>
          <Text style={styles.countText}>{users.length} Users</Text>
        </View>
      </View>

      {/* Comparison Section */}
      <View style={styles.comparisonCard}>
        <TouchableOpacity
          style={styles.comparisonHeaderRow}
          onPress={() => setShowComparison((prev) => !prev)}
          activeOpacity={0.7}
        >
          <Text style={styles.comparisonTitle}>
            Fetch API vs. Axios Comparison
          </Text>
          <Text style={styles.collapseToggleText}>
            {showComparison ? 'Hide' : 'View'}
          </Text>
        </TouchableOpacity>

        {showComparison && (
          <View style={styles.comparisonBody}>
            {/* Fetch Column */}
            <View style={styles.comparisonBlock}>
              <Text style={styles.blockTitleFetch}>Fetch API</Text>
              <Text style={styles.comparisonPoint}>• Built into the React Native environment</Text>
              <Text style={styles.comparisonPoint}>• Requires checking `response.ok`</Text>
              <Text style={styles.comparisonPoint}>• Requires manual `response.json()` parsing</Text>
              <Text style={styles.comparisonPoint}>• Supports Promise-based async requests</Text>
            </View>

            {/* Axios Column */}
            <View style={styles.comparisonBlock}>
              <Text style={styles.blockTitleAxios}>Axios</Text>
              <Text style={styles.comparisonPoint}>• Requires an additional npm package</Text>
              <Text style={styles.comparisonPoint}>• Automatically parses typical JSON responses</Text>
              <Text style={styles.comparisonPoint}>• Rejects non-2xx HTTP status codes by default</Text>
              <Text style={styles.comparisonPoint}>• Convenient request config and timeout support</Text>
            </View>
          </View>
        )}
      </View>

      <Text style={styles.sectionSubtitle}>
        Retrieved User Profiles from JSONPlaceholder:
      </Text>
    </View>
  );

  // Render error card
  const renderErrorView = () => (
    <View style={styles.centerContainer}>
      <Text style={styles.errorIcon}>⚠️</Text>
      <Text style={styles.errorTitle}>Request Failed</Text>
      <Text style={styles.errorMessage}>{errorMessage}</Text>
      <TouchableOpacity
        style={styles.retryButton}
        onPress={() => loadUsersData(selectedMethod)}
        activeOpacity={0.8}
      >
        <Text style={styles.retryButtonText}>Retry Request</Text>
      </TouchableOpacity>
    </View>
  );

  // Render empty state
  const renderEmptyComponent = () => (
    <View style={styles.centerContainer}>
      <Text style={styles.emptyIcon}>👥</Text>
      <Text style={styles.emptyTitle}>No Users Loaded</Text>
      <Text style={styles.emptySubtitle}>
        Press either "Fetch Users" or "Load with Axios" to retrieve dynamic data from the REST API.
      </Text>
      <TouchableOpacity
        style={styles.retryButton}
        onPress={() => loadUsersData('fetch')}
      >
        <Text style={styles.retryButtonText}>Load Users</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Top App Header */}
      <View style={styles.topHeader}>
        <Text style={styles.appTitle}>API Integration Demo</Text>
        <Text style={styles.appSubtitle}>Fetch API vs Axios</Text>
      </View>

      {/* Dynamic Content */}
      {isLoading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#4F46E5" />
          <Text style={styles.loadingText}>
            Loading users via {selectedMethod === 'fetch' ? 'Fetch API' : 'Axios'}...
          </Text>
        </View>
      ) : errorMessage ? (
        <ScrollView contentContainerStyle={styles.scrollErrorContent}>
          {renderListHeader()}
          {renderErrorView()}
        </ScrollView>
      ) : (
        <FlatList<User>
          data={users}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderUserItem}
          ListHeaderComponent={renderListHeader}
          ListEmptyComponent={renderEmptyComponent}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  topHeader: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  appTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.5,
  },
  appSubtitle: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
    fontWeight: '500',
  },
  listContent: {
    padding: 16,
    paddingBottom: 28,
  },
  scrollErrorContent: {
    padding: 16,
  },
  headerContainer: {
    marginBottom: 12,
  },
  buttonGroup: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },
  methodButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#C7D2FE',
  },
  methodButtonActive: {
    backgroundColor: '#4F46E5',
    borderColor: '#4338CA',
  },
  methodButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#4338CA',
  },
  methodButtonTextActive: {
    color: '#FFFFFF',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 14,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 4,
  },
  statusPillLabel: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
  },
  statusPillValue: {
    fontSize: 11,
    color: '#0F172A',
    fontWeight: '700',
  },
  latencyPill: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  latencyText: {
    color: '#065F46',
    fontSize: 11,
    fontWeight: '700',
  },
  countPill: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  countText: {
    color: '#334155',
    fontSize: 11,
    fontWeight: '700',
  },
  comparisonCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  comparisonHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  comparisonTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E293B',
  },
  collapseToggleText: {
    fontSize: 12,
    color: '#4F46E5',
    fontWeight: '600',
  },
  comparisonBody: {
    marginTop: 12,
    gap: 10,
  },
  comparisonBlock: {
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 10,
    borderLeftWidth: 3,
    borderLeftColor: '#4F46E5',
  },
  blockTitleFetch: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0284C7',
    marginBottom: 4,
  },
  blockTitleAxios: {
    fontSize: 13,
    fontWeight: '700',
    color: '#7C3AED',
    marginBottom: 4,
  },
  comparisonPoint: {
    fontSize: 12,
    color: '#475569',
    lineHeight: 18,
  },
  sectionSubtitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
    marginBottom: 8,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  idBadge: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  idBadgeText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#4F46E5',
  },
  nameContainer: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  userHandle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 1,
  },
  cardDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 10,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  detailIcon: {
    fontSize: 13,
    width: 22,
    textAlign: 'center',
    marginRight: 8,
  },
  detailText: {
    fontSize: 13,
    color: '#334155',
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },
  errorIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#DC2626',
    marginBottom: 6,
  },
  errorMessage: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#4F46E5',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  emptyIcon: {
    fontSize: 52,
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 16,
  },
});

export default ApiDemoScreen;
