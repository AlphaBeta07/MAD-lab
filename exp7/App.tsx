import React, { useState } from 'react';
import {
  StatusBar,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
} from 'react-native';
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { CartProvider, useCart } from './src/context/CartContext';
import { ProductListScreen } from './src/screens/ProductListScreen';
import { CartScreen } from './src/screens/CartScreen';
import { ScreenType } from './src/types';

// Tab navigation bar displayed at the bottom of the screen
const BottomNavigation: React.FC<{
  currentScreen: ScreenType;
  onNavigate: (screen: ScreenType) => void;
}> = ({ currentScreen, onNavigate }) => {
  const insets = useSafeAreaInsets();
  const { cartCount } = useCart();

  return (
    <View
      style={[
        styles.bottomBar,
        { paddingBottom: Math.max(insets.bottom, 10) },
      ]}
    >
      <TouchableOpacity
        style={[
          styles.tabButton,
          currentScreen === 'products' && styles.tabButtonActive,
        ]}
        onPress={() => onNavigate('products')}
        activeOpacity={0.7}
        accessibilityRole="tab"
        accessibilityLabel="Shop tab"
      >
        <Text style={styles.tabIcon}>🛍️</Text>
        <Text
          style={[
            styles.tabLabel,
            currentScreen === 'products' && styles.tabLabelActive,
          ]}
        >
          Shop
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.tabButton,
          currentScreen === 'cart' && styles.tabButtonActive,
        ]}
        onPress={() => onNavigate('cart')}
        activeOpacity={0.7}
        accessibilityRole="tab"
        accessibilityLabel="Cart tab"
      >
        <View style={styles.tabIconWrapper}>
          <Text style={styles.tabIcon}>🛒</Text>
          {cartCount > 0 && (
            <View style={styles.tabBadge}>
              <Text style={styles.tabBadgeText}>
                {cartCount > 99 ? '99+' : cartCount}
              </Text>
            </View>
          )}
        </View>
        <Text
          style={[
            styles.tabLabel,
            currentScreen === 'cart' && styles.tabLabelActive,
          ]}
        >
          Cart
        </Text>
      </TouchableOpacity>
    </View>
  );
};

// Main container switching between screens while preserving provider state
const MainNavigator: React.FC = () => {
  const insets = useSafeAreaInsets();
  const [currentScreen, setCurrentScreen] = useState<ScreenType>('products');

  const handleNavigate = (screen: ScreenType): void => {
    setCurrentScreen(screen);
  };

  return (
    <View style={[styles.mainContainer, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" />

      {/* Screen View */}
      <View style={styles.screenContainer}>
        {currentScreen === 'products' ? (
          <ProductListScreen onNavigate={handleNavigate} />
        ) : (
          <CartScreen onNavigate={handleNavigate} />
        )}
      </View>

      {/* Bottom Tabs */}
      <BottomNavigation
        currentScreen={currentScreen}
        onNavigate={handleNavigate}
      />
    </View>
  );
};

// Root component wrapping everything in CartProvider and SafeAreaProvider
export default function App(): React.JSX.Element {
  return (
    <SafeAreaProvider>
      <CartProvider>
        <MainNavigator />
      </CartProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  screenContainer: {
    flex: 1,
  },
  bottomBar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingTop: 8,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
  },
  tabButtonActive: {
    opacity: 1,
  },
  tabIconWrapper: {
    position: 'relative',
  },
  tabIcon: {
    fontSize: 22,
  },
  tabBadge: {
    position: 'absolute',
    top: -4,
    right: -12,
    backgroundColor: '#DC2626',
    borderRadius: 9,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  tabBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#64748B',
    marginTop: 3,
  },
  tabLabelActive: {
    color: '#4F46E5',
    fontWeight: '700',
  },
});
