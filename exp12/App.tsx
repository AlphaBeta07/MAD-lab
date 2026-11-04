import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { AppProvider, useApp, CampusEvent } from './src/context/AppContext';
import { LoginScreen } from './src/screens/LoginScreen';
import { RegisterScreen } from './src/screens/RegisterScreen';
import { HomeScreen } from './src/screens/HomeScreen';
import { EventListScreen } from './src/screens/EventListScreen';
import { EventDetailsScreen } from './src/screens/EventDetailsScreen';
import { FavoritesScreen } from './src/screens/FavoritesScreen';
import { ProfileScreen } from './src/screens/ProfileScreen';

type AuthScreen = 'login' | 'register';
type MainTab = 'home' | 'events' | 'favorites' | 'profile';
type ActiveScreen = MainTab | 'details';

const MainNavigator: React.FC = () => {
  const insets = useSafeAreaInsets();
  const { user, isAuthLoading, favorites, setSelectedEvent } = useApp();

  const [authScreen, setAuthScreen] = useState<AuthScreen>('login');
  const [activeTab, setActiveTab] = useState<MainTab>('home');
  const [activeScreen, setActiveScreen] = useState<ActiveScreen>('home');
  const [previousTab, setPreviousTab] = useState<MainTab>('home');

  // Handle Event Selection -> Open Details
  const handleSelectEvent = (event: CampusEvent): void => {
    setSelectedEvent(event);
    setPreviousTab(activeTab);
    setActiveScreen('details');
  };

  // Switch between tabs
  const handleSwitchTab = (tab: MainTab): void => {
    setActiveTab(tab);
    setActiveScreen(tab);
  };

  // Back from details
  const handleBackFromDetails = (): void => {
    setActiveScreen(previousTab);
  };

  // 1. Splash / Auth Loading State
  if (isAuthLoading) {
    return (
      <View style={[styles.centerContainer, { paddingTop: insets.top }]}>
        <Text style={styles.splashBadge}>🎓 Campus Event Manager</Text>
        <ActivityIndicator size="large" color="#4F46E5" style={styles.splashSpinner} />
        <Text style={styles.splashText}>Connecting to campus services...</Text>
      </View>
    );
  }

  // 2. Unauthenticated Flow (Login / Register)
  if (!user) {
    return (
      <View
        style={[
          styles.container,
          { paddingTop: insets.top, paddingBottom: insets.bottom },
        ]}
      >
        {authScreen === 'login' ? (
          <LoginScreen onNavigateToRegister={() => setAuthScreen('register')} />
        ) : (
          <RegisterScreen onNavigateToLogin={() => setAuthScreen('login')} />
        )}
      </View>
    );
  }

  // 3. Authenticated Flow (Home, Events, Details, Favorites, Profile)
  return (
    <View
      style={[
        styles.container,
        { paddingTop: insets.top, paddingBottom: insets.bottom },
      ]}
    >
      {/* Top Campus App Bar (only shown when not on Details screen) */}
      {activeScreen !== 'details' && (
        <View style={styles.topBar}>
          <View>
            <Text style={styles.topBarBrand}>🎓 Campus Event Manager</Text>
            <Text style={styles.topBarSub}>
              {activeTab === 'home' && 'Student Portal & Highlights'}
              {activeTab === 'events' && 'Browse Upcoming Events'}
              {activeTab === 'favorites' && 'Bookmarked Events'}
              {activeTab === 'profile' && 'Student Profile & Settings'}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.avatarPill}
            onPress={() => handleSwitchTab('profile')}
          >
            <Text style={styles.avatarPillText}>
              {user.email ? user.email.charAt(0).toUpperCase() : '👤'}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Main Content Area */}
      <View style={styles.contentArea}>
        {activeScreen === 'details' && (
          <EventDetailsScreen onBack={handleBackFromDetails} />
        )}
        {activeScreen === 'home' && (
          <HomeScreen
            onNavigateToEvents={() => handleSwitchTab('events')}
            onNavigateToFavorites={() => handleSwitchTab('favorites')}
            onNavigateToProfile={() => handleSwitchTab('profile')}
            onSelectEvent={handleSelectEvent}
          />
        )}
        {activeScreen === 'events' && (
          <EventListScreen onSelectEvent={handleSelectEvent} />
        )}
        {activeScreen === 'favorites' && (
          <FavoritesScreen
            onSelectEvent={handleSelectEvent}
            onExploreEvents={() => handleSwitchTab('events')}
          />
        )}
        {activeScreen === 'profile' && (
          <ProfileScreen
            onNavigateToFavorites={() => handleSwitchTab('favorites')}
          />
        )}
      </View>

      {/* Bottom Tab Bar (hidden when on EventDetails for focus) */}
      {activeScreen !== 'details' && (
        <View style={styles.bottomTabBar}>
          <TouchableOpacity
            style={styles.tabItem}
            onPress={() => handleSwitchTab('home')}
          >
            <Text
              style={[
                styles.tabIcon,
                activeTab === 'home' && styles.tabIconActive,
              ]}
            >
              🏠
            </Text>
            <Text
              style={[
                styles.tabLabel,
                activeTab === 'home' && styles.tabLabelActive,
              ]}
            >
              Home
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.tabItem}
            onPress={() => handleSwitchTab('events')}
          >
            <Text
              style={[
                styles.tabIcon,
                activeTab === 'events' && styles.tabIconActive,
              ]}
            >
              🗓️
            </Text>
            <Text
              style={[
                styles.tabLabel,
                activeTab === 'events' && styles.tabLabelActive,
              ]}
            >
              Events
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.tabItem}
            onPress={() => handleSwitchTab('favorites')}
          >
            <View style={styles.tabIconWrapper}>
              <Text
                style={[
                  styles.tabIcon,
                  activeTab === 'favorites' && styles.tabIconActive,
                ]}
              >
                ⭐
              </Text>
              {favorites.length > 0 && (
                <View style={styles.badgePill}>
                  <Text style={styles.badgeText}>{favorites.length}</Text>
                </View>
              )}
            </View>
            <Text
              style={[
                styles.tabLabel,
                activeTab === 'favorites' && styles.tabLabelActive,
              ]}
            >
              Favorites
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.tabItem}
            onPress={() => handleSwitchTab('profile')}
          >
            <Text
              style={[
                styles.tabIcon,
                activeTab === 'profile' && styles.tabIconActive,
              ]}
            >
              👤
            </Text>
            <Text
              style={[
                styles.tabLabel,
                activeTab === 'profile' && styles.tabLabelActive,
              ]}
            >
              Profile
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

export default function App(): React.JSX.Element {
  return (
    <SafeAreaProvider>
      <StatusBar barStyle="dark-content" />
      <AppProvider>
        <MainNavigator />
      </AppProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  contentArea: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    padding: 20,
  },
  splashBadge: {
    fontSize: 20,
    fontWeight: '800',
    color: '#4F46E5',
    marginBottom: 20,
  },
  splashSpinner: {
    marginBottom: 16,
  },
  splashText: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  topBarBrand: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.3,
  },
  topBarSub: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
    fontWeight: '500',
  },
  avatarPill: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#EEF2FF',
    borderWidth: 1,
    borderColor: '#C7D2FE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarPillText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#4F46E5',
  },
  bottomTabBar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingVertical: 8,
    paddingHorizontal: 8,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
  },
  tabIconWrapper: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabIcon: {
    fontSize: 20,
    opacity: 0.6,
  },
  tabIconActive: {
    opacity: 1,
    transform: [{ scale: 1.1 }],
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
    marginTop: 3,
  },
  tabLabelActive: {
    color: '#4F46E5',
    fontWeight: '800',
  },
  badgePill: {
    position: 'absolute',
    top: -4,
    right: -10,
    backgroundColor: '#EF4444',
    borderRadius: 10,
    minWidth: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
  },
});
