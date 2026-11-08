'use client';

import React, { useRef, useState } from 'react';
import Image from 'next/image';
import { AlertTriangle, Trash2, Package } from 'lucide-react';
import { AdminModal } from '@/components/admin/ui/AdminModal';
import { formatPriceFromCents } from '@/lib/mock/admin-products-data';
import type { AdminProductItem } from '@/types/admin-product';

export interface ProductDeleteDialogProps {
  isOpen: boolean;
  product: AdminProductItem | null;
  onClose: () => void;
  onConfirm: (productId: string) => void;
}

export function ProductDeleteDialog({
  isOpen,
  product,
  onClose,
  onConfirm,
}: ProductDeleteDialogProps) {
  const cancelBtnRef = useRef<HTMLButtonElement>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [imgError, setImgError] = useState(false);

  if (!product) return null;

  const handleDelete = () => {
    setIsDeleting(true);
    onConfirm(product.id);
    setIsDeleting(false);
  };

  return (
    <AdminModal
      isOpen={isOpen}
      onClose={onClose}
      title="Delete Catalog Product"
      size="md"
      initialFocusRef={cancelBtnRef}
      footer={
        <>
          <button
            ref={cancelBtnRef}
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={isDeleting}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-bold text-xs sm:text-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 disabled:opacity-50 cursor-pointer shadow-md shadow-red-950/40"
          >
            <Trash2 className="w-4 h-4" aria-hidden="true" />
            <span>{isDeleting ? 'Deleting...' : 'Delete Product'}</span>
          </button>
        </>
      }
    >
      <div className="space-y-4">
        {/* Warning Banner */}
        <div className="flex items-start gap-3 p-3.5 rounded-xl bg-red-950/30 border border-red-500/30 text-red-200 text-xs sm:text-sm">
          <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" aria-hidden="true" />
          <div className="space-y-1">
            <p className="font-semibold text-red-300">
              Are you sure you want to permanently delete this product?
            </p>
            <p className="text-slate-400 text-xs leading-relaxed">
              This action removes the product from the admin inventory list and storefront catalog. This simulated action cannot be undone.
            </p>
          </div>
        </div>

        {/* Product Details Confirmation Card */}
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-4">
          <div className="relative w-14 h-14 rounded-lg overflow-hidden bg-slate-900 border border-slate-800 shrink-0 flex items-center justify-center">
            {imgError || !product.imageUrl ? (
              <Package className="w-6 h-6 text-slate-500" aria-hidden="true" />
            ) : (
              <Image
                src={product.imageUrl}
                alt=""
                fill
                sizes="56px"
                className="object-cover"
                onError={() => setImgError(true)}
              />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <h4 className="font-bold text-white text-sm truncate">{product.name}</h4>
            <div className="flex items-center gap-2 mt-1 text-xs text-slate-400">
              <span className="font-mono text-orange-400 font-semibold">{product.sku}</span>
              <span>•</span>
              <span>{product.categoryName}</span>
              <span>•</span>
              <span className="font-mono">{formatPriceFromCents(product.priceInCents)}</span>
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              Current Live Stock: <strong className="text-slate-300 font-mono">{product.inventory} units</strong>
            </div>
          </div>
        </div>
      </div>
    </AdminModal>
  );
}
