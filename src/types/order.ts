import type { CartPricingSummary, ShippingTier } from '../lib/pricing/cartPricing';

/**
 * Customer contact information captured at checkout.
 */
export interface CustomerContact {
  fullName: string;
  email: string;
  phone: string;
}

/**
 * Physical shipping destination for simulated order fulfillment.
 */
export interface ShippingAddress {
  fullName: string;
  streetAddress: string;
  unit?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

/**
 * Immutable purchase-time snapshot of an ordered line item.
 * Decoupled from subsequent product catalog or shopping cart modifications.
 */
export interface OrderItemSnapshot {
  /** Composite cart line item key (e.g. prod-1?color=blue) */
  id: string;
  productId: string;
  slug: string;
  name: string;
  category: string;
  /** Unit price in integer cents captured at purchase time */
  priceInCents: number;
  /** Purchased quantity */
  quantity: number;
  imageUrl: string;
  selectedColor?: string;
  selectedCapacity?: string;
  sku?: string;
}

/**
 * Simulated order status values.
 *
 * SEMANTIC CLARIFICATION:
 * - 'PENDING': The simulated order record was successfully recorded in the prototype store.
 *   It is "pending" only in the sense of a mock storefront pipeline (awaiting simulated
 *   order fulfillment/status updates in future admin phases). It does NOT imply that real
 *   payment or physical fulfillment is pending or occurring.
 * - 'PROCESSING': Simulated fulfillment underway.
 * - 'SHIPPED': Simulated order dispatched.
 * - 'DELIVERED': Simulated order delivered.
 * - 'CANCELLED': Simulated order cancelled.
 */
export type OrderStatus =
  | 'PENDING'
  | 'PROCESSING'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELLED';

/**
 * Simulated payment record.
 *
 * SEMANTIC CLARIFICATION:
 * - 'SIMULATED_SUCCESS': The prototype checkout flow completed the payment step without errors.
 *   No real payment gateway (Stripe/PayPal) was called, and no real financial charge occurred.
 */
export interface SimulatedPaymentRecord {
  status: 'SIMULATED_SUCCESS';
  method: 'SIMULATED_CHECKOUT';
  provider: 'ALTITUDE_PROTOTYPE_GATEWAY';
  disclaimer: 'Prototype demonstration order. No payment card was charged.';
  timestamp: string; // ISO 8601
}

/**
 * Complete, immutable Order domain entity.
 *
 * BACKEND BOUNDARY NOTE:
 * This structure represents an immutable purchase snapshot stored client-side for prototype
 * demonstration. In a production system, an order entity is created and authorized by a trusted
 * backend database transaction. The client-side structure defined here is designed to map directly
 * to a future backend API order payload (`POST /api/orders`).
 */
export interface Order {
  id: string;
  orderNumber: string; // ALT-XXXXXX
  createdAt: string; // ISO 8601
  status: OrderStatus;
  statusLabel: string; // e.g. "Simulated Order Recorded"
  customer: Readonly<CustomerContact>;
  shippingAddress: Readonly<ShippingAddress>;
  shippingTier: ShippingTier;
  pricing: Readonly<CartPricingSummary>;
  items: ReadonlyArray<OrderItemSnapshot>;
  simulatedPayment: SimulatedPaymentRecord;
  idempotencyKey?: string;
}

/**
 * Payload required to create an order.
 */
export interface CreateOrderPayload {
  customer: CustomerContact;
  shippingAddress: ShippingAddress;
  shippingTier: ShippingTier;
  items: OrderItemSnapshot[];
  /** Optional client-side pricing summary for verification against authoritative calculation */
  clientPricingSummary?: CartPricingSummary;
  /** Idempotency key preventing duplicate submissions */
  idempotencyKey?: string;
}

/**
 * Error thrown when an item requested has insufficient stock or is out of stock.
 */
export class OrderStockError extends Error {
  constructor(message: string, public readonly itemSlug?: string) {
    super(message);
    this.name = 'OrderStockError';
  }
}

/**
 * Error thrown when client-supplied pricing contradicts authoritative pricing calculations.
 */
export class OrderPricingError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'OrderPricingError';
  }
}

/**
 * Error thrown when browser storage quota or permissions prevent order persistence.
 */
export class OrderStorageError extends Error {
  constructor(message: string, public readonly cause?: unknown) {
    super(message);
    this.name = 'OrderStorageError';
  }
}

/**
 * Error thrown when a duplicate submission is detected in flight.
 */
export class OrderDuplicateSubmissionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'OrderDuplicateSubmissionError';
  }
}

/**
 * Error thrown when an order cancellation request is invalid (e.g. non-pending status or unowned).
 */
export class OrderCancellationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'OrderCancellationError';
  }
}
