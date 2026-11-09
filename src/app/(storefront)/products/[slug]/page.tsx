import React from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ShopNotificationBar } from '@/components/shop/ShopNotificationBar';
import { ShopTrustBar } from '@/components/shop/ShopTrustBar';
import { ProductBreadcrumbs } from '@/components/pdp/ProductBreadcrumbs';
import { ProductGallery } from '@/components/pdp/ProductGallery';
import { ProductPurchaseForm } from '@/components/pdp/ProductPurchaseForm';
import { ProductStickyTabs } from '@/components/pdp/ProductStickyTabs';
import { ProductNarrativeBanner } from '@/components/pdp/ProductNarrativeBanner';
import { ProductFeaturesDeepDive } from '@/components/pdp/ProductFeaturesDeepDive';
import { ProductReviewsSection } from '@/components/pdp/ProductReviewsSection';
import { ProductRecommendedGrid } from '@/components/pdp/ProductRecommendedGrid';
import { getProductDetailBySlug, getRecommendedProducts } from '@/data/productDetails';
import { MOCK_SHOP_PRODUCTS } from '@/data/shopCatalog';

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

export function generateStaticParams() {
  return MOCK_SHOP_PRODUCTS.map((p) => ({
    slug: p.slug,
  }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = getProductDetailBySlug(slug);

  if (!product) {
    return {
      title: 'Product Not Found — ALTITUDE',
      description: 'The requested outdoor equipment could not be found.',
    };
  }

  return {
    title: `${product.name} — ALTITUDE Gear`,
    description: product.shortDescription ?? `${product.name} outdoor equipment engineered for rugged trails.`,
    openGraph: {
      title: `${product.name} — ALTITUDE Gear`,
      description: product.shortDescription,
      images: [{ url: product.imageUrl, alt: product.imageAlt ?? product.name }],
    },
  };
}

export default async function ProductDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const product = getProductDetailBySlug(slug);

  if (!product) {
    notFound();
  }

  const recommendedProducts = getRecommendedProducts(slug, 4);

  return (
    <div className="min-h-screen flex flex-col bg-white text-slate-800 antialiased selection:bg-orange-500 selection:text-white">
      {/* 1. Global Announcement / Notification Bar */}
      <ShopNotificationBar />

      {/* 2. Product Breadcrumb Rail */}
      <ProductBreadcrumbs category={product.category} productName={product.name} />

      {/* 4. Product Hero Section (Gallery Left + Purchasing Form Right) */}
      <main id="main-content" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-2 pb-12 w-full flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Media Column (7 Cols on lg) */}
          <div className="lg:col-span-7">
            <ProductGallery
              primaryImage={product.imageUrl}
              imageAlt={product.imageAlt ?? product.name}
              badge={product.badge}
              galleryImages={product.galleryImages}
              quickMetrics={product.quickMetrics}
            />
          </div>

          {/* Checkout & Configuration Column (5 Cols on lg) */}
          <div className="lg:col-span-5">
            <ProductPurchaseForm
              productId={product.id}
              slug={product.slug}
              productName={product.name}
              category={product.category}
              priceInCents={product.priceInCents}
              rating={product.rating}
              reviewCount={product.reviewCount}
              shortDescription={product.shortDescription}
              colors={product.colors}
              capacityOptions={product.capacityOptions}
              sku={product.sku}
              inStock={product.inStock}
            />
          </div>
        </div>
      </main>

      {/* 5. Sticky Section Tabs */}
      <ProductStickyTabs reviewCount={product.reviewCount} />

      {/* 6. Narrative Banner & Deep-Dive Specifications */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 w-full">
        {product.narrativeBanner && (
          <ProductNarrativeBanner
            kicker={product.narrativeBanner.kicker}
            title={product.narrativeBanner.title}
            description={product.narrativeBanner.description}
            imageSrc={product.narrativeBanner.imageSrc}
            imageAlt={product.narrativeBanner.imageAlt}
          />
        )}

        <ProductFeaturesDeepDive
          narrativeTitle={product.narrativeTitle}
          narrativeParagraphs={product.narrativeParagraphs}
          thoughtfulFeatures={product.thoughtfulFeatures}
          specifications={product.specifications}
          inTheBag={product.inTheBag}
        />
      </div>

      {/* 7. Customer Reviews Section */}
      <ProductReviewsSection
        productName={product.name}
        reviewsSummary={product.reviewsSummary}
        sampleReviews={product.sampleReviews}
      />

      {/* 8. Related Gear Recommendation Grid */}
      <ProductRecommendedGrid products={recommendedProducts} />

      {/* 9. Trust Guarantees Bar */}
      <ShopTrustBar />
    </div>
  );
}
