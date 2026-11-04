import AsyncStorage from '@react-native-async-storage/async-storage';
import { Note } from '../types/note';

export const NOTES_STORAGE_KEY = 'notes';

/**
 * Validates whether an unknown parsed object matches the Note interface structure.
 */
function isValidNote(item: unknown): item is Note {
  if (typeof item !== 'object' || item === null) {
    return false;
  }
  const candidate = item as Record<string, unknown>;
  return (
    typeof candidate.id === 'string' &&
    typeof candidate.text === 'string' &&
    typeof candidate.createdAt === 'number' &&
    typeof candidate.updatedAt === 'number'
  );
}

// Mutex promise chain to prevent overlapping write operations without hanging on failures
let writeQueue: Promise<void> = Promise.resolve();

/**
 * Loads and parses stored notes from AsyncStorage safely.
 * Returns an empty array if no notes are stored or if the stored data is malformed.
 */
export async function loadNotes(): Promise<Note[]> {
  try {
    const rawData = await AsyncStorage.getItem(NOTES_STORAGE_KEY);
    if (!rawData) {
      return [];
    }

    const parsed: unknown = JSON.parse(rawData);
    if (!Array.isArray(parsed)) {
      console.warn('[notesStorage] Stored notes format is not an array, resetting to empty.');
      return [];
    }

    // Filter and sanitize items to ensure they strictly conform to Note interface
    const validNotes: Note[] = parsed.filter(isValidNote);
    return validNotes;
  } catch (error) {
    console.error('[notesStorage] Error reading notes from AsyncStorage:', error);
    // Return empty list on parse error or read failure to prevent application crash
    return [];
  }
}

/**
 * Persists an array of notes to AsyncStorage.
 * Sequenced through writeQueue to prevent race conditions during rapid updates.
 */
export async function saveNotes(notes: Note[]): Promise<void> {
  const operation = writeQueue.then(async () => {
    try {
      const serialized = JSON.stringify(notes);
      await AsyncStorage.setItem(NOTES_STORAGE_KEY, serialized);
    } catch (error) {
      console.error('[notesStorage] Error saving notes to AsyncStorage:', error);
      throw new Error('Failed to save notes to local storage. Please try again.');
    }
  });

  // Ensure queue always recovers even if an operation fails
  writeQueue = operation.catch(() => {});
  return operation;
}

/**
 * Removes all notes from AsyncStorage.
 */
export async function clearStoredNotes(): Promise<void> {
  const operation = writeQueue.then(async () => {
    try {
      await AsyncStorage.removeItem(NOTES_STORAGE_KEY);
    } catch (error) {
      console.error('[notesStorage] Error clearing notes from AsyncStorage:', error);
      throw new Error('Failed to clear stored notes from local storage.');
    }
  });

  writeQueue = operation.catch(() => {});
  return operation;
}
