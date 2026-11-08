'use client';

import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import type { AdminProductItem, AdminProductSortOption, AdminStockFilterOption } from '@/types/admin-product';
import {
  MOCK_ADMIN_PRODUCTS,
  calculateStockStatus,
} from '@/lib/mock/admin-products-data';

export type ActiveModalType = 'none' | 'create' | 'edit' | 'delete' | 'import';

export interface AdminProductsNotification {
  type: 'success' | 'error' | 'info';
  message: string;
}

export interface ProductMutationResult {
  success: boolean;
  errorField?: 'sku';
  message?: string;
}

function generateProductId(prefix: 'prod-custom' | 'prod-import'): string {
  const uuid =
    typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
  return `${prefix}-${uuid}`;
}

export function useAdminProductsState() {
  // 1. Core catalog state (initialized with 14 seed items)
  const [products, setProducts] = useState<AdminProductItem[]>(MOCK_ADMIN_PRODUCTS);
  const productsRef = useRef<AdminProductItem[]>(products);

  useEffect(() => {
    productsRef.current = products;
  }, [products]);

  // 2. Filter & Search state
  const [searchQuery, setSearchQueryState] = useState('');
  const [selectedCategory, setSelectedCategoryState] = useState('all');
  const [selectedStockFilter, setSelectedStockFilterState] = useState<AdminStockFilterOption>('all');
  const [sortBy, setSortBy] = useState<AdminProductSortOption>('newest');

  // 3. Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSizeState] = useState(8);

  // 4. Modal state
  const [activeModal, setActiveModal] = useState<ActiveModalType>('none');
  const [selectedProduct, setSelectedProduct] = useState<AdminProductItem | null>(null);

  // 5. User feedback notifications
  const [notification, setNotification] = useState<AdminProductsNotification | null>(null);

  const showNotification = useCallback((type: 'success' | 'error' | 'info', message: string) => {
    setNotification({ type, message });
    setTimeout(() => {
      setNotification((curr) => (curr?.message === message ? null : curr));
    }, 4500);
  }, []);

  const dismissNotification = useCallback(() => {
    setNotification(null);
  }, []);

  // Filter setters with auto-reset to page 1
  const setSearchQuery = useCallback((query: string) => {
    setSearchQueryState(query);
    setCurrentPage(1);
  }, []);

  const setSelectedCategory = useCallback((categoryId: string) => {
    setSelectedCategoryState(categoryId);
    setCurrentPage(1);
  }, []);

  const setSelectedStockFilter = useCallback((filter: AdminStockFilterOption) => {
    setSelectedStockFilterState(filter);
    setCurrentPage(1);
  }, []);

  const setPageSize = useCallback((size: number) => {
    setPageSizeState(size);
    setCurrentPage(1);
  }, []);

  const resetFilters = useCallback(() => {
    setSearchQueryState('');
    setSelectedCategoryState('all');
    setSelectedStockFilterState('all');
    setSortBy('newest');
    setCurrentPage(1);
  }, []);

  // Modal actions
  const openCreateModal = useCallback(() => {
    setSelectedProduct(null);
    setActiveModal('create');
  }, []);

  const openEditModal = useCallback((product: AdminProductItem) => {
    setSelectedProduct(product);
    setActiveModal('edit');
  }, []);

  const openDeleteDialog = useCallback((product: AdminProductItem) => {
    setSelectedProduct(product);
    setActiveModal('delete');
  }, []);

  const openImportModal = useCallback(() => {
    setSelectedProduct(null);
    setActiveModal('import');
  }, []);

  const closeModal = useCallback(() => {
    setActiveModal('none');
    setSelectedProduct(null);
  }, []);

  // Derived KPI statistics
  const kpiStats = useMemo(() => {
    const total = products.length;
    let inStock = 0;
    let lowStock = 0;
    let outOfStock = 0;

    for (const p of products) {
      if (p.inventory <= 0) {
        outOfStock++;
      } else if (p.inventory <= 3) {
        lowStock++;
      } else {
        inStock++;
      }
    }

    return { total, inStock, lowStock, outOfStock };
  }, [products]);

  // Pure filtering & sorting pipeline
  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        // Search query filter
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const matchesName = p.name.toLowerCase().includes(q);
          const matchesSku = p.sku.toLowerCase().includes(q);
          const matchesCategory = p.categoryName.toLowerCase().includes(q);
          const matchesDesc = p.description.toLowerCase().includes(q);
          if (!matchesName && !matchesSku && !matchesCategory && !matchesDesc) {
            return false;
          }
        }

        // Category filter
        if (selectedCategory !== 'all') {
          if (p.categoryId !== selectedCategory && p.categoryName !== selectedCategory) {
            return false;
          }
        }

        // Stock status filter
        if (selectedStockFilter !== 'all') {
          if (selectedStockFilter === 'out_of_stock' && p.inventory > 0) return false;
          if (selectedStockFilter === 'low_stock' && (p.inventory <= 0 || p.inventory > 3)) return false;
          if (selectedStockFilter === 'in_stock' && p.inventory <= 3) return false;
        }

        return true;
      })
      .sort((a, b) => {
        switch (sortBy) {
          case 'name-asc':
            return a.name.localeCompare(b.name);
          case 'name-desc':
            return b.name.localeCompare(a.name);
          case 'price-asc':
            return a.priceInCents - b.priceInCents;
          case 'price-desc':
            return b.priceInCents - a.priceInCents;
          case 'stock-asc':
            return a.inventory - b.inventory;
          case 'stock-desc':
            return b.inventory - a.inventory;
          case 'newest':
          default:
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
      });
  }, [products, searchQuery, selectedCategory, selectedStockFilter, sortBy]);

  // Derived Pagination
  const totalFiltered = filteredProducts.length;
  const totalPages = Math.max(1, Math.ceil(totalFiltered / pageSize));
  const safeCurrentPage = Math.max(1, Math.min(currentPage, totalPages));

  const paginatedProducts = useMemo(() => {
    const startIndex = (safeCurrentPage - 1) * pageSize;
    return filteredProducts.slice(startIndex, startIndex + pageSize);
  }, [filteredProducts, safeCurrentPage, pageSize]);

  // CRUD Mutations
  const createProduct = useCallback(
    (productData: Omit<AdminProductItem, 'id' | 'createdAt' | 'updatedAt' | 'stockStatus'> & { inventory: number }): ProductMutationResult => {
      if (!productData || typeof productData.sku !== 'string' || !productData.sku.trim()) {
        const errorMsg = 'SKU cannot be empty.';
        showNotification('error', errorMsg);
        return { success: false, errorField: 'sku', message: errorMsg };
      }

      // Check SKU uniqueness against latest state in productsRef
      const normalizedNewSku = productData.sku.trim().toUpperCase();
      const existingSku = productsRef.current.find(
        (p) => p.sku.trim().toUpperCase() === normalizedNewSku
      );
      if (existingSku) {
        const errorMsg = `SKU "${productData.sku}" is already assigned to "${existingSku.name}".`;
        showNotification('error', errorMsg);
        return { success: false, errorField: 'sku', message: errorMsg };
      }

      const now = new Date().toISOString();
      const newProduct: AdminProductItem = {
        ...productData,
        sku: normalizedNewSku,
        id: generateProductId('prod-custom'),
        stockStatus: calculateStockStatus(productData.inventory),
        rating: 0,
        reviewCount: 0,
        createdAt: now,
        updatedAt: now,
      };

      // Synchronously update productsRef
      productsRef.current = [newProduct, ...productsRef.current];
      setProducts((prev) => [newProduct, ...prev]);
      showNotification('success', `Product "${newProduct.name}" added to catalog.`);
      closeModal();
      return { success: true };
    },
    [showNotification, closeModal]
  );

  const updateProduct = useCallback(
    (
      id: string,
      updates: Partial<Omit<AdminProductItem, 'id' | 'createdAt'>>
    ): ProductMutationResult => {
      const target = productsRef.current.find((p) => p.id === id);
      if (!target) {
        return { success: false, message: `Product with ID "${id}" not found.` };
      }

      // Check SKU uniqueness against other products in productsRef
      const normalizedUpdateSku =
        typeof updates.sku === 'string' ? updates.sku.trim().toUpperCase() : undefined;

      if (normalizedUpdateSku !== undefined) {
        if (!normalizedUpdateSku) {
          const errorMsg = 'SKU cannot be empty.';
          showNotification('error', errorMsg);
          return { success: false, errorField: 'sku', message: errorMsg };
        }
        const existingSku = productsRef.current.find(
          (p) => p.id !== id && p.sku.trim().toUpperCase() === normalizedUpdateSku
        );
        if (existingSku) {
          const errorMsg = `SKU "${updates.sku}" is already in use by another product.`;
          showNotification('error', errorMsg);
          return { success: false, errorField: 'sku', message: errorMsg };
        }
      }

      const now = new Date().toISOString();
      const updatedInventory = updates.inventory !== undefined ? updates.inventory : target.inventory;
      const updatedItem: AdminProductItem = {
        ...target,
        ...updates,
        ...(normalizedUpdateSku !== undefined ? { sku: normalizedUpdateSku } : {}),
        inventory: updatedInventory,
        stockStatus: calculateStockStatus(updatedInventory),
        updatedAt: now,
      };

      // Both productsRef and React state receive the identical updated product data
      productsRef.current = productsRef.current.map((item) =>
        item.id === id ? updatedItem : item
      );
      setProducts((prev) =>
        prev.map((item) => (item.id === id ? updatedItem : item))
      );

      showNotification('success', 'Product changes saved successfully.');
      closeModal();
      return { success: true };
    },
    [showNotification, closeModal]
  );

  const deleteProduct = useCallback(
    (id: string) => {
      const target = productsRef.current.find((p) => p.id === id);
      productsRef.current = productsRef.current.filter((p) => p.id !== id);
      setProducts((prev) => prev.filter((p) => p.id !== id));
      setCurrentPage((prev) => {
        const nextFilteredCount = Math.max(0, filteredProducts.filter((p) => p.id !== id).length);
        const nextTotalPages = Math.max(1, Math.ceil(nextFilteredCount / pageSize));
        return Math.max(1, Math.min(prev, nextTotalPages));
      });
      showNotification('success', `Product "${target?.name ?? id}" was deleted.`);
      closeModal();
    },
    [filteredProducts, pageSize, showNotification, closeModal]
  );

  const adjustStock = useCallback(
    (id: string, delta: number) => {
      const now = new Date().toISOString();
      productsRef.current = productsRef.current.map((item) => {
        if (item.id !== id) return item;
        const nextStock = Math.max(0, item.inventory + delta);
        return {
          ...item,
          inventory: nextStock,
          stockStatus: calculateStockStatus(nextStock),
          updatedAt: now,
        };
      });

      setProducts((prev) =>
        prev.map((item) => {
          if (item.id !== id) return item;
          const nextStock = Math.max(0, item.inventory + delta);
          return {
            ...item,
            inventory: nextStock,
            stockStatus: calculateStockStatus(nextStock),
            updatedAt: now,
          };
        })
      );
    },
    []
  );

  const bulkImport = useCallback(
    (
      newItems: Array<
        Omit<AdminProductItem, 'id' | 'createdAt' | 'updatedAt' | 'stockStatus'> & {
          inventory: number;
        }
      >
    ) => {
      if (!Array.isArray(newItems) || newItems.length === 0) {
        closeModal();
        return;
      }

      // Deduplicate against the latest catalog state via productsRef
      const existingSkuSet = new Set(productsRef.current.map((p) => p.sku.trim().toUpperCase()));
      const seenBatchSkus = new Set<string>();
      const now = new Date().toISOString();

      const safeItemsToAdd: AdminProductItem[] = [];
      let skippedCount = 0;

      for (let idx = 0; idx < newItems.length; idx++) {
        const item = newItems[idx];

        // 1. Null-safe SKU handling: never call .trim() on unvalidated values
        if (!item || typeof item.sku !== 'string') {
          skippedCount++;
          continue;
        }

        const normalizedSku = item.sku.trim().toUpperCase();
        if (!normalizedSku) {
          skippedCount++;
          continue;
        }

        // 2. Reject SKUs existing in catalog or duplicated within incoming batch
        if (existingSkuSet.has(normalizedSku) || seenBatchSkus.has(normalizedSku)) {
          skippedCount++;
          continue;
        }

        seenBatchSkus.add(normalizedSku);

        // 3. Collision-proof unique ID generation using full crypto.randomUUID()
        safeItemsToAdd.push({
          ...item,
          sku: normalizedSku,
          id: generateProductId('prod-import'),
          stockStatus: calculateStockStatus(item.inventory),
          createdAt: now,
          updatedAt: now,
        });
      }

      if (safeItemsToAdd.length === 0) {
        showNotification(
          'error',
          'Import failed: No new products imported. All items had duplicate SKUs or were invalid.'
        );
        closeModal();
        return;
      }

      // Synchronously update productsRef so consecutive calls in the same event tick see these new SKUs
      productsRef.current = [...safeItemsToAdd, ...productsRef.current];

      // Pure state updater without side effects
      setProducts((prev) => {
        const existing = new Set(prev.map((p) => p.sku.trim().toUpperCase()));
        const deduped = safeItemsToAdd.filter((p) => !existing.has(p.sku));
        return deduped.length > 0 ? [...deduped, ...prev] : prev;
      });

      // Side effects (notifications & modal close) executed cleanly in handler
      if (skippedCount > 0) {
        showNotification(
          'info',
          `Imported ${safeItemsToAdd.length} products. Skipped ${skippedCount} duplicate items.`
        );
      } else {
        showNotification(
          'success',
          `Successfully imported ${safeItemsToAdd.length} products into the catalog.`
        );
      }
      closeModal();
    },
    [showNotification, closeModal]
  );

  const isFiltered = searchQuery.trim() !== '' || selectedCategory !== 'all' || selectedStockFilter !== 'all';

  return {
    products,
    filteredProducts,
    paginatedProducts,
    kpiStats,
    // Filter controls
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    selectedStockFilter,
    setSelectedStockFilter,
    sortBy,
    setSortBy,
    isFiltered,
    resetFilters,
    // Pagination controls
    currentPage: safeCurrentPage,
    setCurrentPage,
    pageSize,
    setPageSize,
    totalFiltered,
    totalPages,
    // Modal actions
    activeModal,
    selectedProduct,
    openCreateModal,
    openEditModal,
    openDeleteDialog,
    openImportModal,
    closeModal,
    // CRUD handlers
    createProduct,
    updateProduct,
    deleteProduct,
    adjustStock,
    bulkImport,
    // Notifications
    notification,
    dismissNotification,
  };
}
