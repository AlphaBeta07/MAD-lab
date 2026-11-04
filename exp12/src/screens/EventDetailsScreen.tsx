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
import { CustomHeader } from '../components/CustomHeader';
import { CustomCard } from '../components/CustomCard';
import { CustomButton } from '../components/CustomButton';

interface EventDetailsScreenProps {
  onBack: () => void;
}

export const EventDetailsScreen: React.FC<EventDetailsScreenProps> = ({
  onBack,
}) => {
  const { selectedEvent, isFavorite, toggleFavorite, user } = useApp();
  const [hasRsvpd, setHasRsvpd] = useState<boolean>(false);

  if (!selectedEvent) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyIcon}>🔍</Text>
        <Text style={styles.emptyTitle}>No Event Selected</Text>
        <Text style={styles.emptySubtitle}>
          Please select an event from the events catalog to view full details.
        </Text>
        <CustomButton
          title="Back to Events"
          onPress={onBack}
          style={styles.backBtn}
        />
      </View>
    );
  }

  const favorited = isFavorite(selectedEvent.id);

  const handleRsvp = (): void => {
    if (hasRsvpd) {
      setHasRsvpd(false);
      Alert.alert(
        'RSVP Cancelled',
        `Your reservation for "${selectedEvent.title}" has been cancelled.`
      );
    } else {
      setHasRsvpd(true);
      Alert.alert(
        'RSVP Confirmed! 🎉',
        `You have successfully reserved a seat for "${selectedEvent.title}". A calendar confirmation has been registered for ${user?.email || 'your account'}.`
      );
    }
  };

  return (
    <View style={styles.container}>
      <CustomHeader
        title="Event Details"
        onBack={onBack}
        rightElement={
          <TouchableOpacity
            style={styles.headerFavBtn}
            onPress={() => toggleFavorite(selectedEvent.id)}
          >
            <Text style={styles.headerFavIcon}>
              {favorited ? '❤️' : '🤍'}
            </Text>
          </TouchableOpacity>
        }
      />

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Hero Card */}
        <CustomCard style={styles.heroCard}>
          <View style={styles.heroTop}>
            <Text style={styles.heroEmoji}>{selectedEvent.emoji}</Text>
            <View style={styles.categoryPill}>
              <Text style={styles.categoryPillText}>
                {selectedEvent.category}
              </Text>
            </View>
          </View>

          <Text style={styles.eventTitle}>{selectedEvent.title}</Text>
          <Text style={styles.organizerText}>
            Organized by {selectedEvent.organizer}
          </Text>
        </CustomCard>

        {/* Schedule & Logistics Grid */}
        <CustomCard style={styles.logisticsCard}>
          <Text style={styles.sectionHeading}>Event Logistics</Text>

          <View style={styles.logisticsRow}>
            <View style={styles.logisticItem}>
              <Text style={styles.logisticIcon}>📅</Text>
              <View>
                <Text style={styles.logisticLabel}>Date</Text>
                <Text style={styles.logisticValue}>{selectedEvent.date}</Text>
              </View>
            </View>

            <View style={styles.logisticItem}>
              <Text style={styles.logisticIcon}>⏰</Text>
              <View>
                <Text style={styles.logisticLabel}>Time</Text>
                <Text style={styles.logisticValue}>{selectedEvent.time}</Text>
              </View>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.logisticsRow}>
            <View style={styles.logisticItem}>
              <Text style={styles.logisticIcon}>📍</Text>
              <View style={styles.logisticTextWrap}>
                <Text style={styles.logisticLabel}>Venue</Text>
                <Text style={styles.logisticValue}>{selectedEvent.venue}</Text>
              </View>
            </View>

            <View style={styles.logisticItem}>
              <Text style={styles.logisticIcon}>👥</Text>
              <View>
                <Text style={styles.logisticLabel}>Attendees</Text>
                <Text style={styles.logisticValue}>
                  {selectedEvent.registeredCount + (hasRsvpd ? 1 : 0)} Enrolled
                </Text>
              </View>
            </View>
          </View>
        </CustomCard>

        {/* Description Section */}
        <CustomCard style={styles.descCard}>
          <Text style={styles.sectionHeading}>About this Campus Event</Text>
          <Text style={styles.descBody}>{selectedEvent.description}</Text>
          <Text style={[styles.descBody, styles.descExtra]}>
            Join fellow university students, faculty, and industry leaders.
            Bring your student ID card for automated attendance check-in at the
            auditorium desk. Refreshments and certificate of participation will
            be distributed upon conclusion.
          </Text>
        </CustomCard>

        {/* Action Controls */}
        <View style={styles.actionGroup}>
          <CustomButton
            title={hasRsvpd ? '✓ RSVP Registered (Tap to Cancel)' : 'RSVP for This Event 🎟️'}
            variant={hasRsvpd ? 'secondary' : 'primary'}
            onPress={handleRsvp}
            style={styles.rsvpBtn}
          />

          <CustomButton
            title={
              favorited
                ? '❤️ Remove from Favorites'
                : '⭐ Add to Favorites'
            }
            variant="outline"
            onPress={() => toggleFavorite(selectedEvent.id)}
            style={styles.favToggleBtn}
          />
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scroll: {
    padding: 16,
    paddingBottom: 40,
  },
  headerFavBtn: {
    padding: 6,
  },
  headerFavIcon: {
    fontSize: 22,
  },
  heroCard: {
    padding: 20,
    marginBottom: 16,
    backgroundColor: '#FFFFFF',
  },
  heroTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  heroEmoji: {
    fontSize: 44,
  },
  categoryPill: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#C7D2FE',
  },
  categoryPillText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4F46E5',
  },
  eventTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
    lineHeight: 26,
    letterSpacing: -0.3,
    marginBottom: 6,
  },
  organizerText: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
  },
  logisticsCard: {
    padding: 18,
    marginBottom: 16,
  },
  sectionHeading: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 14,
  },
  logisticsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  logisticItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logisticIcon: {
    fontSize: 22,
  },
  logisticLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#94A3B8',
    textTransform: 'uppercase',
  },
  logisticValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E293B',
    marginTop: 2,
  },
  logisticTextWrap: {
    flex: 1,
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 14,
  },
  descCard: {
    padding: 18,
    marginBottom: 20,
  },
  descBody: {
    fontSize: 14,
    color: '#334155',
    lineHeight: 22,
  },
  descExtra: {
    marginTop: 10,
    color: '#64748B',
  },
  actionGroup: {
    gap: 10,
  },
  rsvpBtn: {
    minHeight: 48,
  },
  favToggleBtn: {
    minHeight: 44,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
    backgroundColor: '#F8FAFC',
  },
  emptyIcon: {
    fontSize: 48,
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
    marginBottom: 20,
    lineHeight: 18,
  },
  backBtn: {
    minWidth: 160,
  },
});

export default EventDetailsScreen;
