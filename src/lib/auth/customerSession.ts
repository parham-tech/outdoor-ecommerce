/**
 * Simulated Customer Session & Profile Service — ALTITUDE E-Commerce
 *
 * Provides a lightweight, frontend-only simulated customer session.
 *
 * IMPORTANT SECURITY BOUNDARY:
 * - This service is explicitly for UI demonstration and prototyping.
 * - Passwords, secret tokens, and payment methods are NEVER stored or transmitted.
 * - Route protection built with this session is a UX guardrail, not production security.
 * - Designed with a clean contract to allow future drop-in replacement by a real
 *   authentication provider (e.g., NextAuth, Supabase, Auth0, or custom backend session cookies).
 */

import type {
  CustomerProfile,
  CustomerSession,
  UpdateCustomerProfilePayload,
} from '../../types/customer';
import { getAllOrders } from '../orders/orderService';

/** Storage key for the active customer session */
export const CUSTOMER_SESSION_STORAGE_KEY = 'altitude_customer_session_v1';

/** Storage key for registered/remembered customer profiles */
export const CUSTOMER_PROFILES_STORAGE_KEY = 'altitude_customer_profiles_v1';

// In-memory fallback for SSR or environments without localStorage
let sessionMemoryStore: CustomerSession | null = null;
const profilesMemoryStore: Map<string, CustomerProfile> = new Map();

// ---------------------------------------------------------------------------
// Storage Helpers
// ---------------------------------------------------------------------------

function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

function readStoredSession(): CustomerSession | null {
  if (!isBrowser()) return sessionMemoryStore;
  try {
    const raw = window.localStorage.getItem(CUSTOMER_SESSION_STORAGE_KEY);
    if (!raw) return sessionMemoryStore;
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object' && parsed.customer?.email) {
      return parsed as CustomerSession;
    }
    return sessionMemoryStore;
  } catch {
    return sessionMemoryStore;
  }
}

function writeStoredSession(session: CustomerSession | null): void {
  sessionMemoryStore = session;
  if (!isBrowser()) return;
  try {
    if (session) {
      window.localStorage.setItem(CUSTOMER_SESSION_STORAGE_KEY, JSON.stringify(session));
    } else {
      window.localStorage.removeItem(CUSTOMER_SESSION_STORAGE_KEY);
    }
  } catch (err) {
    console.warn('[customerSession] Failed to persist session to localStorage', err);
  }
}

function readStoredProfiles(): CustomerProfile[] {
  if (!isBrowser()) return Array.from(profilesMemoryStore.values());
  try {
    const raw = window.localStorage.getItem(CUSTOMER_PROFILES_STORAGE_KEY);
    if (!raw) return Array.from(profilesMemoryStore.values());
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed as CustomerProfile[];
    return Array.from(profilesMemoryStore.values());
  } catch {
    return Array.from(profilesMemoryStore.values());
  }
}

function writeStoredProfiles(profiles: CustomerProfile[]): void {
  profilesMemoryStore.clear();
  profiles.forEach((p) => profilesMemoryStore.set(p.email.toLowerCase(), p));

  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(CUSTOMER_PROFILES_STORAGE_KEY, JSON.stringify(profiles));
  } catch (err) {
    console.warn('[customerSession] Failed to persist profiles to localStorage', err);
  }
}

// ---------------------------------------------------------------------------
// Profile Persistence Helpers
// ---------------------------------------------------------------------------

export function getProfileByEmail(email: string): CustomerProfile | null {
  if (!email) return null;
  const normalized = email.trim().toLowerCase();
  const profiles = readStoredProfiles();
  return profiles.find((p) => p.email.toLowerCase() === normalized) ?? null;
}

export function saveProfile(profile: CustomerProfile): void {
  const profiles = readStoredProfiles();
  const normalized = profile.email.trim().toLowerCase();
  const index = profiles.findIndex((p) => p.email.toLowerCase() === normalized);

  if (index >= 0) {
    profiles[index] = profile;
  } else {
    profiles.push(profile);
  }

  writeStoredProfiles(profiles);
}

// ---------------------------------------------------------------------------
// Session & Auth Actions
// ---------------------------------------------------------------------------

/**
 * Returns the currently active customer session, or null if unauthenticated.
 */
export function getCurrentCustomerSession(): CustomerSession | null {
  return readStoredSession();
}

/**
 * Simulates a customer login.
 *
 * Rules:
 * - Rejects `error@example.com` to support interactive test/demo failure flows.
 * - Looks up previously saved profile; if not found, checks existing order history
 *   for any orders with the same email to reuse the customer's name.
 * - Never collects or stores password credentials.
 */
