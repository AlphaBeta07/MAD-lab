/* eslint-env jest */
// Jest setup file for exp11

// Mock react-native-image-picker
jest.mock('react-native-image-picker', () => ({
  launchCamera: jest.fn(async () => ({
    assets: [
      {
        uri: 'file://mock/captured_photo.jpg',
        width: 1080,
        height: 1920,
        fileName: 'captured_photo.jpg',
        fileSize: 102400,
      },
    ],
  })),
  launchImageLibrary: jest.fn(async () => ({
    assets: [
      {
        uri: 'file://mock/selected_gallery_image.jpg',
        width: 800,
        height: 600,
        fileName: 'selected_gallery_image.jpg',
        fileSize: 81920,
      },
    ],
  })),
}));

// Mock @react-native-community/geolocation
jest.mock('@react-native-community/geolocation', () => ({
  getCurrentPosition: jest.fn((success) => {
    success({
      coords: {
        latitude: 37.78825,
        longitude: -122.4324,
        altitude: 10,
        accuracy: 5,
        speed: 0,
      },
      timestamp: Date.now(),
    });
  }),
  requestAuthorization: jest.fn((success) => success && success()),
  setRNConfiguration: jest.fn(),
}));

// Mock @notifee/react-native
jest.mock('@notifee/react-native', () => ({
  requestPermission: jest.fn(async () => ({
    authorizationStatus: 1, // Authorized
  })),
  displayNotification: jest.fn(async () => 'mock-notification-id'),
  createTriggerNotification: jest.fn(async () => 'mock-trigger-notification-id'),
  createChannel: jest.fn(async () => 'default-channel-id'),
  getNotificationSettings: jest.fn(async () => ({
    authorizationStatus: 1,
  })),
  onForegroundEvent: jest.fn(() => jest.fn()),
  AuthorizationStatus: {
    AUTHORIZED: 1,
    DENIED: 0,
    NOT_DETERMINED: -1,
  },
  TriggerType: {
    TIMESTAMP: 0,
    INTERVAL: 1,
  },
  AndroidImportance: {
    HIGH: 4,
    DEFAULT: 3,
  },
}));
