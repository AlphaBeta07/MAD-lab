import { initializeApp, getApps, getApp } from 'firebase/app';
import { initializeAuth, getAuth, getReactNativePersistence } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Firebase Client Configuration for Campus Event Manager (Experiment E12).
 */
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY || 'AIzaSyAlypPv021Cgv6i3GxeelMOPlsYNanPEn0',
  authDomain: process.env.FIREBASE_AUTH_DOMAIN || 'raildash.firebaseapp.com',
  projectId: process.env.FIREBASE_PROJECT_ID || 'raildash',
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET || 'raildash.firebasestorage.app',
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || '708454758087',
  appId: process.env.FIREBASE_APP_ID || '1:708454758087:web:3761ec704e1cc8c6a170e2',
  measurementId: process.env.FIREBASE_MEASUREMENT_ID || 'G-1VVH3VYW8V',
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

let auth;
try {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
} catch (error) {
  auth = getAuth(app);
}

// Analytics initialization (supported in web / compatible runtimes)
let analytics = null;
try {
  const { getAnalytics, isSupported } = require('firebase/analytics');
  if (typeof isSupported === 'function') {
    isSupported().then((supported) => {
      if (supported) {
        analytics = getAnalytics(app);
      }
    }).catch(() => {});
  }
} catch {
  // Gracefully bypassed in non-web React Native runtime
}

export { app, auth, analytics, firebaseConfig };
export default app;
