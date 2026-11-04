import { Platform, PermissionsAndroid } from 'react-native';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import Geolocation from '@react-native-community/geolocation';
import notifee, {
  AndroidImportance,
  TriggerType,
  AuthorizationStatus,
} from '@notifee/react-native';

// ==========================================
// 1. Camera & Gallery Helpers
// ==========================================

/**
 * Requests Android runtime camera permission.
 *
 * @returns {Promise<boolean>} True if granted.
 */
export async function requestCameraPermission() {
  if (Platform.OS !== 'android') {
    return true;
  }

  try {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.CAMERA,
      {
        title: 'Camera Permission',
        message: 'This app needs access to your camera to take photos for Experiment E11.',
        buttonPositive: 'Grant',
        buttonNegative: 'Deny',
      }
    );
    return granted === PermissionsAndroid.RESULTS.GRANTED;
  } catch (error) {
    console.error('[deviceFeatures] Camera permission request error:', error);
    return false;
  }
}

/**
 * Requests Android runtime media library/gallery permission.
 *
 * @returns {Promise<boolean>} True if granted.
 */
export async function requestGalleryPermission() {
  if (Platform.OS !== 'android') {
    return true;
  }

  try {
    // Android 13+ (API level 33+) uses READ_MEDIA_IMAGES
    const permission =
      Platform.Version >= 33
        ? PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES
        : PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE;

    const granted = await PermissionsAndroid.request(permission, {
      title: 'Gallery Permission',
      message: 'This app needs access to your photo library to select images.',
      buttonPositive: 'Grant',
      buttonNegative: 'Deny',
    });

    return granted === PermissionsAndroid.RESULTS.GRANTED;
  } catch (error) {
    console.error('[deviceFeatures] Gallery permission request error:', error);
    return false;
  }
}

/**
 * Launches the device camera to capture a new photo.
 *
 * @returns {Promise<{ uri: string, fileName?: string, fileSize?: number } | null>}
 */
export async function takePhoto() {
  const hasPermission = await requestCameraPermission();
  if (!hasPermission) {
    throw new Error('Camera permission was denied. Please grant permission in device settings.');
  }

  const result = await launchCamera({
    mediaType: 'photo',
    quality: 0.8,
    saveToPhotos: false,
    includeBase64: false,
  });

  if (result.didCancel) {
    return null; // User cancelled without error
  }

  if (result.errorCode) {
    throw new Error(result.errorMessage || `Camera error code: ${result.errorCode}`);
  }

  if (result.assets && result.assets.length > 0) {
    const asset = result.assets[0];
    return {
      uri: asset.uri,
      fileName: asset.fileName || 'photo.jpg',
      fileSize: asset.fileSize,
      width: asset.width,
      height: asset.height,
    };
  }

  return null;
}

/**
 * Launches the system gallery to pick an existing image.
 *
 * @returns {Promise<{ uri: string, fileName?: string, fileSize?: number } | null>}
 */
export async function pickImageFromGallery() {
  const hasPermission = await requestGalleryPermission();
  if (!hasPermission) {
    throw new Error('Photo gallery permission was denied. Please grant permission in device settings.');
  }

  const result = await launchImageLibrary({
    mediaType: 'photo',
    quality: 0.8,
    selectionLimit: 1,
    includeBase64: false,
  });

  if (result.didCancel) {
    return null; // User cancelled without error
  }

  if (result.errorCode) {
    throw new Error(result.errorMessage || `Gallery error code: ${result.errorCode}`);
  }

  if (result.assets && result.assets.length > 0) {
    const asset = result.assets[0];
    return {
      uri: asset.uri,
      fileName: asset.fileName || 'gallery_image.jpg',
      fileSize: asset.fileSize,
      width: asset.width,
      height: asset.height,
    };
  }

  return null;
}

// ==========================================
// 2. Geolocation Helpers
// ==========================================

/**
 * Requests Android runtime foreground location permission.
 *
 * @returns {Promise<boolean>} True if granted.
 */
export async function requestLocationPermission() {
  if (Platform.OS !== 'android') {
    return true;
  }

  try {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      {
        title: 'Location Permission',
        message: 'This app needs access to your current location for Experiment E11.',
        buttonPositive: 'Grant',
        buttonNegative: 'Deny',
      }
    );
    return granted === PermissionsAndroid.RESULTS.GRANTED;
  } catch (error) {
    console.error('[deviceFeatures] Location permission request error:', error);
    return false;
  }
}

/**
 * Retrieves the device's current GPS / network coordinates.
 *
 * @returns {Promise<{ latitude: number, longitude: number, accuracy: number, timestamp: number }>}
 */
export async function getCurrentDeviceLocation() {
  const hasPermission = await requestLocationPermission();
  if (!hasPermission) {
    throw new Error('Location permission was denied. Please grant permission to retrieve coordinates.');
  }

  return new Promise((resolve, reject) => {
    Geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          altitude: position.coords.altitude,
          timestamp: position.timestamp,
        });
      },
      (error) => {
        console.error('[deviceFeatures] Geolocation error:', error);
        let message = 'Failed to obtain device location.';
        if (error.code === 1) {
          message = 'Location permission denied by user.';
        } else if (error.code === 2) {
          message = 'Location provider unavailable. Please turn on GPS/Location Services.';
        } else if (error.code === 3) {
          message = 'Location request timed out. Please try again.';
        }
        reject(new Error(message));
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 10000,
      }
    );
  });
}

// ==========================================
// 3. Push / Local Notification Helpers
// ==========================================

/**
 * Requests notification permission from user (Android 13+ & iOS).
 *
 * @returns {Promise<boolean>} True if granted.
 */
export async function requestNotificationPermission() {
  try {
    const settings = await notifee.requestPermission();
    return settings.authorizationStatus >= AuthorizationStatus.AUTHORIZED;
  } catch (error) {
    console.error('[deviceFeatures] Notification permission error:', error);
    return false;
  }
}

/**
 * Schedules a local test notification delivered after specified delay.
 *
 * @param {Object} options
 * @param {string} [options.title='E11 Notification Test']
 * @param {string} [options.body='Device Features: Local push notification working!']
 * @param {number} [options.delaySeconds=3]
 * @returns {Promise<string>} Notification ID.
 */
export async function scheduleLocalNotification({
  title = 'E11 Notification Test',
  body = 'Device Features: Local push notification successfully delivered!',
  delaySeconds = 3,
} = {}) {
  const hasPermission = await requestNotificationPermission();
  if (!hasPermission) {
    throw new Error('Notification permission was denied. Please enable notifications in app settings.');
  }

  // Create notification channel for Android 8.0+
  const channelId = await notifee.createChannel({
    id: 'e11_default_channel',
    name: 'E11 Device Features Channel',
    importance: AndroidImportance.HIGH,
    sound: 'default',
    vibration: true,
  });

  const timestamp = Date.now() + delaySeconds * 1000;

  // Schedule notification trigger
  const trigger = {
    type: TriggerType.TIMESTAMP,
    timestamp,
  };

  const notificationId = await notifee.createTriggerNotification(
    {
      title,
      body,
      android: {
        channelId,
        importance: AndroidImportance.HIGH,
        pressAction: {
          id: 'default',
        },
      },
    },
    trigger
  );

  return notificationId;
}
