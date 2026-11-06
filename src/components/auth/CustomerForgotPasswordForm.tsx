'use client';

import React, { useState, useRef, type FormEvent } from 'react';
import Link from 'next/link';
import {
  Mail,
  AlertCircle,
  CheckCircle2,
  Loader2,
  ArrowLeft,
  KeyRound,
  RotateCcw,
} from 'lucide-react';

interface FieldErrors {
  email?: string;
}

export function CustomerForgotPasswordForm() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState('');
  const [bannerError, setBannerError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  const emailInputRef = useRef<HTMLInputElement>(null);

  const validateForm = (): boolean => {
    const errors: FieldErrors = {};
    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      errors.email = 'Email address is required.';
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(trimmedEmail)) {
        errors.email = 'Please enter a valid email address (e.g., alex@example.com).';
      }
    }

    setFieldErrors(errors);

    if (errors.email) {
      emailInputRef.current?.focus();
    }

    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setBannerError(null);

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    // Simulated client-side submission (Frontend mock demonstration)
    setTimeout(() => {
      setIsLoading(false);

      if (email.toLowerCase() === 'unregistered@example.com') {
        setBannerError('We could not find an active ALTITUDE customer account associated with this email address.');
        emailInputRef.current?.focus();
      } else {
        setSubmittedEmail(email.trim());
        setIsSuccess(true);
      }
    }, 750);
  };

  const handleReset = () => {
    setIsSuccess(false);
    setSubmittedEmail('');
    setEmail('');
    setFieldErrors({});
    setBannerError(null);
    setTimeout(() => {
      emailInputRef.current?.focus();
    }, 50);
  };

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Card */}
      <div className="bg-white rounded-2xl border border-stone-200/90 shadow-sm p-6 sm:p-8 md:p-10">
        {/* Header */}
        <div className="mb-8 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-stone-100 text-stone-800 text-xs font-semibold uppercase tracking-wider mb-3">
            <KeyRound className="w-3.5 h-3.5 text-stone-600" aria-hidden="true" />
            <span>Account Recovery</span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 tracking-tight">
            Reset Password
          </h1>
          <p className="mt-2 text-sm text-stone-600">
            Enter your email address and we will provide recovery instructions to securely restore account access.
          </p>
        </div>

        {/* Global Error Banner */}
        {bannerError && (
          <div
            role="alert"
            aria-live="polite"
            className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 flex items-start gap-3"
          >
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" aria-hidden="true" />
            <div className="text-sm">
              <p className="font-semibold text-red-900">Recovery Failed</p>
              <p className="mt-0.5 text-red-700">{bannerError}</p>
            </div>
          </div>
        )}

        {isSuccess ? (
          /* Success State */
          <div className="space-y-6" role="status" aria-live="polite">
            <div className="p-4 sm:p-5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-950 flex items-start gap-3">
              <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" aria-hidden="true" />
              <div className="text-sm space-y-2">
                <p className="font-bold text-emerald-950 text-base">Password Reset Instructions Sent</p>
                <p className="text-emerald-800 leading-relaxed">
                  We have simulated dispatching password reset instructions to{' '}
                  <strong className="text-emerald-950 font-semibold">{submittedEmail}</strong>.
                </p>
                <div className="mt-3 p-3 bg-white/80 rounded-lg border border-emerald-200/80 text-xs text-stone-600 leading-relaxed">
                  <span className="font-semibold text-emerald-900 block mb-0.5">Prototype Simulation Note:</span>
                  In a production release, a single-use cryptographically signed token link with a 15-minute expiration
                  window would be emailed. For this frontend demonstration, no real outbound email was transmitted.
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="button"
                onClick={handleReset}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-stone-300 text-stone-700 hover:bg-stone-50 font-semibold text-sm transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
              >
                <RotateCcw className="w-4 h-4" aria-hidden="true" />
                <span>Try Another Email</span>
              </button>
              <Link
                href="/login"
                className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-semibold text-sm transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
              >
                <span>Return to Sign In</span>
              </Link>
            </div>
          </div>
        ) : (
          /* Reset Form */
          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            {/* Email Input */}
            <div>
              <label
                htmlFor="reset-email"
                className="block text-xs sm:text-sm font-semibold text-stone-800 mb-1.5"
              >
                Account Email Address{' '}
                <span className="text-orange-600 font-bold" aria-hidden="true">
                  *
                </span>
                <span className="sr-only">(required)</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                  <Mail className="w-4 h-4" aria-hidden="true" />
                </div>
                <input
                  ref={emailInputRef}
                  id="reset-email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (fieldErrors.email) {
                      setFieldErrors({});
                    }
                  }}
                  aria-required="true"
                  aria-invalid={!!fieldErrors.email}
                  aria-describedby={fieldErrors.email ? 'reset-email-error' : undefined}
                  disabled={isLoading}
                  placeholder="name@example.com"
                  className={`w-full pl-10 pr-3.5 py-2.5 rounded-lg border text-sm text-stone-900 placeholder:text-stone-400 bg-white shadow-2xs transition-colors duration-150 focus:outline-hidden focus:ring-2 focus:ring-orange-500 focus:border-orange-500 disabled:bg-stone-50 disabled:text-stone-400 ${
                    fieldErrors.email
                      ? 'border-red-500 bg-red-50/20'
                      : 'border-stone-300 hover:border-stone-400'
                  }`}
                />
              </div>
              {fieldErrors.email && (
                <p
                  id="reset-email-error"
                  role="alert"
                  className="mt-1.5 text-xs text-red-600 font-medium flex items-center gap-1"
                >
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                  {fieldErrors.email}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-orange-600 hover:bg-orange-700 active:bg-orange-800 text-white font-semibold text-sm sm:text-base tracking-wide shadow-sm hover:shadow transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed select-none cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                  <span>Sending Instructions...</span>
                </>
              ) : (
                <span>Send Reset Link</span>
              )}
            </button>
          </form>
        )}

        {/* Back to Login Link */}
        <div className="mt-6 text-center text-xs sm:text-sm text-stone-600 border-t border-stone-200/80 pt-5">
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 font-semibold text-stone-700 hover:text-stone-950 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 rounded-sm"
          >
            <ArrowLeft className="w-4 h-4" aria-hidden="true" />
            <span>Back to Sign In</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
