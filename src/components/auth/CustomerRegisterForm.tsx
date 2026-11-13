'use client';

import React, { useState, useRef, useMemo, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Eye,
  EyeOff,
  Lock,
  Mail,
  User,
  AlertCircle,
  CheckCircle2,
  Loader2,
  ArrowRight,
  ShieldCheck,
  Check,
  X,
} from 'lucide-react';
import { useCustomerAuth } from '@/context/CustomerAuthContext';
import { getSafeInternalRedirect } from '@/lib/utils/redirect';

interface FieldErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  agreeTerms?: string;
}

interface PasswordCriteria {
  label: string;
  met: boolean;
}

export function CustomerRegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { register } = useCustomerAuth();

  const rawRedirect = searchParams.get('redirect');
  const safeRedirect = getSafeInternalRedirect(rawRedirect, '/account');
  const loginHref =
    safeRedirect !== '/account'
      ? `/login?redirect=${encodeURIComponent(safeRedirect)}`
      : '/login';

  // Form State
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // UI / Feedback State
  const [isLoading, setIsLoading] = useState(false);
  const [bannerError, setBannerError] = useState<string | null>(null);
  const [bannerSuccess, setBannerSuccess] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  // Input Refs for accessible focus management
  const firstNameRef = useRef<HTMLInputElement>(null);
  const lastNameRef = useRef<HTMLInputElement>(null);
  const emailInputRef = useRef<HTMLInputElement>(null);
  const passwordInputRef = useRef<HTMLInputElement>(null);
  const confirmPasswordInputRef = useRef<HTMLInputElement>(null);
  const termsCheckboxRef = useRef<HTMLInputElement>(null);

  // Live Password Strength Calculation
  const criteriaList: PasswordCriteria[] = useMemo(() => {
    return [
      { label: 'At least 8 characters', met: password.length >= 8 },
      { label: 'Contains uppercase & lowercase letters', met: /[a-z]/.test(password) && /[A-Z]/.test(password) },
      { label: 'Contains at least one number (0-9)', met: /\d/.test(password) },
      { label: 'Contains a special symbol (!@#$%^&*)', met: /[^A-Za-z0-9]/.test(password) },
    ];
  }, [password]);

  const strengthScore = useMemo(() => {
    if (!password) return 0;
    return criteriaList.filter((c) => c.met).length;
  }, [password, criteriaList]);

  const strengthLabel = useMemo(() => {
    if (!password) return { text: 'None', color: 'bg-stone-200', textClass: 'text-stone-400' };
    switch (strengthScore) {
      case 1:
        return { text: 'Weak', color: 'bg-red-500', textClass: 'text-red-600' };
      case 2:
        return { text: 'Fair', color: 'bg-orange-500', textClass: 'text-orange-600' };
      case 3:
        return { text: 'Good', color: 'bg-amber-500', textClass: 'text-amber-600' };
      case 4:
        return { text: 'Strong', color: 'bg-emerald-600', textClass: 'text-emerald-700' };
      default:
        return { text: 'Weak', color: 'bg-red-500', textClass: 'text-red-600' };
    }
  }, [password, strengthScore]);

  // Validation
  const validateForm = (): boolean => {
    const errors: FieldErrors = {};

    if (!firstName.trim()) {
      errors.firstName = 'First name is required.';
    } else if (firstName.trim().length < 2) {
      errors.firstName = 'First name must be at least 2 characters.';
    }

    if (!lastName.trim()) {
      errors.lastName = 'Last name is required.';
    } else if (lastName.trim().length < 2) {
      errors.lastName = 'Last name must be at least 2 characters.';
    }

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

    if (!confirmPassword) {
      errors.confirmPassword = 'Please confirm your password.';
    } else if (password !== confirmPassword) {
      errors.confirmPassword = 'Passwords do not match.';
    }

    if (!agreeTerms) {
      errors.agreeTerms = 'You must agree to the Terms and Privacy Policy to create an account.';
    }

    setFieldErrors(errors);

    // Focus first invalid element
    if (errors.firstName) {
      firstNameRef.current?.focus();
    } else if (errors.lastName) {
      lastNameRef.current?.focus();
    } else if (errors.email) {
      emailInputRef.current?.focus();
    } else if (errors.password) {
      passwordInputRef.current?.focus();
    } else if (errors.confirmPassword) {
      confirmPasswordInputRef.current?.focus();
    } else if (errors.agreeTerms) {
      termsCheckboxRef.current?.focus();
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
      await register({ firstName, lastName, email, password });
      setBannerSuccess(
        `Welcome to ALTITUDE, ${firstName}! Your account has been simulated successfully. Redirecting to your account...`
      );
      setTimeout(() => {
        router.push(safeRedirect);
      }, 500);
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : 'Registration failed. Please check your information and try again.';
      setBannerError(message);
      emailInputRef.current?.focus();
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto">
      {/* Auth Card */}
      <div className="bg-white rounded-2xl border border-stone-200/90 shadow-sm p-6 sm:p-8 md:p-10">
        {/* Header */}
        <div className="mb-8 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-50 text-orange-800 text-xs font-semibold uppercase tracking-wider mb-3">
            <ShieldCheck className="w-3.5 h-3.5 text-orange-600" aria-hidden="true" />
            <span>ALTITUDE Membership</span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 tracking-tight">
            Create Customer Account
          </h1>
          <p className="mt-2 text-sm text-stone-600">
            Join ALTITUDE for expedited checkout, real-time dispatch tracking, and member field testing perks.
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
              <p className="font-semibold text-red-900">Registration Failed</p>
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
              <p className="font-semibold text-emerald-900">Account Created (Simulated)</p>
              <p className="mt-0.5 text-emerald-700 leading-relaxed">{bannerSuccess}</p>
              <div className="mt-3">
                <Link
                  href={loginHref}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 hover:text-emerald-950 underline underline-offset-2"
                >
                  <span>Proceed to Sign In</span>
                  <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} noValidate className="space-y-5">
          {/* First & Last Name Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* First Name */}
            <div>
              <label
                htmlFor="register-firstname"
                className="block text-xs sm:text-sm font-semibold text-stone-800 mb-1.5"
              >
                First Name{' '}
                <span className="text-orange-600 font-bold" aria-hidden="true">
                  *
                </span>
                <span className="sr-only">(required)</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                  <User className="w-4 h-4" aria-hidden="true" />
                </div>
                <input
                  ref={firstNameRef}
                  id="register-firstname"
                  type="text"
                  autoComplete="given-name"
                  value={firstName}
                  onChange={(e) => {
                    setFirstName(e.target.value);
                    if (fieldErrors.firstName) {
                      setFieldErrors((prev) => ({ ...prev, firstName: undefined }));
                    }
                  }}
                  aria-required="true"
                  aria-invalid={!!fieldErrors.firstName}
                  aria-describedby={fieldErrors.firstName ? 'register-firstname-error' : undefined}
                  disabled={isLoading}
                  placeholder="Alex"
                  className={`w-full pl-10 pr-3.5 py-2.5 rounded-lg border text-sm text-stone-900 placeholder:text-stone-400 bg-white shadow-2xs transition-colors duration-150 focus:outline-hidden focus:ring-2 focus:ring-orange-500 focus:border-orange-500 disabled:bg-stone-50 disabled:text-stone-400 ${
                    fieldErrors.firstName
                      ? 'border-red-500 bg-red-50/20'
                      : 'border-stone-300 hover:border-stone-400'
                  }`}
                />
              </div>
              {fieldErrors.firstName && (
                <p
                  id="register-firstname-error"
                  role="alert"
                  className="mt-1.5 text-xs text-red-600 font-medium flex items-center gap-1"
                >
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                  {fieldErrors.firstName}
                </p>
              )}
            </div>

            {/* Last Name */}
            <div>
              <label
                htmlFor="register-lastname"
                className="block text-xs sm:text-sm font-semibold text-stone-800 mb-1.5"
              >
                Last Name{' '}
                <span className="text-orange-600 font-bold" aria-hidden="true">
                  *
                </span>
                <span className="sr-only">(required)</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                  <User className="w-4 h-4" aria-hidden="true" />
                </div>
                <input
                  ref={lastNameRef}
                  id="register-lastname"
                  type="text"
                  autoComplete="family-name"
                  value={lastName}
                  onChange={(e) => {
                    setLastName(e.target.value);
                    if (fieldErrors.lastName) {
                      setFieldErrors((prev) => ({ ...prev, lastName: undefined }));
                    }
                  }}
                  aria-required="true"
                  aria-invalid={!!fieldErrors.lastName}
                  aria-describedby={fieldErrors.lastName ? 'register-lastname-error' : undefined}
                  disabled={isLoading}
                  placeholder="Morgan"
                  className={`w-full pl-10 pr-3.5 py-2.5 rounded-lg border text-sm text-stone-900 placeholder:text-stone-400 bg-white shadow-2xs transition-colors duration-150 focus:outline-hidden focus:ring-2 focus:ring-orange-500 focus:border-orange-500 disabled:bg-stone-50 disabled:text-stone-400 ${
                    fieldErrors.lastName
                      ? 'border-red-500 bg-red-50/20'
                      : 'border-stone-300 hover:border-stone-400'
                  }`}
                />
              </div>
              {fieldErrors.lastName && (
                <p
                  id="register-lastname-error"
                  role="alert"
                  className="mt-1.5 text-xs text-red-600 font-medium flex items-center gap-1"
                >
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                  {fieldErrors.lastName}
                </p>
              )}
            </div>
          </div>

          {/* Email Input */}
          <div>
            <label
              htmlFor="register-email"
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
                id="register-email"
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
                aria-describedby={fieldErrors.email ? 'register-email-error' : undefined}
                disabled={isLoading}
                placeholder="alex.morgan@example.com"
                className={`w-full pl-10 pr-3.5 py-2.5 rounded-lg border text-sm text-stone-900 placeholder:text-stone-400 bg-white shadow-2xs transition-colors duration-150 focus:outline-hidden focus:ring-2 focus:ring-orange-500 focus:border-orange-500 disabled:bg-stone-50 disabled:text-stone-400 ${
                  fieldErrors.email
                    ? 'border-red-500 bg-red-50/20'
                    : 'border-stone-300 hover:border-stone-400'
                }`}
              />
            </div>
            {fieldErrors.email && (
              <p
                id="register-email-error"
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
            <label
              htmlFor="register-password"
              className="block text-xs sm:text-sm font-semibold text-stone-800 mb-1.5"
            >
              Password{' '}
              <span className="text-orange-600 font-bold" aria-hidden="true">
                *
              </span>
              <span className="sr-only">(required)</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                <Lock className="w-4 h-4" aria-hidden="true" />
              </div>
              <input
                ref={passwordInputRef}
                id="register-password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (fieldErrors.password) {
                    setFieldErrors((prev) => ({ ...prev, password: undefined }));
                  }
                }}
                aria-required="true"
                aria-invalid={!!fieldErrors.password}
                aria-describedby="register-password-strength register-password-error"
                disabled={isLoading}
                placeholder="Create a strong password"
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

            {/* Live Password Strength Indicator */}
            {password.length > 0 && (
              <div id="register-password-strength" className="mt-2.5 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-stone-500">Password strength:</span>
                  <span className={`font-semibold ${strengthLabel.textClass}`}>{strengthLabel.text}</span>
                </div>
                {/* Strength Meter Bars */}
                <div className="grid grid-cols-4 gap-1.5 h-1.5 w-full">
                  {[1, 2, 3, 4].map((step) => (
                    <div
                      key={step}
                      className={`h-full rounded-full transition-all duration-200 ${
                        strengthScore >= step ? strengthLabel.color : 'bg-stone-200'
                      }`}
                    />
                  ))}
                </div>
                {/* Criteria Checklist */}
                <ul className="text-xs space-y-1 pt-1 text-stone-600">
                  {criteriaList.map((crit, idx) => (
                    <li key={idx} className="flex items-center gap-1.5">
                      {crit.met ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" aria-hidden="true" />
                      ) : (
                        <X className="w-3.5 h-3.5 text-stone-300 shrink-0" aria-hidden="true" />
                      )}
                      <span className={crit.met ? 'text-stone-700 font-medium' : 'text-stone-400'}>
                        {crit.label}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {fieldErrors.password && (
              <p
                id="register-password-error"
                role="alert"
                className="mt-1.5 text-xs text-red-600 font-medium flex items-center gap-1"
              >
                <AlertCircle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                {fieldErrors.password}
              </p>
            )}
          </div>

          {/* Confirm Password Input */}
          <div>
            <label
              htmlFor="register-confirm-password"
              className="block text-xs sm:text-sm font-semibold text-stone-800 mb-1.5"
            >
              Confirm Password{' '}
              <span className="text-orange-600 font-bold" aria-hidden="true">
                *
              </span>
              <span className="sr-only">(required)</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                <Lock className="w-4 h-4" aria-hidden="true" />
              </div>
              <input
                ref={confirmPasswordInputRef}
                id="register-confirm-password"
                type={showConfirmPassword ? 'text' : 'password'}
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (fieldErrors.confirmPassword) {
                    setFieldErrors((prev) => ({ ...prev, confirmPassword: undefined }));
                  }
                }}
                aria-required="true"
                aria-invalid={!!fieldErrors.confirmPassword}
                aria-describedby={fieldErrors.confirmPassword ? 'register-confirm-password-error' : undefined}
                disabled={isLoading}
                placeholder="Re-type your password"
                className={`w-full pl-10 pr-11 py-2.5 rounded-lg border text-sm text-stone-900 placeholder:text-stone-400 bg-white shadow-2xs transition-colors duration-150 focus:outline-hidden focus:ring-2 focus:ring-orange-500 focus:border-orange-500 disabled:bg-stone-50 disabled:text-stone-400 ${
                  fieldErrors.confirmPassword
                    ? 'border-red-500 bg-red-50/20'
                    : 'border-stone-300 hover:border-stone-400'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                disabled={isLoading}
                aria-label={showConfirmPassword ? 'Hide confirmed password' : 'Show confirmed password'}
                aria-pressed={showConfirmPassword}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-stone-400 hover:text-stone-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 rounded-r-lg transition-colors"
              >
                {showConfirmPassword ? (
                  <EyeOff className="w-4 h-4" aria-hidden="true" />
                ) : (
                  <Eye className="w-4 h-4" aria-hidden="true" />
                )}
              </button>
            </div>
            {fieldErrors.confirmPassword && (
              <p
                id="register-confirm-password-error"
                role="alert"
                className="mt-1.5 text-xs text-red-600 font-medium flex items-center gap-1"
              >
                <AlertCircle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                {fieldErrors.confirmPassword}
              </p>
            )}
          </div>

          {/* Terms & Privacy Agreement */}
          <div>
            <div className="flex items-start">
              <input
                ref={termsCheckboxRef}
                id="register-terms"
                type="checkbox"
                checked={agreeTerms}
                onChange={(e) => {
                  setAgreeTerms(e.target.checked);
                  if (fieldErrors.agreeTerms) {
                    setFieldErrors((prev) => ({ ...prev, agreeTerms: undefined }));
                  }
                }}
                disabled={isLoading}
                aria-required="true"
                aria-invalid={!!fieldErrors.agreeTerms}
                aria-describedby={fieldErrors.agreeTerms ? 'register-terms-error' : undefined}
                className="mt-1 h-4 w-4 rounded border-stone-300 text-orange-600 focus:ring-orange-500 focus:ring-offset-0 transition-colors"
              />
              <label
                htmlFor="register-terms"
                className="ml-2.5 block text-xs sm:text-sm text-stone-700 select-none cursor-pointer leading-normal"
              >
                I agree to the{' '}
                <span className="font-semibold text-stone-900 underline underline-offset-2">Terms of Service</span>{' '}
                and acknowledge the{' '}
                <span className="font-semibold text-stone-900 underline underline-offset-2">Privacy Policy</span>.
              </label>
            </div>
            {fieldErrors.agreeTerms && (
              <p
                id="register-terms-error"
                role="alert"
                className="mt-1.5 text-xs text-red-600 font-medium flex items-center gap-1"
              >
                <AlertCircle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                {fieldErrors.agreeTerms}
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
                <span>Creating Account...</span>
              </>
            ) : (
              <>
                <span>Create Account</span>
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </>
            )}
          </button>
        </form>

        {/* Footer Navigation */}
        <div className="mt-6 text-center text-xs sm:text-sm text-stone-600 border-t border-stone-200/80 pt-5">
          <span>Already registered with ALTITUDE? </span>
          <Link
            href={loginHref}
            className="font-semibold text-orange-600 hover:text-orange-700 underline underline-offset-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 rounded-sm"
          >
            Sign In here
          </Link>
        </div>
      </div>
    </div>
  );
}
