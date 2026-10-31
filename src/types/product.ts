export interface FeaturedProduct {
  id: string;
  name: string;
  slug: string;
  priceInCents: number;
  imageUrl: string;
  imageAlt?: string;
  rating?: number | null;
  reviewCount?: number | null;
}

export interface ShopProduct extends FeaturedProduct {
  category: string;
  specs?: string;
  badge?: string;
  colorSwatches?: string[];
  colorCount?: number;
  activity?: string[];
  features?: string[];
  inStock?: boolean;
}

export interface ProductGalleryImage {
  src: string;
  alt: string;
  label?: string;
}

export interface ProductColorOption {
  name: string;
  hex: string;
}

export interface ProductQuickMetric {
  label: string;
  value: string;
}

export interface ProductThoughtfulFeature {
  title: string;
  description: string;
  icon: 'cloud-rain' | 'wind' | 'tent' | 'backpack' | string;
}

export interface ProductSpecificationItem {
  label: string;
  value: string;
}

export interface ProductSampleReview {
  id: string;
  author: string;
  date: string;
  rating: number;
  title: string;
  content: string;
  helpfulCount: number;
}

export interface ProductReviewsSummary {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: { stars: number; count: number; percentage: number }[];
}

export interface ProductDetail extends ShopProduct {
  subtitle?: string;
  shortDescription?: string;
  sku?: string;
  galleryImages?: ProductGalleryImage[];
  colors?: ProductColorOption[];
  capacityOptions?: string[];
  quickMetrics?: ProductQuickMetric[];
  narrativeTitle?: string;
  narrativeLead?: string;
  narrativeParagraphs?: string[];
  narrativeBanner?: {
    kicker: string;
    title: string;
    description: string;
    imageSrc?: string;
    imageAlt?: string;
  };
  thoughtfulFeatures?: ProductThoughtfulFeature[];
  specifications?: ProductSpecificationItem[];
  inTheBag?: string;
  reviewsSummary?: ProductReviewsSummary;
  sampleReviews?: ProductSampleReview[];
}

