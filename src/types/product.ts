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
