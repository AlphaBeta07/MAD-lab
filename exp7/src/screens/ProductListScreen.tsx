import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  ListRenderItem,
  TextInput,
} from 'react-native';
import { Product, ScreenProps } from '../types';
import { useCart } from '../context/CartContext';
import { fetchProducts, CATEGORIES } from '../data/products';

export const ProductListScreen: React.FC<ScreenProps> = ({ onNavigate }) => {
  // 1. useState: Local component state management
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [recentlyAddedId, setRecentlyAddedId] = useState<string | null>(null);
  const [fetchTrigger, setFetchTrigger] = useState<number>(0);

  // 2. useContext: Access global cart state without prop drilling
  const { cartItems, cartCount, addItem } = useCart();

  // 3. useEffect: Load products asynchronously using a Promise with timeout cleanup on unmount
  useEffect(() => {
    const controller = new AbortController();
    let isMounted = true;

    setIsLoading(true);
    setErrorMessage(null);

    // Simulate asynchronous product fetching using a Promise and delay
    fetchProducts(800, false, controller.signal)
      .then((data) => {
        if (isMounted) {
          setProducts(data);
          setIsLoading(false);
        }
      })
      .catch((err: Error) => {
        if (err.message === 'AbortError' || !isMounted) {
          return;
        }
        if (isMounted) {
          setErrorMessage(
            err.message || 'Unable to load products. Please try again.'
          );
          setIsLoading(false);
        }
      });

    // Cleanup: Clean up pending timeout / abort pending fetch on unmount
    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [fetchTrigger]);

  const handleAddToCart = useCallback((product: Product): void => {
    addItem(product);
    setRecentlyAddedId(product.id);
    setTimeout(() => {
      setRecentlyAddedId((curr) => (curr === product.id ? null : curr));
    }, 1200);
  }, [addItem]);

  const handleRetry = useCallback((): void => {
    setFetchTrigger((prev) => prev + 1);
  }, []);

  // Filter products by selected category and search query
  const filteredProducts = useMemo(() => {
    return products.filter((item) => {
      const matchesCategory =
        selectedCategory === 'All' || item.category === selectedCategory;
      const matchesSearch =
        item.name.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase().trim());
      return matchesCategory && matchesSearch;
    });
  }, [products, selectedCategory, searchQuery]);

  // Lookup quantity of a specific item currently in cart
  const getCartQuantity = useCallback((productId: string): number => {
    const item = cartItems.find(
      (ci) => ci.product.id === productId || ci.id === productId
    );
    return item ? item.quantity : 0;
  }, [cartItems]);

  // Typed FlatList item renderer
  const renderProductItem: ListRenderItem<Product> = ({ item }) => {
    const qtyInCart = getCartQuantity(item.id);
    const isRecentlyAdded = recentlyAddedId === item.id;

    return (
      <View style={styles.card}>
        <View style={styles.cardHeaderRow}>
          <View style={styles.emojiContainer}>
            <Text style={styles.emojiText}>{item.emoji}</Text>
          </View>
          <View style={styles.cardHeaderRight}>
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryBadgeText}>{item.category}</Text>
            </View>
            {qtyInCart > 0 && (
              <View style={styles.inCartBadge}>
                <Text style={styles.inCartBadgeText}>{qtyInCart} in cart</Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.cardBody}>
          <Text style={styles.productName} numberOfLines={2}>
            {item.name}
          </Text>
          <Text style={styles.productDescription} numberOfLines={2}>
            {item.description}
          </Text>
          <Text style={styles.productPrice}>
            ₹{item.price.toLocaleString('en-IN')}
          </Text>
        </View>

        <TouchableOpacity
          activeOpacity={0.7}
          style={[
            styles.addButton,
            isRecentlyAdded && styles.addButtonSuccess,
          ]}
          onPress={() => handleAddToCart(item)}
        >
          <Text style={styles.addButtonText}>
            {isRecentlyAdded ? '✓ Added to Cart' : '+ Add to Cart'}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  // Render error view when product loading fails
  const renderErrorView = () => (
    <View style={styles.centerContainer}>
      <Text style={styles.stateIcon}>⚠️</Text>
      <Text style={styles.stateTitle}>Failed to Load Products</Text>
      <Text style={styles.stateSubtitle}>{errorMessage}</Text>
      <TouchableOpacity
        style={styles.actionButton}
        onPress={handleRetry}
      >
        <Text style={styles.actionButtonText}>Retry</Text>
      </TouchableOpacity>
    </View>
  );

  // Render empty state when search/filter returns no items
  const renderEmptyComponent = () => (
    <View style={styles.centerContainer}>
      <Text style={styles.stateIcon}>🔍</Text>
      <Text style={styles.stateTitle}>No Products Found</Text>
      <Text style={styles.stateSubtitle}>
        No items match your search "{searchQuery}". Try a different keyword or category.
      </Text>
      <TouchableOpacity
        style={styles.actionButton}
        onPress={() => {
          setSelectedCategory('All');
          setSearchQuery('');
        }}
      >
        <Text style={styles.actionButtonText}>Reset Filters</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Screen Header */}
      <View style={styles.header}>
        <View style={styles.headerTitleGroup}>
          <Text style={styles.headerTitle}>Shop</Text>
          <Text style={styles.headerSubtitle}>
            Curated gadgets, wearables & accessories
          </Text>
        </View>
        <TouchableOpacity
          style={styles.cartButton}
          onPress={() => onNavigate('cart')}
          activeOpacity={0.8}
          accessibilityLabel="Shopping Cart"
          accessibilityRole="button"
        >
          <Text style={styles.cartIcon}>🛒</Text>
          {cartCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                {cartCount > 99 ? '99+' : cartCount}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Search Input Bar */}
      <View style={styles.searchContainer}>
        <Text style={styles.searchIcon}>🔎</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Search products or descriptions..."
          placeholderTextColor="#94A3B8"
          value={searchQuery}
          onChangeText={setSearchQuery}
          autoCapitalize="none"
          autoCorrect={false}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity
            onPress={() => setSearchQuery('')}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text style={styles.clearSearchText}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Horizontal Category Chips */}
      <View style={styles.categoriesContainer}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={CATEGORIES}
          keyExtractor={(cat) => cat}
          renderItem={({ item: category }) => {
            const isSelected = selectedCategory === category;
            return (
              <TouchableOpacity
                style={[
                  styles.categoryChip,
                  isSelected && styles.categoryChipActive,
                ]}
                onPress={() => setSelectedCategory(category)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.categoryChipText,
                    isSelected && styles.categoryChipTextActive,
                  ]}
                >
                  {category}
                </Text>
              </TouchableOpacity>
            );
          }}
          contentContainerStyle={styles.categoryListContent}
        />
      </View>

      {/* Product Content: Loading, Error, or FlatList */}
      {isLoading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#4F46E5" />
          <Text style={styles.loadingText}>Loading products...</Text>
        </View>
      ) : errorMessage ? (
        renderErrorView()
      ) : (
        <FlatList<Product>
          data={filteredProducts}
          keyExtractor={(item) => item.id}
          renderItem={renderProductItem}
          ListEmptyComponent={renderEmptyComponent}
          contentContainerStyle={styles.productListContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 10,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  headerTitleGroup: {
    flex: 1,
    paddingRight: 12,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  cartButton: {
    position: 'relative',
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartIcon: {
    fontSize: 20,
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#DC2626',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 5,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    height: 44,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#1E293B',
    paddingVertical: 0,
  },
  clearSearchText: {
    fontSize: 14,
    color: '#94A3B8',
    paddingHorizontal: 6,
  },
  categoriesContainer: {
    marginTop: 10,
    marginBottom: 6,
  },
  categoryListContent: {
    paddingHorizontal: 16,
  },
  categoryChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#E2E8F0',
    marginRight: 8,
  },
  categoryChipActive: {
    backgroundColor: '#4F46E5',
  },
  categoryChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
  },
  categoryChipTextActive: {
    color: '#FFFFFF',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },
  stateIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  stateTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 6,
    textAlign: 'center',
  },
  stateSubtitle: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 16,
  },
  actionButton: {
    backgroundColor: '#4F46E5',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 13,
  },
  productListContent: {
    padding: 16,
    paddingBottom: 24,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  emojiContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emojiText: {
    fontSize: 26,
  },
  cardHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  categoryBadge: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryBadgeText: {
    color: '#4F46E5',
    fontSize: 12,
    fontWeight: '600',
  },
  inCartBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  inCartBadgeText: {
    color: '#92400E',
    fontSize: 11,
    fontWeight: '600',
  },
  cardBody: {
    marginBottom: 12,
  },
  productName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
    lineHeight: 22,
  },
  productDescription: {
    fontSize: 13,
    color: '#64748B',
    lineHeight: 18,
    marginTop: 4,
  },
  productPrice: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 8,
  },
  addButton: {
    backgroundColor: '#4F46E5',
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonSuccess: {
    backgroundColor: '#16A34A',
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default ProductListScreen;
