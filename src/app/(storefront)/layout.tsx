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
          <div className="flex-1 flex flex-col">
            {children}
          </div>
          <Footer />
          <CartDrawer />
        </div>
      </CartProvider>
    </CustomerAuthProvider>
  );
}

