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

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p className="text-xs text-rose-600 mt-1" role="alert" aria-live="polite">
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
      <FieldError message={error} />
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

function validateForm(
  customer: CustomerContact,
  address: ShippingAddress
): FormErrors {
  const errors: FormErrors = {};

  if (!customer.fullName.trim()) errors.fullName = 'Full name is required.';
  if (!customer.email.trim()) {
    errors.email = 'Email address is required.';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customer.email)) {
    errors.email = 'Please enter a valid email address.';
  }
  if (!customer.phone.trim()) errors.phone = 'Phone number is required.';

  if (!address.fullName.trim()) errors.shipFullName = 'Full name is required.';
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
  const [address, setAddress] = useState<ShippingAddress>(() => ({
    fullName: authCustomer?.savedAddress?.fullName || authCustomer?.fullName || '',
    streetAddress: authCustomer?.savedAddress?.streetAddress || '',
    unit: authCustomer?.savedAddress?.unit || '',
    city: authCustomer?.savedAddress?.city || '',
    state: authCustomer?.savedAddress?.state || '',
    postalCode: authCustomer?.savedAddress?.postalCode || '',
    country: authCustomer?.savedAddress?.country || 'US',
  }));

  const [fieldErrors, setFieldErrors] = useState<FormErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isSubmittingRef = useRef(false);
  const errorBannerRef = useRef<HTMLDivElement>(null);

  // Empty cart redirect — deterministic once hydrated
  useEffect(() => {
    if (isHydrated && items.length === 0) {
      router.replace('/cart');
    }
  }, [isHydrated, items.length, router]);

  const handleCustomerChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      setCustomer((prev) => ({ ...prev, [name]: value }));
      setFieldErrors((prev) => ({ ...prev, [name]: undefined }));
    },
    []
  );

  const handleAddressChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const { name, value } = e.target;
      setAddress((prev) => ({ ...prev, [name]: value }));
      const errorKey = name === 'fullName' ? 'shipFullName' : name;
      setFieldErrors((prev) => ({ ...prev, [errorKey]: undefined }));
    },
    []
  );

  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      setSubmitError(null);

      // Synchronous duplicate-click guard
      if (isSubmittingRef.current) return;

      // Validate form
      const errors = validateForm(customer, address);
      if (Object.keys(errors).length > 0) {
        setFieldErrors(errors);
        // Focus first error field
        const firstKey = Object.keys(errors)[0];
        const el = document.getElementById(firstKey === 'shipFullName' ? 'shipFullName' : firstKey);
        el?.focus();
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
          shippingAddress: address,
          shippingTier,
          items: orderItems,
          clientPricingSummary,
          idempotencyKey,
        });

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
    [customer, address, items, shippingTier, idempotencyKey, clearCart, router]
  );

  // Loading / redirect skeleton
  if (!isHydrated || items.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-slate-500 text-sm">Redirecting to cart…</div>
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
                      aria-invalid={!!fieldErrors.fullName}
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
                      aria-invalid={!!fieldErrors.email}
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
                      aria-invalid={!!fieldErrors.phone}
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
                      className={inputClass}
                      aria-required="true"
                      aria-invalid={!!fieldErrors.shipFullName}
                    />
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
                      aria-invalid={!!fieldErrors.streetAddress}
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
                        aria-invalid={!!fieldErrors.city}
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
                        aria-invalid={!!fieldErrors.state}
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
                        aria-invalid={!!fieldErrors.postalCode}
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
                        aria-invalid={!!fieldErrors.country}
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
              <section aria-labelledby="delivery-heading">
                <h2
                  id="delivery-heading"
                  className="text-base font-bold text-slate-900 mb-4 pb-2 border-b border-slate-200"
                >
                  Delivery Method
                </h2>
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
              </section>

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
