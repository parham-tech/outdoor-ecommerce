/**
 * Order Service — ALTITUDE Simulated Checkout
 *
 * Isolated domain service for creating, persisting, and querying simulated orders.
 *
 * BACKEND BOUNDARY NOTE:
 * All validation here is for prototype correctness only. A real backend must independently
 * re-validate stock, prices, and totals against an authoritative database.
 */
import { getProductDetailBySlug } from '../../data/productDetails';
import {
  calculateCartPricing,
  type CartPricingSummary,
  type ShippingTier,
} from '../pricing/cartPricing';
import { resolveStockAvailability } from '../stock/stockResolution';
import {
  type Order,
  type CreateOrderPayload,
  type OrderItemSnapshot,
  OrderStockError,
  OrderPricingError,
  OrderStorageError,
  OrderDuplicateSubmissionError,
  OrderCancellationError,
} from '../../types/order';

/** localStorage key for persisted orders */
const ORDERS_STORAGE_KEY = 'altitude_orders_v1';

/** In-flight idempotency key set — prevents concurrent duplicate submissions */
const inFlightKeys = new Set<string>();

/**
 * In-memory session store fallback when localStorage is unavailable or quota-exceeded.
 * Cleared on page unload.
 */
const sessionStore: Order[] = [];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Checks whether raw localStorage content exists but cannot be parsed as an array.
 */
function isRawStorageCorrupted(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const raw = window.localStorage.getItem(ORDERS_STORAGE_KEY);
    if (!raw) return false;
    const parsed = JSON.parse(raw);
    return !Array.isArray(parsed);
  } catch {
    return true; // JSON.parse failed
  }
}

/**
 * Safe read of all stored orders from localStorage.
 * On corrupted JSON, preserves the raw value and returns session store.
 */
function readStoredOrders(): Order[] {
  if (typeof window === 'undefined') return [...sessionStore];

  let raw: string | null = null;
  try {
    raw = window.localStorage.getItem(ORDERS_STORAGE_KEY);
  } catch {
    // localStorage inaccessible (e.g. private mode restrictions)
    return [...sessionStore];
  }

  if (!raw) return [...sessionStore];

  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed as Order[];
    // Unexpected non-array structure — treat as corruption, do not erase
    console.warn('[orderService] Unexpected data structure in storage, using session store');
    return [...sessionStore];
  } catch {
    // Corrupted JSON — do NOT overwrite storage, preserve raw data
    console.warn('[orderService] Corrupted JSON in localStorage, using session store');
    return [...sessionStore];
  }
}

/**
 * Writes an updated orders array to localStorage.
 * Falls back to session store on quota, corruption, or permission errors.
 */
function writeStoredOrders(orders: Order[]): void {
  if (typeof window === 'undefined') {
    sessionStore.splice(0, sessionStore.length, ...orders);
    return;
  }

  // If existing storage is corrupted, preserve raw content to prevent data loss
  if (isRawStorageCorrupted()) {
    console.warn(
      '[orderService] Storage corruption detected; preserving raw storage without overwriting'
    );
    sessionStore.splice(0, sessionStore.length, ...orders);
    return;
  }

  try {
    window.localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders));
    // Sync session store to match persistent state
    sessionStore.splice(0, sessionStore.length, ...orders);
  } catch (err) {
    // Quota exceeded or storage unavailable — keep session store up to date
    sessionStore.splice(0, sessionStore.length, ...orders);
    throw new OrderStorageError(
      'Failed to persist order to browser storage. Your order has been recorded in this session, but may not survive a page reload.',
      err
    );
  }
}

// ---------------------------------------------------------------------------
// Order Number Generation
// ---------------------------------------------------------------------------

/**
 * Generates a unique 6-digit numeric order number matching /^ALT-\d{6}$/.
 * Retries to avoid collisions with existing stored order numbers.
 */
export function generateOrderNumber(existingOrders?: Order[]): string {
  const orders = existingOrders ?? readStoredOrders();
  const existingNumbers = new Set(orders.map((o) => o.orderNumber));

  for (let attempt = 0; attempt < 100; attempt++) {
    const digits = String(Math.floor(Math.random() * 1_000_000)).padStart(6, '0');
    const candidate = `ALT-${digits}`;
    if (!existingNumbers.has(candidate)) return candidate;
  }

  // Extremely unlikely; fall back to timestamp-based suffix
  return `ALT-${Date.now().toString().slice(-6)}`;
}

// ---------------------------------------------------------------------------
// Stock Validation
// ---------------------------------------------------------------------------

/**
 * Validates that every item in the payload can be fulfilled by current catalog data.
 * Throws OrderStockError for the first item that fails.
 */
