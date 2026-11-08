'use client';

import React, { useState, useRef } from 'react';
import Image from 'next/image';
import { Plus, Trash2, Image as ImageIcon, AlertCircle, Check } from 'lucide-react';
import { AdminModal } from '@/components/admin/ui/AdminModal';
import { AdminStockStatusBadge } from '@/components/admin/ui/AdminBadge';
import {
  ADMIN_PRODUCT_CATEGORIES,
  PRESET_PRODUCT_IMAGES,
  calculateStockStatus,
  parsePriceToCents,
  formatPriceFromCents,
} from '@/lib/mock/admin-products-data';
import type { AdminProductItem, ProductFormErrors } from '@/types/admin-product';
import type { ProductMutationResult } from '@/hooks/useAdminProductsState';

export interface ProductFormModalProps {
  isOpen: boolean;
  mode: 'create' | 'edit';
  initialProduct: AdminProductItem | null;
  onClose: () => void;
  onSubmit: (productData: Omit<AdminProductItem, 'id' | 'createdAt' | 'updatedAt' | 'stockStatus'> & { inventory: number }) => ProductMutationResult | boolean;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

interface ProductFormContentProps {
  mode: 'create' | 'edit';
  initialProduct: AdminProductItem | null;
  onClose: () => void;
  onSubmit: (productData: Omit<AdminProductItem, 'id' | 'createdAt' | 'updatedAt' | 'stockStatus'> & { inventory: number }) => ProductMutationResult | boolean;
}

function ProductFormContent({
  mode,
  initialProduct,
  onClose,
  onSubmit,
}: ProductFormContentProps) {
  const firstInputRef = useRef<HTMLInputElement>(null);

  // Initialize fields directly from initialProduct without cascading useEffect setState
  const [name, setName] = useState(mode === 'edit' && initialProduct ? initialProduct.name : '');
  const [slug, setSlug] = useState(mode === 'edit' && initialProduct ? initialProduct.slug : '');
  const [isSlugCustomized, setIsSlugCustomized] = useState(mode === 'edit');
  const [sku, setSku] = useState(mode === 'edit' && initialProduct ? initialProduct.sku : '');
  const [categoryId, setCategoryId] = useState(mode === 'edit' && initialProduct ? initialProduct.categoryId : 'cat-tents');
  const [priceUsd, setPriceUsd] = useState(
    mode === 'edit' && initialProduct ? (initialProduct.priceInCents / 100).toFixed(2) : ''
  );
  const [salePriceUsd, setSalePriceUsd] = useState(
    mode === 'edit' && initialProduct?.salePriceInCents != null
      ? (initialProduct.salePriceInCents / 100).toFixed(2)
      : ''
  );
  const [inventory, setInventory] = useState(
    mode === 'edit' && initialProduct ? String(initialProduct.inventory) : '10'
  );
  const [description, setDescription] = useState(
    mode === 'edit' && initialProduct ? initialProduct.description : ''
  );
  const [imageUrl, setImageUrl] = useState(
    mode === 'edit' && initialProduct ? initialProduct.imageUrl : '/images/products/placeholder-gear.svg'
  );
  const [galleryImages, setGalleryImages] = useState<string[]>(
    mode === 'edit' && initialProduct?.galleryImages ? initialProduct.galleryImages : []
  );
  const [newGalleryUrl, setNewGalleryUrl] = useState('');

  const [technicalSpecs, setTechnicalSpecs] = useState<Array<{ id: string; key: string; value: string }>>(() => {
    if (mode === 'edit' && initialProduct?.technicalSpecs) {
      return Object.entries(initialProduct.technicalSpecs).map(([key, value], idx) => ({
        id: `spec-${idx}`,
        key,
        value,
      }));
    }
    return [
      { id: 'spec-1', key: 'Capacity', value: '2-person' },
      { id: 'spec-2', key: 'Weight', value: '4.2 lbs' },
    ];
  });

  const [isFeatured, setIsFeatured] = useState(
    mode === 'edit' && initialProduct ? Boolean(initialProduct.isFeatured) : false
  );

  // Validation & Submission
  const [errors, setErrors] = useState<ProductFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreviewError, setImagePreviewError] = useState(false);

  const handleNameChange = (val: string) => {
    setName(val);
    if (!isSlugCustomized) {
      setSlug(slugify(val));
    }
  };

