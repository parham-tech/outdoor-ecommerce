import type { AdminStockStatus } from '@/types/admin';

/**
 * Frontend UI representation of an administrative catalog product item.
 * Strictly decoupled from Prisma models and database internals.
 */
export interface AdminProductItem {
  id: string;
  sku: string;
  name: string;
  slug: string;
  categoryId: string;
  categoryName: string;
  priceInCents: number;
  salePriceInCents?: number | null;
  inventory: number;
  stockStatus: AdminStockStatus;
  imageUrl: string;
  galleryImages?: string[];
  description: string;
  technicalSpecs?: Record<string, string>;
  rating: number;
  reviewCount: number;
  isFeatured?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AdminCategoryOption {
  id: string;
  name: string;
  slug: string;
  description?: string;
  count?: number;
}

export type AdminProductSortOption =
  | 'name-asc'
  | 'name-desc'
  | 'price-asc'
  | 'price-desc'
  | 'stock-asc'
  | 'stock-desc'
  | 'newest';

export type AdminStockFilterOption =
  | 'all'
  | 'in_stock'
  | 'low_stock'
  | 'out_of_stock';

export interface AdminProductFilterState {
  searchQuery: string;
  categoryId: string;
  stockFilter: AdminStockFilterOption;
  sortBy: AdminProductSortOption;
  page: number;
  pageSize: number;
}

export interface ProductFormValues {
  name: string;
  slug: string;
  sku: string;
  categoryId: string;
  priceUsd: string;
  salePriceUsd: string;
  inventory: string;
  description: string;
  imageUrl: string;
  galleryImages: string[];
  technicalSpecs: Array<{ id: string; key: string; value: string }>;
  isFeatured: boolean;
}

export interface ProductFormErrors {
  name?: string;
  sku?: string;
  categoryId?: string;
  priceUsd?: string;
  salePriceUsd?: string;
  inventory?: string;
  description?: string;
  imageUrl?: string;
  general?: string;
}

export interface BulkImportRow {
  rowNumber: number;
  name: string;
  sku: string;
  category: string;
  priceUsd: number;
  inventory: number;
  description: string;
  imageUrl?: string;
  isValid: boolean;
  errors: string[];
}

export interface BulkImportSummary {
  totalRows: number;
  validRows: number;
  invalidRows: number;
  fileName: string;
}
