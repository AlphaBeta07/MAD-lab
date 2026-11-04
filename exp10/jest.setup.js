/* eslint-env jest */
// Jest setup file for exp10
const mockStore = new Map();

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(async (key) => mockStore.get(key) ?? null),
  setItem: jest.fn(async (key, value) => {
    mockStore.set(key, String(value));
  }),
  removeItem: jest.fn(async (key) => {
    mockStore.delete(key);
  }),
  clear: jest.fn(async () => {
    mockStore.clear();
  }),
  getAllKeys: jest.fn(async () => Array.from(mockStore.keys())),
}));

const mockAuthInstance = {
  currentUser: null,
};

jest.mock('firebase/app', () => ({
  initializeApp: jest.fn(() => ({ name: '[DEFAULT]' })),
  getApps: jest.fn(() => [{ name: '[DEFAULT]' }]),
  getApp: jest.fn(() => ({ name: '[DEFAULT]' })),
}));

jest.mock('firebase/auth', () => ({
  initializeAuth: jest.fn(() => mockAuthInstance),
  getAuth: jest.fn(() => mockAuthInstance),
  getReactNativePersistence: jest.fn(() => ({})),
  createUserWithEmailAndPassword: jest.fn(async (_auth, email) => ({
    user: {
      uid: 'mock-user-123',
      email,
      metadata: {
        creationTime: new Date().toISOString(),
        lastSignInTime: new Date().toISOString(),
      },
    },
  })),
  signInWithEmailAndPassword: jest.fn(async (_auth, email) => ({
    user: {
      uid: 'mock-user-123',
      email,
      metadata: {
        creationTime: new Date().toISOString(),
        lastSignInTime: new Date().toISOString(),
      },
    },
  })),
  sendPasswordResetEmail: jest.fn(async () => {}),
  signOut: jest.fn(async () => {}),
  onAuthStateChanged: jest.fn((_auth, callback) => {
    callback(null);
    return jest.fn(); // Unsubscribe mock
  }),
}));
