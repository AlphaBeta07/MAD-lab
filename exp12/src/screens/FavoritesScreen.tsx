import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useApp, CampusEvent } from '../context/AppContext';
import { fetchCampusEvents } from '../services/eventApi';
import { CustomCard } from '../components/CustomCard';
import { CustomButton } from '../components/CustomButton';

interface FavoritesScreenProps {
  onSelectEvent: (event: CampusEvent) => void;
  onExploreEvents: () => void;
}

export const FavoritesScreen: React.FC<FavoritesScreenProps> = ({
  onSelectEvent,
  onExploreEvents,
}) => {
  const { favorites, toggleFavorite } = useApp();

  const [allEvents, setAllEvents] = useState<CampusEvent[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async (): Promise<void> => {
    setError(null);
    try {
      const data = (await fetchCampusEvents(30)) as CampusEvent[];
      setAllEvents(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to retrieve saved events.'
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Filter only favorited events
  const favoritedEvents = useMemo(() => {
    return allEvents.filter((ev) => favorites.includes(ev.id));
  }, [allEvents, favorites]);

  const renderItem = ({ item }: { item: CampusEvent }) => (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={() => onSelectEvent(item)}
    >
      <CustomCard style={styles.card}>
        <View style={styles.cardTop}>
          <Text style={styles.emoji}>{item.emoji}</Text>
          <View style={styles.titleWrap}>
            <Text style={styles.category}>{item.category.toUpperCase()}</Text>
            <Text style={styles.title} numberOfLines={2}>
              {item.title}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.removeBtn}
            onPress={() => toggleFavorite(item.id)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text style={styles.removeIcon}>❤️</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.metaRow}>
          <Text style={styles.metaText}>📅 {item.date}</Text>
          <Text style={styles.metaText}>⏰ {item.time}</Text>
        </View>
        <Text style={styles.venueText}>📍 {item.venue}</Text>
      </CustomCard>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Top Counter Bar */}
      <View style={styles.headerBar}>
        <View>
          <Text style={styles.headerTitle}>Saved Favorites</Text>
          <Text style={styles.headerSub}>
            Persisted locally with AsyncStorage
          </Text>
        </View>
        <View style={styles.countBadge}>
          <Text style={styles.countText}>{favorites.length} Saved</Text>
        </View>
      </View>

      {isLoading ? (
        <View style={styles.centerBox}>
          <ActivityIndicator size="large" color="#4F46E5" />
          <Text style={styles.loadingText}>Syncing saved favorites...</Text>
        </View>
      ) : error ? (
        <View style={styles.centerBox}>
          <CustomCard style={styles.errorCard}>
            <Text style={styles.errorTitle}>Error Loading Favorites</Text>
            <Text style={styles.errorText}>{error}</Text>
            <CustomButton title="Retry" onPress={loadData} />
          </CustomCard>
        </View>
      ) : favoritedEvents.length === 0 ? (
        <View style={styles.emptyBox}>
          <Text style={styles.emptyIcon}>⭐</Text>
          <Text style={styles.emptyTitle}>No Favorite Events Saved Yet</Text>
          <Text style={styles.emptyText}>
            Tap the heart icon on any event to bookmark it for offline access
            and quick tracking.
          </Text>
          <CustomButton
            title="Explore Campus Events"
            onPress={onExploreEvents}
            style={styles.exploreBtn}
          />
        </View>
      ) : (
        <FlatList
          data={favoritedEvents}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
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
  headerBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  headerSub: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  countBadge: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#C7D2FE',
  },
  countText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4F46E5',
  },
  listContent: {
    padding: 16,
    paddingBottom: 30,
  },
  card: {
    marginBottom: 12,
    padding: 16,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  emoji: {
    fontSize: 30,
  },
  titleWrap: {
    flex: 1,
  },
  category: {
    fontSize: 10,
    fontWeight: '700',
    color: '#4F46E5',
    marginBottom: 2,
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    lineHeight: 20,
  },
  removeBtn: {
    padding: 4,
  },
  removeIcon: {
    fontSize: 20,
  },
  metaRow: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  metaText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  venueText: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 4,
    fontWeight: '500',
  },
  centerBox: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 13,
    color: '#64748B',
  },
  errorCard: {
    padding: 20,
    alignItems: 'center',
    width: '100%',
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
  },
  errorTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#991B1B',
    marginBottom: 4,
  },
  errorText: {
    fontSize: 13,
    color: '#7F1D1D',
    marginBottom: 12,
    textAlign: 'center',
  },
  emptyBox: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 6,
  },
  emptyText: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 20,
  },
  exploreBtn: {
    minWidth: 180,
  },
});

export default FavoritesScreen;
