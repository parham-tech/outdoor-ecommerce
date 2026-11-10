'use client';

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
  type ReactNode,
} from 'react';
import type {
  CartItem,
  PersistedCartItem,
  CartNotification,
  AddItemPayload,
  StockResolution,
  CartContextValue,
} from '@/types/cart';
import type { ProductDetail } from '@/types/product';
import { getProductDetailBySlug } from '@/data/productDetails';
import {
  calculateCartPricing,
  validateShippingTier,
  type ShippingTier,
} from '@/lib/pricing/cartPricing';

/**
 * Versioned localStorage storage key.
 */
export const CART_STORAGE_KEY = 'altitude_cart_v1';

/**
 * Storage key for persisting selected shipping tier.
 */
export const SHIPPING_TIER_STORAGE_KEY = 'altitude_shipping_tier_v1';

/**
 * Temporary Frontend-Only Demonstration Order Limit.
 *
 * NOTE ON STOCK POLICY:
 * This limit serves exclusively as a client-side UX guardrail to prevent unreasonable
 * input quantities during demonstration. It is explicitly NOT a representation of
 * actual warehouse inventory. Storefront ProductDetail models expose `inStock: boolean`;
 * exact numerical inventory is honored only if provided by the authoritative storefront source.
 */
export const MAX_FRONTEND_ORDER_LIMIT = 10;

/**
 * Validates that an input quantity is a strict positive integer (>= 1).
 */
export function isValidQuantity(qty: unknown): qty is number {
  return typeof qty === 'number' && Number.isInteger(qty) && qty >= 1;
}

/**
 * Generates a deterministic, collision-safe identifier for a product and variant combination.
 * Uses standard URI percent-encoding with alphabetically sorted variant parameters.
 *
 * Example outputs:
 * - 'prod-alpha-2p-tent'
 * - 'prod-alpha-2p-tent?capacity=2+person&color=olive'
 */
export function createCartItemId(
  productId: string,
  color?: string,
  capacity?: string
): string {
  const cleanId = (productId || '').trim();
  const params = new URLSearchParams();

  if (color && color.trim()) {
    params.set('color', color.trim().toLowerCase());
  }
  if (capacity && capacity.trim()) {
    params.set('capacity', capacity.trim().toLowerCase());
  }

  params.sort();
  const query = params.toString();
  return query ? `${cleanId}?${query}` : cleanId;
}

/**
 * Isolated stock resolution helper.
 *
 * Resolves availability and maximum selectable quantity from authoritative storefront product data.
 * Isolated to allow future backend API replacement without modifying cart UI components.
 */
export function resolveStockAvailability(product: {
  inStock?: boolean;
  inventory?: number;
}): StockResolution {
  // 1. Explicit out of stock via boolean flag or non-positive numerical inventory
  if (product.inStock === false || (typeof product.inventory === 'number' && product.inventory <= 0)) {
    return {
      isAvailable: false,
      maxSelectableQuantity: 0,
      hasExactInventory: typeof product.inventory === 'number',
      exactInventory: typeof product.inventory === 'number' ? Math.max(0, product.inventory) : undefined,
      statusReason: 'Out of stock',
    };
  }

  // 2. Authoritative numerical inventory provided by storefront source
  if (
    typeof product.inventory === 'number' &&
    Number.isInteger(product.inventory) &&
    product.inventory > 0
  ) {
    return {
      isAvailable: true,
      maxSelectableQuantity: product.inventory,
      hasExactInventory: true,
      exactInventory: product.inventory,
    };
  }

  // 3. Storefront boolean availability (inStock === true without numerical count)
  return {
    isAvailable: true,
    maxSelectableQuantity: MAX_FRONTEND_ORDER_LIMIT,
    hasExactInventory: false,
    statusReason: 'Sample availability (frontend order cap applied)',
  };
}

/**
 * Internal validation helper checking product existence, ID/slug consistency,
 * and variant option validity against the authoritative storefront catalog.
 */
