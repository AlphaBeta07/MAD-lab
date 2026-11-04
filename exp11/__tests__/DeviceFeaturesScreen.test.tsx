import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { DeviceFeaturesScreen } from '../src/screens/DeviceFeaturesScreen';

describe('DeviceFeaturesScreen (Experiment E11)', () => {
  it('renders all four device feature sections correctly', async () => {
    let tree!: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(() => {
      tree = ReactTestRenderer.create(<DeviceFeaturesScreen />);
    });

    const root = tree.root;

    // Check Header
    const appTitle = root.findByProps({ children: 'Device Features Demo' });
    expect(appTitle).toBeDefined();

    // Check Section 1 & 2: Camera & Gallery
    const cameraSection = root.findByProps({
      children: '1 & 2. Camera & Image Picker',
    });
    expect(cameraSection).toBeDefined();

    const takePhotoButton = root.findByProps({ children: '📷 Take Photo' });
    expect(takePhotoButton).toBeDefined();

    const chooseGalleryButton = root.findByProps({
      children: '🖼️ Choose Gallery',
    });
    expect(chooseGalleryButton).toBeDefined();

    // Check Section 3: Geolocation
    const geoSection = root.findByProps({
      children: '3. Geolocation (GPS)',
    });
    expect(geoSection).toBeDefined();

    const locationButton = root.findByProps({
      children: '📍 Get Current Location',
    });
    expect(locationButton).toBeDefined();

    // Check Section 4: Notifications
    const notifSection = root.findByProps({
      children: '4. Local Push Notifications',
    });
    expect(notifSection).toBeDefined();

    const notifButton = root.findByProps({
      children: '🔔 Schedule Test Notification (3s)',
    });
    expect(notifButton).toBeDefined();

    await ReactTestRenderer.act(() => {
      tree.unmount();
    });
  });
});
