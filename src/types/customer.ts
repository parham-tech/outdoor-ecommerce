import type { ShippingAddress } from './order';

/**
 * Customer Profile entity for simulated account management.
 *
 * NOTE ON SECURITY:
 * This model contains only client-facing profile fields.
 * Passwords, tokens, and payment credentials are never stored.
 */
export interface CustomerProfile {
  /** Deterministic or random client identifier (e.g. cust_alex_1234) */
  id: string;
  /** Primary contact and identification email (case-normalized) */
  email: string;
  /** Customer display name */
  fullName: string;
  /** Optional customer phone number */
  phone?: string;
  /** Account creation timestamp (ISO 8601) */
  createdAt: string;
  /** Optional default shipping address saved for checkout pre-fill */
  savedAddress?: ShippingAddress;
}

/**
 * Active simulated customer session stored in browser memory/localStorage.
 */
export interface CustomerSession {
  customer: CustomerProfile;
  authenticatedAt: string; // ISO 8601
  provider: 'ALTITUDE_SIMULATED_AUTH';
}

/**
 * Payload to update a customer's profile.
 */
export interface UpdateCustomerProfilePayload {
  fullName?: string;
  phone?: string;
  savedAddress?: ShippingAddress;
}
