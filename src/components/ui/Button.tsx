import React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils/cn';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  href?: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  className?: string;
}

export function Button({
  href,
  variant = 'primary',
  size = 'md',
  children,
  className,
  ...props
}: ButtonProps) {
  const baseStyles =
    'inline-flex items-center justify-center font-bold uppercase tracking-wider transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 select-none';

  const variantStyles = {
    primary:
      'bg-[#FA7109] text-white hover:bg-[#EA580C] active:bg-[#C2410C] shadow-lg shadow-orange-950/25 focus-visible:ring-offset-black/40',
    secondary:
      'bg-[#2E4D36] text-white hover:bg-[#1C3323] active:bg-[#15271B] focus-visible:ring-offset-emerald-950',
    outline:
      'border-2 border-white text-white hover:bg-white hover:text-[#1C3323] focus-visible:ring-offset-black/40',
    ghost:
      'text-white hover:bg-white/10 focus-visible:ring-offset-black/40',
  };

  const sizeStyles = {
    sm: 'text-xs px-4 py-2 rounded-md gap-1.5',
    md: 'text-sm sm:text-base px-6 py-3 rounded-lg gap-2',
    lg: 'text-base sm:text-lg px-8 py-4 rounded-xl gap-2.5',
  };

  const combinedClassName = cn(
    baseStyles,
    variantStyles[variant],
    sizeStyles[size],
    className
  );

  if (href) {
    return (
      <Link href={href} className={combinedClassName}>
        {children}
      </Link>
    );
  }

  return (
    <button className={combinedClassName} {...props}>
      {children}
    </button>
  );
}
