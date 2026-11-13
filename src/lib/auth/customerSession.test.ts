import { describe, it, expect, beforeEach, vi } from 'vitest';

// Bridge @/ aliases so Vitest can resolve them in Node
vi.mock('@/data/productDetails', async () => await import('../../data/productDetails'));
vi.mock('@/data/shopCatalog', async () => await import('../../data/shopCatalog'));
vi.mock('@/lib/pricing/cartPricing', async () => await import('../pricing/cartPricing'));
vi.mock('@/lib/stock/stockResolution', async () => await import('../stock/stockResolution'));
vi.mock('@/lib/orders/orderService', async () => await import('../orders/orderService'));

import {
  simulateLogin,
  simulateRegister,
  getCurrentCustomerSession,
  updateCustomerProfile,
  clearCustomerSession,
  clearAllCustomerData,
  getProfileByEmail,
} from './customerSession';
import { createOrder, clearAllOrders } from '../orders/orderService';
import type { CreateOrderPayload } from '../../types/order';

function makePayload(overrides?: Partial<CreateOrderPayload>): CreateOrderPayload {
  return {
    customer: { fullName: 'Alex Trail', email: 'alex@example.com', phone: '555-0199' },
    shippingAddress: {
      fullName: 'Alex Trail',
      streetAddress: '100 Alpine Way',
      city: 'Denver',
      state: 'CO',
      postalCode: '80202',
      country: 'US',
    },
    shippingTier: 'standard',
    items: [
      {
        id: 'alpha-2-person-tent',
        productId: 'prod-alpha-2p-tent',
        slug: 'alpha-2-person-tent',
        name: 'Alpha 2-person Tent',
        category: 'Tents & Shelters',
        priceInCents: 32900,
        quantity: 1,
        imageUrl: '/images/shop/alpha-2-person-tent.jpg',
      },
    ],
    ...overrides,
  };
}

beforeEach(() => {
  clearAllCustomerData();
  clearAllOrders();
  if (typeof window !== 'undefined') {
    localStorage.clear();
  }
});

describe('customerSession — simulateLogin', () => {
  it('creates an active session for a valid email', () => {
    const session = simulateLogin('jane@example.com');
    expect(session.customer.email).toBe('jane@example.com');
    expect(session.provider).toBe('ALTITUDE_SIMULATED_AUTH');
    expect(session.customer.fullName).toBe('Jane');

    const current = getCurrentCustomerSession();
    expect(current?.customer.email).toBe('jane@example.com');
  });

  it('normalizes email to lowercase and trims whitespace', () => {
    const session = simulateLogin('  SAM.PEAK@EXAMPLE.COM  ');
    expect(session.customer.email).toBe('sam.peak@example.com');
  });

  it('throws an error for error@example.com to simulate failed credentials', () => {
    expect(() => simulateLogin('error@example.com')).toThrow(
      'Invalid customer credentials. Please check your email and password.'
    );
  });

  it('reuses customer name from existing orders when available', () => {
    // Simulate user previously placed an order at checkout as a guest
    createOrder(makePayload({ customer: { fullName: 'Alexandre Trailblazer', email: 'alex@example.com', phone: '555-8888' } }));

    const session = simulateLogin('alex@example.com');
    expect(session.customer.fullName).toBe('Alexandre Trailblazer');
    expect(session.customer.phone).toBe('555-8888');
  });
});

describe('customerSession — simulateRegister', () => {
  it('registers a new customer and sets active session', () => {
    const session = simulateRegister({
      firstName: 'Maya',
      lastName: 'Summit',
      email: 'maya@example.com',
      phone: '555-0202',
    });

    expect(session.customer.fullName).toBe('Maya Summit');
    expect(session.customer.email).toBe('maya@example.com');
    expect(session.customer.phone).toBe('555-0202');

    const storedProfile = getProfileByEmail('maya@example.com');
    expect(storedProfile?.fullName).toBe('Maya Summit');
  });

  it('throws an error for taken@example.com to simulate duplicate email collision', () => {
    expect(() =>
      simulateRegister({
        firstName: 'Test',
        lastName: 'User',
        email: 'taken@example.com',
      })
    ).toThrow('An account with this email address already exists. Please sign in instead.');
  });
});

describe('customerSession — updateCustomerProfile', () => {
  it('updates profile name and phone in active session', () => {
    simulateLogin('user@example.com');

    const updated = updateCustomerProfile({
      fullName: 'Updated Name',
      phone: '555-9999',
    });

    expect(updated.fullName).toBe('Updated Name');
    expect(updated.phone).toBe('555-9999');

    const current = getCurrentCustomerSession();
    expect(current?.customer.fullName).toBe('Updated Name');
    expect(current?.customer.phone).toBe('555-9999');
  });

  it('updates saved address without throwing', () => {
    simulateLogin('user@example.com');

    const newAddress = {
      fullName: 'Updated Name',
      streetAddress: '77 Mountain Rd',
      city: 'Aspen',
      state: 'CO',
      postalCode: '81611',
      country: 'US',
    };

    const updated = updateCustomerProfile({ savedAddress: newAddress });
    expect(updated.savedAddress?.streetAddress).toBe('77 Mountain Rd');
  });

  it('throws when updating without an active session', () => {
    clearCustomerSession();
    expect(() => updateCustomerProfile({ fullName: 'Nobody' })).toThrow(
      'No active customer session found.'
    );
  });
});

describe('customerSession — logout and clear', () => {
  it('clears the active session on logout', () => {
    simulateLogin('user@example.com');
    expect(getCurrentCustomerSession()).not.toBeNull();

    clearCustomerSession();
    expect(getCurrentCustomerSession()).toBeNull();
  });
});
