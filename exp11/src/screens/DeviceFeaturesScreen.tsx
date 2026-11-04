import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  ScrollView,
  Alert,
} from 'react-native';
import {
  takePhoto,
  pickImageFromGallery,
  getCurrentDeviceLocation,
  scheduleLocalNotification,
} from '../services/deviceFeatures';

// Local TypeScript types for state management
interface ImageAssetInfo {
  uri: string;
  fileName?: string;
  fileSize?: number;
  width?: number;
  height?: number;
  source: 'camera' | 'gallery';
}

interface LocationInfo {
  latitude: number;
  longitude: number;
  accuracy: number;
  altitude?: number | null;
  timestamp: number;
}

export const DeviceFeaturesScreen: React.FC = () => {
  // State for Image (Camera & Gallery)
  const [selectedImage, setSelectedImage] = useState<ImageAssetInfo | null>(null);
  const [isImageLoading, setIsImageLoading] = useState<boolean>(false);
  const [imageError, setImageError] = useState<string | null>(null);

  // State for Location
  const [location, setLocation] = useState<LocationInfo | null>(null);
  const [isLocationLoading, setIsLocationLoading] = useState<boolean>(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  // State for Notifications
  const [isNotifLoading, setIsNotifLoading] = useState<boolean>(false);
  const [notifSuccessMessage, setNotifSuccessMessage] = useState<string | null>(null);
  const [notifError, setNotifError] = useState<string | null>(null);

  // Reference to prevent state updates on unmounted component
  const isMountedRef = useRef<boolean>(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // 1. Camera Handler
  const handleTakePhoto = async (): Promise<void> => {
    setIsImageLoading(true);
    setImageError(null);

    try {
      const asset = await takePhoto();
      if (asset && isMountedRef.current) {
        setSelectedImage({
          ...asset,
          source: 'camera',
        });
      }
    } catch (error) {
      if (isMountedRef.current) {
        const msg = error instanceof Error ? error.message : 'Failed to capture photo.';
        setImageError(msg);
        Alert.alert('Camera Error', msg);
      }
    } finally {
      if (isMountedRef.current) {
        setIsImageLoading(false);
      }
    }
  };

  // 2. Gallery Handler
  const handlePickGalleryImage = async (): Promise<void> => {
    setIsImageLoading(true);
    setImageError(null);

    try {
      const asset = await pickImageFromGallery();
      if (asset && isMountedRef.current) {
        setSelectedImage({
          ...asset,
          source: 'gallery',
        });
      }
    } catch (error) {
      if (isMountedRef.current) {
        const msg = error instanceof Error ? error.message : 'Failed to pick image from gallery.';
        setImageError(msg);
        Alert.alert('Gallery Error', msg);
      }
    } finally {
      if (isMountedRef.current) {
        setIsImageLoading(false);
      }
    }
  };

  // 3. Geolocation Handler
  const handleGetLocation = async (): Promise<void> => {
    setIsLocationLoading(true);
    setLocationError(null);

    try {
      const coords = await getCurrentDeviceLocation();
      if (isMountedRef.current) {
        setLocation(coords);
      }
    } catch (error) {
      if (isMountedRef.current) {
        const msg = error instanceof Error ? error.message : 'Failed to obtain device location.';
        setLocationError(msg);
        Alert.alert('Location Error', msg);
      }
    } finally {
      if (isMountedRef.current) {
        setIsLocationLoading(false);
      }
    }
  };

  // 4. Notification Handler
  const handleScheduleNotification = async (): Promise<void> => {
    setIsNotifLoading(true);
    setNotifError(null);
    setNotifSuccessMessage(null);

    try {
      await scheduleLocalNotification({
        title: 'E11 Notification Test ',
        body: 'Local notification successfully delivered from React Native!',
        delaySeconds: 3,
      });

      if (isMountedRef.current) {
        setNotifSuccessMessage(
          'Notification scheduled! Watch your notification tray in 3 seconds.'
        );
      }
    } catch (error) {
      if (isMountedRef.current) {
        const msg =
          error instanceof Error ? error.message : 'Failed to schedule notification.';
        setNotifError(msg);
        Alert.alert('Notification Error', msg);
      }
    } finally {
      if (isMountedRef.current) {
        setIsNotifLoading(false);
      }
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      {/* Screen Header */}
      <View style={styles.header}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>MAD Lab • Experiment 11</Text>
        </View>
        <Text style={styles.appTitle}>Device Features Demo</Text>
        <Text style={styles.appSubtitle}>
          Camera • Gallery • Geolocation • Notifications
        </Text>
      </View>

      {/* SECTION 1 & 2: Camera & Photo Gallery Card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>1 & 2. Camera & Image Picker</Text>
        <Text style={styles.cardDescription}>
          Capture live photos via the hardware camera or select existing images from your gallery.
        </Text>

        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.button, styles.cameraButton, isImageLoading && styles.buttonDisabled]}
            onPress={handleTakePhoto}
            activeOpacity={0.7}
            disabled={isImageLoading}
          >
            <Text style={styles.buttonText}>Take Photo</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.galleryButton, isImageLoading && styles.buttonDisabled]}
            onPress={handlePickGalleryImage}
            activeOpacity={0.7}
            disabled={isImageLoading}
          >
            <Text style={styles.buttonText}>Choose Gallery</Text>
          </TouchableOpacity>
        </View>

        {isImageLoading && (
          <View style={styles.inlineLoading}>
            <ActivityIndicator size="small" color="#4F46E5" />
            <Text style={styles.inlineLoadingText}>Accessing media hardware...</Text>
          </View>
        )}

        {imageError && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>⚠️ {imageError}</Text>
          </View>
        )}

        {/* Selected Image Preview */}
        {selectedImage ? (
          <View style={styles.imagePreviewContainer}>
            <Image
              source={{ uri: selectedImage.uri }}
              style={styles.previewImage}
              resizeMode="cover"
            />
            <View style={styles.imageMeta}>
              <Text style={styles.imageMetaSource}>
                Source: {selectedImage.source === 'camera' ? 'Live Camera' : 'Gallery'}
              </Text>
              {selectedImage.fileName && (
                <Text style={styles.imageMetaName} numberOfLines={1}>
                  File: {selectedImage.fileName}
                </Text>
              )}
              {selectedImage.fileSize && (
                <Text style={styles.imageMetaSize}>
                  Size: {(selectedImage.fileSize / 1024).toFixed(1)} KB
                </Text>
              )}
            </View>
            <TouchableOpacity
              style={styles.clearImageButton}
              onPress={() => setSelectedImage(null)}
            >
              <Text style={styles.clearImageText}>✕ Remove Image</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.placeholderContainer}>
            {/* <Text style={styles.placeholderIcon}>🖼️</Text> */}
            <Text style={styles.placeholderText}>No image selected yet</Text>
          </View>
        )}
      </View>

      {/* SECTION 3: Geolocation Card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>3. Geolocation (GPS)</Text>
        <Text style={styles.cardDescription}>
          Acquire foreground coordinates (latitude, longitude, accuracy) using the device GPS.
        </Text>

        <TouchableOpacity
          style={[styles.button, styles.locationButton, isLocationLoading && styles.buttonDisabled]}
          onPress={handleGetLocation}
          activeOpacity={0.7}
          disabled={isLocationLoading}
        >
          {isLocationLoading ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={styles.buttonText}>Get Current Location</Text>
          )}
        </TouchableOpacity>

        {locationError && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>⚠️ {locationError}</Text>
          </View>
        )}

        {location ? (
          <View style={styles.locationResultBox}>
            <View style={styles.locationRow}>
              <Text style={styles.locationLabel}>Latitude:</Text>
              <Text style={styles.locationValue}>{location.latitude.toFixed(6)}°</Text>
            </View>
            <View style={styles.locationRow}>
              <Text style={styles.locationLabel}>Longitude:</Text>
              <Text style={styles.locationValue}>{location.longitude.toFixed(6)}°</Text>
            </View>
            <View style={styles.locationRow}>
              <Text style={styles.locationLabel}>Accuracy:</Text>
              <Text style={styles.locationValue}>±{location.accuracy.toFixed(1)} meters</Text>
            </View>
            <View style={styles.locationRow}>
              <Text style={styles.locationLabel}>Updated:</Text>
              <Text style={styles.locationValue}>
                {new Date(location.timestamp).toLocaleTimeString()}
              </Text>
            </View>
          </View>
        ) : (
          <View style={styles.placeholderContainer}>
            {/* <Text style={styles.placeholderIcon}>📡</Text> */}
            <Text style={styles.placeholderText}>Coordinates not retrieved yet</Text>
          </View>
        )}
      </View>

      {/* SECTION 4: Push Notifications Card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>4. Local Push Notifications</Text>
        <Text style={styles.cardDescription}>
          Request notification permission and trigger a local push notification after 3 seconds.
        </Text>

        <TouchableOpacity
          style={[styles.button, styles.notifButton, isNotifLoading && styles.buttonDisabled]}
          onPress={handleScheduleNotification}
          activeOpacity={0.7}
          disabled={isNotifLoading}
        >
          {isNotifLoading ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={styles.buttonText}>Schedule Test Notification (3s)</Text>
          )}
        </TouchableOpacity>

        {notifSuccessMessage && (
          <View style={styles.successBox}>
            <Text style={styles.successText}>{notifSuccessMessage}</Text>
          </View>
        )}

        {notifError && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{notifError}</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    padding: 16,
    paddingTop: 24,
    paddingBottom: 40,
    backgroundColor: '#F8FAFC',
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  badge: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    marginBottom: 8,
  },
  badgeText: {
    color: '#4F46E5',
    fontSize: 12,
    fontWeight: '700',
  },
  appTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.5,
  },
  appSubtitle: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 4,
    fontWeight: '500',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 13,
    color: '#64748B',
    lineHeight: 18,
    marginBottom: 14,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDisabled: {
    opacity: 0.65,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  cameraButton: {
    flex: 1,
    backgroundColor: '#4F46E5',
  },
  galleryButton: {
    flex: 1,
    backgroundColor: '#0284C7',
  },
  locationButton: {
    backgroundColor: '#059669',
    marginBottom: 12,
  },
  notifButton: {
    backgroundColor: '#7C3AED',
    marginBottom: 8,
  },
  inlineLoading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    gap: 8,
  },
  inlineLoadingText: {
    fontSize: 13,
    color: '#64748B',
  },
  placeholderContainer: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderStyle: 'dashed',
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderIcon: {
    fontSize: 32,
    marginBottom: 6,
  },
  placeholderText: {
    fontSize: 13,
    color: '#94A3B8',
    fontWeight: '500',
  },
  imagePreviewContainer: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 10,
    alignItems: 'center',
  },
  previewImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
  },
  imageMeta: {
    width: '100%',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  imageMetaSource: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4F46E5',
  },
  imageMetaName: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  imageMetaSize: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
  },
  clearImageButton: {
    marginTop: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    backgroundColor: '#FEE2E2',
    alignSelf: 'flex-end',
  },
  clearImageText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#DC2626',
  },
  locationResultBox: {
    backgroundColor: '#F0FDF4',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  locationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 3,
  },
  locationLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#166534',
  },
  locationValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#14532D',
  },
  errorBox: {
    backgroundColor: '#FEF2F2',
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
    borderLeftWidth: 3,
    borderLeftColor: '#DC2626',
  },
  errorText: {
    color: '#991B1B',
    fontSize: 12,
    fontWeight: '500',
  },
  successBox: {
    backgroundColor: '#F0FDF4',
    borderRadius: 8,
    padding: 10,
    marginTop: 6,
    borderLeftWidth: 3,
    borderLeftColor: '#16A34A',
  },
  successText: {
    color: '#15803D',
    fontSize: 12,
    fontWeight: '600',
  },
});

export default DeviceFeaturesScreen;
