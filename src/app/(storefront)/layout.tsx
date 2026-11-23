import { Suspense } from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { CartProvider } from '@/context/CartContext';
import { CustomerAuthProvider } from '@/context/CustomerAuthContext';
import { CartDrawer } from '@/components/cart/CartDrawer';

function HeaderFallback() {
  return <div className="w-full h-20 bg-[#0b121c]" />;
}

export default function StorefrontLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <CustomerAuthProvider>
      <CartProvider>
        <div className="min-h-full flex flex-col bg-[#F7F5F0] text-[#1C3323] font-sans">
          <Suspense fallback={<HeaderFallback />}>
            <Header />
          </Suspense>
          <main id="main-content" tabIndex={-1} className="flex-1 flex flex-col focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-orange-500/60">
            {children}
          </main>
          <Footer />
          <CartDrawer />
        </div>
      </CartProvider>
    </CustomerAuthProvider>
  );
}

