'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Edit2, Trash2, ExternalLink, Plus, Minus, Package } from 'lucide-react';
import { AdminTable } from '@/components/admin/ui/AdminTable';
import { AdminBadge, AdminStockStatusBadge } from '@/components/admin/ui/AdminBadge';
import { formatPriceFromCents } from '@/lib/mock/admin-products-data';
import type { AdminTableColumn } from '@/types/admin';
import type { AdminProductItem } from '@/types/admin-product';

export interface ProductsTableProps {
  products: AdminProductItem[];
  onEditProduct: (product: AdminProductItem) => void;
  onDeleteProduct: (product: AdminProductItem) => void;
  onAdjustStock: (id: string, delta: number) => void;
}

function ProductThumbnail({
  src,
  alt,
}: {
  src: string;
  alt: string;
}) {
  const [hasError, setHasError] = useState(false);

  if (hasError || !src) {
    return (
      <div
        className="w-11 h-11 rounded-lg bg-slate-800 border border-slate-700/80 flex items-center justify-center shrink-0 text-slate-500"
        title="Thumbnail unavailable"
      >
        <Package className="w-5 h-5" aria-hidden="true" />
      </div>
    );
  }

  return (
    <div className="relative w-11 h-11 rounded-lg overflow-hidden bg-slate-950 border border-slate-800 shrink-0">
      <Image
        src={src}
        alt={alt}
        fill
        sizes="44px"
        className="object-cover"
        onError={() => setHasError(true)}
      />
    </div>
  );
}

export function ProductsTable({
  products,
  onEditProduct,
  onDeleteProduct,
  onAdjustStock,
}: ProductsTableProps) {
  const columns: AdminTableColumn<AdminProductItem>[] = [
    {
      header: 'Product',
      className: 'min-w-[240px]',
      render: (product) => (
        <div className="flex items-center gap-3">
          <ProductThumbnail src={product.imageUrl} alt={product.name} />
          <div className="flex flex-col min-w-0">
            <span className="font-semibold text-white truncate text-sm">
              {product.name}
            </span>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[11px] font-mono text-orange-400 font-bold tracking-wider">
                {product.sku}
              </span>
              <span className="text-slate-600 text-xs">•</span>
              <span className="text-xs text-slate-400 truncate max-w-[140px]">
                /{product.slug}
              </span>
            </div>
          </div>
        </div>
      ),
    },
    {
      header: 'Category',
      className: 'min-w-[140px]',
      render: (product) => (
        <AdminBadge variant="default" size="sm">
          {product.categoryName}
        </AdminBadge>
      ),
    },
    {
      header: 'Price',
      className: 'min-w-[130px]',
      render: (product) => {
        const hasSale =
          product.salePriceInCents != null &&
          product.salePriceInCents < product.priceInCents;

        return (
          <div className="flex flex-col">
            {hasSale ? (
              <>
                <span className="font-bold text-emerald-400 font-mono text-sm">
                  {formatPriceFromCents(product.salePriceInCents!)}
                </span>
                <span className="text-xs text-slate-500 line-through font-mono">
                  {formatPriceFromCents(product.priceInCents)}
                </span>
              </>
            ) : (
              <span className="font-bold text-slate-100 font-mono text-sm">
                {formatPriceFromCents(product.priceInCents)}
              </span>
            )}
          </div>
        );
      },
    },
    {
      header: 'Inventory',
      className: 'min-w-[180px]',
      render: (product) => (
        <div className="flex items-center gap-3">
          <AdminStockStatusBadge
            stock={product.inventory}
            status={product.stockStatus}
          />

          {/* Quick inline stock stepper */}
          <div
            className="inline-flex items-center rounded-lg border border-slate-800 bg-slate-950 p-0.5"
            role="group"
            aria-label={`Adjust stock for ${product.name}`}
          >
            <button
              type="button"
              onClick={() => onAdjustStock(product.id, -1)}
              disabled={product.inventory <= 0}
              aria-label={`Decrease stock for ${product.name}`}
              className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-slate-400 rounded transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 cursor-pointer disabled:cursor-not-allowed"
            >
              <Minus className="w-3 h-3" aria-hidden="true" />
            </button>
            <span className="px-1.5 text-xs font-mono font-bold text-slate-300 min-w-5 text-center">
              {product.inventory}
            </span>
            <button
              type="button"
              onClick={() => onAdjustStock(product.id, 1)}
              aria-label={`Increase stock for ${product.name}`}
              className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 cursor-pointer"
            >
              <Plus className="w-3 h-3" aria-hidden="true" />
            </button>
          </div>
        </div>
      ),
    },
    {
      header: 'Actions',
      headerClassName: 'text-right',
      className: 'text-right min-w-[130px]',
      render: (product) => (
        <div className="flex items-center justify-end gap-1.5">
          {/* View Public Storefront Link */}
          <Link
            href={`/shop`}
            target="_blank"
            rel="noopener noreferrer"
            title="Preview in Storefront"
            aria-label={`Preview ${product.name} in storefront`}
            className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
          >
            <ExternalLink className="w-4 h-4" aria-hidden="true" />
          </Link>

          {/* Edit Product Action */}
          <button
            type="button"
            onClick={() => onEditProduct(product)}
            title="Edit Product"
            aria-label={`Edit ${product.name}`}
            className="p-2 text-slate-400 hover:text-orange-400 hover:bg-orange-500/10 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 cursor-pointer"
          >
            <Edit2 className="w-4 h-4" aria-hidden="true" />
          </button>

          {/* Delete Product Action */}
          <button
            type="button"
            onClick={() => onDeleteProduct(product)}
            title="Delete Product"
            aria-label={`Delete ${product.name}`}
            className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 cursor-pointer"
          >
            <Trash2 className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="bg-slate-900 border border-slate-800/90 rounded-2xl overflow-hidden shadow-sm">
      <AdminTable
        columns={columns}
        data={products}
        keyExtractor={(item) => item.id}
        caption="ALTITUDE Products Catalog and Inventory"
        emptyMessage="No products match the selected search and filter criteria."
      />
    </div>
  );
}
