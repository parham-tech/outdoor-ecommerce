'use client';

import React, { useState, useCallback, type FormEvent } from 'react';
import {
  User,
  Mail,
  Phone,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Save,
  Loader2,
  Trash2,
} from 'lucide-react';
import { useCustomerAuth } from '@/context/CustomerAuthContext';
import { AccountNav } from '@/components/account/AccountNav';
import { AccountAuthGuard } from '@/components/account/AccountAuthGuard';
import type { ShippingAddress } from '@/types/order';

function ProfileFormContent() {
  const { customer, updateProfile } = useCustomerAuth();

  // Personal Information State
  const [fullName, setFullName] = useState(customer?.fullName || '');
  const [phone, setPhone] = useState(customer?.phone || '');

  // Saved Address State
  const [shipFullName, setShipFullName] = useState(customer?.savedAddress?.fullName || '');
  const [streetAddress, setStreetAddress] = useState(customer?.savedAddress?.streetAddress || '');
  const [unit, setUnit] = useState(customer?.savedAddress?.unit || '');
  const [city, setCity] = useState(customer?.savedAddress?.city || '');
  const [state, setState] = useState(customer?.savedAddress?.state || '');
  const [postalCode, setPostalCode] = useState(customer?.savedAddress?.postalCode || '');
  const [country, setCountry] = useState(customer?.savedAddress?.country || 'US');

  // Feedback State
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{ fullName?: string; phone?: string }>({});

  const handleSubmit = useCallback(
    async (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      setSaveSuccess(null);
      setSaveError(null);

      // Validation
      const errors: { fullName?: string } = {};
      if (!fullName.trim()) {
        errors.fullName = 'Full name is required.';
      }
      if (Object.keys(errors).length > 0) {
        setFieldErrors(errors);
        return;
      }
      setFieldErrors({});

      setIsSaving(true);

      try {
        let savedAddress: ShippingAddress | undefined = undefined;

        // If any address fields are filled, package the address
        if (streetAddress.trim() || city.trim() || postalCode.trim()) {
          savedAddress = {
            fullName: shipFullName.trim() || fullName.trim(),
            streetAddress: streetAddress.trim(),
            unit: unit.trim() || undefined,
            city: city.trim(),
            state: state.trim(),
            postalCode: postalCode.trim(),
            country: country.trim() || 'US',
          };
        }

        await updateProfile({
          fullName: fullName.trim(),
          phone: phone.trim() || undefined,
          savedAddress,
        });

        setSaveSuccess('Profile and default address saved successfully.');
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Failed to update profile.';
        setSaveError(message);
      } finally {
        setIsSaving(false);
      }
    },
    [
      fullName,
      phone,
      shipFullName,
      streetAddress,
      unit,
      city,
      state,
      postalCode,
      country,
      updateProfile,
    ]
  );

  const handleClearAddress = useCallback(async () => {
    setShipFullName('');
    setStreetAddress('');
    setUnit('');
    setCity('');
    setState('');
    setPostalCode('');
    setCountry('US');

    try {
      await updateProfile({
        savedAddress: undefined,
      });
      setSaveSuccess('Saved default address removed.');
    } catch {
      setSaveError('Failed to remove saved address.');
    }
  }, [updateProfile]);

  const inputClass =
    'w-full text-sm text-stone-900 bg-white border border-stone-300 rounded-lg px-3.5 py-2.5 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-shadow disabled:bg-stone-50 disabled:text-stone-400';

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <AccountNav title="Customer Profile" subtitle="Update your contact info and default shipping preferences." />

      {/* Success Notification */}
      {saveSuccess && (
        <div
          role="status"
          className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-sm flex items-center justify-between"
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" aria-hidden="true" />
            <span className="font-medium">{saveSuccess}</span>
          </div>
          <button
            type="button"
            onClick={() => setSaveSuccess(null)}
            className="text-xs font-bold text-emerald-800 hover:text-emerald-950 underline cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Error Notification */}
      {saveError && (
        <div
          role="alert"
          className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-center justify-between"
        >
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" aria-hidden="true" />
            <span className="font-medium">{saveError}</span>
          </div>
          <button
            type="button"
            onClick={() => setSaveError(null)}
            className="text-xs font-bold text-rose-800 hover:text-rose-950 underline cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className="space-y-8">
        {/* Section 1: Personal Contact Information */}
        <div className="bg-white rounded-2xl border border-stone-200 p-6 sm:p-8 shadow-xs">
          <div className="flex items-center gap-2 pb-4 mb-6 border-b border-stone-100">
            <User className="w-5 h-5 text-stone-500" aria-hidden="true" />
            <h2 className="text-base font-bold text-stone-900 font-serif">
              Personal Information
            </h2>
          </div>

          <div className="space-y-5">
            {/* Full Name */}
            <div>
              <label htmlFor="fullName" className="block text-xs font-semibold text-stone-700 mb-1.5">
                Full Name <span className="text-rose-500" aria-hidden="true">*</span>
              </label>
              <input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => {
                  setFullName(e.target.value);
                  if (fieldErrors.fullName) {
                    setFieldErrors((prev) => ({ ...prev, fullName: undefined }));
                  }
                }}
                className={inputClass}
                required
                aria-invalid={!!fieldErrors.fullName}
              />
              {fieldErrors.fullName && (
                <p className="mt-1 text-xs text-rose-600 font-medium" role="alert">
                  {fieldErrors.fullName}
                </p>
              )}
            </div>

            {/* Email (Readonly to maintain order integrity) */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="email" className="block text-xs font-semibold text-stone-700">
                  Email Address
                </label>
                <span className="text-[11px] text-stone-400">Account Primary Key</span>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                  <Mail className="w-4 h-4" aria-hidden="true" />
                </div>
                <input
                  id="email"
                  type="email"
                  value={customer?.email || ''}
                  disabled
                  readOnly
                  className={`${inputClass} pl-10 cursor-not-allowed`}
                />
              </div>
              <p className="mt-1.5 text-xs text-stone-500">
                Your past and future orders are associated with this email. To protect order history integrity, email changes are locked in prototype mode.
              </p>
            </div>

            {/* Phone */}
            <div>
              <label htmlFor="phone" className="block text-xs font-semibold text-stone-700 mb-1.5">
                Phone Number (optional)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                  <Phone className="w-4 h-4" aria-hidden="true" />
                </div>
                <input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="(555) 000-0000"
                  className={`${inputClass} pl-10`}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Saved Default Shipping Address */}
        <div className="bg-white rounded-2xl border border-stone-200 p-6 sm:p-8 shadow-xs">
          <div className="flex items-center justify-between pb-4 mb-6 border-b border-stone-100">
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-stone-500" aria-hidden="true" />
              <h2 className="text-base font-bold text-stone-900 font-serif">
                Default Shipping Address
              </h2>
            </div>
            {customer?.savedAddress && (
              <button
                type="button"
                onClick={handleClearAddress}
                className="text-xs text-stone-500 hover:text-rose-600 font-medium flex items-center gap-1 transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Clear Address</span>
              </button>
            )}
          </div>

          <div className="space-y-4">
            <div>
              <label htmlFor="shipFullName" className="block text-xs font-semibold text-stone-700 mb-1.5">
                Recipient Name
              </label>
              <input
                id="shipFullName"
                type="text"
                value={shipFullName}
                onChange={(e) => setShipFullName(e.target.value)}
                placeholder="Full name for delivery"
                className={inputClass}
              />
            </div>

            <div>
              <label htmlFor="streetAddress" className="block text-xs font-semibold text-stone-700 mb-1.5">
                Street Address
              </label>
              <input
                id="streetAddress"
                type="text"
                value={streetAddress}
                onChange={(e) => setStreetAddress(e.target.value)}
                placeholder="e.g. 104 Alpine Crest Trail"
                className={inputClass}
              />
            </div>

            <div>
              <label htmlFor="unit" className="block text-xs font-semibold text-stone-700 mb-1.5">
                Apartment, Suite, Unit (optional)
              </label>
              <input
                id="unit"
                type="text"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                placeholder="Apt 4B"
                className={inputClass}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="city" className="block text-xs font-semibold text-stone-700 mb-1.5">
                  City
                </label>
                <input
                  id="city"
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className={inputClass}
                />
              </div>

              <div>
                <label htmlFor="state" className="block text-xs font-semibold text-stone-700 mb-1.5">
                  State / Province
                </label>
                <input
                  id="state"
                  type="text"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className={inputClass}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="postalCode" className="block text-xs font-semibold text-stone-700 mb-1.5">
                  Postal Code
                </label>
                <input
                  id="postalCode"
                  type="text"
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                  className={inputClass}
                />
              </div>

              <div>
                <label htmlFor="country" className="block text-xs font-semibold text-stone-700 mb-1.5">
                  Country
                </label>
                <select
                  id="country"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className={inputClass}
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
              </div>
            </div>

            <p className="text-xs text-stone-500 pt-1">
              Note: Updating your default address will pre-fill future checkouts. Historical order address snapshots will remain unchanged.
            </p>
          </div>
        </div>

        {/* Submit Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="submit"
            disabled={isSaving}
            className="inline-flex items-center gap-2 bg-orange-600 hover:bg-orange-700 active:bg-orange-800 text-white text-sm font-bold py-3 px-8 rounded-xl transition-colors shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 disabled:opacity-60 cursor-pointer"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                <span>Saving Changes...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" aria-hidden="true" />
                <span>Save Profile Changes</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

export default function CustomerProfilePage() {
  const { customer } = useCustomerAuth();
  return (
    <AccountAuthGuard>
      <ProfileFormContent key={customer?.id || customer?.email || 'guest'} />
    </AccountAuthGuard>
  );
}
