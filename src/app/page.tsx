import { Header } from '@/components/layout/Header';
import { Hero } from '@/components/home/Hero';
import { FeaturesBar } from '@/components/home/FeaturesBar';
import { FeaturedCategories } from '@/components/home/FeaturedCategories';
import { LifestyleBanner } from '@/components/home/LifestyleBanner';
import { FeaturedProducts } from '@/components/home/FeaturedProducts';
import { GoFurtherBanner } from '@/components/home/GoFurtherBanner';
import { NewsletterSection } from '@/components/home/NewsletterSection';
import { MOCK_FEATURED_PRODUCTS } from '@/data/mockProducts';

export default function HomePage() {
  return (
    <div className="relative min-h-screen flex flex-col bg-[#F7F5F0]">
      {/* Top Navigation Header */}
      <Header />

      {/* Main Content Area */}
      <main id="main-content" className="flex-1">
        <Hero />
        <FeaturesBar />
        <FeaturedCategories />
        <LifestyleBanner />
        <FeaturedProducts products={MOCK_FEATURED_PRODUCTS} />
        <GoFurtherBanner />
        <NewsletterSection />
      </main>
    </div>
  );
}
