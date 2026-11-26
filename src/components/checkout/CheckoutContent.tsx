'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { AlertCircle, ArrowLeft, Loader2 } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useCustomerAuth } from '@/context/CustomerAuthContext';
import { formatCurrency } from '@/lib/utils/format';
import { CheckoutOrderSummary } from './CheckoutOrderSummary';
import {
  createOrder,
  deriveAuthoritativePricing,
} from '@/lib/orders/orderService';
import {
  OrderStockError,
  OrderPricingError,
  OrderStorageError,
  type CustomerContact,
  type ShippingAddress,
  type OrderItemSnapshot,
} from '@/types/order';
import type { CustomerProfile } from '@/types/customer';

// ---------------------------------------------------------------------------
// Field helpers
// ---------------------------------------------------------------------------

function FieldError({ id, message }: { id?: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} className="text-xs text-rose-600 mt-1 font-medium" role="alert">
      {message}
    </p>
  );
}

function FormField({
  label,
  id,
  required,
  error,
  children,
}: {
  label: string;
  id: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={id} className="block text-xs font-semibold text-slate-700 mb-1.5">
        {label}
        {required && <span className="text-rose-500 ml-0.5" aria-hidden="true">*</span>}
      </label>
      {children}
      <FieldError id={error ? `${id}-error` : undefined} message={error} />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

interface FormErrors {
  fullName?: string;
  email?: string;
  phone?: string;
  shipFullName?: string;
  streetAddress?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
}

const CHECKOUT_FIELD_ORDER: (keyof FormErrors)[] = [
  'fullName',
  'email',
  'phone',
  'shipFullName',
  'streetAddress',
  'city',
  'state',
  'postalCode',
  'country',
];

const CHECKOUT_ERROR_KEY_TO_DOM_ID: Record<keyof FormErrors, string> = {
  fullName: 'fullName',
  email: 'email',
  phone: 'phone',
  shipFullName: 'shipFullName',
  streetAddress: 'streetAddress',
  city: 'city',
  state: 'state',
  postalCode: 'postalCode',
  country: 'country',
};

function validateForm(
  customer: CustomerContact,
  address: ShippingAddress,
  isSameRecipient: boolean
): FormErrors {
  const errors: FormErrors = {};

  if (!customer.fullName.trim()) errors.fullName = 'Full name is required.';
  if (!customer.email.trim()) {
    errors.email = 'Email address is required.';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customer.email)) {
    errors.email = 'Please enter a valid email address.';
  }
  if (!customer.phone.trim()) errors.phone = 'Phone number is required.';

  if (!isSameRecipient && !address.fullName.trim()) {
    errors.shipFullName = 'Full name is required.';
  }
  if (!address.streetAddress.trim()) errors.streetAddress = 'Street address is required.';
  if (!address.city.trim()) errors.city = 'City is required.';
  if (!address.state.trim()) errors.state = 'State / Province is required.';
  if (!address.postalCode.trim()) errors.postalCode = 'Postal code is required.';
  if (!address.country.trim()) errors.country = 'Country is required.';

  return errors;
}

// ---------------------------------------------------------------------------
// CheckoutForm
// ---------------------------------------------------------------------------

function CheckoutForm({ authCustomer }: { authCustomer: CustomerProfile | null }) {
  const router = useRouter();
  const { items, pricing, shippingTier, setShippingTier, clearCart, isHydrated } = useCart();

  // Idempotency key — stable for this checkout session
  const [idempotencyKey] = useState<string>(() => {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID();
    }
    return `idem_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
  });

  // Form state initialized directly from authenticated customer (if present)
  const [customer, setCustomer] = useState<CustomerContact>(() => ({
    fullName: authCustomer?.fullName || '',
    email: authCustomer?.email || '',
    phone: authCustomer?.phone || '',
  }));

  const [isSameRecipient, setIsSameRecipient] = useState<boolean>(() => {
    const savedShipName = authCustomer?.savedAddress?.fullName?.trim();
    const contactName = authCustomer?.fullName?.trim();
    if (savedShipName && contactName && savedShipName !== contactName) {
      return false;
    }
    return true;
  });

  const [address, setAddress] = useState<ShippingAddress>(() => ({
    fullName: authCustomer?.savedAddress?.fullName || authCustomer?.fullName || '',
    streetAddress: authCustomer?.savedAddress?.streetAddress || '',
    unit: authCustomer?.savedAddress?.unit || '',
    city: authCustomer?.savedAddress?.city || '',
    state: authCustomer?.savedAddress?.state || '',
    postalCode: authCustomer?.savedAddress?.postalCode || '',
    country: authCustomer?.savedAddress?.country || 'US',
  }));

  // Preserve a separately entered recipient name when toggling back and forth
  const customRecipientNameRef = useRef<string | null>(
    (() => {
      const savedShipName = authCustomer?.savedAddress?.fullName?.trim();
      const contactName = authCustomer?.fullName?.trim();
      if (savedShipName && contactName && savedShipName !== contactName) {
        return authCustomer?.savedAddress?.fullName || null;
      }
      return null;
    })()
  );

  const [fieldErrors, setFieldErrors] = useState<FormErrors>({});
  const [validationCount, setValidationCount] = useState(0);
  const pendingErrorFocusRef = useRef<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isOrderSubmitted, setIsOrderSubmitted] = useState(false);
  const isSubmittingRef = useRef(false);
  const hasSubmittedOrderRef = useRef(false);
  const errorBannerRef = useRef<HTMLDivElement>(null);

  // Focus the first invalid field only after React commits DOM error attributes
  useEffect(() => {
    if (validationCount > 0 && pendingErrorFocusRef.current) {
      const targetId = pendingErrorFocusRef.current;
      pendingErrorFocusRef.current = null;
      const el = document.getElementById(targetId);
      el?.focus();
    }
  }, [validationCount]);

  // Empty cart redirect — deterministic once hydrated, skipped after successful order placement
  useEffect(() => {
    if (isHydrated && items.length === 0 && !hasSubmittedOrderRef.current) {
      router.replace('/cart');
    }
  }, [isHydrated, items.length, router]);

  const handleCustomerChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      setCustomer((prev) => ({ ...prev, [name]: value }));
      setFieldErrors((prev) => ({ ...prev, [name]: undefined }));

      if (name === 'fullName' && isSameRecipient) {
        setAddress((prev) => ({ ...prev, fullName: value }));
        setFieldErrors((prev) => ({ ...prev, shipFullName: undefined }));
      }
    },
    [isSameRecipient]
  );

  const handleAddressChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const { name, value } = e.target;
      if (name === 'fullName' && isSameRecipient) return;
      if (name === 'fullName') {
        customRecipientNameRef.current = value;
      }
      setAddress((prev) => ({ ...prev, [name]: value }));
      const errorKey = name === 'fullName' ? 'shipFullName' : name;
      setFieldErrors((prev) => ({ ...prev, [errorKey]: undefined }));
    },
    [isSameRecipient]
  );

  const handleSameRecipientChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const checked = e.target.checked;
      setIsSameRecipient(checked);

      if (checked) {
        setAddress((prev) => ({ ...prev, fullName: customer.fullName }));
        setFieldErrors((prev) => ({ ...prev, shipFullName: undefined }));
      } else if (customRecipientNameRef.current !== null) {
        setAddress((prev) => ({
          ...prev,
          fullName: customRecipientNameRef.current ?? '',
        }));
      }
    },
    [customer.fullName]
  );

  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      setSubmitError(null);

      // Synchronous duplicate-click guard
      if (isSubmittingRef.current) return;

      const effectiveAddress: ShippingAddress = isSameRecipient
        ? { ...address, fullName: customer.fullName }
        : address;

      // Validate form
      const errors = validateForm(customer, effectiveAddress, isSameRecipient);
      if (Object.keys(errors).length > 0) {
        const firstKey = CHECKOUT_FIELD_ORDER.find((k) => errors[k]);
        if (firstKey) {
          pendingErrorFocusRef.current = CHECKOUT_ERROR_KEY_TO_DOM_ID[firstKey];
        }
        setFieldErrors(errors);
        setValidationCount((c) => c + 1);
        return;
      }

      isSubmittingRef.current = true;
      setIsSubmitting(true);

      try {
        // Build item snapshots from hydrated cart items
        const orderItems: OrderItemSnapshot[] = items.map((item) => ({
          id: item.id,
          productId: item.productId,
          slug: item.slug,
          name: item.name,
          category: item.category,
          priceInCents: item.priceInCents,
          quantity: item.quantity,
          imageUrl: item.imageUrl,
          selectedColor: item.selectedColor,
          selectedCapacity: item.selectedCapacity,
          sku: item.sku,
        }));

        // Derive authoritative client summary to pass for server-side verification
        const clientPricingSummary = deriveAuthoritativePricing(orderItems, shippingTier);

        const order = createOrder({
          customer,
          shippingAddress: effectiveAddress,
          shippingTier,
          items: orderItems,
          clientPricingSummary,
          idempotencyKey,
        });

        // Prevent empty-cart redirect race before navigating to confirmation
        hasSubmittedOrderRef.current = true;
        setIsOrderSubmitted(true);

        // Clear cart only after successful persistence
        clearCart();
        router.push(`/checkout/success?orderNumber=${encodeURIComponent(order.orderNumber)}`);
      } catch (err) {
        let message = 'An unexpected error occurred. Please try again.';

        if (err instanceof OrderStockError) {
          message = `Stock issue: ${err.message}`;
        } else if (err instanceof OrderPricingError) {
          message = `Pricing error: ${err.message}`;
        } else if (err instanceof OrderStorageError) {
          message = `Could not save your order: ${err.message}`;
        } else if (err instanceof Error) {
          message = err.message;
        }

        setSubmitError(message);
        // Focus error banner for screen reader announcement
        setTimeout(() => errorBannerRef.current?.focus(), 100);
      } finally {
        isSubmittingRef.current = false;
        setIsSubmitting(false);
      }
    },
    [customer, address, isSameRecipient, items, shippingTier, idempotencyKey, clearCart, router]
  );

  // Loading / redirect skeleton
  if (!isHydrated || items.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-slate-600 text-sm" role="status" aria-live="polite">
          {isOrderSubmitted ? 'Order confirmed. Redirecting…' : 'Redirecting to cart…'}
        </div>
      </div>
    );
  }

  const inputClass =
    'w-full text-sm text-slate-900 bg-white border border-slate-300 rounded-lg px-3.5 py-2.5 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#A94900] focus:border-transparent transition-shadow';

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Page header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center gap-3">
          <Link
            href="/cart"
            className="text-slate-500 hover:text-slate-900 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#A94900] rounded"
            aria-label="Back to cart"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-lg font-bold text-slate-900">Checkout</h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error Banner */}
        {submitError && (
          <div
            ref={errorBannerRef}
            role="alert"
            aria-live="assertive"
            tabIndex={-1}
            className="mb-6 p-4 rounded-xl border border-rose-200 bg-rose-50 flex items-start gap-3"
          >
            <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" aria-hidden="true" />
            <p className="text-sm text-rose-800 font-medium">{submitError}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div className="lg:grid lg:grid-cols-5 lg:gap-10">
            {/* ---- Left column: form ---- */}
            <div className="lg:col-span-3 space-y-8">
              {/* Contact Information */}
              <section aria-labelledby="contact-heading">
                <h2
                  id="contact-heading"
                  className="text-base font-bold text-slate-900 mb-4 pb-2 border-b border-slate-200"
                >
                  Contact Information
                </h2>
                <div className="space-y-4">
                  <FormField label="Full Name" id="fullName" required error={fieldErrors.fullName}>
                    <input
                      id="fullName"
                      name="fullName"
                      type="text"
                      autoComplete="name"
                      value={customer.fullName}
                      onChange={handleCustomerChange}
                      className={inputClass}
                      aria-required="true"
                      aria-describedby={fieldErrors.fullName ? 'fullName-error' : undefined}
                      aria-invalid={fieldErrors.fullName ? 'true' : undefined}
                    />
                  </FormField>
                  <FormField label="Email Address" id="email" required error={fieldErrors.email}>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      value={customer.email}
                      onChange={handleCustomerChange}
                      className={inputClass}
                      aria-required="true"
                      aria-describedby={fieldErrors.email ? 'email-error' : undefined}
                      aria-invalid={fieldErrors.email ? 'true' : undefined}
                    />
                  </FormField>
                  <FormField label="Phone Number" id="phone" required error={fieldErrors.phone}>
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      autoComplete="tel"
                      value={customer.phone}
                      onChange={handleCustomerChange}
                      className={inputClass}
                      aria-required="true"
                      aria-describedby={fieldErrors.phone ? 'phone-error' : undefined}
                      aria-invalid={fieldErrors.phone ? 'true' : undefined}
                    />
                  </FormField>
                </div>
              </section>

              {/* Shipping Address */}
              <section aria-labelledby="shipping-heading">
                <h2
                  id="shipping-heading"
                  className="text-base font-bold text-slate-900 mb-4 pb-2 border-b border-slate-200"
                >
                  Shipping Address
                </h2>
                <div className="space-y-4">
                  <div className="pt-0.5">
                    <label
                      htmlFor="sameAsContact"
                      className="inline-flex items-center gap-2.5 text-sm font-medium text-slate-700 cursor-pointer select-none py-1"
                    >
                      <input
                        id="sameAsContact"
                        type="checkbox"
                        checked={isSameRecipient}
                        onChange={handleSameRecipientChange}
                        className="w-4 h-4 rounded border-slate-300 accent-[#A94900] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#A94900] focus-visible:ring-offset-2 cursor-pointer"
                      />
                      <span>Shipping recipient is the same as contact name</span>
                    </label>
                  </div>

                  <FormField
                    label="Full Name"
                    id="shipFullName"
                    required
                    error={fieldErrors.shipFullName}
                  >
                    <input
                      id="shipFullName"
                      name="fullName"
                      type="text"
                      autoComplete="shipping name"
                      value={address.fullName}
                      onChange={handleAddressChange}
                      readOnly={isSameRecipient}
                      className={`${inputClass} read-only:bg-slate-100 read-only:text-slate-700 read-only:cursor-default`}
                      aria-required="true"
                      aria-describedby={
                        [
                          fieldErrors.shipFullName ? 'shipFullName-error' : null,
                          isSameRecipient ? 'shipFullName-sync-hint' : null,
                        ]
                          .filter(Boolean)
                          .join(' ') || undefined
                      }
                      aria-invalid={fieldErrors.shipFullName ? 'true' : undefined}
                    />
                    {isSameRecipient && (
                      <p id="shipFullName-sync-hint" className="text-[11px] text-slate-600 mt-1">
                        Synced with Contact Full Name. Uncheck above to enter a different recipient.
                      </p>
                    )}
                  </FormField>
                  <FormField
                    label="Street Address"
                    id="streetAddress"
                    required
                    error={fieldErrors.streetAddress}
                  >
                    <input
                      id="streetAddress"
                      name="streetAddress"
                      type="text"
                      autoComplete="shipping street-address"
                      value={address.streetAddress}
                      onChange={handleAddressChange}
                      className={inputClass}
                      aria-required="true"
                      aria-describedby={fieldErrors.streetAddress ? 'streetAddress-error' : undefined}
                      aria-invalid={fieldErrors.streetAddress ? 'true' : undefined}
                    />
                  </FormField>
                  <FormField label="Apartment / Unit (optional)" id="unit">
                    <input
                      id="unit"
                      name="unit"
                      type="text"
                      autoComplete="shipping address-line2"
                      value={address.unit ?? ''}
                      onChange={handleAddressChange}
                      className={inputClass}
                    />
                  </FormField>
                  <div className="grid grid-cols-2 gap-4">
                    <FormField label="City" id="city" required error={fieldErrors.city}>
                      <input
                        id="city"
                        name="city"
                        type="text"
                        autoComplete="shipping address-level2"
                        value={address.city}
                        onChange={handleAddressChange}
                        className={inputClass}
                        aria-required="true"
                        aria-describedby={fieldErrors.city ? 'city-error' : undefined}
                        aria-invalid={fieldErrors.city ? 'true' : undefined}
                      />
                    </FormField>
                    <FormField
                      label="State / Province"
                      id="state"
                      required
                      error={fieldErrors.state}
                    >
                      <input
                        id="state"
                        name="state"
                        type="text"
                        autoComplete="shipping address-level1"
                        value={address.state}
                        onChange={handleAddressChange}
                        className={inputClass}
                        aria-required="true"
                        aria-describedby={fieldErrors.state ? 'state-error' : undefined}
                        aria-invalid={fieldErrors.state ? 'true' : undefined}
                      />
                    </FormField>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      label="Postal Code"
                      id="postalCode"
                      required
                      error={fieldErrors.postalCode}
                    >
                      <input
                        id="postalCode"
                        name="postalCode"
                        type="text"
                        autoComplete="shipping postal-code"
                        value={address.postalCode}
                        onChange={handleAddressChange}
                        className={inputClass}
                        aria-required="true"
                        aria-describedby={fieldErrors.postalCode ? 'postalCode-error' : undefined}
                        aria-invalid={fieldErrors.postalCode ? 'true' : undefined}
                      />
                    </FormField>
                    <FormField label="Country" id="country" required error={fieldErrors.country}>
                      <select
                        id="country"
                        name="country"
                        autoComplete="shipping country"
                        value={address.country}
                        onChange={handleAddressChange}
                        className={inputClass}
                        aria-required="true"
                        aria-describedby={fieldErrors.country ? 'country-error' : undefined}
                        aria-invalid={fieldErrors.country ? 'true' : undefined}
                      >
                        <option value="US">United States</option>
                        <option value="CA">Canada</option>
                        <option value="GB">United Kingdom</option>
                        <option value="AU">Australia</option>
                        <option value="DE">Germany</option>
                        <option value="FR">France</option>
                        <option value="NL">Netherlands</option>
                        <option value="NZ">New Zealand</option>
                      </select>
                    </FormField>
                  </div>
                </div>
              </section>

              {/* Delivery Method */}
              <fieldset className="border-0 p-0 m-0">
                <legend className="text-base font-bold text-slate-900 mb-4 pb-2 border-b border-slate-200 w-full block">
                  Delivery Method
                </legend>
                <div className="space-y-3">
                  {/* Standard */}
                  <label
                    className={`flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-colors ${
                      shippingTier === 'standard'
                        ? 'border-[#A94900] bg-orange-50/60'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="shippingTier"
                      value="standard"
                      checked={shippingTier === 'standard'}
                      onChange={() => setShippingTier('standard')}
                      className="mt-0.5 accent-[#A94900]"
                    />
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <span className="text-sm font-semibold text-slate-900">
                          Standard Shipping
                        </span>
                        <span className="text-sm font-bold text-slate-900">
                          {pricing.qualifiesForFreeShipping ? (
                            <span className="text-emerald-700">FREE</span>
                          ) : (
                            formatCurrency(500)
                          )}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {pricing.qualifiesForFreeShipping
                          ? 'You qualify for free standard shipping!'
                          : `Free on orders over ${formatCurrency(7500)}`}
                      </p>
                    </div>
                  </label>

                  {/* Express */}
                  <label
                    className={`flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-colors ${
                      shippingTier === 'express'
                        ? 'border-[#A94900] bg-orange-50/60'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="shippingTier"
                      value="express"
                      checked={shippingTier === 'express'}
                      onChange={() => setShippingTier('express')}
                      className="mt-0.5 accent-[#A94900]"
                    />
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <span className="text-sm font-semibold text-slate-900">
                          Express Shipping
                        </span>
                        <span className="text-sm font-bold text-slate-900">
                          {formatCurrency(1500)}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">Priority processing</p>
                    </div>
                  </label>
                </div>
              </fieldset>

              {/* Simulated Payment Notice */}
              <section aria-labelledby="payment-heading">
                <h2
                  id="payment-heading"
                  className="text-base font-bold text-slate-900 mb-4 pb-2 border-b border-slate-200"
                >
                  Payment
                </h2>
                <div className="p-4 rounded-xl border border-blue-200 bg-blue-50">
                  <p className="text-sm font-semibold text-blue-900 mb-1">
                    🔬 Prototype Demonstration Mode
                  </p>
                  <p className="text-xs text-blue-800 leading-relaxed">
                    This is a simulated checkout. No payment card information is collected and no
                    real financial transaction will occur. Click &quot;Place Simulated Order&quot; to
                    complete the checkout simulation and record a prototype order.
                  </p>
                </div>
              </section>

              {/* Mobile order summary */}
              <div className="lg:hidden">
                <CheckoutOrderSummary items={items} pricing={pricing} />
              </div>

              {/* Submit */}
              <div className="pb-8">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  aria-busy={isSubmitting}
                  className="w-full flex items-center justify-center gap-2 bg-[#A94900] hover:bg-[#8F3E00] active:bg-[#753300] text-white font-bold py-4 px-8 rounded-xl text-sm transition-colors shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#A94900] focus-visible:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:bg-[#A94900]"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                      <span>Placing Order…</span>
                    </>
                  ) : (
                    <span>Place Simulated Order</span>
                  )}
                </button>
                <p className="text-[11px] text-slate-500 text-center mt-2">
                  No real payment collected · Prototype demonstration only
                </p>
              </div>
            </div>

            {/* ---- Right column: order summary (desktop) ---- */}
            <div className="hidden lg:block lg:col-span-2">
              <div className="sticky top-6">
                <CheckoutOrderSummary items={items} pricing={pricing} />
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export function CheckoutContent() {
  const { customer: authCustomer } = useCustomerAuth();

  return (
    <CheckoutForm
      key={authCustomer?.id || authCustomer?.email || 'guest'}
      authCustomer={authCustomer}
    />
  );
}
