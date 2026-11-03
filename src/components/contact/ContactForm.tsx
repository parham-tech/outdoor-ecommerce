'use client';

import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/Button';

interface FormState {
  fullName: string;
  email: string;
  subject: string;
  orderNumber: string;
  message: string;
}

interface FormErrors {
  fullName?: string;
  email?: string;
  subject?: string;
  message?: string;
}

const INITIAL_FORM_STATE: FormState = {
  fullName: '',
  email: '',
  subject: '',
  orderNumber: '',
  message: '',
};

const SUBJECT_OPTIONS = [
  { value: '', label: 'Select an inquiry topic...' },
  { value: 'product-inquiry', label: 'Product Inquiries & Specifications' },
  { value: 'gear-advice', label: 'Backcountry Gear Advice' },
  { value: 'order-inquiry', label: 'Order Status & Assistance' },
  { value: 'general', label: 'General Questions & Feedback' },
] as const;

export function ContactForm() {
  const [formData, setFormData] = useState<FormState>(INITIAL_FORM_STATE);
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [lastSubmission, setLastSubmission] = useState<FormState | null>(null);

  const fullNameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const subjectRef = useRef<HTMLSelectElement>(null);
  const messageRef = useRef<HTMLTextAreaElement>(null);

  const validate = (data: FormState): FormErrors => {
    const errs: FormErrors = {};

    if (!data.fullName.trim() || data.fullName.trim().length < 2) {
      errs.fullName = 'Please enter your full name (at least 2 characters).';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!data.email.trim()) {
      errs.email = 'Please enter your email address.';
    } else if (!emailRegex.test(data.email.trim())) {
      errs.email = 'Please enter a valid email address (e.g., name@example.com).';
    }

    if (!data.subject) {
      errs.subject = 'Please select an inquiry topic.';
    }

    if (!data.message.trim() || data.message.trim().length < 10) {
      errs.message = 'Please provide a message with at least 10 characters.';
    }

    return errs;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    const nextFormData = { ...formData, [name]: value };
    setFormData(nextFormData);

    // Revalidate field if already touched
    if (touched[name]) {
      const currentErrors = validate(nextFormData);
      setErrors((prev) => ({
        ...prev,
        [name]: currentErrors[name as keyof FormErrors],
      }));
    }
  };

  const handleBlur = (
    e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    const currentErrors = validate(formData);
    setErrors((prev) => ({
      ...prev,
      [name]: currentErrors[name as keyof FormErrors],
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Mark all required fields as touched
    setTouched({
      fullName: true,
      email: true,
      subject: true,
      orderNumber: true,
      message: true,
    });

    const validationErrors = validate(formData);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      // Focus first erroneous field for accessibility
      if (validationErrors.fullName) {
        fullNameRef.current?.focus();
      } else if (validationErrors.email) {
        emailRef.current?.focus();
      } else if (validationErrors.subject) {
        subjectRef.current?.focus();
      } else if (validationErrors.message) {
        messageRef.current?.focus();
      }
      return;
    }

    // Validation passed
    setLastSubmission({ ...formData });
    setIsSubmitted(true);
  };

  const handleResetForm = () => {
    setFormData(INITIAL_FORM_STATE);
    setErrors({});
    setTouched({});
    setIsSubmitted(false);
    setLastSubmission(null);
    // Return focus to first input
    setTimeout(() => {
      fullNameRef.current?.focus();
    }, 50);
  };

  const getSubjectLabel = (value: string) => {
    const match = SUBJECT_OPTIONS.find((opt) => opt.value === value);
    return match ? match.label : value;
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8 lg:p-10 shadow-xs">
      <div className="mb-6">
        <h2 id="contact-form-title" className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
          Send Us a Message
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-1.5 leading-relaxed">
          Fill out the details below. All fields marked with{' '}
          <span className="text-orange-600 font-semibold" aria-hidden="true">
            *
          </span>{' '}
          are required.
        </p>
      </div>

      {isSubmitted && lastSubmission ? (
        <div
          role="status"
          aria-live="polite"
          className="bg-amber-50/90 border border-amber-200 rounded-xl p-5 sm:p-6 text-slate-800 space-y-4"
        >
          <div className="flex items-start gap-3">
            <div className="p-2 bg-amber-100 rounded-full text-amber-800 flex-shrink-0 mt-0.5">
              <svg
                className="w-5 h-5"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-amber-900">
                Inquiry Validated (Demonstration Mode)
              </h3>
              <p className="text-xs sm:text-sm text-amber-800/90 mt-1 leading-relaxed">
                Thank you, <span className="font-semibold">{lastSubmission.fullName}</span>! Your contact details and inquiry have passed client validation.
              </p>
              <p className="text-xs sm:text-sm text-amber-800/90 mt-1 leading-relaxed">
                <strong>Notice:</strong> This website currently operates as an interactive frontend showcase without an active backend mail server. No message was transmitted across the network.
              </p>
            </div>
          </div>

          <div className="border-t border-amber-200/70 pt-3 text-xs text-slate-700 space-y-1.5 bg-amber-100/40 rounded-lg p-3">
            <p className="font-semibold text-slate-800">Submitted Inquiry Summary:</p>
            <p>
              <span className="font-medium text-slate-600">Email:</span> {lastSubmission.email}
            </p>
            <p>
              <span className="font-medium text-slate-600">Topic:</span> {getSubjectLabel(lastSubmission.subject)}
            </p>
            {lastSubmission.orderNumber && (
              <p>
                <span className="font-medium text-slate-600">Order Number:</span> {lastSubmission.orderNumber}
              </p>
            )}
            <p className="italic text-slate-600 pt-1 border-t border-amber-200/50">
              &ldquo;{lastSubmission.message}&rdquo;
            </p>
          </div>

          <div className="pt-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={handleResetForm}
              className="text-xs font-semibold"
            >
              Submit Another Inquiry
            </Button>
          </div>
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          noValidate
          aria-labelledby="contact-form-title"
          className="space-y-5"
        >
          {/* Full Name */}
          <div>
            <label
              htmlFor="fullName"
              className="block text-xs sm:text-sm font-semibold text-slate-900 mb-1.5"
            >
              Full Name{' '}
              <span className="text-orange-600 font-bold" aria-hidden="true">
                *
              </span>
              <span className="sr-only">(required)</span>
            </label>
            <input
              ref={fullNameRef}
              type="text"
              id="fullName"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              onBlur={handleBlur}
              aria-required="true"
              aria-invalid={!!errors.fullName}
              aria-describedby={errors.fullName ? 'fullName-error' : undefined}
              placeholder="e.g. Alex Morgan"
              className={`w-full rounded-lg border px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 bg-white shadow-2xs transition-colors duration-150 focus:outline-hidden focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
                errors.fullName
                  ? 'border-red-500 bg-red-50/20'
                  : 'border-slate-300 hover:border-slate-400'
              }`}
            />
            {errors.fullName && (
              <p
                id="fullName-error"
                role="alert"
                className="mt-1 text-xs text-red-600 font-medium"
              >
                {errors.fullName}
              </p>
            )}
          </div>

          {/* Email Address */}
          <div>
            <label
              htmlFor="email"
              className="block text-xs sm:text-sm font-semibold text-slate-900 mb-1.5"
            >
              Email Address{' '}
              <span className="text-orange-600 font-bold" aria-hidden="true">
                *
              </span>
              <span className="sr-only">(required)</span>
            </label>
            <input
              ref={emailRef}
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              onBlur={handleBlur}
              aria-required="true"
              aria-invalid={!!errors.email}
              aria-describedby={errors.email ? 'email-error' : undefined}
              placeholder="name@example.com"
              className={`w-full rounded-lg border px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 bg-white shadow-2xs transition-colors duration-150 focus:outline-hidden focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
                errors.email
                  ? 'border-red-500 bg-red-50/20'
                  : 'border-slate-300 hover:border-slate-400'
              }`}
            />
            {errors.email && (
              <p
                id="email-error"
                role="alert"
                className="mt-1 text-xs text-red-600 font-medium"
              >
                {errors.email}
              </p>
            )}
          </div>

          {/* Subject Dropdown & Optional Order Number (Responsive 2-Col on tablet/desktop) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="subject"
                className="block text-xs sm:text-sm font-semibold text-slate-900 mb-1.5"
              >
                Subject{' '}
                <span className="text-orange-600 font-bold" aria-hidden="true">
                  *
                </span>
                <span className="sr-only">(required)</span>
              </label>
              <div className="relative">
                <select
                  ref={subjectRef}
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  aria-required="true"
                  aria-invalid={!!errors.subject}
                  aria-describedby={errors.subject ? 'subject-error' : undefined}
                  className={`w-full appearance-none rounded-lg border px-3.5 py-2.5 pr-8 text-sm text-slate-900 bg-white shadow-2xs transition-colors duration-150 focus:outline-hidden focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
                    errors.subject
                      ? 'border-red-500 bg-red-50/20'
                      : 'border-slate-300 hover:border-slate-400'
                  } ${!formData.subject ? 'text-slate-400' : 'text-slate-900'}`}
                >
                  {SUBJECT_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value} className="text-slate-900">
                      {opt.label}
                    </option>
                  ))}
                </select>
                <div
                  className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-slate-500"
                  aria-hidden="true"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
              {errors.subject && (
                <p
                  id="subject-error"
                  role="alert"
                  className="mt-1 text-xs text-red-600 font-medium"
                >
                  {errors.subject}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="orderNumber"
                className="block text-xs sm:text-sm font-semibold text-slate-900 mb-1.5"
              >
                Order Number{' '}
                <span className="text-slate-400 font-normal text-xs">(optional)</span>
              </label>
              <input
                type="text"
                id="orderNumber"
                name="orderNumber"
                value={formData.orderNumber}
                onChange={handleChange}
                placeholder="e.g. ALT-10482"
                aria-describedby="orderNumber-hint"
                className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 bg-white shadow-2xs hover:border-slate-400 focus:outline-hidden focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors duration-150"
              />
              <p id="orderNumber-hint" className="mt-1 text-[11px] text-slate-500">
                Include only if your inquiry pertains to a recent order.
              </p>
            </div>
          </div>

          {/* Message Textarea */}
          <div>
            <label
              htmlFor="message"
              className="block text-xs sm:text-sm font-semibold text-slate-900 mb-1.5"
            >
              Message{' '}
              <span className="text-orange-600 font-bold" aria-hidden="true">
                *
              </span>
              <span className="sr-only">(required)</span>
            </label>
            <textarea
              ref={messageRef}
              id="message"
              name="message"
              rows={5}
              value={formData.message}
              onChange={handleChange}
              onBlur={handleBlur}
              aria-required="true"
              aria-invalid={!!errors.message}
              aria-describedby={errors.message ? 'message-error' : undefined}
              placeholder="Describe your question, gear setup, or how we can assist..."
              className={`w-full rounded-lg border px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 bg-white shadow-2xs transition-colors duration-150 focus:outline-hidden focus:ring-2 focus:ring-orange-500 focus:border-orange-500 resize-y min-h-[120px] ${
                errors.message
                  ? 'border-red-500 bg-red-50/20'
                  : 'border-slate-300 hover:border-slate-400'
              }`}
            />
            {errors.message && (
              <p
                id="message-error"
                role="alert"
                className="mt-1 text-xs text-red-600 font-medium"
              >
                {errors.message}
              </p>
            )}
          </div>

          {/* Submit Action */}
          <div className="pt-2">
            <Button
              type="submit"
              variant="primary"
              size="md"
              className="w-full sm:w-auto text-xs sm:text-sm px-8 py-3"
            >
              Send Message
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
