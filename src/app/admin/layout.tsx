import React from 'react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'ALTITUDE Admin Console',
  description: 'Administrative operations portal for ALTITUDE Outdoor E-Commerce',
};

export default function AdminRootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen flex flex-col bg-slate-900 text-slate-100 antialiased font-sans">
      {children}
    </div>
  );
}
