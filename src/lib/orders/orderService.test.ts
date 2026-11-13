import { describe, it, expect, beforeEach, vi } from 'vitest';

// Bridge @/ aliases so Vitest can resolve them in Node
vi.mock('@/data/productDetails', async () => await import('../../data/productDetails'));
vi.mock('@/data/shopCatalog', async () => await import('../../data/shopCatalog'));
vi.mock('@/lib/pricing/cartPricing', async () => await import('../pricing/cartPricing'));
vi.mock('@/lib/stock/stockResolution', async () => await import('../stock/stockResolution'));

import {
  generateOrderNumber,
  validateOrderStock,
  deriveAuthoritativePricing,
  createOrder,
  getAllOrders,
  getOrderById,
  getOrderByNumber,
  getOrderByIdempotencyKey,
  getOrdersByCustomerEmail,
  cancelOrder,
  clearAllOrders,
} from './orderService';
import {
  OrderStockError,
  OrderPricingError,
  OrderStorageError,
  OrderCancellationError,
  OrderDuplicateSubmissionError,
  type OrderItemSnapshot,
  type CreateOrderPayload,
} from '../../types/order';
import { calculateCartPricing } from '../pricing/cartPricing';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeItem(overrides?: Partial<OrderItemSnapshot>): OrderItemSnapshot {
  return {
    id: 'alpha-2-person-tent',
    productId: 'prod-alpha-2p-tent',
    slug: 'alpha-2-person-tent',
    name: 'Alpha 2-person Tent',
    category: 'Tents & Shelters',
    priceInCents: 32900,
    quantity: 1,
    imageUrl: '/images/shop/alpha-2-person-tent.jpg',
    ...overrides,
  };
}

