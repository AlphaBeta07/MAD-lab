import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { useApp, CampusEvent } from '../context/AppContext';
import { fetchCampusEvents } from '../services/eventApi';
import { CustomCard } from '../components/CustomCard';
import { CustomButton } from '../components/CustomButton';

interface EventListScreenProps {
  onSelectEvent: (event: CampusEvent) => void;
}

const CATEGORY_FILTERS = [
  'All',
  'Tech & Coding',
  'Arts & Culture',
  'Sports & Fitness',
  'Career & Placement',
  'Academic Seminar',
];

export const EventListScreen: React.FC<EventListScreenProps> = ({
  onSelectEvent,
}) => {
  const { toggleFavorite, isFavorite } = useApp();

  const [events, setEvents] = useState<CampusEvent[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const loadEvents = useCallback(async (): Promise<void> => {
    setError(null);
    try {
      const data = (await fetchCampusEvents(20)) as CampusEvent[];
      setEvents(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to retrieve events.'
      );
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  const onRefresh = (): void => {
    setRefreshing(true);
    loadEvents();
  };

  // Filter events based on search query and category
  const filteredEvents = useMemo(() => {
    return events.filter((ev) => {
      const matchesCategory =
        selectedCategory === 'All' || ev.category === selectedCategory;
      const q = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !q ||
        ev.title.toLowerCase().includes(q) ||
        ev.description.toLowerCase().includes(q) ||
        ev.venue.toLowerCase().includes(q);
      return matchesCategory && matchesSearch;
    });
  }, [events, selectedCategory, searchQuery]);

  const renderEventItem = ({ item }: { item: CampusEvent }) => {
    const favorited = isFavorite(item.id);

    return (
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => onSelectEvent(item)}
      >
        <CustomCard style={styles.eventCard}>
          <View style={styles.cardHeader}>
            <Text style={styles.emoji}>{item.emoji}</Text>
            <View style={styles.titleContainer}>
              <View style={styles.tagRow}>
                <Text style={styles.categoryBadge}>{item.category}</Text>
                <Text style={styles.dateBadge}>📅 {item.date}</Text>
              </View>
              <Text style={styles.eventTitle} numberOfLines={2}>
                {item.title}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.favBtn}
              onPress={() => toggleFavorite(item.id)}
            >
              <Text style={styles.favIcon}>{favorited ? '❤️' : '🤍'}</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.description} numberOfLines={2}>
            {item.description}
          </Text>

          <View style={styles.cardFooter}>
            <Text style={styles.venueText}>📍 {item.venue}</Text>
            <Text style={styles.attendeesBadge}>
              👥 {item.registeredCount} going
            </Text>
          </View>
        </CustomCard>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchWrapper}>
        <View style={styles.searchBox}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search events, workshops, venues..."
            placeholderTextColor="#94A3B8"
            value={searchQuery}
            onChangeText={setSearchQuery}
            clearButtonMode="while-editing"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Text style={styles.clearIcon}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Category Filter Horizontal Scroll */}
      <View style={styles.filtersWrapper}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={CATEGORY_FILTERS}
          keyExtractor={(item) => item}
          contentContainerStyle={styles.filterList}
          renderItem={({ item }) => {
            const isSelected = selectedCategory === item;
            return (
              <TouchableOpacity
                style={[
                  styles.filterChip,
                  isSelected && styles.filterChipActive,
                ]}
                onPress={() => setSelectedCategory(item)}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    isSelected && styles.filterChipTextActive,
                  ]}
                >
                  {item}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      {/* Main List Section */}
      {isLoading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#4F46E5" />
          <Text style={styles.loadingMessage}>
            Loading live events from campus API...
          </Text>
        </View>
      ) : error ? (
        <View style={styles.centerContainer}>
          <CustomCard style={styles.errorCard}>
            <Text style={styles.errorIcon}>📡</Text>
            <Text style={styles.errorTitle}>Unable to Reach Event Server</Text>
            <Text style={styles.errorText}>{error}</Text>
            <CustomButton
              title="Retry Fetch"
              onPress={loadEvents}
              style={styles.retryBtn}
            />
          </CustomCard>
        </View>
      ) : (
        <FlatList
          data={filteredEvents}
          keyExtractor={(item) => item.id}
          renderItem={renderEventItem}
          contentContainerStyle={styles.listContent}
          refreshing={refreshing}
          onRefresh={onRefresh}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>🔍</Text>
              <Text style={styles.emptyTitle}>No matching events found</Text>
              <Text style={styles.emptySubtitle}>
                Try adjusting your search query or switching categories.
              </Text>
            </View>
          }
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
  searchWrapper: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 42,
  },
  searchIcon: {
    fontSize: 14,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#0F172A',
    padding: 0,
  },
  clearIcon: {
    fontSize: 14,
    color: '#64748B',
    padding: 4,
  },
  filtersWrapper: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    paddingVertical: 10,
  },
  filterList: {
    paddingHorizontal: 16,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  filterChipActive: {
    backgroundColor: '#4F46E5',
    borderColor: '#4F46E5',
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  filterChipTextActive: {
    color: '#FFFFFF',
  },
  listContent: {
    padding: 16,
    paddingBottom: 30,
  },
  eventCard: {
    marginBottom: 12,
    padding: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  emoji: {
    fontSize: 32,
  },
  titleContainer: {
    flex: 1,
  },
  tagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  categoryBadge: {
    fontSize: 10,
    fontWeight: '700',
    color: '#4F46E5',
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    overflow: 'hidden',
  },
  dateBadge: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
  },
  eventTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    lineHeight: 20,
  },
  favBtn: {
    padding: 4,
  },
  favIcon: {
    fontSize: 22,
  },
  description: {
    fontSize: 13,
    color: '#475569',
    marginTop: 8,
    lineHeight: 18,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  venueText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
    flex: 1,
  },
  attendeesBadge: {
    fontSize: 11,
    fontWeight: '700',
    color: '#059669',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    overflow: 'hidden',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingMessage: {
    marginTop: 12,
    fontSize: 14,
    color: '#64748B',
  },
  errorCard: {
    padding: 20,
    alignItems: 'center',
    width: '100%',
    borderColor: '#FECACA',
    backgroundColor: '#FEF2F2',
  },
  errorIcon: {
    fontSize: 36,
    marginBottom: 8,
  },
  errorTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#991B1B',
    marginBottom: 6,
  },
  errorText: {
    fontSize: 13,
    color: '#7F1D1D',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 18,
  },
  retryBtn: {
    width: '100%',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyIcon: {
    fontSize: 40,
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
  },
});

export default EventListScreen;
