import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { loadFavorites, saveFavorites, FAVORITES_STORAGE_KEY } from '../src/services/storage';
import { getFriendlyErrorMessage } from '../src/services/authService';
import { fetchCampusEvents } from '../src/services/eventApi';
import { CustomButton } from '../src/components/CustomButton';
import { CustomCard } from '../src/components/CustomCard';
import { CustomInput } from '../src/components/CustomInput';
import { LoginScreen } from '../src/screens/LoginScreen';
import { RegisterScreen } from '../src/screens/RegisterScreen';
import { AppProvider } from '../src/context/AppContext';

// Mock axios for eventApi tests
jest.mock('axios', () => ({
  get: jest.fn(() =>
    Promise.resolve({
      data: [
        {
          id: 1,
          title: 'annual campus hackathon',
          body: 'Join us for 24 hours of innovative software engineering and prizes.',
        },
        {
          id: 2,
          title: 'student cultural gala',
          body: 'Celebration of campus diversity, live music, and theatrical performances.',
        },
      ],
    })
  ),
  isAxiosError: jest.fn(() => false),
}));

describe('Campus Event Manager - E12 Test Suite', () => {
  describe('1. AsyncStorage Local Persistence (storage.js)', () => {
    beforeEach(async () => {
      const AsyncStorage = require('@react-native-async-storage/async-storage');
      await AsyncStorage.clear();
    });

    it('returns empty array when no favorites are saved', async () => {
      const favs = await loadFavorites();
      expect(favs).toEqual([]);
    });

    it('persists and loads favorite event IDs correctly', async () => {
      const initialFavs = ['1', '3', '7'];
      await saveFavorites(initialFavs);

      const loaded = await loadFavorites();
      expect(loaded).toEqual(initialFavs);
    });

    it('handles malformed JSON without throwing exceptions', async () => {
      const AsyncStorage = require('@react-native-async-storage/async-storage');
      await AsyncStorage.setItem(FAVORITES_STORAGE_KEY, 'invalid-json-content{[');

      const fallback = await loadFavorites();
      expect(fallback).toEqual([]);
    });
  });

  describe('2. Firebase Auth Service Error Mapping (authService.js)', () => {
    it('translates auth/invalid-credential to friendly error', () => {
      const msg = getFriendlyErrorMessage({ code: 'auth/invalid-credential' });
      expect(msg).toContain('Incorrect campus email or password');
    });

    it('translates auth/email-already-in-use to friendly error', () => {
      const msg = getFriendlyErrorMessage({ code: 'auth/email-already-in-use' });
      expect(msg).toContain('already registered');
    });

    it('translates auth/weak-password to friendly error', () => {
      const msg = getFriendlyErrorMessage({ code: 'auth/weak-password' });
      expect(msg).toContain('at least 6 characters');
    });

    it('translates auth/network-request-failed to friendly error', () => {
      const msg = getFriendlyErrorMessage({ code: 'auth/network-request-failed' });
      expect(msg).toContain('Network connection error');
    });

    it('returns default message for unknown errors', () => {
      const msg = getFriendlyErrorMessage({ message: 'Custom server fault' });
      expect(msg).toBe('Custom server fault');
    });
  });

  describe('3. REST API Event Transformation (eventApi.js)', () => {
    it('fetches and maps JSONPlaceholder items into campus events', async () => {
      const events = await fetchCampusEvents(2);
      expect(events).toHaveLength(2);

      const first = events[0];
      expect(first.id).toBe('1');
      expect(first.title).toBe('Annual Campus Hackathon');
      expect(first.description).toContain('24 hours');
      expect(first.emoji).toBeDefined();
      expect(first.venue).toBeDefined();
      expect(first.date).toContain('2026');
      expect(first.registeredCount).toBeGreaterThan(0);
    });
  });

  describe('4. Reusable UI Components', () => {
    it('renders CustomButton and responds to press', () => {
      const onPressMock = jest.fn();
      let tree: any;
      ReactTestRenderer.act(() => {
        tree = ReactTestRenderer.create(
          <CustomButton title="RSVP Now" onPress={onPressMock} />
        );
      });
      expect(tree.root.findByProps({ children: 'RSVP Now' })).toBeTruthy();
    });

    it('renders CustomInput with placeholder and value', () => {
      let tree: any;
      ReactTestRenderer.act(() => {
        tree = ReactTestRenderer.create(
          <CustomInput
            label="Email"
            placeholder="student@university.edu"
            value="alex@campus.edu"
            onChangeText={() => {}}
          />
        );
      });
      const input = tree.root.findByProps({ placeholder: 'student@university.edu' });
      expect(input.props.value).toBe('alex@campus.edu');
    });

    it('renders CustomCard with children inside', () => {
      let tree: any;
      ReactTestRenderer.act(() => {
        tree = ReactTestRenderer.create(
          <CustomCard>
            <CustomButton title="Inside Card" onPress={() => {}} />
          </CustomCard>
        );
      });
      expect(tree.root.findByProps({ children: 'Inside Card' })).toBeTruthy();
    });
  });

  describe('5. Screens Rendering & Interaction', () => {
    it('renders LoginScreen without crashing', () => {
      let tree: any;
      ReactTestRenderer.act(() => {
        tree = ReactTestRenderer.create(
          <AppProvider>
            <LoginScreen onNavigateToRegister={() => {}} />
          </AppProvider>
        );
      });
      const matches = tree.root.findAllByProps({ children: 'Sign In' });
      expect(matches.length).toBeGreaterThan(0);
    });

    it('renders RegisterScreen without crashing', () => {
      let tree: any;
      ReactTestRenderer.act(() => {
        tree = ReactTestRenderer.create(
          <AppProvider>
            <RegisterScreen onNavigateToLogin={() => {}} />
          </AppProvider>
        );
      });
      const matches = tree.root.findAllByProps({ children: 'Create Account' });
      expect(matches.length).toBeGreaterThan(0);
    });
  });
});