export function validateOrderStock(items: readonly OrderItemSnapshot[]): void {
  for (const item of items) {
    const product = getProductDetailBySlug(item.slug);
    if (!product) {
      throw new OrderStockError(
        `Product "${item.name}" (${item.slug}) is no longer available in the catalog.`,
        item.slug
      );
    }

    const stock = resolveStockAvailability(product);

    if (!stock.isAvailable) {
      throw new OrderStockError(
        `"${item.name}" is currently out of stock and cannot be ordered.`,
        item.slug
      );
    }

    if (item.quantity > stock.maxSelectableQuantity) {
      throw new OrderStockError(
        `Requested quantity (${item.quantity}) for "${item.name}" exceeds available stock (${stock.maxSelectableQuantity}).`,
        item.slug
      );
    }
  }
}

// ---------------------------------------------------------------------------
// Pricing Derivation
// ---------------------------------------------------------------------------

/**
 * Derives the authoritative pricing summary from the order items and shipping tier.
 * If a client-supplied summary is provided, validates its total matches; throws
 * OrderPricingError on mismatch to prevent tampered or stale pricing from being persisted.
 */
export function deriveAuthoritativePricing(
  items: readonly OrderItemSnapshot[],
  tier: ShippingTier,
  clientSummary?: CartPricingSummary
): CartPricingSummary {
  const pricingItems = items.map((i) => ({
    priceInCents: i.priceInCents,
    quantity: i.quantity,
  }));
  const authoritative = calculateCartPricing(pricingItems, tier);

  if (clientSummary !== undefined) {
    if (clientSummary.totalInCents !== authoritative.totalInCents) {
      throw new OrderPricingError(
        `Pricing mismatch: client total ${clientSummary.totalInCents}¢ does not match authoritative total ${authoritative.totalInCents}¢. Order rejected.`
      );
    }
  }

  return authoritative;
}

// ---------------------------------------------------------------------------
// createOrder
// ---------------------------------------------------------------------------

/**
 * Creates a new simulated order.
 *
 * Steps:
 * 1. Idempotency check (concurrent in-flight and post-completion retry)
 * 2. Input validation
 * 3. Stock validation
 * 4. Authoritative pricing derivation
 * 5. Deep-clone snapshots
 * 6. Persist to localStorage with safe fallback
 */
