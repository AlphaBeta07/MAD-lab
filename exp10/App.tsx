import React, { useState } from 'react';
import {
  StatusBar,
  StyleSheet,
  View,
  ActivityIndicator,
  Text,
} from 'react-native';
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { LoginScreen } from './src/screens/LoginScreen';
import { RegisterScreen } from './src/screens/RegisterScreen';
import { HomeScreen } from './src/screens/HomeScreen';

type AuthScreenState = 'login' | 'register';

function MainAppNavigator(): React.JSX.Element {
  const insets = useSafeAreaInsets();
  const { user, isLoading } = useAuth();
  const [authScreen, setAuthScreen] = useState<AuthScreenState>('login');

  if (isLoading) {
    return (
      <View style={[styles.loadingContainer, { paddingTop: insets.top }]}>
        <ActivityIndicator size="large" color="#4F46E5" />
        <Text style={styles.loadingText}>Connecting to Firebase Auth...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" />
      {user ? (
        <HomeScreen />
      ) : authScreen === 'login' ? (
        <LoginScreen onNavigateToRegister={() => setAuthScreen('register')} />
      ) : (
        <RegisterScreen onNavigateToLogin={() => setAuthScreen('login')} />
      )}
    </View>
  );
}

export default function App(): React.JSX.Element {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <MainAppNavigator />
      </AuthProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  loadingText: {
    marginTop: 14,
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },
});
