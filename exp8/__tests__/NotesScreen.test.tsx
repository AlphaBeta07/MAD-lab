import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NotesScreen } from '../src/screens/NotesScreen';
import { saveNotes } from '../src/utils/notesStorage';

describe('NotesScreen (Experiment E08)', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
    jest.clearAllMocks();
  });

  it('renders initial empty state with header and input card', async () => {
    let tree!: ReactTestRenderer.ReactTestRenderer;
    await ReactTestRenderer.act(() => {
      tree = ReactTestRenderer.create(<NotesScreen />);
    });

    // Flush async load effect
    await ReactTestRenderer.act(async () => {
      await Promise.resolve();
    });

    const root = tree.root;
    // Check header
    const headerTitle = root.findByProps({ children: 'My Notes' });
    expect(headerTitle).toBeDefined();

    // Check empty state
    const emptyTitle = root.findByProps({ children: 'No Notes Yet' });
    expect(emptyTitle).toBeDefined();

    await ReactTestRenderer.act(() => {
      tree.unmount();
    });
  });

  it('renders saved notes loaded from AsyncStorage', async () => {
    await saveNotes([
      {
        id: 'note-1',
        text: 'Existing Persisted Note',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
    ]);

    let tree!: ReactTestRenderer.ReactTestRenderer;
    await ReactTestRenderer.act(() => {
      tree = ReactTestRenderer.create(<NotesScreen />);
    });

    // Flush async load effect
    await ReactTestRenderer.act(async () => {
      await Promise.resolve();
    });

    const root = tree.root;
    const noteContent = root.findByProps({ children: 'Existing Persisted Note' });
    expect(noteContent).toBeDefined();

    await ReactTestRenderer.act(() => {
      tree.unmount();
    });
  });
});
