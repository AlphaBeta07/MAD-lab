import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useApp, CampusEvent } from '../context/AppContext';
import { fetchCampusEvents } from '../services/eventApi';
import { CustomCard } from '../components/CustomCard';
import { CustomButton } from '../components/CustomButton';

interface HomeScreenProps {
  onNavigateToEvents: () => void;
  onNavigateToFavorites: () => void;
  onNavigateToProfile: () => void;
  onSelectEvent: (event: CampusEvent) => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onNavigateToEvents,
  onNavigateToFavorites,
  onNavigateToProfile,
  onSelectEvent,
}) => {
  const { user, favorites, toggleFavorite, isFavorite } = useApp();

  const [featuredEvents, setFeaturedEvents] = useState<CampusEvent[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const loadFeatured = useCallback(async (): Promise<void> => {
    setError(null);
    try {
      const data = (await fetchCampusEvents(4)) as CampusEvent[];
      setFeaturedEvents(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Unable to load featured events.'
      );
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadFeatured();
  }, [loadFeatured]);

  const onRefresh = (): void => {
    setRefreshing(true);
    loadFeatured();
  };

  const userDisplayName = user?.email
    ? user.email.split('@')[0]
    : 'Campus Scholar';

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Hero Welcome Banner */}
      <View style={styles.hero}>
        <View style={styles.heroTop}>
          <Text style={styles.heroBadge}>🎓 Term: Fall 2026</Text>
          <TouchableOpacity onPress={onNavigateToProfile}>
            <Text style={styles.heroAvatar}>👤</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.heroGreeting}>Hello, {userDisplayName} 👋</Text>
        <Text style={styles.heroSub}>
          Explore campus happenings, research symposiums, and cultural fests.
        </Text>
      </View>

      {/* Quick Metrics Bar */}
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>15+</Text>
          <Text style={styles.statLabel}>Active Events</Text>
        </View>
        <TouchableOpacity
          style={[styles.statCard, styles.statCardAccent]}
          onPress={onNavigateToFavorites}
        >
          <Text style={styles.statNumber}>{favorites.length}</Text>
          <Text style={styles.statLabel}>Saved Favorites</Text>
        </TouchableOpacity>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>5</Text>
          <Text style={styles.statLabel}>Categories</Text>
        </View>
      </View>

      {/* Quick Navigation Action Shortcuts */}
      <View style={styles.shortcutsSection}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.shortcutRow}>
          <TouchableOpacity
            style={styles.shortcutBtn}
            onPress={onNavigateToEvents}
          >
            <Text style={styles.shortcutIcon}>🗓️</Text>
            <Text style={styles.shortcutText}>All Events</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.shortcutBtn}
            onPress={onNavigateToFavorites}
          >
            <Text style={styles.shortcutIcon}>⭐</Text>
            <Text style={styles.shortcutText}>My Favorites</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.shortcutBtn}
            onPress={onNavigateToProfile}
          >
            <Text style={styles.shortcutIcon}>⚙️</Text>
            <Text style={styles.shortcutText}>Profile</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Featured Events Section */}
      <View style={styles.featuredSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Featured Events</Text>
          <TouchableOpacity onPress={onNavigateToEvents}>
            <Text style={styles.seeAllText}>View All ({'>'})</Text>
          </TouchableOpacity>
        </View>

        {isLoading ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="small" color="#4F46E5" />
            <Text style={styles.loadingText}>Fetching live campus events...</Text>
          </View>
        ) : error ? (
          <CustomCard style={styles.errorCard}>
            <Text style={styles.errorTitle}>Failed to load events</Text>
            <Text style={styles.errorDesc}>{error}</Text>
            <CustomButton
              title="Try Again"
              variant="outline"
              onPress={loadFeatured}
              style={styles.retryBtn}
            />
          </CustomCard>
        ) : (
          featuredEvents.map((event) => {
            const favorited = isFavorite(event.id);
            return (
              <CustomCard key={event.id} style={styles.eventCard}>
                <View style={styles.eventCardHeader}>
                  <Text style={styles.eventEmoji}>{event.emoji}</Text>
                  <View style={styles.eventTitleWrap}>
                    <Text style={styles.eventCategory}>
                      {event.category.toUpperCase()}
                    </Text>
                    <Text style={styles.eventTitle} numberOfLines={2}>
                      {event.title}
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={styles.favIconBtn}
                    onPress={() => toggleFavorite(event.id)}
                  >
                    <Text style={styles.favIconText}>
                      {favorited ? '❤️' : '🤍'}
                    </Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.eventDetailsRow}>
                  <Text style={styles.eventMeta}>📅 {event.date}</Text>
                  <Text style={styles.eventMeta}>📍 {event.venue}</Text>
                </View>

                <View style={styles.cardFooter}>
                  <Text style={styles.attendeesText}>
                    👥 {event.registeredCount} attending
                  </Text>
                  <TouchableOpacity
                    style={styles.detailsBtn}
                    onPress={() => onSelectEvent(event)}
                  >
                    <Text style={styles.detailsBtnText}>Details →</Text>
                  </TouchableOpacity>
                </View>
              </CustomCard>
            );
          })
        )}
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
  hero: {
    backgroundColor: '#4F46E5',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  heroTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  heroBadge: {
    fontSize: 11,
    fontWeight: '700',
    color: '#EEF2FF',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    overflow: 'hidden',
  },
  heroAvatar: {
    fontSize: 22,
  },
  heroGreeting: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.3,
  },
  heroSub: {
    fontSize: 13,
    color: '#E0E7FF',
    marginTop: 4,
    lineHeight: 18,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  statCardAccent: {
    borderColor: '#C7D2FE',
    backgroundColor: '#F5F3FF',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1E293B',
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
    marginTop: 2,
  },
  shortcutsSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 10,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  seeAllText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#4F46E5',
  },
  shortcutRow: {
    flexDirection: 'row',
    gap: 10,
  },
  shortcutBtn: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  shortcutIcon: {
    fontSize: 22,
    marginBottom: 4,
  },
  shortcutText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#334155',
  },
  featuredSection: {
    marginBottom: 16,
  },
  loadingBox: {
    padding: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 8,
    fontSize: 13,
    color: '#64748B',
  },
  errorCard: {
    padding: 16,
    borderColor: '#FECACA',
    backgroundColor: '#FEF2F2',
  },
  errorTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#991B1B',
    marginBottom: 4,
  },
  errorDesc: {
    fontSize: 12,
    color: '#7F1D1D',
    marginBottom: 12,
  },
  retryBtn: {
    minHeight: 38,
  },
  eventCard: {
    marginBottom: 12,
    padding: 14,
  },
  eventCardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  eventEmoji: {
    fontSize: 28,
  },
  eventTitleWrap: {
    flex: 1,
  },
  eventCategory: {
    fontSize: 10,
    fontWeight: '700',
    color: '#4F46E5',
    marginBottom: 2,
    letterSpacing: 0.5,
  },
  eventTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    lineHeight: 20,
  },
  favIconBtn: {
    padding: 4,
  },
  favIconText: {
    fontSize: 20,
  },
  eventDetailsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  eventMeta: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  attendeesText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#059669',
  },
  detailsBtn: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  detailsBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4F46E5',
  },
});

export default HomeScreen;
