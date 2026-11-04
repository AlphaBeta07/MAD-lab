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
  sendPasswordReset as authReset,
  logoutUser,
  subscribeToAuthState,
} from '../services/authService';
import { loadFavorites, saveFavorites } from '../services/storage';

export interface CampusEvent {
  id: string;
  title: string;
  description: string;
  category: string;
  emoji: string;
  venue: string;
  date: string;
  time: string;
  organizer: string;
  registeredCount: number;
}

interface AppContextValue {
  user: User | null;
  isAuthLoading: boolean;
  favorites: string[];
  selectedEvent: CampusEvent | null;
  setSelectedEvent: (event: CampusEvent | null) => void;
  toggleFavorite: (eventId: string) => Promise<void>;
  isFavorite: (eventId: string) => boolean;
  login: (email: string, pass: string) => Promise<void>;
  register: (email: string, pass: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AppContext = createContext<AppContextValue | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState<boolean>(true);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<CampusEvent | null>(null);

  // 1. Initialize favorites from AsyncStorage
  useEffect(() => {
    let isMounted = true;
    loadFavorites().then((saved) => {
      if (isMounted) {
        setFavorites(saved);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  // 2. Track Firebase Auth State
  useEffect(() => {
    const unsubscribe = subscribeToAuthState((currentUser: User | null) => {
      setUser(currentUser);
      setIsAuthLoading(false);
    });
    return () => {
      unsubscribe();
    };
  }, []);

  // 3. Toggle Favorites with AsyncStorage Persistence
  const toggleFavorite = useCallback(
    async (eventId: string): Promise<void> => {
      setFavorites((prev) => {
        const next = prev.includes(eventId)
          ? prev.filter((id) => id !== eventId)
          : [...prev, eventId];

        // Persist to storage asynchronously
        saveFavorites(next).catch((err) =>
          console.error('[AppContext] Failed to persist favorites:', err)
        );

        return next;
      });
    },
    []
  );

  const isFavorite = useCallback(
    (eventId: string): boolean => {
      return favorites.includes(eventId);
    },
    [favorites]
  );

  const login = async (email: string, pass: string): Promise<void> => {
    const loggedInUser = await loginUser(email, pass);
    setUser(loggedInUser);
  };

  const register = async (email: string, pass: string): Promise<void> => {
    const registeredUser = await registerUser(email, pass);
    setUser(registeredUser);
  };

  const resetPassword = async (email: string): Promise<void> => {
    await authReset(email);
  };

  const logout = async (): Promise<void> => {
    await logoutUser();
    setUser(null);
  };

  const value: AppContextValue = {
    user,
    isAuthLoading,
    favorites,
    selectedEvent,
    setSelectedEvent,
    toggleFavorite,
    isFavorite,
    login,
    register,
    resetPassword,
    logout,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = (): AppContextValue => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

export default AppContext;