export function validateProductAndOptions(payload: AddItemPayload): {
  isValid: boolean;
  product?: ProductDetail;
  error?: string;
  normalizedColor?: string;
  normalizedCapacity?: string;
} {
  const slug = (payload.slug || '').trim();
  const productId = (payload.productId || '').trim();

  if (!slug || !productId) {
    return { isValid: false, error: 'Product ID and slug are required.' };
  }

  const product = getProductDetailBySlug(slug);
  if (!product) {
    return { isValid: false, error: 'Product not found in catalog.' };
  }

  if (product.id !== productId) {
    return { isValid: false, error: 'Product ID does not match catalog slug.' };
  }

  let normalizedColor: string | undefined;
  const hasColors = Boolean(product.colors && product.colors.length > 0);
  if (payload.selectedColor && payload.selectedColor.trim()) {
    const rawColor = payload.selectedColor.trim();
    if (!hasColors) {
      return {
        isValid: false,
        error: `Color selection is not available for ${product.name}.`,
      };
    }
    const match = product.colors!.find(
      (c) => c.name.toLowerCase() === rawColor.toLowerCase()
    );
    if (!match) {
      return {
        isValid: false,
        error: `Color "${rawColor}" is not available for ${product.name}.`,
      };
    }
    normalizedColor = match.name;
  }

  let normalizedCapacity: string | undefined;
  const hasCapacities = Boolean(product.capacityOptions && product.capacityOptions.length > 0);
  if (payload.selectedCapacity && payload.selectedCapacity.trim()) {
    const rawCapacity = payload.selectedCapacity.trim();
    if (!hasCapacities) {
      return {
        isValid: false,
        error: `Option selection is not available for ${product.name}.`,
      };
    }
    const match = product.capacityOptions!.find(
      (opt) => opt.toLowerCase() === rawCapacity.toLowerCase()
    );
    if (!match) {
      return {
        isValid: false,
        error: `Option "${rawCapacity}" is not available for ${product.name}.`,
      };
    }
    normalizedCapacity = match;
  }

  const stock = resolveStockAvailability(product);
  if (!stock.isAvailable) {
    return {
      isValid: false,
      product,
      error: `${product.name} is currently out of stock.`,
    };
  }

  return {
    isValid: true,
    product,
    normalizedColor,
    normalizedCapacity,
  };
}

const CartContext = createContext<CartContextValue | null>(null);

export interface CartProviderProps {
  children: ReactNode;
}