export function createOrder(payload: CreateOrderPayload): Order {
  const { customer, shippingAddress, shippingTier, items, clientPricingSummary, idempotencyKey } =
    payload;

  // --- 1. Idempotency: post-completion retry ---
  if (idempotencyKey) {
    const existing = getOrderByIdempotencyKey(idempotencyKey);
    if (existing) {
      const existingEmail = existing.customer?.email?.trim().toLowerCase();
      const currentEmail = customer?.email?.trim().toLowerCase();
      if (existingEmail !== currentEmail) {
        throw new OrderDuplicateSubmissionError(
          'Idempotency key collision: this key is already associated with a different customer.'
        );
      }

      const itemsMatch =
        Array.isArray(items) &&
        existing.items.length === items.length &&
        existing.items.every((existingItem) => {
          const match = items.find(
            (i) => (i.id && i.id === existingItem.id) || i.slug === existingItem.slug
          );
          return (
            match !== undefined &&
            match.quantity === existingItem.quantity &&
            match.priceInCents === existingItem.priceInCents
          );
        });

      const norm = (s?: string) => s?.trim().toLowerCase() || '';
      const addressMatch =
        Boolean(shippingAddress) &&
        norm(existing.shippingAddress?.streetAddress) === norm(shippingAddress?.streetAddress) &&
        norm(existing.shippingAddress?.city) === norm(shippingAddress?.city) &&
        norm(existing.shippingAddress?.state) === norm(shippingAddress?.state) &&
        norm(existing.shippingAddress?.postalCode) === norm(shippingAddress?.postalCode) &&
        norm(existing.shippingAddress?.country) === norm(shippingAddress?.country) &&
        norm(existing.shippingAddress?.unit) === norm(shippingAddress?.unit);

      if (!itemsMatch || !addressMatch || existing.shippingTier !== shippingTier) {
        throw new OrderDuplicateSubmissionError(
          'Idempotency key collision: this key is already associated with a different order payload.'
        );
      }

      return existing;
    }

    // Idempotency: concurrent in-flight protection
    if (inFlightKeys.has(idempotencyKey)) {
      throw new OrderDuplicateSubmissionError(
        'An order with this submission key is already being processed. Please wait.'
      );
    }
    inFlightKeys.add(idempotencyKey);
  }

  try {
    // --- 2. Input validation ---
    if (!customer?.fullName?.trim() || !customer?.email?.trim()) {
      throw new Error('Customer contact information is incomplete.');
    }
    if (!shippingAddress?.streetAddress?.trim() || !shippingAddress?.city?.trim()) {
      throw new Error('Shipping address is incomplete.');
    }
    if (!items || items.length === 0) {
      throw new Error('Cannot create an order with no items.');
    }

    // --- 3. Stock validation ---
    validateOrderStock(items);

    // --- 4. Authoritative pricing ---
    const pricing = deriveAuthoritativePricing(items, shippingTier, clientPricingSummary);

    // --- 5. Build immutable snapshots (deep clone) ---
    const now = new Date().toISOString();
    const existingOrders = readStoredOrders();

    const order: Order = JSON.parse(
      JSON.stringify({
        id: `ord_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
        orderNumber: generateOrderNumber(existingOrders),
        createdAt: now,
        status: 'PENDING' as const,
        statusLabel: 'Simulated Order Recorded',
        customer: { ...customer },
        shippingAddress: { ...shippingAddress },
        shippingTier,
        pricing,
        items: items.map((i) => ({ ...i })),
        simulatedPayment: {
          status: 'SIMULATED_SUCCESS' as const,
          method: 'SIMULATED_CHECKOUT' as const,
          provider: 'ALTITUDE_PROTOTYPE_GATEWAY' as const,
          disclaimer: 'Prototype demonstration order. No payment card was charged.' as const,
          timestamp: now,
        },
        idempotencyKey: idempotencyKey ?? undefined,
      })
    ) as Order;

    // --- 6. Persist — append without erasing existing orders ---
    const updatedOrders = [...existingOrders, order];
    writeStoredOrders(updatedOrders);

    return order;
  } finally {
    if (idempotencyKey) {
      inFlightKeys.delete(idempotencyKey);
    }
  }
}

// ---------------------------------------------------------------------------
// Query helpers
// ---------------------------------------------------------------------------

/** Returns all stored orders (localStorage + session fallback). */
export function getAllOrders(): Order[] {
  return readStoredOrders();
}

/** Returns an order by its internal `id` field, or null. */
export function getOrderById(id: string): Order | null {
  return readStoredOrders().find((o) => o.id === id) ?? null;
}

/** Returns an order by its `orderNumber` (ALT-XXXXXX), or null. */
export function getOrderByNumber(orderNumber: string): Order | null {
  return readStoredOrders().find((o) => o.orderNumber === orderNumber) ?? null;
}

/** Returns an order that was created with the given idempotency key, or null. */
export function getOrderByIdempotencyKey(key: string): Order | null {
  return readStoredOrders().find((o) => o.idempotencyKey === key) ?? null;
}

/**
 * Returns all orders associated with a customer email in descending chronological order (newest first).
 * Performs case-insensitive matching on customer.email.
 */
export function getOrdersByCustomerEmail(email: string): Order[] {
  if (!email || !email.trim()) return [];
  const normalized = email.trim().toLowerCase();
  return readStoredOrders()
    .filter((o) => o.customer?.email?.trim().toLowerCase() === normalized)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

/**
 * Cancels a simulated order.
 *
 * Rules:
 * - Only orders with status 'PENDING' can be cancelled.
 * - Requires customerEmail and verifies ownership before allowing cancellation.
 * - Returns the updated order with status 'CANCELLED'.
 */
export function cancelOrder(orderIdOrNumber: string, customerEmail: string): Order {
  if (!orderIdOrNumber || !orderIdOrNumber.trim()) {
    throw new OrderCancellationError('Order identifier is required for cancellation.');
  }

  if (!customerEmail || !customerEmail.trim()) {
    throw new OrderCancellationError('Customer email is required to cancel an order.');
  }

  const cleanQuery = orderIdOrNumber.trim();
  const orders = readStoredOrders();
  const index = orders.findIndex(
    (o) => o.id === cleanQuery || o.orderNumber === cleanQuery
  );

  if (index === -1) {
    throw new OrderCancellationError(`Order "${cleanQuery}" was not found.`);
  }

  const target = orders[index];

  // Verify ownership: customerEmail must match order's customer email
  const normalizedCustomer = customerEmail.trim().toLowerCase();
  const orderEmail = target.customer?.email?.trim().toLowerCase();
  if (orderEmail !== normalizedCustomer) {
    throw new OrderCancellationError(
      'You do not have permission to cancel this order.'
    );
  }

  // Check lifecycle status: only PENDING may be cancelled
  if (target.status !== 'PENDING') {
    throw new OrderCancellationError(
      `Only orders with status PENDING can be cancelled. Current status: ${target.status}.`
    );
  }

  // Create updated immutable order snapshot
  const updatedOrder: Order = {
    ...target,
    status: 'CANCELLED',
    statusLabel: 'Simulated Order Cancelled',
  };

  const updatedOrders = [...orders];
  updatedOrders[index] = updatedOrder;

  writeStoredOrders(updatedOrders);
  return updatedOrder;
}


/**
 * Clears all stored orders.
 * Intended for test isolation only — do not call from production UI code.
 */
export function clearAllOrders(): void {
  if (typeof window !== 'undefined') {
    try {
      window.localStorage.removeItem(ORDERS_STORAGE_KEY);
    } catch {
      // ignore
    }
  }
  sessionStore.splice(0, sessionStore.length);
}
