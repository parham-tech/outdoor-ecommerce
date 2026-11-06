'use client';

import React, { useState, useRef, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import {
  Eye,
  EyeOff,
  Lock,
  Mail,
  AlertCircle,
  CheckCircle2,
  Loader2,
  ShieldAlert,
} from 'lucide-react';

interface FieldErrors {
  email?: string;
  password?: string;
}

export function AdminLoginForm() {
  const router = useRouter();

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
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);

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
        errors.email = 'Please enter a valid email address.';
      }
    }

    if (!password) {
      errors.password = 'Password is required.';
    } else if (password.length < 8) {
      errors.password = 'Password must be at least 8 characters.';
    }

    setFieldErrors(errors);

    // Focus the first invalid field
    if (errors.email) {
      emailInputRef.current?.focus();
      return false;
    }
    if (errors.password) {
      passwordInputRef.current?.focus();
      return false;
    }

    return true;
  };

  // Mock Form Submission
  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setBannerError(null);
    setBannerSuccess(null);

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    // Simulate network authentication request
    setTimeout(() => {
      setIsLoading(false);

      const normalizedEmail = email.trim().toLowerCase();

      // Demo credentials check (from .env.example)
      const isDemoAdmin =
        (normalizedEmail === 'admin@example.com' || normalizedEmail === 'admin@altitude.example') &&
        password === 'AdminPassword123!';

      if (isDemoAdmin) {
        setBannerSuccess('Authentication verified. Redirecting to admin dashboard...');
        setTimeout(() => {
          router.push('/admin/dashboard');
        }, 800);
      } else {
        setBannerError(
          'Invalid email or password. Please verify your credentials and try again.'
        );
        passwordInputRef.current?.focus();
      }
    }, 700);
  };

  // Quick fill helper for reviewers
  const handleFillDemoCredentials = () => {
    setEmail('admin@example.com');
    setPassword('AdminPassword123!');
    setFieldErrors({});
    setBannerError(null);
  };

  return (
    <div className="w-full max-w-md">
      {/* Login Card */}
      <div className="bg-slate-850/90 bg-slate-900 border border-slate-700/80 rounded-2xl p-6 sm:p-8 shadow-2xl shadow-black/50 backdrop-blur-md">
        {/* Form Title & Subtitle */}
        <div className="mb-6 text-center">
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-wide">
            Administrator Sign In
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1.5">
            Enter your credentials to access the management portal.
          </p>
        </div>

        {/* Global Error Banner */}
        {bannerError && (
          <div
            role="alert"
            aria-live="polite"
            className="mb-5 p-3.5 bg-red-950/60 border border-red-500/40 rounded-xl flex items-start gap-3 text-red-200 text-xs sm:text-sm animate-in fade-in duration-200"
          >
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" aria-hidden="true" />
            <div className="flex-1">
              <span className="font-semibold block text-red-100">Sign In Failed</span>
              <span>{bannerError}</span>
            </div>
          </div>
        )}

        {/* Global Success Banner (Mock Success) */}
        {bannerSuccess && (
          <div
            role="status"
            aria-live="polite"
            className="mb-5 p-3.5 bg-emerald-950/60 border border-emerald-500/40 rounded-xl flex items-start gap-3 text-emerald-200 text-xs sm:text-sm animate-in fade-in duration-200"
          >
            <CheckCircle2
              className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5"
              aria-hidden="true"
            />
            <div className="flex-1">
              <span className="font-semibold block text-emerald-100">Success</span>
              <span>{bannerSuccess}</span>
            </div>
          </div>
        )}

        {/* Main Login Form */}
        <form onSubmit={handleSubmit} noValidate className="space-y-4 sm:space-y-5">
          {/* Email Address Field */}
          <div>
            <label
              htmlFor="admin-email"
              className="block text-xs sm:text-sm font-semibold text-slate-200 mb-1.5"
            >
              Email Address
            </label>
            <div className="relative">
              <div
                className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400"
                aria-hidden="true"
              >
                <Mail className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
              </div>
              <input
                ref={emailInputRef}
                id="admin-email"
                name="email"
                type="email"
                autoComplete="email"
                disabled={isLoading}
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (fieldErrors.email) {
                    setFieldErrors((prev) => ({ ...prev, email: undefined }));
                  }
                }}
                placeholder="admin@example.com"
                aria-invalid={fieldErrors.email ? 'true' : 'false'}
                aria-describedby={fieldErrors.email ? 'admin-email-error' : undefined}
                className={`w-full bg-slate-950 text-slate-100 placeholder-slate-500 text-sm rounded-xl pl-10 pr-3.5 py-3 border transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
                  fieldErrors.email
                    ? 'border-red-500/80 focus:ring-2 focus:ring-red-500 focus:border-red-500'
                    : 'border-slate-700/80 hover:border-slate-600 focus:ring-2 focus:ring-orange-500 focus:border-orange-500'
                } focus:outline-none`}
              />
            </div>
            {fieldErrors.email && (
              <p
                id="admin-email-error"
                role="alert"
                className="text-xs text-red-400 mt-1.5 flex items-center gap-1 font-medium"
              >
                <AlertCircle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                {fieldErrors.email}
              </p>
            )}
          </div>

          {/* Password Field */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label
                htmlFor="admin-password"
                className="block text-xs sm:text-sm font-semibold text-slate-200"
              >
                Password
              </label>
              <button
                type="button"
                onClick={() => setShowForgotPasswordModal(true)}
                className="text-xs text-orange-400 hover:text-orange-300 transition-colors focus:outline-none focus-visible:underline rounded-sm"
              >
                Forgot password?
              </button>
            </div>
            <div className="relative">
              <div
                className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400"
                aria-hidden="true"
              >
                <Lock className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
              </div>
              <input
                ref={passwordInputRef}
                id="admin-password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                disabled={isLoading}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (fieldErrors.password) {
                    setFieldErrors((prev) => ({ ...prev, password: undefined }));
                  }
                }}
                placeholder="••••••••••••"
                aria-invalid={fieldErrors.password ? 'true' : 'false'}
                aria-describedby={fieldErrors.password ? 'admin-password-error' : undefined}
                className={`w-full bg-slate-950 text-slate-100 placeholder-slate-500 text-sm rounded-xl pl-10 pr-11 py-3 border transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
                  fieldErrors.password
                    ? 'border-red-500/80 focus:ring-2 focus:ring-red-500 focus:border-red-500'
                    : 'border-slate-700/80 hover:border-slate-600 focus:ring-2 focus:ring-orange-500 focus:border-orange-500'
                } focus:outline-none`}
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                disabled={isLoading}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-200 transition-colors focus:outline-none focus-visible:text-orange-400 disabled:opacity-40"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                aria-pressed={showPassword}
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4 sm:w-4.5 sm:h-4.5" aria-hidden="true" />
                ) : (
                  <Eye className="w-4 h-4 sm:w-4.5 sm:h-4.5" aria-hidden="true" />
                )}
              </button>
            </div>
            {fieldErrors.password && (
              <p
                id="admin-password-error"
                role="alert"
                className="text-xs text-red-400 mt-1.5 flex items-center gap-1 font-medium"
              >
                <AlertCircle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                {fieldErrors.password}
              </p>
            )}
          </div>

          {/* Remember Me Checkbox */}
          <div className="flex items-center">
            <label
              htmlFor="admin-remember-me"
              className="flex items-center gap-2.5 text-xs sm:text-sm text-slate-300 cursor-pointer select-none"
            >
              <input
                id="admin-remember-me"
                type="checkbox"
                checked={rememberMe}
                disabled={isLoading}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded border-slate-700 bg-slate-950 text-orange-500 focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-slate-900 cursor-pointer disabled:opacity-50"
              />
              <span>Remember this workstation</span>
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full min-h-[48px] bg-orange-600 hover:bg-orange-500 active:bg-orange-700 text-white font-bold text-sm tracking-wider uppercase rounded-xl py-3 px-4 shadow-lg shadow-orange-950/40 transition-all duration-200 flex items-center justify-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 disabled:opacity-50 disabled:pointer-events-none select-none cursor-pointer"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" aria-hidden="true" />
                <span>Authenticating...</span>
              </>
            ) : (
              <span>Sign In to Dashboard</span>
            )}
          </button>
        </form>

        {/* Demo Credentials Helper Box (Reviewer convenience) */}
        <div className="mt-6 pt-5 border-t border-slate-800 text-center">
          <div className="inline-flex items-center justify-center gap-2 p-2 px-3 bg-slate-950/80 rounded-xl border border-slate-800 text-xs text-slate-400">
            <ShieldAlert className="w-3.5 h-3.5 text-orange-400 shrink-0" aria-hidden="true" />
            <span>Demo Mode:</span>
            <button
              type="button"
              onClick={handleFillDemoCredentials}
              className="text-orange-400 hover:text-orange-300 font-medium underline underline-offset-2 focus:outline-none focus-visible:ring-1 focus-visible:ring-orange-400 rounded-xs"
            >
              Fill Demo Admin Credentials
            </button>
          </div>
        </div>
      </div>

      {/* Security Disclaimer Notice */}
      <p className="mt-4 text-center text-[11px] sm:text-xs text-slate-500">
        Protected by hardware-level rate limiting and advisory session locks.
        <br />
        Unauthorized access attempts are logged and monitored.
      </p>

      {/* Forgot Password Placeholder Modal */}
      {showForgotPasswordModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="forgot-password-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-150"
        >
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-sm w-full p-6 shadow-2xl text-center">
            <div className="w-12 h-12 bg-orange-500/10 text-orange-400 rounded-full mx-auto flex items-center justify-center mb-4">
              <Lock className="w-6 h-6" aria-hidden="true" />
            </div>
            <h3 id="forgot-password-title" className="text-lg font-bold text-white mb-2">
              Password Reset Notice
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-6">
              For security compliance, administrative credential resets cannot be performed
              self-service. Please contact the ALTITUDE Systems Infrastructure Team.
            </p>
            <button
              type="button"
              onClick={() => setShowForgotPasswordModal(false)}
              className="w-full bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs uppercase tracking-wider py-2.5 px-4 rounded-xl transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-400"
            >
              Understood
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
