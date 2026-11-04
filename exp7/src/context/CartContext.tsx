import React, {
  createContext,
  useContext,
  useState,
  useMemo,
  useEffect,
} from 'react';
import { Product, CartItem, CartContextValue } from '../types';

const CartContext = createContext<CartContextValue | undefined>(undefined);

const createCartItem = (product: Product, quantity = 1): CartItem => ({
  product,
  quantity,
  id: product.id,
  name: product.name,
  description: product.description,
  price: product.price,
  category: product.category,
  emoji: product.emoji,
});

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  // useState: Maintains the global cart items collection
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  // Add a product or increment quantity if already present
  const addItem = (product: Product): void => {
    setCartItems((prevItems) => {
      const existingIndex = prevItems.findIndex(
        (item) => item.product.id === product.id || item.id === product.id
      );

      if (existingIndex > -1) {
        return prevItems.map((item, index) =>
          index === existingIndex
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }

      return [...prevItems, createCartItem(product, 1)];
    });
  };

  // Remove a product from the cart completely
  const removeItem = (productId: string): void => {
    setCartItems((prevItems) =>
      prevItems.filter(
        (item) => item.product.id !== productId && item.id !== productId
      )
    );
  };

  // Update product quantity, ensuring it never drops below 1 (or removes if 0)
  const updateQuantity = (productId: string, quantity: number): void => {
    if (quantity <= 0) {
      removeItem(productId);
      return;
    }

    setCartItems((prevItems) =>
      prevItems.map((item) => {
        if (item.product.id === productId || item.id === productId) {
          return { ...item, quantity };
        }
        return item;
      })
    );
  };

  // Convenient helper to increment item quantity
  const increaseQuantity = (productId: string): void => {
    setCartItems((prevItems) =>
      prevItems.map((item) => {
        if (item.product.id === productId || item.id === productId) {
          return { ...item, quantity: item.quantity + 1 };
        }
        return item;
      })
    );
  };

  // Convenient helper to decrement item quantity, removing when reaching 0
  const decreaseQuantity = (productId: string): void => {
    setCartItems((prevItems) =>
      prevItems
        .map((item) => {
          if (item.product.id === productId || item.id === productId) {
            return { ...item, quantity: item.quantity - 1 };
          }
          return item;
        })
        .filter((item) => item.quantity > 0)
    );
  };

  // Empty all items from the cart
  const clearCart = (): void => {
    setCartItems([]);
  };

  // Calculate cartCount: sum of quantities across all items
  const cartCount = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.quantity, 0),
    [cartItems]
  );

  // Calculate cartTotal: sum of (unit price * quantity) for all items
  const cartTotal = useMemo(
    () =>
      cartItems.reduce(
        (sum, item) => sum + item.product.price * item.quantity,
        0
      ),
    [cartItems]
  );

  // Demonstrate useEffect: React to cart-item changes and log/track current total
  useEffect(() => {
    console.log(
      `[CartContext] Cart state updated -> Items count: ${cartCount}, Total: ₹${cartTotal.toLocaleString(
        'en-IN'
      )}`
    );
  }, [cartItems, cartCount, cartTotal]);

  const value: CartContextValue = {
    cartItems,
    items: cartItems, // Compatibility alias
    cartCount,
    cartTotal,
    itemCount: cartCount, // Compatibility alias
    totalItems: cartCount, // Compatibility alias
    totalPrice: cartTotal, // Compatibility alias
    addItem,
    removeItem,
    updateQuantity,
    increaseQuantity,
    decreaseQuantity,
    clearCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

// Custom hook to consume CartContext safely
export const useCart = (): CartContextValue => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export default CartContext;
