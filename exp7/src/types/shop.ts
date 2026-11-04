/**
 * Type definitions for the Shopping Cart Application (Experiment E07)
 */

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  emoji: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  // Convenience fields mirroring Product for direct access
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  emoji: string;
}

export interface CartContextValue {
  cartItems: CartItem[];
  items: CartItem[]; // Compatibility alias
  cartCount: number;
  cartTotal: number;
  itemCount: number; // Compatibility alias
  totalItems: number; // Compatibility alias
  totalPrice: number; // Compatibility alias
  addItem: (product: Product) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  increaseQuantity: (productId: string) => void;
  decreaseQuantity: (productId: string) => void;
  clearCart: () => void;
}

// Alias for backward compatibility
export type CartContextType = CartContextValue;

export type ScreenType = 'products' | 'cart';

export interface ScreenProps {
  onNavigate: (screen: ScreenType) => void;
}
