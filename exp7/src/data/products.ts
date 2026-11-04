import { Product } from '../types';

export const SAMPLE_PRODUCTS: Product[] = [
  {
    id: 'prod-1',
    name: 'Wireless Noise-Canceling Headphones',
    description:
      'High-fidelity audio with active noise cancellation, ambient sound mode, and 40h battery life.',
    price: 4999,
    category: 'Audio',
    emoji: '🎧',
  },
  {
    id: 'prod-2',
    name: 'Smart Fitness Watch Series 9',
    description:
      'Crisp AMOLED display, optical heart rate sensor, SpO2 monitor, GPS, and 5 ATM water resistance.',
    price: 3499,
    category: 'Wearables',
    emoji: '⌚',
  },
  {
    id: 'prod-3',
    name: 'Mechanical Gaming Keyboard',
    description:
      'Customizable RGB backlighting with hot-swappable mechanical switches and cushioned wrist rest.',
    price: 2799,
    category: 'Electronics',
    emoji: '⌨️',
  },
  {
    id: 'prod-4',
    name: 'Ergonomic Running Sneakers',
    description:
      'Ultra-lightweight breathable mesh athletic shoes engineered with responsive foam cushioning.',
    price: 2299,
    category: 'Footwear',
    emoji: '👟',
  },
  {
    id: 'prod-5',
    name: 'Waterproof Laptop Backpack',
    description:
      'Rugged weather-resistant backpack with padded 16-inch laptop compartment and integrated USB port.',
    price: 1599,
    category: 'Accessories',
    emoji: '🎒',
  },
  {
    id: 'prod-6',
    name: 'Portable Bluetooth Speaker',
    description:
      '360° surround audio with punchy bass, 16-hour playtime, and IPX7 waterproof rating.',
    price: 1899,
    category: 'Audio',
    emoji: '🔊',
  },
  {
    id: 'prod-7',
    name: 'Fast Wireless Charging Pad',
    description:
      '15W high-efficiency wireless charger with intelligent temperature control and foreign object detection.',
    price: 999,
    category: 'Electronics',
    emoji: '⚡',
  },
  {
    id: 'prod-8',
    name: 'Polarized UV Sunglasses',
    description:
      'Classic lightweight aviator sunglasses with UV400 polarized lenses and anti-glare coating.',
    price: 1299,
    category: 'Accessories',
    emoji: '🕶️',
  },
];

export const CATEGORIES = [
  'All',
  'Audio',
  'Wearables',
  'Electronics',
  'Footwear',
  'Accessories',
];

/**
 * Simulates an asynchronous API request to fetch products using a Promise and delay.
 * Accepts an optional AbortSignal to cleanly cancel pending timeouts upon component unmount.
 */
export const fetchProducts = (
  delayMs = 750,
  shouldFail = false,
  signal?: AbortSignal
): Promise<Product[]> => {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      if (shouldFail) {
        reject(
          new Error(
            'Failed to load products. Please check your network connection.'
          )
        );
      } else {
        // Return a fresh clone of sample products
        resolve([...SAMPLE_PRODUCTS]);
      }
    }, delayMs);

    if (signal) {
      signal.addEventListener('abort', () => {
        clearTimeout(timer);
        reject(new Error('AbortError'));
      });
    }
  });
};
