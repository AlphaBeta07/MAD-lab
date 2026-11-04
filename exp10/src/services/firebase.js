import { initializeApp, getApps, getApp } from 'firebase/app';
import { initializeAuth, getAuth, getReactNativePersistence } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Firebase Client Configuration.
 *
 * NOTE FOR COLLEGE PRACTICAL LAB SETUP:
 * 1. Open https://console.firebase.google.com/
 * 2. Create a new project (e.g., "mad-lab-exp10") or select an existing one.
 * 3. Go to "Project Settings" -> "General" -> "Your apps" -> Select Web/React Native app (</>).
 * 4. Copy the config values and replace the placeholder fields below or define them in process.env.
 * 5. In Firebase Console, navigate to "Build" -> "Authentication" -> "Sign-in method".
 * 6. Enable "Email/Password" provider.
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

// Initialize Firebase App only once to avoid duplicate app errors
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

/**
 * Initialize Firebase Auth with React Native AsyncStorage persistence.
 * This guarantees user sessions remain saved across application restarts.
 */
let auth;
try {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
} catch (error) {
  // If initializeAuth was already called, fall back to getAuth(app)
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