function makePayload(overrides?: Partial<CreateOrderPayload>): CreateOrderPayload {
  return {
    customer: { fullName: 'Jane Hiker', email: 'jane@example.com', phone: '555-0100' },
    shippingAddress: {
      fullName: 'Jane Hiker',
      streetAddress: '42 Summit Trail',
      city: 'Boulder',
      state: 'CO',
      postalCode: '80302',
      country: 'US',
    },
    shippingTier: 'standard',
    items: [makeItem()],
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// Setup — isolate localStorage between tests
// ---------------------------------------------------------------------------

beforeEach(() => {
  clearAllOrders();
  // Reset localStorage mock
  if (typeof window !== 'undefined') {
    localStorage.clear();
  }
});

// ---------------------------------------------------------------------------
// 1. Order Number Generation
// ---------------------------------------------------------------------------

describe('generateOrderNumber', () => {
  it('generates a string matching /^ALT-\\d{6}$/', () => {
    const num = generateOrderNumber([]);
    expect(num).toMatch(/^ALT-\d{6}$/);
  });

  it('generates 100 consecutive unique order numbers with zero collisions', () => {
    const generated = new Set<string>();
    // We pass the already-generated set progressively so collision-avoidance is tested
    const fakeOrders: { orderNumber: string }[] = [];
    for (let i = 0; i < 100; i++) {
      const num = generateOrderNumber(fakeOrders as Parameters<typeof generateOrderNumber>[0]);
      expect(generated.has(num)).toBe(false);
      generated.add(num);
      fakeOrders.push({ orderNumber: num } as Parameters<typeof generateOrderNumber>[0] extends Array<infer E> ? E : never);
    }
    expect(generated.size).toBe(100);
  });
});

// ---------------------------------------------------------------------------
// 2. Authoritative Pricing Derivation
// ---------------------------------------------------------------------------

describe('deriveAuthoritativePricing', () => {
  it('derives pricing with standard shipping under free threshold', () => {
    const items = [makeItem({ priceInCents: 3000, quantity: 1 })];
    const result = deriveAuthoritativePricing(items, 'standard');
    const expected = calculateCartPricing([{ priceInCents: 3000, quantity: 1 }], 'standard');
    expect(result.totalInCents).toBe(expected.totalInCents);
    expect(result.shippingInCents).toBe(500); // $5 standard
  });

  it('applies free standard shipping when subtotal >= $75', () => {
    const items = [makeItem({ priceInCents: 8000, quantity: 1 })];
    const result = deriveAuthoritativePricing(items, 'standard');
    expect(result.shippingInCents).toBe(0);
    expect(result.qualifiesForFreeShipping).toBe(true);
  });

  it('charges $15 express shipping regardless of subtotal', () => {
    const items = [makeItem({ priceInCents: 10000, quantity: 1 })];
    const result = deriveAuthoritativePricing(items, 'express');
    expect(result.shippingInCents).toBe(1500);
  });

  it('throws OrderPricingError when client total does not match authoritative total', () => {
    const items = [makeItem({ priceInCents: 3000, quantity: 1 })];
    const bogusClientSummary = calculateCartPricing([{ priceInCents: 3000, quantity: 1 }], 'standard');
    // Tamper with total
    const tampered = { ...bogusClientSummary, totalInCents: 99 };
    expect(() => deriveAuthoritativePricing(items, 'standard', tampered)).toThrow(OrderPricingError);
  });

  it('accepts matching client pricing without error', () => {
    const items = [makeItem({ priceInCents: 3000, quantity: 1 })];
    const honest = calculateCartPricing([{ priceInCents: 3000, quantity: 1 }], 'standard');
    expect(() => deriveAuthoritativePricing(items, 'standard', honest)).not.toThrow();
  });
});

// ---------------------------------------------------------------------------
// 3. Stock Validation
// ---------------------------------------------------------------------------

describe('validateOrderStock', () => {
  it('passes for an in-stock item with quantity within limit', () => {
    // alpha-2-person-tent is inStock: true in the catalog
    expect(() => validateOrderStock([makeItem({ quantity: 1 })])).not.toThrow();
  });

  it('throws OrderStockError for an item with an unknown slug', () => {
    expect(() =>
      validateOrderStock([makeItem({ slug: 'nonexistent-product-xyz', quantity: 1 })])
    ).toThrow(OrderStockError);
  });

  it('throws OrderStockError when quantity exceeds max selectable quantity (10 cap)', () => {
    // inStock: true, no inventory count → cap is MAX_FRONTEND_ORDER_LIMIT (10)
    expect(() => validateOrderStock([makeItem({ quantity: 11 })])).toThrow(OrderStockError);
  });
});

// ---------------------------------------------------------------------------
// 4. createOrder — Success Path
// ---------------------------------------------------------------------------

describe('createOrder — success path', () => {
  it('creates an order with status PENDING and SIMULATED_SUCCESS payment', () => {
    const order = createOrder(makePayload());
    expect(order.status).toBe('PENDING');
    expect(order.statusLabel).toBe('Simulated Order Recorded');
    expect(order.simulatedPayment.status).toBe('SIMULATED_SUCCESS');
    expect(order.simulatedPayment.provider).toBe('ALTITUDE_PROTOTYPE_GATEWAY');
  });

  it('assigns a unique order number matching /^ALT-\\d{6}$/', () => {
    const order = createOrder(makePayload());
    expect(order.orderNumber).toMatch(/^ALT-\d{6}$/);
  });

  it('assigns a unique internal id', () => {
    const o1 = createOrder(makePayload({ idempotencyKey: 'key-a' }));
    const o2 = createOrder(makePayload({ idempotencyKey: 'key-b' }));
    expect(o1.id).not.toBe(o2.id);
    expect(o1.orderNumber).not.toBe(o2.orderNumber);
  });

  it('calculates pricing authoritatively from items and shippingTier', () => {
    const order = createOrder(makePayload({ shippingTier: 'express' }));
    expect(order.pricing.shippingInCents).toBe(1500);
    const expected = calculateCartPricing([{ priceInCents: 32900, quantity: 1 }], 'express');
    expect(order.pricing.totalInCents).toBe(expected.totalInCents);
  });

  it('persists to getAllOrders()', () => {
    createOrder(makePayload());
    expect(getAllOrders()).toHaveLength(1);
  });

  it('appends new orders without erasing previously stored orders', () => {
    createOrder(makePayload({ idempotencyKey: 'first' }));
    createOrder(makePayload({ idempotencyKey: 'second' }));
    createOrder(makePayload({ idempotencyKey: 'third' }));
    expect(getAllOrders()).toHaveLength(3);
  });

  it('retrieves the order by id via getOrderById', () => {
    const order = createOrder(makePayload());
    expect(getOrderById(order.id)).toMatchObject({ id: order.id });
  });

  it('retrieves the order by number via getOrderByNumber', () => {
    const order = createOrder(makePayload());
    expect(getOrderByNumber(order.orderNumber)).toMatchObject({ orderNumber: order.orderNumber });
  });

  it('retrieves the order by idempotency key via getOrderByIdempotencyKey', () => {
    const order = createOrder(makePayload({ idempotencyKey: 'my-key-1' }));
    expect(getOrderByIdempotencyKey('my-key-1')).toMatchObject({ id: order.id });
  });
});

// ---------------------------------------------------------------------------
// 5. Idempotency — Concurrent & Post-Completion Retries
// ---------------------------------------------------------------------------

describe('createOrder — idempotency', () => {
  it('returns the same existing order when retried with same idempotency key after success', () => {
    const payload = makePayload({ idempotencyKey: 'retry-test-key' });
    const original = createOrder(payload);
    // Retry with the same key after the first call has completed
    const retry = createOrder(payload);
    expect(retry.id).toBe(original.id);
    expect(retry.orderNumber).toBe(original.orderNumber);
    // No duplicate was created
    expect(getAllOrders()).toHaveLength(1);
  });

  it('does not create a duplicate when re-submitted with the same key twice', () => {
    const payload = makePayload({ idempotencyKey: 'dedup-key' });
    createOrder(payload);
    createOrder(payload);
    createOrder(payload);
    expect(getAllOrders()).toHaveLength(1);
  });

  it('throws OrderDuplicateSubmissionError when key is reused for a different customer email', () => {
    createOrder(
      makePayload({
        customer: { fullName: 'Alex Trail', email: 'alex@example.com', phone: '123' },
        idempotencyKey: 'shared-key-1',
      })
    );

    expect(() =>
      createOrder(
        makePayload({
          customer: { fullName: 'Bob Camp', email: 'bob@example.com', phone: '456' },
          idempotencyKey: 'shared-key-1',
        })
      )
    ).toThrow(OrderDuplicateSubmissionError);
  });

  it('throws OrderDuplicateSubmissionError when key is reused with a materially different order payload', () => {
    createOrder(
      makePayload({
        items: [makeItem({ quantity: 1 })],
        idempotencyKey: 'shared-key-2',
      })
    );

    // Different item quantity
    expect(() =>
      createOrder(
        makePayload({
          items: [makeItem({ quantity: 2 })],
          idempotencyKey: 'shared-key-2',
        })
      )
    ).toThrow(OrderDuplicateSubmissionError);

    // Different shipping tier
    expect(() =>
      createOrder(
        makePayload({
          items: [makeItem({ quantity: 1 })],
          shippingTier: 'express',
          idempotencyKey: 'shared-key-2',
        })
      )
    ).toThrow(OrderDuplicateSubmissionError);
  });

  it('throws OrderDuplicateSubmissionError when key is reused with a changed shipping address', () => {
    createOrder(
      makePayload({
        shippingAddress: {
          fullName: 'Jane Hiker',
          streetAddress: '100 Alpine Way',
          city: 'Denver',
          state: 'CO',
          postalCode: '80202',
          country: 'US',
        },
        idempotencyKey: 'addr-key-1',
      })
    );

    // Changed street address
    expect(() =>
      createOrder(
        makePayload({
          shippingAddress: {
            fullName: 'Jane Hiker',
            streetAddress: '200 Summit Blvd',
            city: 'Denver',
            state: 'CO',
            postalCode: '80202',
            country: 'US',
          },
          idempotencyKey: 'addr-key-1',
        })
      )
    ).toThrow(OrderDuplicateSubmissionError);

    // Changed postal code
    expect(() =>
      createOrder(
        makePayload({
          shippingAddress: {
            fullName: 'Jane Hiker',
            streetAddress: '100 Alpine Way',
            city: 'Denver',
            state: 'CO',
            postalCode: '99999',
            country: 'US',
          },
          idempotencyKey: 'addr-key-1',
        })
      )
    ).toThrow(OrderDuplicateSubmissionError);
  });

  it('preserves legitimate retry when customer, address, items, and shipping tier are identical', () => {
    const payload = makePayload({
      customer: { fullName: 'Jane Hiker', email: 'jane@example.com', phone: '555-0100' },
      shippingAddress: {
        fullName: 'Jane Hiker',
        streetAddress: '100 Alpine Way',
        city: 'Denver',
        state: 'CO',
        postalCode: '80202',
        country: 'US',
      },
      shippingTier: 'standard',
      items: [makeItem({ quantity: 1 })],
      idempotencyKey: 'exact-retry-key',
    });

    const first = createOrder(payload);
    // Exact identical retry
    const retry = createOrder({ ...payload });

    expect(retry.id).toBe(first.id);
    expect(retry.orderNumber).toBe(first.orderNumber);
    expect(retry.shippingAddress.streetAddress).toBe('100 Alpine Way');
    expect(getAllOrders()).toHaveLength(1);
  });
});

// ---------------------------------------------------------------------------
// 6. Snapshot Integrity
// ---------------------------------------------------------------------------

describe('createOrder — snapshot integrity', () => {
  it('stored items are independent of mutations to the input payload', () => {
    const items = [makeItem({ quantity: 2 })];
    const payload = makePayload({ items });
    const order = createOrder(payload);
    // Mutate the original input
    items[0].quantity = 999;
    items[0].name = 'MUTATED';
    // Stored snapshot must be unaffected
    expect(order.items[0].quantity).toBe(2);
    expect(order.items[0].name).toBe('Alpha 2-person Tent');
  });

  it('stored customer is independent of mutations to the input payload', () => {
    const customer = { fullName: 'Jane Hiker', email: 'jane@example.com', phone: '555-0100' };
    const order = createOrder(makePayload({ customer }));
    customer.fullName = 'MUTATED';
    expect(order.customer.fullName).toBe('Jane Hiker');
  });
});

// ---------------------------------------------------------------------------
// 7. Validation Errors
// ---------------------------------------------------------------------------

describe('createOrder — validation errors', () => {
  it('throws when items array is empty', () => {
    expect(() => createOrder(makePayload({ items: [] }))).toThrow();
  });

  it('throws OrderStockError for out-of-limit quantity', () => {
    expect(() =>
      createOrder(makePayload({ items: [makeItem({ quantity: 50 })] }))
    ).toThrow(OrderStockError);
  });

  it('throws OrderPricingError when client pricing total is incorrect', () => {
    const honest = calculateCartPricing([{ priceInCents: 32900, quantity: 1 }], 'standard');
    const tampered = { ...honest, totalInCents: 1 };
    expect(() =>
      createOrder(makePayload({ clientPricingSummary: tampered }))
    ).toThrow(OrderPricingError);
  });
});

// ---------------------------------------------------------------------------
// 8. Storage Failure Handling
// ---------------------------------------------------------------------------

describe('createOrder — storage failure handling', () => {
  it('throws OrderStorageError when localStorage.setItem throws QuotaExceededError', () => {
    const fakeLocalStorage: Record<string, string> = {};
    const mockStorage = {
      getItem: (key: string) => fakeLocalStorage[key] ?? null,
      setItem: () => {
        throw new Error('QuotaExceededError');
      },
      removeItem: (key: string) => {
        delete fakeLocalStorage[key];
      },
      clear: () => {
        Object.keys(fakeLocalStorage).forEach((k) => delete fakeLocalStorage[k]);
      },
    };

    const originalWindow = (globalThis as unknown as { window?: unknown }).window;
    (globalThis as unknown as { window: unknown }).window = { localStorage: mockStorage };

    try {
      expect(() => createOrder(makePayload({ idempotencyKey: 'storage-fail-key' }))).toThrow(
        OrderStorageError
      );
    } finally {
      if (originalWindow !== undefined) {
        (globalThis as unknown as { window: unknown }).window = originalWindow;
      } else {
        delete (globalThis as unknown as { window?: unknown }).window;
      }
    }
  });

  it('tolerates corrupted JSON in localStorage without erasing data', () => {
    const corruptedData = '{ CORRUPTED JSON [[[';
    const fakeLocalStorage: Record<string, string> = {
      altitude_orders_v1: corruptedData,
    };
    const mockStorage = {
      getItem: (key: string) => fakeLocalStorage[key] ?? null,
      setItem: (key: string, val: string) => {
        fakeLocalStorage[key] = val;
      },
      removeItem: (key: string) => {
        delete fakeLocalStorage[key];
      },
      clear: () => {
        Object.keys(fakeLocalStorage).forEach((k) => delete fakeLocalStorage[k]);
      },
    };

    const originalWindow = (globalThis as unknown as { window?: unknown }).window;
    (globalThis as unknown as { window: unknown }).window = { localStorage: mockStorage };

    try {
      // Should not throw; falls back to session store
      const order = createOrder(makePayload({ idempotencyKey: 'after-corrupt' }));
      expect(order.orderNumber).toMatch(/^ALT-\d{6}$/);

      // Raw corrupted data must still be in localStorage (not erased or overwritten)
      expect(fakeLocalStorage['altitude_orders_v1']).toBe(corruptedData);
    } finally {
      if (originalWindow !== undefined) {
        (globalThis as unknown as { window: unknown }).window = originalWindow;
      } else {
        delete (globalThis as unknown as { window?: unknown }).window;
      }
    }
  });
});

// ---------------------------------------------------------------------------
// 9. Customer Order Queries (getOrdersByCustomerEmail)
// ---------------------------------------------------------------------------

describe('getOrdersByCustomerEmail', () => {
  it('returns only orders belonging to the specified email', () => {
    createOrder(makePayload({ customer: { fullName: 'User 1', email: 'user1@example.com', phone: '123' }, idempotencyKey: 'u1-1' }));
    createOrder(makePayload({ customer: { fullName: 'User 2', email: 'user2@example.com', phone: '456' }, idempotencyKey: 'u2-1' }));
    createOrder(makePayload({ customer: { fullName: 'User 1', email: 'user1@example.com', phone: '123' }, idempotencyKey: 'u1-2' }));

    const user1Orders = getOrdersByCustomerEmail('user1@example.com');
    expect(user1Orders).toHaveLength(2);
    expect(user1Orders.every((o) => o.customer.email === 'user1@example.com')).toBe(true);

    const user2Orders = getOrdersByCustomerEmail('user2@example.com');
    expect(user2Orders).toHaveLength(1);
    expect(user2Orders[0].customer.email).toBe('user2@example.com');
  });

  it('performs case-insensitive email matching and trims whitespace', () => {
    createOrder(makePayload({ customer: { fullName: 'Alex Trail', email: 'alex@example.com', phone: '123' } }));
    const orders = getOrdersByCustomerEmail('  ALEX@EXAMPLE.COM  ');
    expect(orders).toHaveLength(1);
  });

  it('returns empty array when customer has no orders', () => {
    createOrder(makePayload({ customer: { fullName: 'Alex Trail', email: 'alex@example.com', phone: '123' } }));
    expect(getOrdersByCustomerEmail('nobody@example.com')).toHaveLength(0);
    expect(getOrdersByCustomerEmail('')).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// 10. Order Cancellation (cancelOrder)
// ---------------------------------------------------------------------------

describe('cancelOrder', () => {
  it('successfully cancels a PENDING order and updates statusLabel', () => {
    const order = createOrder(makePayload());
    expect(order.status).toBe('PENDING');

    const cancelled = cancelOrder(order.id, order.customer.email);
    expect(cancelled.status).toBe('CANCELLED');
    expect(cancelled.statusLabel).toBe('Simulated Order Cancelled');

    // Stored order must be updated
    const retrieved = getOrderById(order.id);
    expect(retrieved?.status).toBe('CANCELLED');
  });

  it('cancels by orderNumber as well as internal id', () => {
    const order = createOrder(makePayload());
    const cancelled = cancelOrder(order.orderNumber, order.customer.email);
    expect(cancelled.status).toBe('CANCELLED');
  });

  it('verifies customer email ownership and normalizes case and whitespace', () => {
    const order = createOrder(makePayload({ customer: { fullName: 'Jane', email: 'jane@example.com', phone: '123' } }));
    // Different email attempting cancellation
    expect(() => cancelOrder(order.id, 'hacker@example.com')).toThrow(OrderCancellationError);
    expect(() => cancelOrder(order.id, 'hacker@example.com')).toThrow('You do not have permission to cancel this order.');
    // Correct owner succeeds with uppercase and whitespace padding
    expect(() => cancelOrder(order.id, '  JANE@EXAMPLE.COM  ')).not.toThrow();
  });

  it('rejects cancellation when customer email is missing or whitespace', () => {
    const order = createOrder(makePayload());
    expect(() => cancelOrder(order.id, '')).toThrow(OrderCancellationError);
    expect(() => cancelOrder(order.id, '')).toThrow('Customer email is required to cancel an order.');
    expect(() => cancelOrder(order.id, '   ')).toThrow(OrderCancellationError);
    expect(() => cancelOrder(order.id, '   ')).toThrow('Customer email is required to cancel an order.');
  });

  it('rejects cancellation when order is already CANCELLED', () => {
    const order = createOrder(makePayload());
    cancelOrder(order.id, order.customer.email);
    // Second cancellation attempt
    expect(() => cancelOrder(order.id, order.customer.email)).toThrow(OrderCancellationError);
    expect(() => cancelOrder(order.id, order.customer.email)).toThrow('Only orders with status PENDING can be cancelled');
  });

  it('rejects cancellation when order status is non-PENDING (e.g. SHIPPED)', () => {
    const fakeLocalStorage: Record<string, string> = {};
    const mockStorage = {
      getItem: (key: string) => fakeLocalStorage[key] || null,
      setItem: (key: string, val: string) => {
        fakeLocalStorage[key] = val;
      },
      removeItem: (key: string) => {
        delete fakeLocalStorage[key];
      },
      clear: () => {
        Object.keys(fakeLocalStorage).forEach((k) => delete fakeLocalStorage[k]);
      },
    };

    const originalWindow = (globalThis as unknown as { window?: unknown }).window;
    (globalThis as unknown as { window: unknown }).window = { localStorage: mockStorage };

    try {
      const order = createOrder(makePayload());
      const raw = fakeLocalStorage['altitude_orders_v1'];
      expect(raw).toBeDefined();
      const orders = JSON.parse(raw);
      orders[0].status = 'SHIPPED';
      fakeLocalStorage['altitude_orders_v1'] = JSON.stringify(orders);

      expect(() => cancelOrder(order.id, order.customer.email)).toThrow(OrderCancellationError);
      expect(() => cancelOrder(order.id, order.customer.email)).toThrow(
        'Only orders with status PENDING can be cancelled. Current status: SHIPPED.'
      );
    } finally {
      if (originalWindow !== undefined) {
        (globalThis as unknown as { window: unknown }).window = originalWindow;
      } else {
        delete (globalThis as unknown as { window?: unknown }).window;
      }
    }
  });

  it('throws OrderCancellationError for unknown order id', () => {
    expect(() => cancelOrder('non-existent-id', 'jane@example.com')).toThrow(OrderCancellationError);
  });
});

// ---------------------------------------------------------------------------
// 11. Order Snapshot Invariance
// ---------------------------------------------------------------------------

describe('Order Snapshot Invariance', () => {
  it('ensures historical order customer and address snapshots are immutable', () => {
    const initialPayload = makePayload({
      customer: {
        fullName: 'Original Customer',
        email: 'original@example.com',
        phone: '555-1111',
      },
      shippingAddress: {
        fullName: 'Original Recipient',
        streetAddress: '100 Alpine Way',
        city: 'Denver',
        state: 'CO',
        postalCode: '80202',
        country: 'US',
      },
    });

    const order = createOrder(initialPayload);

    // Mutate the original payload in-memory after order placement
    initialPayload.customer.fullName = 'Mutated Customer';
    initialPayload.shippingAddress.streetAddress = '999 Mutated Boulevard';
    initialPayload.items[0].quantity = 999;

    // Verify stored snapshot retains original immutable values
    const retrieved = getOrderById(order.id);
    expect(retrieved).not.toBeNull();
    expect(retrieved?.customer.fullName).toBe('Original Customer');
    expect(retrieved?.customer.email).toBe('original@example.com');
    expect(retrieved?.customer.phone).toBe('555-1111');
    expect(retrieved?.shippingAddress.streetAddress).toBe('100 Alpine Way');
    expect(retrieved?.shippingAddress.fullName).toBe('Original Recipient');
    expect(retrieved?.items[0].quantity).toBe(1);
  });
});
