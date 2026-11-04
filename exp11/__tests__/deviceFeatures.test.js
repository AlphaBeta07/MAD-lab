import { Platform, PermissionsAndroid } from 'react-native';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import Geolocation from '@react-native-community/geolocation';
import notifee from '@notifee/react-native';
import {
  takePhoto,
  pickImageFromGallery,
  getCurrentDeviceLocation,
  scheduleLocalNotification,
  requestCameraPermission,
  requestGalleryPermission,
  requestLocationPermission,
  requestNotificationPermission,
} from '../src/services/deviceFeatures';

describe('deviceFeatures Service (Experiment E11)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(PermissionsAndroid, 'request').mockResolvedValue(
      PermissionsAndroid.RESULTS.GRANTED
    );
  });

  describe('Permissions', () => {
    it('requests camera permission on Android', async () => {
      const originalOS = Platform.OS;
      Platform.OS = 'android';

      const granted = await requestCameraPermission();
      expect(granted).toBe(true);
      expect(PermissionsAndroid.request).toHaveBeenCalledWith(
        PermissionsAndroid.PERMISSIONS.CAMERA,
        expect.any(Object)
      );

      Platform.OS = originalOS;
    });

    it('requests gallery permission on Android', async () => {
      const originalOS = Platform.OS;
      Platform.OS = 'android';

      const granted = await requestGalleryPermission();
      expect(granted).toBe(true);

      Platform.OS = originalOS;
    });

    it('requests location permission on Android', async () => {
      const originalOS = Platform.OS;
      Platform.OS = 'android';

      const granted = await requestLocationPermission();
      expect(granted).toBe(true);
      expect(PermissionsAndroid.request).toHaveBeenCalledWith(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        expect.any(Object)
      );

      Platform.OS = originalOS;
    });

    it('requests notification permission successfully', async () => {
      const granted = await requestNotificationPermission();
      expect(granted).toBe(true);
      expect(notifee.requestPermission).toHaveBeenCalled();
    });
  });

  describe('Camera & Image Picker', () => {
    it('takes photo via camera and returns asset details', async () => {
      const asset = await takePhoto();
      expect(launchCamera).toHaveBeenCalledWith(
        expect.objectContaining({ mediaType: 'photo' })
      );
      expect(asset).toBeDefined();
      expect(asset.uri).toBe('file://mock/captured_photo.jpg');
    });

    it('picks image from gallery and returns asset details', async () => {
      const asset = await pickImageFromGallery();
      expect(launchImageLibrary).toHaveBeenCalledWith(
        expect.objectContaining({ mediaType: 'photo' })
      );
      expect(asset).toBeDefined();
      expect(asset.uri).toBe('file://mock/selected_gallery_image.jpg');
    });

    it('handles camera cancellation gracefully without error', async () => {
      launchCamera.mockResolvedValueOnce({ didCancel: true });
      const asset = await takePhoto();
      expect(asset).toBeNull();
    });
  });

  describe('Geolocation', () => {
    it('retrieves current device coordinates', async () => {
      const coords = await getCurrentDeviceLocation();
      expect(Geolocation.getCurrentPosition).toHaveBeenCalled();
      expect(coords).toBeDefined();
      expect(coords.latitude).toBe(37.78825);
      expect(coords.longitude).toBe(-122.4324);
    });
  });

  describe('Push Notifications', () => {
    it('creates channel and schedules local notification', async () => {
      const id = await scheduleLocalNotification({
        title: 'Test Title',
        body: 'Test Message',
        delaySeconds: 3,
      });

      expect(notifee.createChannel).toHaveBeenCalledWith(
        expect.objectContaining({ id: 'e11_default_channel' })
      );
      expect(notifee.createTriggerNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Test Title',
          body: 'Test Message',
        }),
        expect.objectContaining({ type: 0 })
      );
      expect(id).toBe('mock-trigger-notification-id');
    });
  });
});
