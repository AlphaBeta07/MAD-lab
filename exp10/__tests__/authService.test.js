import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth';
import {
  registerUser,
  loginUser,
  sendPasswordReset,
  logoutUser,
  subscribeToAuthState,
  getFriendlyErrorMessage,
} from '../src/services/authService';

describe('authService (Experiment E10)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getFriendlyErrorMessage', () => {
    it('translates common Firebase error codes into friendly user messages', () => {
      expect(getFriendlyErrorMessage('auth/invalid-email')).toContain(
        'valid email address'
      );
      expect(getFriendlyErrorMessage('auth/email-already-in-use')).toContain(
        'already registered'
      );
      expect(getFriendlyErrorMessage('auth/weak-password')).toContain(
        'at least 6 characters'
      );
      expect(getFriendlyErrorMessage('auth/invalid-credential')).toContain(
        'Invalid email or password'
      );
      expect(getFriendlyErrorMessage('auth/too-many-requests')).toContain(
        'temporarily disabled'
      );
      expect(getFriendlyErrorMessage('auth/network-request-failed')).toContain(
        'Network connection error'
      );
      expect(getFriendlyErrorMessage('unknown/code')).toContain(
        'An authentication error occurred'
      );
    });
  });

  describe('registerUser', () => {
    it('calls createUserWithEmailAndPassword with trimmed email and password', async () => {
      const user = await registerUser('  student@test.com  ', 'secret123');
      expect(createUserWithEmailAndPassword).toHaveBeenCalledWith(
        expect.anything(),
        'student@test.com',
        'secret123'
      );
      expect(user).toBeDefined();
      expect(user.email).toBe('student@test.com');
    });

    it('translates Firebase error on registration failure', async () => {
      const fbError = new Error('Email in use');
      fbError.code = 'auth/email-already-in-use';
      createUserWithEmailAndPassword.mockRejectedValueOnce(fbError);

      await expect(
        registerUser('existing@test.com', 'password123')
      ).rejects.toThrow('This email is already registered');
    });
  });

  describe('loginUser', () => {
    it('calls signInWithEmailAndPassword with trimmed email and password', async () => {
      const user = await loginUser('  student@test.com  ', 'secret123');
      expect(signInWithEmailAndPassword).toHaveBeenCalledWith(
        expect.anything(),
        'student@test.com',
        'secret123'
      );
      expect(user).toBeDefined();
      expect(user.email).toBe('student@test.com');
    });

    it('translates Firebase error on login failure', async () => {
      const fbError = new Error('Invalid credentials');
      fbError.code = 'auth/invalid-credential';
      signInWithEmailAndPassword.mockRejectedValueOnce(fbError);

      await expect(
        loginUser('student@test.com', 'wrongpassword')
      ).rejects.toThrow('Invalid email or password');
    });
  });

  describe('sendPasswordReset', () => {
    it('calls sendPasswordResetEmail with trimmed email', async () => {
      await sendPasswordReset('  reset@test.com  ');
      expect(sendPasswordResetEmail).toHaveBeenCalledWith(
        expect.anything(),
        'reset@test.com'
      );
    });
  });

  describe('logoutUser', () => {
    it('calls signOut on auth instance', async () => {
      await logoutUser();
      expect(signOut).toHaveBeenCalled();
    });
  });

  describe('subscribeToAuthState', () => {
    it('registers onAuthStateChanged listener and returns unsubscribe function', () => {
      const callback = jest.fn();
      const unsubscribe = subscribeToAuthState(callback);
      expect(onAuthStateChanged).toHaveBeenCalledWith(expect.anything(), callback);
      expect(typeof unsubscribe).toBe('function');
    });
  });
});
