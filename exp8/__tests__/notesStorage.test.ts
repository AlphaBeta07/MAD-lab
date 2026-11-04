import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  loadNotes,
  saveNotes,
  clearStoredNotes,
  NOTES_STORAGE_KEY,
} from '../src/utils/notesStorage';
import { Note } from '../src/types/note';

describe('notesStorage (Experiment E08)', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
    jest.clearAllMocks();
  });

  it('returns an empty array when no notes are stored', async () => {
    const notes = await loadNotes();
    expect(notes).toEqual([]);
    expect(AsyncStorage.getItem).toHaveBeenCalledWith(NOTES_STORAGE_KEY);
  });

  it('saves and reloads notes successfully', async () => {
    const mockNotes: Note[] = [
      {
        id: 'note-1',
        text: 'Finish MAD Lab Experiment 8',
        createdAt: 1700000000000,
        updatedAt: 1700000000000,
      },
      {
        id: 'note-2',
        text: 'Review React Native AsyncStorage',
        createdAt: 1700000005000,
        updatedAt: 1700000005000,
      },
    ];

    await saveNotes(mockNotes);
    expect(AsyncStorage.setItem).toHaveBeenCalledWith(
      NOTES_STORAGE_KEY,
      JSON.stringify(mockNotes)
    );

    const loadedNotes = await loadNotes();
    expect(loadedNotes).toEqual(mockNotes);
    expect(loadedNotes.length).toBe(2);
  });

  it('handles malformed JSON in storage gracefully without crashing', async () => {
    await AsyncStorage.setItem(NOTES_STORAGE_KEY, '{ invalid json');
    const notes = await loadNotes();
    expect(notes).toEqual([]);
  });

  it('filters out invalid or non-Note structures from storage', async () => {
    const corruptData = [
      { id: 'valid-1', text: 'Valid Note', createdAt: 100, updatedAt: 100 },
      { id: 123, text: 'Invalid ID type' },
      null,
      'just a string',
      { id: 'valid-2', text: 'Another Valid Note', createdAt: 200, updatedAt: 200 },
    ];

    await AsyncStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(corruptData));
    const notes = await loadNotes();
    expect(notes.length).toBe(2);
    expect(notes[0].id).toBe('valid-1');
    expect(notes[1].id).toBe('valid-2');
  });

  it('clears stored notes', async () => {
    const mockNotes: Note[] = [
      {
        id: 'note-1',
        text: 'Note to be cleared',
        createdAt: 1700000000000,
        updatedAt: 1700000000000,
      },
    ];

    await saveNotes(mockNotes);
    expect((await loadNotes()).length).toBe(1);

    await clearStoredNotes();
    expect(AsyncStorage.removeItem).toHaveBeenCalledWith(NOTES_STORAGE_KEY);
    expect((await loadNotes()).length).toBe(0);
  });
});
