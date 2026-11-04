import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from 'react';
import type { User } from 'firebase/auth';
import {
  registerUser,
  loginUser,
  sendPasswordReset as authSendPasswordReset,
  logoutUser,
  subscribeToAuthState,
} from '../services/authService';

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  clearError: () => void;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  sendPasswordReset: (email: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Listen to Firebase authentication state changes
  useEffect(() => {
    const unsubscribe = subscribeToAuthState((currentUser) => {
      setUser(currentUser);
      setIsLoading(false);
    });

    // Unsubscribe from listener upon unmount
    return () => {
      unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    setError(null);
    try {
      const loggedInUser = await loginUser(email, password);
      setUser(loggedInUser);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Login failed. Please try again.';
      setError(message);
      throw err;
    }
  };

  const register = async (email: string, password: string): Promise<void> => {
    setError(null);
    try {
      const registeredUser = await registerUser(email, password);
      setUser(registeredUser);
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : 'Registration failed. Please try again.';
      setError(message);
      throw err;
    }
  };

  const sendPasswordReset = async (email: string): Promise<void> => {
    setError(null);
    try {
      await authSendPasswordReset(email);
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : 'Password reset failed. Please try again.';
      setError(message);
      throw err;
    }
  };

  const logout = async (): Promise<void> => {
    setError(null);
    try {
      await logoutUser();
      setUser(null);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Sign out failed. Please try again.';
      setError(message);
      throw err;
    }
  };

  const value: AuthContextValue = {
    user,
    isLoading,
    error,
    clearError,
    login,
    register,
    sendPasswordReset,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
