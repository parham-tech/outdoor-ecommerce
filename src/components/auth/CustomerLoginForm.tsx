'use client';

import React, { useState, useRef, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Eye,
  EyeOff,
  Lock,
  Mail,
  AlertCircle,
  CheckCircle2,
  Loader2,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { useCustomerAuth } from '@/context/CustomerAuthContext';
import { getSafeInternalRedirect } from '@/lib/utils/redirect';

interface FieldErrors {
  email?: string;
  password?: string;
}

export function CustomerLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useCustomerAuth();

  const rawRedirect = searchParams.get('redirect');
  const safeRedirect = getSafeInternalRedirect(rawRedirect, '/account');
  const registerHref =
    safeRedirect !== '/account'
      ? `/register?redirect=${encodeURIComponent(safeRedirect)}`
      : '/register';

  // Form Field State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // UI / Feedback State
  const [isLoading, setIsLoading] = useState(false);
  const [bannerError, setBannerError] = useState<string | null>(null);
  const [bannerSuccess, setBannerSuccess] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  const emailInputRef = useRef<HTMLInputElement>(null);
  const passwordInputRef = useRef<HTMLInputElement>(null);

  // Client-Side Validation
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

    if (!password) {
      errors.password = 'Password is required.';
    } else if (password.length < 8) {
      errors.password = 'Password must be at least 8 characters.';
    }

    setFieldErrors(errors);

    // Set focus to the first invalid field
    if (errors.email) {
      emailInputRef.current?.focus();
    } else if (errors.password) {
      passwordInputRef.current?.focus();
    }

    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setBannerError(null);
    setBannerSuccess(null);

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      await login(email, password);
      setBannerSuccess(`Welcome back! Simulated sign-in successful. Redirecting to your account...`);
      setTimeout(() => {
        router.push(safeRedirect);
      }, 500);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Invalid customer credentials. Please try again.';
      setBannerError(message);
      passwordInputRef.current?.focus();
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Auth Card */}
      <div className="bg-white rounded-2xl border border-stone-200/90 shadow-sm p-6 sm:p-8 md:p-10">
        {/* Header */}
        <div className="mb-8 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-semibold uppercase tracking-wider mb-3">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" aria-hidden="true" />
            <span>Customer Portal</span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 tracking-tight">
            Sign In to ALTITUDE
          </h1>
          <p className="mt-2 text-sm text-stone-600">
            Access your field orders, saved gear lists, and member rewards.
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
              <p className="font-semibold text-red-900">Sign In Failed</p>
              <p className="mt-0.5 text-red-700">{bannerError}</p>
            </div>
          </div>
        )}

        {/* Global Success Banner */}
        {bannerSuccess && (
          <div
            role="status"
            aria-live="polite"
            className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-start gap-3"
          >
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" aria-hidden="true" />
            <div className="text-sm">
              <p className="font-semibold text-emerald-900">Sign In Simulated</p>
              <p className="mt-0.5 text-emerald-700 leading-relaxed">{bannerSuccess}</p>
            </div>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} noValidate className="space-y-5">
          {/* Email Input */}
          <div>
            <label
              htmlFor="customer-email"
              className="block text-xs sm:text-sm font-semibold text-stone-800 mb-1.5"
            >
              Email Address{' '}
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
                id="customer-email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (fieldErrors.email) {
                    setFieldErrors((prev) => ({ ...prev, email: undefined }));
                  }
                }}
                aria-required="true"
                aria-invalid={!!fieldErrors.email}
                aria-describedby={fieldErrors.email ? 'customer-email-error' : undefined}
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
                id="customer-email-error"
                role="alert"
                className="mt-1.5 text-xs text-red-600 font-medium flex items-center gap-1"
              >
                <AlertCircle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                {fieldErrors.email}
              </p>
            )}
          </div>

          {/* Password Input */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label
                htmlFor="customer-password"
                className="block text-xs sm:text-sm font-semibold text-stone-800"
              >
                Password{' '}
                <span className="text-orange-600 font-bold" aria-hidden="true">
                  *
                </span>
                <span className="sr-only">(required)</span>
              </label>
              <Link
                href="/forgot-password"
                className="text-xs font-medium text-orange-600 hover:text-orange-700 underline underline-offset-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 rounded-sm"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                <Lock className="w-4 h-4" aria-hidden="true" />
              </div>
              <input
                ref={passwordInputRef}
                id="customer-password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (fieldErrors.password) {
                    setFieldErrors((prev) => ({ ...prev, password: undefined }));
                  }
                }}
                aria-required="true"
                aria-invalid={!!fieldErrors.password}
                aria-describedby={fieldErrors.password ? 'customer-password-error' : undefined}
                disabled={isLoading}
                placeholder="••••••••"
                className={`w-full pl-10 pr-11 py-2.5 rounded-lg border text-sm text-stone-900 placeholder:text-stone-400 bg-white shadow-2xs transition-colors duration-150 focus:outline-hidden focus:ring-2 focus:ring-orange-500 focus:border-orange-500 disabled:bg-stone-50 disabled:text-stone-400 ${
                  fieldErrors.password
                    ? 'border-red-500 bg-red-50/20'
                    : 'border-stone-300 hover:border-stone-400'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isLoading}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                aria-pressed={showPassword}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-stone-400 hover:text-stone-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 rounded-r-lg transition-colors"
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" aria-hidden="true" />
                ) : (
                  <Eye className="w-4 h-4" aria-hidden="true" />
                )}
              </button>
            </div>
            {fieldErrors.password && (
              <p
                id="customer-password-error"
                role="alert"
                className="mt-1.5 text-xs text-red-600 font-medium flex items-center gap-1"
              >
                <AlertCircle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                {fieldErrors.password}
              </p>
            )}
          </div>

          {/* Remember Me Checkbox */}
          <div className="flex items-center">
            <input
              id="customer-remember-me"
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              disabled={isLoading}
              className="h-4 w-4 rounded border-stone-300 text-orange-600 focus:ring-orange-500 focus:ring-offset-0 transition-colors"
            />
            <label
              htmlFor="customer-remember-me"
              className="ml-2.5 block text-xs sm:text-sm text-stone-700 select-none cursor-pointer"
            >
              Remember me on this browser
            </label>
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
                <span>Signing In...</span>
              </>
            ) : (
              <>
                <span>Sign In</span>
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </>
            )}
          </button>
        </form>

        {/* Prototype Demo Hint */}
        <div className="mt-6 pt-5 border-t border-stone-200/80 text-xs text-stone-500 bg-stone-50/80 rounded-lg p-3">
          <p className="font-semibold text-stone-700">Prototype Demo Credentials:</p>
          <p className="mt-0.5">
            Enter any valid email and 8+ character password to simulate sign-in. Use{' '}
            <code className="text-orange-700 font-mono">error@example.com</code> to simulate a failed credential check.
          </p>
        </div>

        {/* Footer Navigation */}
        <div className="mt-6 text-center text-xs sm:text-sm text-stone-600">
          <span>Don&apos;t have an account yet? </span>
          <Link
            href={registerHref}
            className="font-semibold text-orange-600 hover:text-orange-700 underline underline-offset-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 rounded-sm"
          >
            Create an account
          </Link>
        </div>
      </div>
    </div>
  );
}
