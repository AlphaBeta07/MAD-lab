import AsyncStorage from '@react-native-async-storage/async-storage';

export const FAVORITES_STORAGE_KEY = 'campus_event_favorites';

/**
 * Loads favorite event IDs from AsyncStorage.
 *
 * @returns {Promise<Array<string>>} Array of favorited event IDs.
 */
export async function loadFavorites() {
  try {
    const raw = await AsyncStorage.getItem(FAVORITES_STORAGE_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed.map(String);
  } catch (error) {
    console.error('[storage] Error loading favorites:', error);
    return [];
  }
}

/**
 * Persists an array of favorite event IDs to AsyncStorage.
 *
 * @param {Array<string>} favorites
 * @returns {Promise<void>}
 */
export async function saveFavorites(favorites) {
  try {
    const serialized = JSON.stringify(favorites);
    await AsyncStorage.setItem(FAVORITES_STORAGE_KEY, serialized);
  } catch (error) {
    console.error('[storage] Error saving favorites:', error);
    throw new Error('Failed to save favorites to local storage.');
  }
}