export function simulateLogin(email: string, _password?: string): CustomerSession {
  void _password;
  if (!email || !email.trim()) {
    throw new Error('Email address is required.');
  }

  const normalizedEmail = email.trim().toLowerCase();

  // Test failure credential
  if (normalizedEmail === 'error@example.com') {
    throw new Error('Invalid customer credentials. Please check your email and password.');
  }

  // Look for existing profile
  let profile = getProfileByEmail(normalizedEmail);

  if (!profile) {
    // Check if an order was placed with this email previously
    const existingOrders = getAllOrders().filter(
      (o) => o.customer?.email?.trim().toLowerCase() === normalizedEmail
    );
    const existingName = existingOrders[0]?.customer?.fullName;
    const existingPhone = existingOrders[0]?.customer?.phone;
    const existingAddress = existingOrders[0]?.shippingAddress;

    // Derive display name from previous orders or email prefix
    const derivedName =
      existingName ||
      normalizedEmail
        .split('@')[0]
        .replace(/[._-]/g, ' ')
        .replace(/\b\w/g, (c) => c.toUpperCase());

    profile = {
      id: `cust_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      email: normalizedEmail,
      fullName: derivedName,
      phone: existingPhone,
      createdAt: existingOrders[0]?.createdAt || new Date().toISOString(),
      savedAddress: existingAddress ? { ...existingAddress } : undefined,
    };

    saveProfile(profile);
  }

  const session: CustomerSession = {
    customer: profile,
    authenticatedAt: new Date().toISOString(),
    provider: 'ALTITUDE_SIMULATED_AUTH',
  };

  writeStoredSession(session);
  return session;
}

/**
 * Simulates customer account registration.
 *
 * Rules:
 * - Rejects `taken@example.com` to test duplicate email collision handling.
 * - Stores customer profile without password.
 * - Automatically initiates a customer session upon successful registration.
 */
export function simulateRegister(payload: {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  _password?: string;
}): CustomerSession {
  const { firstName, lastName, email, phone } = payload;

  if (!email || !email.trim()) {
    throw new Error('Email address is required.');
  }

  const normalizedEmail = email.trim().toLowerCase();

  if (normalizedEmail === 'taken@example.com') {
    throw new Error('An account with this email address already exists. Please sign in instead.');
  }

  const fullName = `${firstName.trim()} ${lastName.trim()}`.trim();
  const profile: CustomerProfile = {
    id: `cust_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    email: normalizedEmail,
    fullName: fullName || normalizedEmail.split('@')[0],
    phone: phone?.trim() || undefined,
    createdAt: new Date().toISOString(),
  };

  saveProfile(profile);

  const session: CustomerSession = {
    customer: profile,
    authenticatedAt: new Date().toISOString(),
    provider: 'ALTITUDE_SIMULATED_AUTH',
  };

  writeStoredSession(session);
  return session;
}

/**
 * Updates the current customer profile.
 * Does not overwrite historical order snapshots.
 */
export function updateCustomerProfile(
  updates: UpdateCustomerProfilePayload
): CustomerProfile {
  const currentSession = getCurrentCustomerSession();
  if (!currentSession) {
    throw new Error('No active customer session found.');
  }

  const updatedProfile: CustomerProfile = {
    ...currentSession.customer,
    fullName: updates.fullName?.trim() || currentSession.customer.fullName,
    phone: updates.phone !== undefined ? updates.phone.trim() : currentSession.customer.phone,
    savedAddress:
      updates.savedAddress !== undefined
        ? updates.savedAddress
        : currentSession.customer.savedAddress,
  };

  saveProfile(updatedProfile);

  const updatedSession: CustomerSession = {
    ...currentSession,
    customer: updatedProfile,
  };
  writeStoredSession(updatedSession);

  return updatedProfile;
}

/**
 * Logs out the simulated customer and removes session from storage.
 */
export function clearCustomerSession(): void {
  writeStoredSession(null);
}

/**
 * Resets all customer profiles and sessions.
 * Intended for test cleanup only.
 */
export function clearAllCustomerData(): void {
  writeStoredSession(null);
  profilesMemoryStore.clear();
  if (isBrowser()) {
    try {
      window.localStorage.removeItem(CUSTOMER_SESSION_STORAGE_KEY);
      window.localStorage.removeItem(CUSTOMER_PROFILES_STORAGE_KEY);
    } catch {
      // ignore
    }
  }
}