export function CartProvider({ children }: CartProviderProps) {
  const [items, setItems] = useState<CartItem[]>([]);
  const itemsRef = useRef<CartItem[]>(items);

  useEffect(() => {
    itemsRef.current = items;
  }, [items]);

  const [isHydrated, setIsHydrated] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [shippingTier, setShippingTierState] = useState<ShippingTier>('standard');
  const [notification, setNotification] = useState<CartNotification | null>(null);

  const notificationTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const showNotification = useCallback(
    (type: 'info' | 'warning' | 'error', message: string) => {
      if (notificationTimeoutRef.current) {
        clearTimeout(notificationTimeoutRef.current);
      }
      setNotification({ id: String(Date.now()), type, message });
      notificationTimeoutRef.current = setTimeout(() => {
        setNotification(null);
      }, 6000);
    },
    []
  );

  const clearNotification = useCallback(() => {
    if (notificationTimeoutRef.current) {
      clearTimeout(notificationTimeoutRef.current);
    }
    setNotification(null);
  }, []);

  // 1. Client-side Hydration & Catalog Reconciliation on Mount
  useEffect(() => {
    const timer = setTimeout(() => {
      // --- 1. Reconcile Shipping Tier ---
      // Isolated restoration: always restores a valid tier regardless of cart items data state.
      let restoredTier: ShippingTier = 'standard';
      try {
        const storedTier = localStorage.getItem(SHIPPING_TIER_STORAGE_KEY);
        if (storedTier === 'standard' || storedTier === 'express') {
          restoredTier = storedTier;
        }
      } catch {
        // Safe fallback to 'standard' if localStorage access throws (e.g. private browsing)
      }

      // --- 2. Reconcile Cart Items ---
      // Isolated reconciliation: failures in cart JSON parsing or catalog lookup
      // gracefully fall back to an empty cart without aborting tier restoration.
      const reconciledItems: CartItem[] = [];
      let hadUnavailableItems = false;
      let hadAdjustedQuantities = false;

      try {
        const storedJson = localStorage.getItem(CART_STORAGE_KEY);
        if (storedJson) {
          const parsed: unknown = JSON.parse(storedJson);
          if (Array.isArray(parsed)) {
            const itemMap = new Map<string, CartItem>();

            for (const raw of parsed) {
              if (
                typeof raw !== 'object' ||
                raw === null ||
                typeof raw.productId !== 'string' ||
                typeof raw.slug !== 'string' ||
                !isValidQuantity(raw.quantity)
              ) {
                continue;
              }

              const product = getProductDetailBySlug(raw.slug.trim());
              // Verify existence and ID consistency against authoritative storefront catalog
              if (!product || product.id !== raw.productId.trim()) {
                hadUnavailableItems = true;
                continue;
              }

              const stock = resolveStockAvailability(product);
              if (!stock.isAvailable) {
                hadUnavailableItems = true;
                continue;
              }

              // Validate persisted color selection against authoritative product data
              let validColor: string | undefined;
              const hasColors = Boolean(product.colors && product.colors.length > 0);
              if (raw.selectedColor !== undefined && raw.selectedColor !== null) {
                if (typeof raw.selectedColor !== 'string') {
                  hadUnavailableItems = true;
                  continue;
                }
                const trimmedColor = raw.selectedColor.trim();
                if (trimmedColor) {
                  if (!hasColors) {
                    hadUnavailableItems = true;
                    continue;
                  }
                  const match = product.colors!.find(
                    (c) => c.name.toLowerCase() === trimmedColor.toLowerCase()
                  );
                  if (!match) {
                    hadUnavailableItems = true;
                    continue;
                  }
                  validColor = match.name;
                }
              }

              // Validate persisted capacity selection against authoritative product data
              let validCapacity: string | undefined;
              const hasCapacities = Boolean(product.capacityOptions && product.capacityOptions.length > 0);
              if (raw.selectedCapacity !== undefined && raw.selectedCapacity !== null) {
                if (typeof raw.selectedCapacity !== 'string') {
                  hadUnavailableItems = true;
                  continue;
                }
                const trimmedCapacity = raw.selectedCapacity.trim();
                if (trimmedCapacity) {
                  if (!hasCapacities) {
                    hadUnavailableItems = true;
                    continue;
                  }
                  const match = product.capacityOptions!.find(
                    (opt) => opt.toLowerCase() === trimmedCapacity.toLowerCase()
                  );
                  if (!match) {
                    hadUnavailableItems = true;
                    continue;
                  }
                  validCapacity = match;
                }
              }

              const id = createCartItemId(product.id, validColor, validCapacity);
              const maxLimit = stock.maxSelectableQuantity;

              if (raw.quantity > maxLimit) {
                hadAdjustedQuantities = true;
              }

              const safeQuantity = Math.min(raw.quantity, maxLimit);

              // Deduplicate in case multiple persisted items resolve to the same canonical ID
              if (itemMap.has(id)) {
                const existing = itemMap.get(id)!;
                const targetMergedQty = existing.quantity + safeQuantity;
                if (targetMergedQty > maxLimit) {
                  hadAdjustedQuantities = true;
                }
                existing.quantity = Math.min(targetMergedQty, maxLimit);
              } else {
                const newItem: CartItem = {
                  id,
                  productId: product.id,
                  slug: product.slug,
                  name: product.name,
                  category: product.category,
                  priceInCents: product.priceInCents, // Live price from catalog
                  imageUrl: product.imageUrl, // Live asset from catalog
                  selectedColor: validColor,
                  selectedCapacity: validCapacity,
                  quantity: safeQuantity,
                  maxSelectableQuantity: maxLimit,
                  isAvailable: true,
                  hasExactInventory: stock.hasExactInventory,
                  exactInventory: stock.exactInventory,
                  sku: product.sku,
                };
                itemMap.set(id, newItem);
                reconciledItems.push(newItem);
              }
            }
          }
        }
      } catch {
        // Safe fallback: corrupted JSON or catalog access errors gracefully default to empty cart
      }

      // --- 3. Atomic State Commit ---
      // Guaranteed to set both items and restoredTier before isHydrated becomes true,
      // regardless of whether cart item data was valid, corrupted, or empty.
      itemsRef.current = reconciledItems;
      setItems(reconciledItems);
      setShippingTierState(restoredTier);
      setIsHydrated(true);

      if (hadUnavailableItems) {
        showNotification(
          'warning',
          'One or more items in your cart are no longer available and were removed.'
        );
      } else if (hadAdjustedQuantities) {
        showNotification(
          'info',
          'Some item quantities were adjusted to maximum available limits.'
        );
      }
    }, 0);

    return () => clearTimeout(timer);
  }, [showNotification]);

  // 2. LocalStorage Persistence Guard for Cart Items
  // CRITICAL: Prevent writing to storage until client-side hydration has completed.
  useEffect(() => {
    if (!isHydrated) return;

    try {
      const persistedPayload: PersistedCartItem[] = items.map((item) => ({
        productId: item.productId,
        slug: item.slug,
        selectedColor: item.selectedColor,
        selectedCapacity: item.selectedCapacity,
        quantity: item.quantity,
      }));
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(persistedPayload));
    } catch {
      // Fail safely if quota exceeded or storage blocked in private browsing
    }
  }, [items, isHydrated]);

  // 3. LocalStorage Persistence Guard for Shipping Tier
  // CRITICAL: Prevent writing to storage until client-side hydration has completed.
  useEffect(() => {
    if (!isHydrated) return;

    try {
      localStorage.setItem(SHIPPING_TIER_STORAGE_KEY, shippingTier);
    } catch {
      // Fail safely if quota exceeded or storage blocked in private browsing
    }
  }, [shippingTier, isHydrated]);

  // Computed totals (pure integer-cent arithmetic)
  const itemCount = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity, 0),
    [items]
  );

  const subtotalInCents = useMemo(
    () => items.reduce((sum, item) => sum + item.priceInCents * item.quantity, 0),
    [items]
  );

  const pricing = useMemo(
    () => calculateCartPricing(subtotalInCents, shippingTier),
    [subtotalInCents, shippingTier]
  );

  const setShippingTier = useCallback((tier: ShippingTier) => {
    validateShippingTier(tier);
    setShippingTierState(tier);
  }, []);

  // Cart Actions
  const addItem = useCallback(
    (payload: AddItemPayload): boolean => {
      if (!isHydrated) {
        showNotification('info', 'Cart is initializing, please try again in a moment.');
        return false;
      }

      if (!isValidQuantity(payload.quantity)) {
        showNotification('error', 'Quantity must be a positive integer.');
        return false;
      }

      const { isValid, product, error, normalizedColor, normalizedCapacity } =
        validateProductAndOptions(payload);

      if (!isValid || !product) {
        showNotification('error', error || 'Failed to add item to cart.');
        return false;
      }

      const stock = resolveStockAvailability(product);
      if (!stock.isAvailable) {
        showNotification('error', `${product.name} is currently out of stock.`);
        return false;
      }

      const id = createCartItemId(product.id, normalizedColor, normalizedCapacity);

      // Read latest state from itemsRef to avoid closure staleness across rapid invocations
      const currentItems = itemsRef.current;
      const existingIndex = currentItems.findIndex((item) => item.id === id);

      let nextItems: CartItem[];
      let pendingNotification: { type: 'info' | 'warning' | 'error'; message: string } | null = null;

      if (existingIndex > -1) {
        const existing = currentItems[existingIndex];
        const targetQty = existing.quantity + payload.quantity;
        const cappedQty = Math.min(targetQty, stock.maxSelectableQuantity);

        if (cappedQty === existing.quantity) {
          showNotification(
            'info',
            `Maximum available quantity (${stock.maxSelectableQuantity}) reached for ${product.name}.`
          );
          return false;
        }

        if (cappedQty < targetQty) {
          pendingNotification = {
            type: 'info',
            message: `Added ${cappedQty - existing.quantity} unit(s). Reached maximum limit of ${stock.maxSelectableQuantity}.`,
          };
        }
        nextItems = [...currentItems];
        nextItems[existingIndex] = {
          ...existing,
          quantity: cappedQty,
          priceInCents: product.priceInCents, // Sync live price
          name: product.name,
          imageUrl: product.imageUrl,
          maxSelectableQuantity: stock.maxSelectableQuantity,
        };
      } else {
        const initialQty = Math.min(payload.quantity, stock.maxSelectableQuantity);
        if (initialQty < payload.quantity) {
          pendingNotification = {
            type: 'info',
            message: `Quantity adjusted to maximum limit of ${stock.maxSelectableQuantity}.`,
          };
        }

        const newItem: CartItem = {
          id,
          productId: product.id,
          slug: product.slug,
          name: product.name,
          category: product.category,
          priceInCents: product.priceInCents,
          imageUrl: product.imageUrl,
          selectedColor: normalizedColor,
          selectedCapacity: normalizedCapacity,
          quantity: initialQty,
          maxSelectableQuantity: stock.maxSelectableQuantity,
          isAvailable: true,
          hasExactInventory: stock.hasExactInventory,
          exactInventory: stock.exactInventory,
          sku: product.sku,
        };
        nextItems = [...currentItems, newItem];
      }

      // Synchronously update itemsRef and dispatch pure state update
      itemsRef.current = nextItems;
      setItems(nextItems);

      // Trigger user notification strictly outside the state updater
      if (pendingNotification) {
        showNotification(pendingNotification.type, pendingNotification.message);
      }

      return true;
    },
    [isHydrated, showNotification]
  );

  const updateQuantity = useCallback(
    (id: string, quantity: number) => {
      if (!isHydrated) return;

      if (!isValidQuantity(quantity)) {
        showNotification('error', 'Quantity must be at least 1.');
        return;
      }

      const currentItems = itemsRef.current;
      const targetIndex = currentItems.findIndex((item) => item.id === id);
      if (targetIndex === -1) return;

      const target = currentItems[targetIndex];
      const clampedQty = Math.min(quantity, target.maxSelectableQuantity);

      let pendingNotification: { type: 'info' | 'warning' | 'error'; message: string } | null = null;
      if (clampedQty < quantity) {
        pendingNotification = {
          type: 'info',
          message: `Quantity capped at maximum available limit (${target.maxSelectableQuantity}).`,
        };
      }

      const nextItems = [...currentItems];
      nextItems[targetIndex] = {
        ...target,
        quantity: clampedQty,
      };

      itemsRef.current = nextItems;
      setItems(nextItems);

      if (pendingNotification) {
        showNotification(pendingNotification.type, pendingNotification.message);
      }
    },
    [isHydrated, showNotification]
  );

  const removeItem = useCallback(
    (id: string) => {
      if (!isHydrated) return;
      const nextItems = itemsRef.current.filter((item) => item.id !== id);
      itemsRef.current = nextItems;
      setItems(nextItems);
    },
    [isHydrated]
  );

  const clearCart = useCallback(() => {
    if (!isHydrated) return;
    itemsRef.current = [];
    setItems([]);
    setShippingTierState('standard');
  }, [isHydrated]);

  const openDrawer = useCallback(() => setIsDrawerOpen(true), []);
  const closeDrawer = useCallback(() => setIsDrawerOpen(false), []);
  const toggleDrawer = useCallback(() => setIsDrawerOpen((prev) => !prev), []);

  const contextValue = useMemo<CartContextValue>(
    () => ({
      items,
      itemCount,
      subtotalInCents,
      pricing,
      shippingTier,
      isDrawerOpen,
      isHydrated,
      notification,
      openDrawer,
      closeDrawer,
      toggleDrawer,
      clearNotification,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      setShippingTier,
    }),
    [
      items,
      itemCount,
      subtotalInCents,
      pricing,
      shippingTier,
      isDrawerOpen,
      isHydrated,
      notification,
      openDrawer,
      closeDrawer,
      toggleDrawer,
      clearNotification,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      setShippingTier,
    ]
  );

  return (
    <CartContext.Provider value={contextValue}>{children}</CartContext.Provider>
  );
}

/**
 * Hook to access the cart state and actions.
 * Throws a descriptive runtime error if used outside a CartProvider.
 */
export function useCart(): CartContextValue {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
