import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { CartProvider } from '../src/context/CartContext';
import { ProductListScreen } from '../src/screens/ProductListScreen';
import { CartScreen } from '../src/screens/CartScreen';

describe('Screens (Experiment E07)', () => {
  it('renders ProductListScreen successfully inside CartProvider and cleans up on unmount', async () => {
    const handleNavigate = jest.fn();

    let tree!: ReactTestRenderer.ReactTestRenderer;
    await ReactTestRenderer.act(async () => {
      tree = ReactTestRenderer.create(
        <CartProvider>
          <ProductListScreen onNavigate={handleNavigate} />
        </CartProvider>
      );
    });

    expect(tree).toBeDefined();

    // Verify cleanup
    await ReactTestRenderer.act(async () => {
      tree.unmount();
    });
  });

  it('renders CartScreen with empty state when no items are present', async () => {
    const handleNavigate = jest.fn();

    let tree!: ReactTestRenderer.ReactTestRenderer;
    await ReactTestRenderer.act(async () => {
      tree = ReactTestRenderer.create(
        <CartProvider>
          <CartScreen onNavigate={handleNavigate} />
        </CartProvider>
      );
    });

    const root = tree.root;
    // Check that empty cart message is displayed
    const emptyTitle = root.findByProps({ children: 'Your Cart is Empty' });
    expect(emptyTitle).toBeDefined();

    await ReactTestRenderer.act(async () => {
      tree.unmount();
    });
  });
});
