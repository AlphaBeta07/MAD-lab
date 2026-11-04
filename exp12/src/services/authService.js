import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth';
import { auth } from './firebase';

export function getFriendlyErrorMessage(errorOrCode) {
  const code =
    typeof errorOrCode === 'string'
      ? errorOrCode
      : errorOrCode?.code || '';

  switch (code) {
    case 'auth/invalid-email':
      return 'Please enter a valid email address.';
    case 'auth/email-already-in-use':
      return 'This email is already registered. Please sign in or use another email.';
    case 'auth/weak-password':
      return 'Password should be at least 6 characters long.';
    case 'auth/user-not-found':
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'Incorrect campus email or password. Please verify your credentials.';
    case 'auth/user-disabled':
      return 'This user account has been disabled.';
    case 'auth/too-many-requests':
      return 'Too many failed login attempts. Access has been temporarily disabled. Try again later.';
    case 'auth/network-request-failed':
      return 'Network connection error. Please check your internet connection.';
    case 'auth/operation-not-allowed':
      return 'Email/Password sign-in is not enabled in Firebase Console.';
    case 'auth/configuration-not-found':
      return 'Firebase Authentication is not activated in the Firebase Console for "raildash". Please enable Email/Password provider.';
    default:
      if (typeof errorOrCode === 'object' && errorOrCode?.message) {
        return errorOrCode.message;
      }
      return 'An authentication error occurred. Please try again.';
  }
}

export async function registerUser(email, password) {
  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email.trim(),
      password
    );
    return userCredential.user;
  } catch (error) {
    console.error('[authService] Registration failed:', error.code, error.message);
    const friendlyMessage = getFriendlyErrorMessage(error.code);
    const customError = new Error(friendlyMessage);
    customError.code = error.code;
    throw customError;
  }
}

export async function loginUser(email, password) {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email.trim(),
      password
    );
    return userCredential.user;
  } catch (error) {
    console.error('[authService] Login failed:', error.code, error.message);
    const friendlyMessage = getFriendlyErrorMessage(error.code);
    const customError = new Error(friendlyMessage);
    customError.code = error.code;
    throw customError;
  }
}

export async function sendPasswordReset(email) {
  try {
    await sendPasswordResetEmail(auth, email.trim());
  } catch (error) {
    console.error('[authService] Password reset failed:', error.code, error.message);
    const friendlyMessage = getFriendlyErrorMessage(error.code);
    const customError = new Error(friendlyMessage);
    customError.code = error.code;
    throw customError;
  }
}

export async function logoutUser() {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('[authService] Logout failed:', error);
    throw new Error('Failed to sign out. Please check your connection.');
  }
}

export function subscribeToAuthState(callback) {
  return onAuthStateChanged(auth, callback);
}
