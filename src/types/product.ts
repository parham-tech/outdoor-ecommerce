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

