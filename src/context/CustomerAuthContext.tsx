'use client';

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from 'react';
import type {
  CustomerProfile,
  CustomerSession,
  UpdateCustomerProfilePayload,
} from '@/types/customer';
import {
  getCurrentCustomerSession,
  simulateLogin as serviceLogin,
  simulateRegister as serviceRegister,
  updateCustomerProfile as serviceUpdateProfile,
  clearCustomerSession as serviceLogout,
} from '@/lib/auth/customerSession';

export interface CustomerAuthContextValue {
  customer: CustomerProfile | null;
  session: CustomerSession | null;
  isAuthenticated: boolean;
  isHydrated: boolean;
  login: (email: string, password?: string) => Promise<CustomerSession>;
  register: (payload: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    password?: string;
  }) => Promise<CustomerSession>;
  logout: () => void;
  updateProfile: (updates: UpdateCustomerProfilePayload) => Promise<CustomerProfile>;
}

const CustomerAuthContext = createContext<CustomerAuthContextValue | null>(null);

const emptySubscribe = () => () => {};

function safeGetCurrentSession(): CustomerSession | null {
  try {
    return getCurrentCustomerSession();
  } catch (err) {
    console.warn('[CustomerAuthProvider] Failed to hydrate customer session', err);
    return null;
  }
}

export function CustomerAuthProvider({ children }: { children: ReactNode }) {
  // Synchronous client hydration tracking without setState-in-effect or artificial delays
  const isHydrated = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  // Runtime session override when login/logout/updateProfile is executed in-session
  const [sessionOverride, setSessionOverride] = useState<{ value: CustomerSession | null } | null>(null);

  const session = useMemo(() => {
    if (!isHydrated) return null;
    return sessionOverride !== null ? sessionOverride.value : safeGetCurrentSession();
  }, [isHydrated, sessionOverride]);

  const login = useCallback(async (email: string, password?: string): Promise<CustomerSession> => {
    const newSession = serviceLogin(email, password);
    setSessionOverride({ value: newSession });
    return newSession;
  }, []);

  const register = useCallback(
    async (payload: {
      firstName: string;
      lastName: string;
      email: string;
      phone?: string;
      password?: string;
    }): Promise<CustomerSession> => {
      const newSession = serviceRegister(payload);
      setSessionOverride({ value: newSession });
      return newSession;
    },
    []
  );

  const logout = useCallback(() => {
    serviceLogout();
    setSessionOverride({ value: null });
  }, []);

  const updateProfile = useCallback(
    async (updates: UpdateCustomerProfilePayload): Promise<CustomerProfile> => {
      const updatedProfile = serviceUpdateProfile(updates);
      const activeSession = safeGetCurrentSession();
      setSessionOverride({ value: activeSession });
      return updatedProfile;
    },
    []
  );

  const value = useMemo<CustomerAuthContextValue>(
    () => ({
      customer: session?.customer ?? null,
      session,
      isAuthenticated: Boolean(session?.customer),
      isHydrated,
      login,
      register,
      logout,
      updateProfile,
    }),
    [session, isHydrated, login, register, logout, updateProfile]
  );

  return (
    <CustomerAuthContext.Provider value={value}>
      {children}
    </CustomerAuthContext.Provider>
  );
}

/**
 * Access the simulated customer session and authentication actions.
 * Throws a descriptive error if used outside a CustomerAuthProvider.
 */
export function useCustomerAuth(): CustomerAuthContextValue {
  const context = useContext(CustomerAuthContext);
  if (!context) {
    throw new Error('useCustomerAuth must be used within a CustomerAuthProvider');
  }
  return context;
}
