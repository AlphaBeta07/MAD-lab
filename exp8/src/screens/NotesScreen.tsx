import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ListRenderItem,
  Keyboard,
} from 'react-native';
import { Note } from '../types/note';
import { loadNotes, saveNotes, clearStoredNotes } from '../utils/notesStorage';

/**
 * Formats a timestamp into a clean, human-readable date and time.
 */
function formatTimestamp(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

/**
 * Generates a unique, collision-resistant string ID.
 */
function generateUniqueId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 9)}`;
}

export const NotesScreen: React.FC = () => {
  // State variables for notes collection, loading, input, and edit mode
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [inputText, setInputText] = useState<string>('');
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // 1. READ: Load stored notes on initial mount
  const fetchStoredNotes = useCallback(async () => {
    setIsLoading(true);
    try {
      const storedNotes = await loadNotes();
      setNotes(storedNotes);
    } catch (error) {
      console.error('[NotesScreen] Failed to load notes:', error);
      Alert.alert('Error', 'Unable to load notes from local storage.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStoredNotes();
  }, [fetchStoredNotes]);

  // 2. CREATE or UPDATE: Handle form submission
  const handleSubmit = async (): Promise<void> => {
    const trimmedText = inputText.trim();

    if (!trimmedText) {
      setValidationError('Please enter some text for the note.');
      return;
    }

    setValidationError(null);
    setIsSaving(true);

    try {
      const now = Date.now();

      if (editingNoteId) {
        // UPDATE existing note
        const updatedNotes = notes.map((note) => {
          if (note.id === editingNoteId) {
            return {
              ...note,
              text: trimmedText,
              updatedAt: now,
            };
          }
          return note;
        });

        await saveNotes(updatedNotes);
        setNotes(updatedNotes);
        setEditingNoteId(null);
        setInputText('');
        Keyboard.dismiss();
      } else {
        // CREATE new note
        const newNote: Note = {
          id: generateUniqueId(),
          text: trimmedText,
          createdAt: now,
          updatedAt: now,
        };

        const updatedNotes = [newNote, ...notes];
        await saveNotes(updatedNotes);
        setNotes(updatedNotes);
        setInputText('');
        Keyboard.dismiss();
      }
    } catch (error) {
      console.error('[NotesScreen] Error saving note:', error);
      Alert.alert('Save Failed', 'Could not save the note to storage. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  // 3. UPDATE: Trigger edit mode for a specific note
  const handleStartEdit = (note: Note): void => {
    setEditingNoteId(note.id);
    setInputText(note.text);
    setValidationError(null);
  };

  // Cancel edit mode and reset form
  const handleCancelEdit = (): void => {
    setEditingNoteId(null);
    setInputText('');
    setValidationError(null);
  };

  // 4. DELETE: Remove note with confirmation dialog
  const handleDeleteNote = (noteId: string): void => {
    Alert.alert(
      'Delete Note',
      'Are you sure you want to permanently delete this note?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const remainingNotes = notes.filter((n) => n.id !== noteId);
              await saveNotes(remainingNotes);
              setNotes(remainingNotes);

              // If the note being edited was deleted, exit edit mode
              if (editingNoteId === noteId) {
                handleCancelEdit();
              }
            } catch (error) {
              console.error('[NotesScreen] Error deleting note:', error);
              Alert.alert('Delete Failed', 'Could not delete the note. Please try again.');
            }
          },
        },
      ]
    );
  };

  // Clear all notes action with confirmation dialog
  const handleClearAllNotes = (): void => {
    Alert.alert(
      'Clear All Notes',
      'Are you sure you want to delete all saved notes? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: async () => {
            try {
              await clearStoredNotes();
              setNotes([]);
              handleCancelEdit();
            } catch (error) {
              console.error('[NotesScreen] Error clearing all notes:', error);
              Alert.alert('Error', 'Failed to clear notes from storage.');
            }
          },
        },
      ]
    );
  };

  // Filter notes by search query
  const filteredNotes = useMemo(() => {
    if (!searchQuery.trim()) {
      return notes;
    }
    const query = searchQuery.toLowerCase().trim();
    return notes.filter((note) => note.text.toLowerCase().includes(query));
  }, [notes, searchQuery]);

  // Render individual note item in FlatList
  const renderNoteItem: ListRenderItem<Note> = ({ item }) => {
    const isBeingEdited = editingNoteId === item.id;
    const isEdited = item.updatedAt > item.createdAt;

    return (
      <View style={[styles.noteCard, isBeingEdited && styles.noteCardEditing]}>
        <Text style={styles.noteText}>{item.text}</Text>

        <View style={styles.noteMetaRow}>
          <Text style={styles.timestampText}>
            {formatTimestamp(item.createdAt)}
            {isEdited && ' • Edited'}
          </Text>

          <View style={styles.cardActions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleStartEdit(item)}
              activeOpacity={0.7}
              accessibilityLabel="Edit note"
              accessibilityRole="button"
            >
              <Text style={styles.editActionText}> Edit</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.deleteButton]}
              onPress={() => handleDeleteNote(item.id)}
              activeOpacity={0.7}
              accessibilityLabel="Delete note"
              accessibilityRole="button"
            >
              <Text style={styles.deleteActionText}> Delete</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  // Render empty state component
  const renderEmptyComponent = () => (
    <View style={styles.emptyContainer}>
      {/* <Text style={styles.emptyIcon}>📝</Text> */}
      <Text style={styles.emptyTitle}>
        {searchQuery ? 'No Matching Notes' : 'No Notes Yet'}
      </Text>
      <Text style={styles.emptySubtitle}>
        {searchQuery
          ? `No notes match "${searchQuery}". Try a different keyword.`
          : 'Write your first thought, task, or reminder in the box above!'}
      </Text>
      {searchQuery ? (
        <TouchableOpacity
          style={styles.clearSearchButton}
          onPress={() => setSearchQuery('')}
        >
          <Text style={styles.clearSearchButtonText}>Clear Search</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={styles.keyboardContainer}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTitleGroup}>
            <Text style={styles.headerTitle}>My Notes</Text>
            <Text style={styles.headerSubtitle}>
              Capture your thoughts and tasks
            </Text>
          </View>

          <View style={styles.headerRightGroup}>
            <View style={styles.countBadge}>
              <Text style={styles.countBadgeText}>
                {notes.length} {notes.length === 1 ? 'Note' : 'Notes'}
              </Text>
            </View>
            {notes.length > 0 && (
              <TouchableOpacity
                style={styles.clearAllButton}
                onPress={handleClearAllNotes}
                activeOpacity={0.7}
              >
                <Text style={styles.clearAllText}>Clear All</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Input Card */}
        <View style={styles.inputCard}>
          {editingNoteId && (
            <View style={styles.editingBanner}>
              <Text style={styles.editingBannerText}>
                 Editing selected note
              </Text>
            </View>
          )}

          <TextInput
            style={styles.textInput}
            placeholder="Write a note, to-do item, or reminder..."
            placeholderTextColor="#94A3B8"
            multiline
            numberOfLines={3}
            textAlignVertical="top"
            value={inputText}
            onChangeText={(text) => {
              setInputText(text);
              if (validationError && text.trim()) {
                setValidationError(null);
              }
            }}
          />

          {validationError && (
            <Text style={styles.errorText}>⚠️ {validationError}</Text>
          )}

          <View style={styles.buttonRow}>
            {editingNoteId && (
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={handleCancelEdit}
                activeOpacity={0.7}
                disabled={isSaving}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={[
                styles.submitButton,
                editingNoteId && styles.submitButtonEdit,
                isSaving && styles.submitButtonDisabled,
              ]}
              onPress={handleSubmit}
              activeOpacity={0.8}
              disabled={isSaving}
            >
              {isSaving ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.submitButtonText}>
                  {editingNoteId ? '💾 Save Changes' : '+ Add Note'}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Search bar when notes exist */}
        {notes.length > 0 && (
          <View style={styles.searchContainer}>
            {/* <Text style={styles.searchIcon}>🔎</Text> */}
            <TextInput
              style={styles.searchInput}
              placeholder="Search notes..."
              placeholderTextColor="#94A3B8"
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoCapitalize="none"
              autoCorrect={false}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Text style={styles.clearSearchIconText}>✕</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Notes FlatList or Loading View */}
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#4F46E5" />
            <Text style={styles.loadingText}>Loading notes from storage...</Text>
          </View>
        ) : (
          <FlatList<Note>
            data={filteredNotes}
            keyExtractor={(item) => item.id}
            renderItem={renderNoteItem}
            ListEmptyComponent={renderEmptyComponent}
            contentContainerStyle={[
              styles.listContent,
              filteredNotes.length === 0 && styles.listContentEmpty,
            ]}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  keyboardContainer: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  headerTitleGroup: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  headerRightGroup: {
    alignItems: 'flex-end',
    gap: 4,
  },
  countBadge: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  countBadgeText: {
    color: '#4F46E5',
    fontSize: 12,
    fontWeight: '700',
  },
  clearAllButton: {
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  clearAllText: {
    color: '#DC2626',
    fontSize: 11,
    fontWeight: '600',
  },
  inputCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 14,
    marginBottom: 8,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  editingBanner: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 8,
    alignSelf: 'flex-start',
  },
  editingBannerText: {
    color: '#92400E',
    fontSize: 12,
    fontWeight: '600',
  },
  textInput: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    padding: 12,
    fontSize: 15,
    color: '#0F172A',
    minHeight: 80,
    maxHeight: 140,
  },
  errorText: {
    color: '#DC2626',
    fontSize: 12,
    fontWeight: '500',
    marginTop: 6,
    marginLeft: 4,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: 10,
    gap: 8,
  },
  cancelButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
  },
  cancelButtonText: {
    color: '#475569',
    fontSize: 14,
    fontWeight: '600',
  },
  submitButton: {
    backgroundColor: '#4F46E5',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
    minWidth: 110,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonEdit: {
    backgroundColor: '#16A34A',
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 6,
    marginBottom: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    height: 42,
  },
  searchIcon: {
    fontSize: 15,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#1E293B',
    paddingVertical: 0,
  },
  clearSearchIconText: {
    fontSize: 14,
    color: '#94A3B8',
    paddingHorizontal: 6,
  },
  listContent: {
    padding: 16,
    paddingTop: 8,
    paddingBottom: 28,
  },
  listContentEmpty: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  noteCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  noteCardEditing: {
    borderColor: '#4F46E5',
    borderWidth: 2,
    backgroundColor: '#F5F3FF',
  },
  noteText: {
    fontSize: 15,
    lineHeight: 22,
    color: '#1E293B',
  },
  noteMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  timestampText: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
  },
  cardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  actionButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: '#F1F5F9',
  },
  deleteButton: {
    backgroundColor: '#FEE2E2',
  },
  editActionText: {
    fontSize: 11,
    color: '#4338CA',
    fontWeight: '600',
  },
  deleteActionText: {
    fontSize: 11,
    color: '#DC2626',
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    paddingHorizontal: 24,
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
    marginBottom: 14,
  },
  clearSearchButton: {
    backgroundColor: '#4F46E5',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  clearSearchButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#64748B',
  },
});

export default NotesScreen;
