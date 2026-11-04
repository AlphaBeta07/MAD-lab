import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { CartProvider, useCart } from '../src/context/CartContext';
import { Product } from '../src/types';

const mockProductA: Product = {
  id: 'test-1',
  name: 'Test Product 1',
  description: 'Description 1',
  price: 500,
  category: 'Audio',
  emoji: '🎧',
};

const mockProductB: Product = {
  id: 'test-2',
  name: 'Test Product 2',
  description: 'Description 2',
  price: 1500,
  category: 'Wearables',
  emoji: '⌚',
};

describe('CartContext & State Management (Experiment E07)', () => {
  it('throws an error if useCart is called outside of CartProvider', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

    const TestComponent = () => {
      useCart();
      return null;
    };

    await expect(async () => {
      await ReactTestRenderer.act(async () => {
        ReactTestRenderer.create(<TestComponent />);
      });
    }).rejects.toThrow('useCart must be used within a CartProvider');

    consoleErrorSpy.mockRestore();
    consoleWarnSpy.mockRestore();
  });

  it('manages adding, updating, and removing cart items with accurate total & count', async () => {
    let cartHook!: ReturnType<typeof useCart>;

    const Consumer = () => {
      cartHook = useCart();
      return null;
    };

    await ReactTestRenderer.act(async () => {
      ReactTestRenderer.create(
        <CartProvider>
          <Consumer />
        </CartProvider>
      );
    });

    // Initial state
    expect(cartHook.cartItems).toEqual([]);
    expect(cartHook.cartCount).toBe(0);
    expect(cartHook.cartTotal).toBe(0);

    // Add first product
    await ReactTestRenderer.act(async () => {
      cartHook.addItem(mockProductA);
    });
    expect(cartHook.cartItems.length).toBe(1);
    expect(cartHook.cartCount).toBe(1);
    expect(cartHook.cartTotal).toBe(500);

    // Add same product again -> quantity should increment without duplicating item
    await ReactTestRenderer.act(async () => {
      cartHook.addItem(mockProductA);
    });
    expect(cartHook.cartItems.length).toBe(1);
    expect(cartHook.cartItems[0].quantity).toBe(2);
    expect(cartHook.cartCount).toBe(2);
    expect(cartHook.cartTotal).toBe(1000);

    // Add second product
    await ReactTestRenderer.act(async () => {
      cartHook.addItem(mockProductB);
    });
    expect(cartHook.cartItems.length).toBe(2);
    expect(cartHook.cartCount).toBe(3);
    expect(cartHook.cartTotal).toBe(1000 + 1500);

    // Increase quantity using helper
    await ReactTestRenderer.act(async () => {
      cartHook.increaseQuantity(mockProductA.id);
    });
    expect(cartHook.cartItems[0].quantity).toBe(3);
    expect(cartHook.cartCount).toBe(4);
    expect(cartHook.cartTotal).toBe(3 * 500 + 1500);

    // Decrease quantity using helper
    await ReactTestRenderer.act(async () => {
      cartHook.decreaseQuantity(mockProductA.id);
    });
    expect(cartHook.cartItems[0].quantity).toBe(2);

    // updateQuantity to a specific number
    await ReactTestRenderer.act(async () => {
      cartHook.updateQuantity(mockProductB.id, 4);
    });
    expect(cartHook.cartCount).toBe(2 + 4);
    expect(cartHook.cartTotal).toBe(2 * 500 + 4 * 1500);

    // updateQuantity to 0 should remove item, preventing zero or negative quantity
    await ReactTestRenderer.act(async () => {
      cartHook.updateQuantity(mockProductA.id, 0);
    });
    expect(cartHook.cartItems.length).toBe(1);
    expect(cartHook.cartItems[0].id).toBe(mockProductB.id);

    // Remove item directly
    await ReactTestRenderer.act(async () => {
      cartHook.removeItem(mockProductB.id);
    });
    expect(cartHook.cartItems.length).toBe(0);
    expect(cartHook.cartCount).toBe(0);
    expect(cartHook.cartTotal).toBe(0);

    // Test clearCart
    await ReactTestRenderer.act(async () => {
      cartHook.addItem(mockProductA);
      cartHook.addItem(mockProductB);
    });
    expect(cartHook.cartItems.length).toBe(2);

    await ReactTestRenderer.act(async () => {
      cartHook.clearCart();
    });
    expect(cartHook.cartItems.length).toBe(0);
    expect(cartHook.cartCount).toBe(0);
    expect(cartHook.cartTotal).toBe(0);
  });
});
