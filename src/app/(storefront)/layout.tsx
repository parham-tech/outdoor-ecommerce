import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

export default function StorefrontLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-full flex flex-col bg-[#F7F5F0] text-[#1C3323] font-sans">
      <Header />
      <div className="flex-1 flex flex-col">
        {children}
      </div>
      <Footer />
    </div>
  );
}
