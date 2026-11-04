import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  ListRenderItem,
} from 'react-native';
import { CartItem, ScreenProps } from '../types';
import { useCart } from '../context/CartContext';

export const CartScreen: React.FC<ScreenProps> = ({ onNavigate }) => {
  // Access global CartContext state and actions
  const {
    cartItems,
    cartCount,
    cartTotal,
    increaseQuantity,
    decreaseQuantity,
    removeItem,
    clearCart,
  } = useCart();

  // Demonstrate useEffect: React to cart changes and log/track the current total
  useEffect(() => {
    console.log(
      `[CartScreen] Effect triggered: Cart has ${cartCount} items | Grand Total: ₹${cartTotal.toLocaleString(
        'en-IN'
      )}`
    );
  }, [cartItems, cartCount, cartTotal]);

  // Confirmation dialog before clearing the entire cart
  const handleClearCart = (): void => {
    Alert.alert(
      'Clear Cart',
      'Are you sure you want to remove all items from your cart?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: () => clearCart(),
        },
      ]
    );
  };

  // Mock checkout handler demonstrating completion
  const handleCheckout = (): void => {
    Alert.alert(
      'Order Confirmed 🎉',
      `Thank you for your purchase!\n\nTotal Items: ${cartCount}\nGrand Total: ₹${cartTotal.toLocaleString(
        'en-IN'
      )}`,
      [
        {
          text: 'Continue Shopping',
          onPress: () => {
            clearCart();
            onNavigate('products');
          },
        },
      ]
    );
  };

  // Render individual cart item card
  const renderCartItem: ListRenderItem<CartItem> = ({ item }) => {
    const { product, quantity } = item;
    const itemSubtotal = product.price * quantity;

    return (
      <View style={styles.cartCard}>
        <View style={styles.itemRow}>
          {/* Product Icon / Emoji */}
          <View style={styles.itemEmojiContainer}>
            <Text style={styles.itemEmoji}>{product.emoji}</Text>
          </View>

          {/* Product Details */}
          <View style={styles.itemDetails}>
            <Text style={styles.itemName} numberOfLines={2}>
              {product.name}
            </Text>
            <Text style={styles.itemCategory}>{product.category}</Text>
            <Text style={styles.itemUnitPrice}>
              Unit: ₹{product.price.toLocaleString('en-IN')}
            </Text>
          </View>

          {/* Remove Item Button */}
          <TouchableOpacity
            style={styles.removeButton}
            onPress={() => removeItem(product.id)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            accessibilityLabel={`Remove ${product.name} from cart`}
            accessibilityRole="button"
          >
            <Text style={styles.removeIcon}>🗑️</Text>
          </TouchableOpacity>
        </View>

        {/* Quantity Controls and Subtotal */}
        <View style={styles.itemFooter}>
          <View style={styles.quantityControls}>
            <TouchableOpacity
              style={styles.qtyButton}
              onPress={() => decreaseQuantity(product.id)}
              activeOpacity={0.7}
              accessibilityLabel="Decrease quantity"
              accessibilityRole="button"
            >
              <Text style={styles.qtyButtonText}>−</Text>
            </TouchableOpacity>

            <View style={styles.qtyValueContainer}>
              <Text style={styles.qtyValueText}>{quantity}</Text>
            </View>

            <TouchableOpacity
              style={styles.qtyButton}
              onPress={() => increaseQuantity(product.id)}
              activeOpacity={0.7}
              accessibilityLabel="Increase quantity"
              accessibilityRole="button"
            >
              <Text style={styles.qtyButtonText}>+</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.subtotalContainer}>
            <Text style={styles.subtotalLabel}>Subtotal</Text>
            <Text style={styles.subtotalValue}>
              ₹{itemSubtotal.toLocaleString('en-IN')}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  // Helpful empty cart placeholder with return-to-shop action
  const renderEmptyCart = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>🛒</Text>
      <Text style={styles.emptyTitle}>Your Cart is Empty</Text>
      <Text style={styles.emptySubtitle}>
        Looks like you haven't added anything to your cart yet. Explore our
        products and add what you love!
      </Text>
      <TouchableOpacity
        style={styles.exploreButton}
        onPress={() => onNavigate('products')}
        activeOpacity={0.8}
        accessibilityRole="button"
      >
        <Text style={styles.exploreButtonText}>Return to Shopping</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTitleGroup}>
          <Text style={styles.headerTitle}>My Cart</Text>
          <Text style={styles.headerSubtitle}>
            {cartCount} {cartCount === 1 ? 'item' : 'items'} in your cart
          </Text>
        </View>
        {cartItems.length > 0 && (
          <TouchableOpacity
            style={styles.clearHeaderButton}
            onPress={handleClearCart}
            activeOpacity={0.7}
            accessibilityRole="button"
          >
            <Text style={styles.clearHeaderButtonText}>Clear Cart</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Cart Items List */}
      <FlatList<CartItem>
        data={cartItems}
        keyExtractor={(item) => item.product.id}
        renderItem={renderCartItem}
        ListEmptyComponent={renderEmptyCart}
        contentContainerStyle={[
          styles.listContent,
          cartItems.length === 0 && styles.listContentEmpty,
        ]}
        showsVerticalScrollIndicator={false}
      />

      {/* Summary and Checkout Footer */}
      {cartItems.length > 0 && (
        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total Items:</Text>
            <Text style={styles.summaryValue}>{cartCount}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.grandTotalLabel}>Grand Total:</Text>
            <Text style={styles.grandTotalValue}>
              ₹{cartTotal.toLocaleString('en-IN')}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.checkoutButton}
            onPress={handleCheckout}
            activeOpacity={0.8}
            accessibilityRole="button"
          >
            <Text style={styles.checkoutButtonText}>
              Checkout • ₹{cartTotal.toLocaleString('en-IN')}
            </Text>
          </TouchableOpacity>
        </View>
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
    paddingBottom: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  headerTitleGroup: {
    flex: 1,
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
  clearHeaderButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#FEE2E2',
    borderRadius: 8,
  },
  clearHeaderButtonText: {
    color: '#DC2626',
    fontSize: 12,
    fontWeight: '600',
  },
  listContent: {
    padding: 16,
    paddingBottom: 20,
  },
  listContentEmpty: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  cartCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemEmojiContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  itemEmoji: {
    fontSize: 26,
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1E293B',
    lineHeight: 20,
  },
  itemCategory: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  itemUnitPrice: {
    fontSize: 13,
    color: '#475569',
    fontWeight: '500',
    marginTop: 2,
  },
  removeButton: {
    padding: 6,
    marginLeft: 8,
  },
  removeIcon: {
    fontSize: 18,
  },
  itemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 10,
    padding: 2,
  },
  qtyButton: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  qtyButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0F172A',
    lineHeight: 20,
  },
  qtyValueContainer: {
    paddingHorizontal: 12,
    minWidth: 32,
    alignItems: 'center',
  },
  qtyValueText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  subtotalContainer: {
    alignItems: 'flex-end',
  },
  subtotalLabel: {
    fontSize: 11,
    color: '#64748B',
  },
  subtotalValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#4F46E5',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyIcon: {
    fontSize: 56,
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  exploreButton: {
    backgroundColor: '#4F46E5',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
  },
  exploreButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  summaryCard: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#64748B',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
  },
  grandTotalLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  grandTotalValue: {
    fontSize: 20,
    fontWeight: '800',
    color: '#4F46E5',
  },
  checkoutButton: {
    backgroundColor: '#4F46E5',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 10,
  },
  checkoutButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});

export default CartScreen;