  const handleAddSpecRow = () => {
    setTechnicalSpecs((prev) => [
      ...prev,
      { id: `spec-${Date.now()}`, key: '', value: '' },
    ]);
  };

  const handleUpdateSpec = (id: string, field: 'key' | 'value', text: string) => {
    setTechnicalSpecs((prev) =>
      prev.map((s) => (s.id === id ? { ...s, [field]: text } : s))
    );
  };

  const handleRemoveSpec = (id: string) => {
    setTechnicalSpecs((prev) => prev.filter((s) => s.id !== id));
  };

  const handleAddGalleryImage = () => {
    if (newGalleryUrl.trim()) {
      setGalleryImages((prev) => [...prev, newGalleryUrl.trim()]);
      setNewGalleryUrl('');
    }
  };

  const handleRemoveGalleryImage = (index: number) => {
    setGalleryImages((prev) => prev.filter((_, idx) => idx !== index));
  };

  const priceInCents = parsePriceToCents(priceUsd);
  const salePriceInCents = salePriceUsd.trim() ? parsePriceToCents(salePriceUsd) : null;
  const parsedInventory = parseInt(inventory, 10) || 0;
  const previewStockStatus = calculateStockStatus(parsedInventory);

  const validate = (): boolean => {
    const errs: ProductFormErrors = {};

    if (!name.trim()) {
      errs.name = 'Product title is required and cannot be empty.';
    }

    if (!sku.trim()) {
      errs.sku = 'SKU is required (e.g. TNT-SR2-001).';
    }

    if (!priceUsd.trim() || priceUsd.includes('-') || priceInCents <= 0) {
      errs.priceUsd = 'Price must be a valid positive amount greater than $0.00.';
    }

    if (salePriceUsd.trim()) {
      if (salePriceUsd.includes('-') || (salePriceInCents != null && salePriceInCents <= 0)) {
        errs.salePriceUsd = 'Sale price must be a valid positive amount.';
      } else if (salePriceInCents != null && salePriceInCents >= priceInCents) {
        errs.salePriceUsd = 'Sale price must be strictly lower than regular price.';
      }
    }

    if (isNaN(parsedInventory) || parsedInventory < 0 || inventory.includes('-')) {
      errs.inventory = 'Inventory cannot be negative.';
    }

    if (!description.trim()) {
      errs.description = 'Product description is required.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    setIsSubmitting(true);

    const categoryObj = ADMIN_PRODUCT_CATEGORIES.find((c) => c.id === categoryId);

    const specsRecord: Record<string, string> = {};
    for (const spec of technicalSpecs) {
      if (spec.key.trim() && spec.value.trim()) {
        specsRecord[spec.key.trim()] = spec.value.trim();
      }
    }

    const payload = {
      name: name.trim(),
      slug: slug.trim() || slugify(name),
      sku: sku.trim().toUpperCase(),
      categoryId,
      categoryName: categoryObj?.name || 'Outdoor Gear',
      priceInCents,
      salePriceInCents: salePriceInCents || null,
      inventory: parsedInventory,
      description: description.trim(),
      imageUrl: imageUrl.trim() || '/images/products/placeholder-gear.svg',
      galleryImages,
      technicalSpecs: specsRecord,
      rating: initialProduct?.rating ?? 0,
      reviewCount: initialProduct?.reviewCount ?? 0,
      isFeatured,
    };

    const result = onSubmit(payload);
    setIsSubmitting(false);

    if (typeof result === 'boolean') {
      if (result) onClose();
    } else if (result.success) {
      onClose();
    } else if (result.errorField === 'sku') {
      setErrors((prev) => ({
        ...prev,
        sku: result.message || 'This SKU is already assigned to another product.',
      }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Section 1: Core Information */}
      <div className="space-y-4">
        <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-orange-400">
          1. Basic Information
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Title / Name */}
          <div className="sm:col-span-2">
            <label
              htmlFor="prod-form-name"
              className="block text-xs font-semibold text-slate-300 mb-1.5"
            >
              Product Title <span className="text-orange-400">*</span>
            </label>
            <input
              ref={firstInputRef}
              id="prod-form-name"
              type="text"
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="e.g. Summit Ridge 2-Person Backpacking Tent"
              aria-invalid={Boolean(errors.name)}
              aria-describedby={errors.name ? 'prod-name-error' : undefined}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700/80 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all"
            />
            {errors.name && (
              <p id="prod-name-error" className="text-xs text-red-400 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" aria-hidden="true" />
                <span>{errors.name}</span>
              </p>
            )}
          </div>

          {/* SKU */}
          <div>
            <label
              htmlFor="prod-form-sku"
              className="block text-xs font-semibold text-slate-300 mb-1.5"
            >
              Stock Keeping Unit (SKU) <span className="text-orange-400">*</span>
            </label>
            <input
              id="prod-form-sku"
              type="text"
              value={sku}
              onChange={(e) => setSku(e.target.value)}
              placeholder="e.g. TNT-SR2-001"
              aria-invalid={Boolean(errors.sku)}
              aria-describedby={errors.sku ? 'prod-sku-error' : undefined}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700/80 text-sm text-white font-mono placeholder-slate-500 uppercase focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all"
            />
            {errors.sku && (
              <p id="prod-sku-error" className="text-xs text-red-400 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" aria-hidden="true" />
                <span>{errors.sku}</span>
              </p>
            )}
          </div>

          {/* Category */}
          <div>
            <label
              htmlFor="prod-form-category"
              className="block text-xs font-semibold text-slate-300 mb-1.5"
            >
              Category <span className="text-orange-400">*</span>
            </label>
            <select
              id="prod-form-category"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700/80 text-sm text-white focus:outline-none focus:ring-2 focus:ring-orange-500 cursor-pointer"
            >
              {ADMIN_PRODUCT_CATEGORIES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Slug */}
          <div className="sm:col-span-2">
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="prod-form-slug" className="text-xs font-semibold text-slate-300">
                URL Slug
              </label>
              <button
                type="button"
                onClick={() => {
                  setIsSlugCustomized(!isSlugCustomized);
                  if (isSlugCustomized) setSlug(slugify(name));
                }}
                className="text-[11px] text-orange-400 hover:text-orange-300 focus-visible:outline-none focus-visible:underline"
              >
                {isSlugCustomized ? 'Reset to Auto Slug' : 'Customize Slug'}
              </button>
            </div>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-mono text-slate-500">
                /shop/
              </span>
              <input
                id="prod-form-slug"
                type="text"
                value={slug}
                disabled={!isSlugCustomized}
                onChange={(e) => setSlug(slugify(e.target.value))}
                placeholder="summit-ridge-2-person-backpacking-tent"
                className="w-full pl-16 pr-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700/80 text-xs font-mono text-slate-300 placeholder-slate-600 disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Section 2: Pricing & Inventory */}
      <div className="space-y-4 pt-2 border-t border-slate-800">
        <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-orange-400">
          2. Pricing & Live Inventory
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Regular Price (USD) */}
          <div>
            <label
              htmlFor="prod-form-price"
              className="block text-xs font-semibold text-slate-300 mb-1.5"
            >
              Regular Price ($) <span className="text-orange-400">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-slate-400 font-mono">
                $
              </span>
              <input
                id="prod-form-price"
                type="number"
                step="0.01"
                min="0"
                value={priceUsd}
                onChange={(e) => setPriceUsd(e.target.value)}
                placeholder="289.99"
                aria-invalid={Boolean(errors.priceUsd)}
                aria-describedby="prod-price-help"
                className="w-full pl-8 pr-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700/80 text-sm text-white font-mono placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all"
              />
            </div>
            <p id="prod-price-help" className="text-[11px] text-slate-400 mt-1 font-mono">
              {priceInCents > 0 ? `${formatPriceFromCents(priceInCents)} (${priceInCents} cents)` : 'Enter price in USD'}
            </p>
            {errors.priceUsd && (
              <p className="text-xs text-red-400 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" aria-hidden="true" />
                <span>{errors.priceUsd}</span>
              </p>
            )}
          </div>

          {/* Sale Price (Optional) */}
          <div>
            <label
              htmlFor="prod-form-sale-price"
              className="block text-xs font-semibold text-slate-300 mb-1.5"
            >
              Sale Price ($) <span className="text-slate-500 font-normal">(Optional)</span>
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-slate-400 font-mono">
                $
              </span>
              <input
                id="prod-form-sale-price"
                type="number"
                step="0.01"
                min="0"
                value={salePriceUsd}
                onChange={(e) => setSalePriceUsd(e.target.value)}
                placeholder="249.99"
                aria-invalid={Boolean(errors.salePriceUsd)}
                className="w-full pl-8 pr-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700/80 text-sm text-emerald-400 font-mono placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all"
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-1 font-mono">
              {salePriceInCents ? formatPriceFromCents(salePriceInCents) : 'Leave blank if no sale'}
            </p>
            {errors.salePriceUsd && (
              <p className="text-xs text-red-400 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" aria-hidden="true" />
                <span>{errors.salePriceUsd}</span>
              </p>
            )}
          </div>

          {/* Inventory Quantity */}
          <div>
            <label
              htmlFor="prod-form-inventory"
              className="block text-xs font-semibold text-slate-300 mb-1.5"
            >
              Stock Quantity <span className="text-orange-400">*</span>
            </label>
            <input
              id="prod-form-inventory"
              type="number"
              min="0"
              step="1"
              value={inventory}
              onChange={(e) => setInventory(e.target.value)}
              placeholder="10"
              aria-invalid={Boolean(errors.inventory)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700/80 text-sm text-white font-mono placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all"
            />
            <div className="mt-1 flex items-center gap-2">
              <span className="text-[11px] text-slate-400">Status:</span>
              <AdminStockStatusBadge stock={parsedInventory} status={previewStockStatus} />
            </div>
            {errors.inventory && (
              <p className="text-xs text-red-400 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" aria-hidden="true" />
                <span>{errors.inventory}</span>
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Section 3: Description */}
      <div className="space-y-2 pt-2 border-t border-slate-800">
        <label
          htmlFor="prod-form-desc"
          className="block text-xs font-semibold text-slate-300"
        >
          Product Description <span className="text-orange-400">*</span>
        </label>
        <textarea
          id="prod-form-desc"
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Detailed description of features, materials, and recommended outdoor activities..."
          aria-invalid={Boolean(errors.description)}
          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700/80 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all resize-y"
        />
        {errors.description && (
          <p className="text-xs text-red-400 mt-1 flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5" aria-hidden="true" />
            <span>{errors.description}</span>
          </p>
        )}
      </div>

      {/* Section 4: Image Management UI */}
      <div className="space-y-3 pt-2 border-t border-slate-800">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-orange-400">
            3. Image Management UI
          </h3>
          <span className="text-[11px] text-slate-400">URL Input & Local Preset Assets</span>
        </div>

        {/* Primary Image URL & Thumbnail Preview */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-slate-950 border border-slate-700/80 shrink-0 flex items-center justify-center">
            {imagePreviewError || !imageUrl ? (
              <ImageIcon className="w-8 h-8 text-slate-600" aria-hidden="true" />
            ) : (
              <Image
                src={imageUrl}
                alt="Product image preview"
                fill
                sizes="80px"
                className="object-cover"
                onError={() => setImagePreviewError(true)}
                onLoad={() => setImagePreviewError(false)}
              />
            )}
          </div>

          <div className="flex-1 w-full space-y-1.5">
            <label
              htmlFor="prod-form-image"
              className="block text-xs font-semibold text-slate-300"
            >
              Primary Image URL
            </label>
            <input
              id="prod-form-image"
              type="text"
              value={imageUrl}
              onChange={(e) => {
                setImageUrl(e.target.value);
                setImagePreviewError(false);
              }}
              placeholder="e.g. /images/shop/alpha-2-person-tent.jpg"
              className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700/80 text-xs text-white placeholder-slate-500 font-mono focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all"
            />
            {imagePreviewError && (
              <p className="text-[11px] text-amber-400 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" aria-hidden="true" />
                <span>Preview unavailable for this URL. Fallback asset will be used.</span>
              </p>
            )}
          </div>
        </div>

        {/* Quick Preset Asset Selector */}
        <div className="space-y-1.5 pt-1">
          <span className="text-xs text-slate-400 font-medium">Quick Select from Local Presets:</span>
          <div className="flex items-center gap-2 flex-wrap">
            {PRESET_PRODUCT_IMAGES.map((preset, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setImageUrl(preset.url);
                  setImagePreviewError(false);
                }}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
                  imageUrl === preset.url
                    ? 'bg-orange-500/20 text-orange-300 border-orange-500/40 font-semibold'
                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white hover:bg-slate-850'
                }`}
              >
                {imageUrl === preset.url && <Check className="w-3 h-3 text-orange-400" aria-hidden="true" />}
                <span>{preset.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Auxiliary Gallery URLs */}
        <div className="space-y-2 pt-2">
          <span className="text-xs text-slate-300 font-semibold">Additional Gallery Images:</span>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={newGalleryUrl}
              onChange={(e) => setNewGalleryUrl(e.target.value)}
              placeholder="Add auxiliary image URL..."
              className="flex-1 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700/80 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
            <button
              type="button"
              onClick={handleAddGalleryImage}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200"
            >
              Add Image
            </button>
          </div>

          {galleryImages.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap pt-1">
              {galleryImages.map((gUrl, gIdx) => (
                <div
                  key={gIdx}
                  className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-300"
                >
                  <span className="truncate max-w-[180px] font-mono text-[11px]">{gUrl}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveGalleryImage(gIdx)}
                    aria-label={`Remove gallery image ${gIdx + 1}`}
                    className="text-slate-500 hover:text-red-400"
                  >
                    <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Section 5: Technical Specifications (Key-Value Editor) */}
      <div className="space-y-3 pt-2 border-t border-slate-800">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-orange-400">
            4. Technical Specifications
          </h3>
          <button
            type="button"
            onClick={handleAddSpecRow}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Add Spec Row</span>
          </button>
        </div>

        {technicalSpecs.length === 0 ? (
          <p className="text-xs text-slate-500 italic py-2">
            No technical specifications added. Click &quot;Add Spec Row&quot; to include weight, capacity, or material.
          </p>
        ) : (
          <div className="space-y-2">
            {technicalSpecs.map((spec) => (
              <div key={spec.id} className="flex items-center gap-2">
                <input
                  type="text"
                  value={spec.key}
                  onChange={(e) => handleUpdateSpec(spec.id, 'key', e.target.value)}
                  placeholder="Spec Label (e.g. Weight)"
                  className="w-1/3 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700/80 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
                <input
                  type="text"
                  value={spec.value}
                  onChange={(e) => handleUpdateSpec(spec.id, 'value', e.target.value)}
                  placeholder="Spec Value (e.g. 4.2 lbs)"
                  className="flex-1 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700/80 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveSpec(spec.id)}
                  aria-label="Remove specification"
                  className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" aria-hidden="true" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Featured checkbox */}
      <div className="pt-2 border-t border-slate-800 flex items-center gap-2">
        <input
          id="prod-form-featured"
          type="checkbox"
          checked={isFeatured}
          onChange={(e) => setIsFeatured(e.target.checked)}
          className="w-4 h-4 rounded bg-slate-950 border-slate-700 text-orange-500 focus:ring-orange-500"
        />
        <label htmlFor="prod-form-featured" className="text-xs font-semibold text-slate-300 cursor-pointer">
          Featured Product (Highlight on storefront homepage)
        </label>
      </div>

      {/* Footer Actions inside the form */}
      <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 cursor-pointer"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-slate-950 font-bold text-xs sm:text-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 disabled:opacity-50 cursor-pointer shadow-md shadow-orange-500/20"
        >
          {isSubmitting ? (
            <span>Saving...</span>
          ) : mode === 'create' ? (
            <span>Create Product</span>
          ) : (
            <span>Save Changes</span>
          )}
        </button>
      </div>
    </form>
  );
}

export function ProductFormModal({
  isOpen,
  mode,
  initialProduct,
  onClose,
  onSubmit,
}: ProductFormModalProps) {
  if (!isOpen) return null;

  return (
    <AdminModal
      isOpen={isOpen}
      onClose={onClose}
      title={mode === 'create' ? 'Add New Product' : `Edit Product: ${initialProduct?.name}`}
      description={
        mode === 'create'
          ? 'Enter product attributes, pricing, live inventory, and technical specifications.'
          : 'Modify existing catalog specifications and live stock levels.'
      }
      size="xl"
    >
      <ProductFormContent
        key={mode === 'edit' && initialProduct ? initialProduct.id : 'create-new-product'}
        mode={mode}
        initialProduct={initialProduct}
        onClose={onClose}
        onSubmit={onSubmit}
      />
    </AdminModal>
  );
}
