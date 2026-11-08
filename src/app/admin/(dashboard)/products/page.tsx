'use client';

import React from 'react';
import { ShieldCheck, CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { AdminBreadcrumb } from '@/components/admin/ui/AdminBreadcrumb';
import { ProductsHeader } from '@/components/admin/products/ProductsHeader';
import { ProductsFilterBar } from '@/components/admin/products/ProductsFilterBar';
import { ProductsTable } from '@/components/admin/products/ProductsTable';
import { ProductsPagination } from '@/components/admin/products/ProductsPagination';
import { ProductFormModal } from '@/components/admin/products/ProductFormModal';
import { ProductDeleteDialog } from '@/components/admin/products/ProductDeleteDialog';
import { BulkProductImportModal } from '@/components/admin/products/BulkProductImportModal';
import { useAdminProductsState } from '@/hooks/useAdminProductsState';

export default function AdminProductsPage() {
  const {
    products,
    paginatedProducts,
    kpiStats,
    // Filters
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
    // Pagination
    currentPage,
    setCurrentPage,
    pageSize,
    setPageSize,
    totalFiltered,
    totalPages,
    // Modals
    activeModal,
    selectedProduct,
    openCreateModal,
    openEditModal,
    openDeleteDialog,
    openImportModal,
    closeModal,
    // CRUD
    createProduct,
    updateProduct,
    deleteProduct,
    adjustStock,
    bulkImport,
    // Notification
    notification,
    dismissNotification,
  } = useAdminProductsState();

  return (
    <main id="admin-main-content" className="space-y-6">
      {/* Breadcrumb Navigation */}
      <AdminBreadcrumb
        items={[
          { label: 'Products', current: true },
        ]}
      />

      {/* Dynamic Feedback Notification Banner */}
      {notification && (
        <div
          role="status"
          aria-live="polite"
          className={`flex items-center justify-between p-4 rounded-xl border text-sm animate-in fade-in slide-in-from-top-2 duration-200 ${
            notification.type === 'success'
              ? 'bg-emerald-950/70 border-emerald-500/40 text-emerald-200'
              : notification.type === 'error'
              ? 'bg-red-950/70 border-red-500/40 text-red-200'
              : 'bg-sky-950/70 border-sky-500/40 text-sky-200'
          }`}
        >
          <div className="flex items-center gap-3">
            {notification.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" aria-hidden="true" />
            ) : notification.type === 'error' ? (
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0" aria-hidden="true" />
            ) : (
              <Info className="w-5 h-5 text-sky-400 shrink-0" aria-hidden="true" />
            )}
            <span className="font-medium">{notification.message}</span>
          </div>
          <button
            type="button"
            onClick={dismissNotification}
            aria-label="Dismiss notification"
            className="p-1 text-slate-400 hover:text-white rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 cursor-pointer"
          >
            <X className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>
      )}

      {/* Page Header with Actions & KPI chips */}
      <ProductsHeader
        stats={kpiStats}
        onAddProduct={openCreateModal}
        onImportProducts={openImportModal}
      />

      {/* Filter and Search Bar */}
      <ProductsFilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        selectedStockFilter={selectedStockFilter}
        onStockFilterChange={setSelectedStockFilter}
        sortBy={sortBy}
        onSortChange={setSortBy}
        isFiltered={isFiltered}
        onResetFilters={resetFilters}
        totalFilteredCount={totalFiltered}
      />

      {/* Products Data Table */}
      <section aria-label="Products Inventory Table" className="space-y-4">
        <ProductsTable
          products={paginatedProducts}
          onEditProduct={openEditModal}
          onDeleteProduct={openDeleteDialog}
          onAdjustStock={adjustStock}
        />

        {/* Pagination Controls */}
        <ProductsPagination
          currentPage={currentPage}
          totalPages={totalPages}
          pageSize={pageSize}
          totalItems={totalFiltered}
          onPageChange={setCurrentPage}
          onPageSizeChange={setPageSize}
        />
      </section>

      {/* Prototype Status Disclaimer Footnote */}
      <footer className="pt-4 border-t border-slate-800/80">
        <div className="flex items-start sm:items-center gap-2 p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-400">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5 sm:mt-0" aria-hidden="true" />
          <p className="leading-relaxed">
            <strong className="text-slate-300">PROTOTYPE DEMONSTRATION:</strong> Product catalog additions, edits, deletions, stock adjustments, and batch imports are managed in client-side state for verification and do not mutate the live database.
          </p>
        </div>
      </footer>

      {/* Add / Edit Product Modal */}
      <ProductFormModal
        isOpen={activeModal === 'create' || activeModal === 'edit'}
        mode={activeModal === 'edit' ? 'edit' : 'create'}
        initialProduct={selectedProduct}
        onClose={closeModal}
        onSubmit={(payload) => {
          if (activeModal === 'edit' && selectedProduct) {
            return updateProduct(selectedProduct.id, payload);
          } else {
            return createProduct(payload);
          }
        }}
      />

      {/* Delete Product Confirmation Dialog */}
      <ProductDeleteDialog
        isOpen={activeModal === 'delete'}
        product={selectedProduct}
        onClose={closeModal}
        onConfirm={deleteProduct}
      />

      {/* Bulk CSV / Excel Import Modal */}
      <BulkProductImportModal
        isOpen={activeModal === 'import'}
        existingProducts={products}
        onClose={closeModal}
        onImport={bulkImport}
      />
    </main>
  );
}
