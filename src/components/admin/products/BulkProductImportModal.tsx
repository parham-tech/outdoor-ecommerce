'use client';

import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  FileSpreadsheet,
  Download,
  AlertCircle,
  CheckCircle2,
  XCircle,
  FileText,
  Loader2,
  Check,
} from 'lucide-react';
import { AdminModal } from '@/components/admin/ui/AdminModal';
import {
  ADMIN_PRODUCT_CATEGORIES,
  generateSampleCsvTemplate,
  parsePriceToCents,
  PRICE_FORMAT_REGEX,
} from '@/lib/mock/admin-products-data';
import type { AdminProductItem, BulkImportRow } from '@/types/admin-product';

export interface BulkProductImportModalProps {
  isOpen: boolean;
  existingProducts: AdminProductItem[];
  onClose: () => void;
  onImport: (
    newProducts: Array<
      Omit<AdminProductItem, 'id' | 'createdAt' | 'updatedAt' | 'stockStatus'> & {
        inventory: number;
      }
    >
  ) => void;
}

// Zero-dependency RFC 4180 CSV Parser
function parseCsvContent(text: string): string[][] {
  const lines: string[][] = [];
  let currentRow: string[] = [];
  let currentField = '';
  let insideQuotes = false;
  let fieldHadQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (char === '"') {
      if (insideQuotes && nextChar === '"') {
        currentField += '"';
        i++; // skip escaped quote
      } else {
        insideQuotes = !insideQuotes;
        fieldHadQuotes = true;
      }
    } else if (char === ',' && !insideQuotes) {
      currentRow.push(fieldHadQuotes ? currentField : currentField.trim());
      currentField = '';
      fieldHadQuotes = false;
    } else if ((char === '\r' || char === '\n') && !insideQuotes) {
      if (char === '\r' && nextChar === '\n') i++; // CRLF
      currentRow.push(fieldHadQuotes ? currentField : currentField.trim());
      if (currentRow.some((f) => f.trim().length > 0)) {
        lines.push(currentRow);
      }
      currentRow = [];
      currentField = '';
      fieldHadQuotes = false;
    } else {
      currentField += char;
    }
  }

  if (currentField || currentRow.length > 0) {
    currentRow.push(fieldHadQuotes ? currentField : currentField.trim());
    if (currentRow.some((f) => f.trim().length > 0)) {
      lines.push(currentRow);
    }
  }

  return lines;
}

export function BulkProductImportModal({
  isOpen,
  existingProducts,
  onClose,
  onImport,
}: BulkProductImportModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);
  const [parsedRows, setParsedRows] = useState<BulkImportRow[]>([]);
  const [filterView, setFilterView] = useState<'all' | 'valid' | 'invalid'>('all');
  const [isImporting, setIsImporting] = useState(false);

  // Reset state on close
  const handleClose = () => {
    setFileName(null);
    setParseError(null);
    setParsedRows([]);
    setIsParsing(false);
    setIsImporting(false);
    onClose();
  };

  // Download Sample Template
  const handleDownloadTemplate = () => {
    const csvContent = generateSampleCsvTemplate();
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'altitude_products_template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Process Raw 2D Grid (from either CSV or Excel)
  const processRawGrid = (grid: string[][], sourceFileName: string) => {
    if (grid.length < 2) {
      setParseError('The uploaded file must contain a header row and at least one product row.');
      setIsParsing(false);
      return;
    }

    const headers = grid[0].map((h) => h.toLowerCase().trim());
    const nameIdx = headers.findIndex((h) => h === 'name' || h === 'title');
    const skuIdx = headers.findIndex((h) => h === 'sku');
    const catIdx = headers.findIndex((h) => h === 'category');
    const priceIdx = headers.findIndex((h) => h === 'price' || h === 'priceusd');
    const invIdx = headers.findIndex((h) => h === 'inventory' || h === 'stock' || h === 'quantity');
    const descIdx = headers.findIndex((h) => h === 'description' || h === 'desc');
    const imgIdx = headers.findIndex((h) => h === 'imageurl' || h === 'image' || h === 'img');

    if (nameIdx === -1 || skuIdx === -1 || catIdx === -1 || priceIdx === -1 || invIdx === -1) {
      setParseError(
        'Missing required columns. File must include headers: Name, SKU, Category, Price, and Inventory.'
      );
      setIsParsing(false);
      return;
    }

    const rows: BulkImportRow[] = [];
    for (let i = 1; i < grid.length; i++) {
      const row = grid[i];
      if (row.length === 0 || row.every((c) => !c)) continue; // skip blank row

      const nameVal = (row[nameIdx] || '').trim();
      const skuVal = (row[skuIdx] || '').trim().toUpperCase();
      const catVal = (row[catIdx] || '').trim();
      const priceStr = (row[priceIdx] || '').trim();
      const invStr = (row[invIdx] || '').trim();
      const rawDesc = descIdx !== -1 && row[descIdx] != null ? row[descIdx] : '';
      const descVal = rawDesc.trim().length > 0 ? rawDesc : 'Imported catalog gear.';
      const imgVal = imgIdx !== -1 && row[imgIdx] ? row[imgIdx].trim() : '/images/products/placeholder-gear.svg';

      const rowErrors: string[] = [];

      // Validate Name
      if (!nameVal) {
        rowErrors.push('Missing product name');
      }

      // Validate SKU presence and catalog uniqueness (intra-file duplicates resolved in Pass 2)
      if (!skuVal) {
        rowErrors.push('Missing SKU');
      } else {
        const existingItem = existingProducts.find(
          (p) => p.sku.trim().toUpperCase() === skuVal
        );
        if (existingItem) {
          rowErrors.push(`SKU "${skuVal}" already exists in catalog`);
        }
      }

      // Validate Category
      const matchedCategory = ADMIN_PRODUCT_CATEGORIES.find(
        (c) =>
          c.id.toLowerCase() === catVal.toLowerCase() ||
          c.slug.toLowerCase() === catVal.toLowerCase() ||
          c.name.toLowerCase() === catVal.toLowerCase()
      );
      if (!matchedCategory) {
        rowErrors.push(`Unknown category "${catVal}"`);
      }

      // Validate Price (validate input before sanitization, reject invalid/negative/zero)
      let parsedPrice = 0;
      if (!priceStr) {
        rowErrors.push('Price is required');
      } else if (priceStr.includes('-') || (priceStr.startsWith('(') && priceStr.endsWith(')'))) {
        rowErrors.push('Price must be greater than $0.00');
      } else if (!PRICE_FORMAT_REGEX.test(priceStr)) {
        rowErrors.push('Price must be a valid dollar amount (e.g. 29.99 or $29.99)');
      } else {
        const sanitizedPrice = priceStr.replace(/[^0-9.]/g, '');
        const num = parseFloat(sanitizedPrice);
        if (isNaN(num) || num <= 0) {
          rowErrors.push('Price must be greater than $0.00');
        } else {
          parsedPrice = num;
        }
      }

      // Validate Inventory (explicitly reject negative inventory)
      const isNegativeInv = invStr.includes('-');
      const parsedInv = parseInt(invStr.replace(/[^0-9-]/g, ''), 10);
      if (isNegativeInv || isNaN(parsedInv) || parsedInv < 0) {
        rowErrors.push('Inventory must be an integer >= 0');
      }

      rows.push({
        rowNumber: i,
        name: nameVal,
        sku: skuVal,
        category: matchedCategory?.name || catVal,
        priceUsd: isNaN(parsedPrice) || parsedPrice <= 0 ? 0 : parsedPrice,
        inventory: isNaN(parsedInv) || parsedInv < 0 ? 0 : parsedInv,
        description: descVal,
        imageUrl: imgVal,
        isValid: rowErrors.length === 0,
        errors: rowErrors,
      });
    }

    // Pass 2: Resolve intra-file duplicate SKUs among candidate valid rows.
    // The first valid row for an SKU is accepted; subsequent rows sharing that SKU
    // are flagged as duplicates and marked invalid.
    // An earlier invalid row (failing price, category, etc.) does not block a subsequent valid row.
    const seenValidFileSkus = new Set<string>();
    for (const row of rows) {
      if (!row.sku) continue;

      if (row.isValid) {
        if (seenValidFileSkus.has(row.sku)) {
          row.isValid = false;
          row.errors.push(`Duplicate SKU "${row.sku}" within file`);
        } else {
          seenValidFileSkus.add(row.sku);
        }
      }
    }

    setParsedRows(rows);
    setFileName(sourceFileName);
    setIsParsing(false);
  };

  // Handle File Input Selection
  const handleFile = async (file: File) => {
    setParseError(null);
    setIsParsing(true);

    if (file.size > 5 * 1024 * 1024) {
      setParseError('File size exceeds the 5MB limit.');
      setIsParsing(false);
      return;
    }

    const lowerName = file.name.toLowerCase();

    // 1. Excel (.xlsx / .xls) parsing with dynamic import of read-excel-file
    if (lowerName.endsWith('.xlsx') || lowerName.endsWith('.xls')) {
      try {
        const { readSheet } = await import('read-excel-file/browser');
        const rows = await readSheet(file);
        const stringGrid: string[][] = (rows as unknown[][]).map((r) =>
          r.map((cell) => (cell != null ? String(cell) : ''))
        );
        processRawGrid(stringGrid, file.name);
      } catch (err) {
        setParseError(`Failed to parse Excel spreadsheet: ${(err as Error).message}`);
        setIsParsing(false);
      }
      return;
    }

    // 2. CSV / Plain Text parsing (Dependency-free native RFC 4180 parser)
    if (lowerName.endsWith('.csv') || lowerName.endsWith('.tsv') || lowerName.endsWith('.txt')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          const grid = parseCsvContent(content);
          processRawGrid(grid, file.name);
        } catch (err) {
          setParseError(`Failed to parse CSV file: ${(err as Error).message}`);
          setIsParsing(false);
        }
      };
      reader.onerror = () => {
        setParseError('Unable to read the selected file.');
        setIsParsing(false);
      };
      reader.readAsText(file);
      return;
    }

    setParseError('Unsupported file type. Please upload a .csv or .xlsx spreadsheet.');
    setIsParsing(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  // Execute Batch Import of Valid Rows
  const handleExecuteImport = () => {
    const validRows = parsedRows.filter((r) => r.isValid);
    if (validRows.length === 0) return;

    setIsImporting(true);

    const productsToCreate = validRows.map((row) => {
      const matchedCat = ADMIN_PRODUCT_CATEGORIES.find(
        (c) =>
          c.name.toLowerCase() === row.category.toLowerCase() ||
          c.slug.toLowerCase() === row.category.toLowerCase()
      );

      return {
        name: row.name,
        slug: row.name
          .toLowerCase()
          .replace(/[^\w\s-]/g, '')
          .replace(/[\s_-]+/g, '-'),
        sku: row.sku,
        categoryId: matchedCat?.id || 'cat-tents',
        categoryName: matchedCat?.name || 'Outdoor Gear',
        priceInCents: parsePriceToCents(row.priceUsd.toFixed(2)),
        salePriceInCents: null,
        inventory: row.inventory,
        description: row.description,
        imageUrl: row.imageUrl || '/images/products/placeholder-gear.svg',
        rating: 0,
        reviewCount: 0,
        technicalSpecs: {},
        isFeatured: false,
      };
    });

    onImport(productsToCreate);
    setIsImporting(false);
    handleClose();
  };

  const validCount = parsedRows.filter((r) => r.isValid).length;
  const invalidCount = parsedRows.filter((r) => !r.isValid).length;

  const displayedRows = parsedRows.filter((r) => {
    if (filterView === 'valid') return r.isValid;
    if (filterView === 'invalid') return !r.isValid;
    return true;
  });

  return (
    <AdminModal
      isOpen={isOpen}
      onClose={handleClose}
      title="Bulk Product Import"
      description="Upload a CSV or Excel (.xlsx) file to batch-import gear products into the ALTITUDE catalog."
      size="2xl"
      footer={
        <>
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 cursor-pointer"
          >
            Cancel
          </button>
          {parsedRows.length > 0 && (
            <button
              type="button"
              onClick={handleExecuteImport}
              disabled={validCount === 0 || isImporting}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-slate-950 font-bold text-xs sm:text-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 disabled:opacity-50 cursor-pointer shadow-md shadow-orange-500/20"
            >
              {isImporting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                  <span>Importing...</span>
                </>
              ) : (
                <span>Import {validCount} Valid Products</span>
              )}
            </button>
          )}
        </>
      }
    >
      <div className="space-y-6">
        {/* Step 1: Template Download Banner */}
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-950/60 border border-emerald-500/30 text-emerald-400">
              <FileSpreadsheet className="w-5 h-5" aria-hidden="true" />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-bold text-white">Need the correct column format?</p>
              <p className="text-xs text-slate-400">
                Download our pre-formatted template with headers and sample outdoor products.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleDownloadTemplate}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 cursor-pointer shrink-0"
          >
            <Download className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Download Template (.csv)</span>
          </button>
        </div>

        {/* Step 2: File Dropzone */}
        {parsedRows.length === 0 ? (
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer flex flex-col items-center justify-center space-y-3 ${
              isDragging
                ? 'border-orange-500 bg-orange-500/10'
                : 'border-slate-800 bg-slate-950/50 hover:border-slate-700 hover:bg-slate-950'
            }`}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.xlsx,.xls,.tsv,.txt"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleFile(e.target.files[0]);
                }
              }}
              className="sr-only"
            />

            <div className="p-3 rounded-full bg-slate-900 border border-slate-800 text-orange-400">
              {isParsing ? (
                <Loader2 className="w-8 h-8 animate-spin" aria-hidden="true" />
              ) : (
                <UploadCloud className="w-8 h-8" aria-hidden="true" />
              )}
            </div>

            <div>
              <p className="text-sm font-bold text-white">
                {isParsing ? 'Parsing spreadsheet...' : 'Click or drag spreadsheet file here'}
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Supports CSV (.csv) and Microsoft Excel (.xlsx, .xls) up to 5MB.
              </p>
            </div>
          </div>
        ) : (
          /* File Uploaded Header */
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-950 border border-slate-800">
            <div className="flex items-center gap-3">
              <FileText className="w-5 h-5 text-orange-400" aria-hidden="true" />
              <div>
                <p className="text-xs sm:text-sm font-bold text-white truncate max-w-[260px] sm:max-w-md">
                  {fileName}
                </p>
                <p className="text-[11px] text-slate-400">
                  {parsedRows.length} rows detected • {validCount} valid, {invalidCount} with errors
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                setParsedRows([]);
                setFileName(null);
                setParseError(null);
              }}
              className="text-xs text-slate-400 hover:text-white px-2 py-1 rounded bg-slate-900 border border-slate-800 hover:bg-slate-800"
            >
              Choose different file
            </button>
          </div>
        )}

        {/* Parse Error Alert */}
        {parseError && (
          <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-red-950/40 border border-red-500/30 text-red-200 text-xs">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" aria-hidden="true" />
            <p className="leading-relaxed">{parseError}</p>
          </div>
        )}

        {/* Step 3: Interactive Row Preview & Diagnostics Table */}
        {parsedRows.length > 0 && (
          <div className="space-y-3">
            {/* Filter Pills */}
            <div className="flex items-center justify-between gap-2 flex-wrap text-xs">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setFilterView('all')}
                  className={`px-2.5 py-1 rounded-lg font-semibold border transition-colors ${
                    filterView === 'all'
                      ? 'bg-slate-800 text-white border-slate-700'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                  }`}
                >
                  All Rows ({parsedRows.length})
                </button>
                <button
                  type="button"
                  onClick={() => setFilterView('valid')}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-semibold border transition-colors ${
                    filterView === 'valid'
                      ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40'
                      : 'bg-slate-950 text-emerald-400/70 border-slate-800 hover:text-emerald-300'
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Valid ({validCount})</span>
                </button>
                <button
                  type="button"
                  onClick={() => setFilterView('invalid')}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-semibold border transition-colors ${
                    filterView === 'invalid'
                      ? 'bg-red-950/80 text-red-300 border-red-500/40'
                      : 'bg-slate-950 text-red-400/70 border-slate-800 hover:text-red-300'
                  }`}
                >
                  <XCircle className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Errors ({invalidCount})</span>
                </button>
              </div>

              {invalidCount > 0 && (
                <span className="text-amber-400 text-[11px]">
                  Rows with errors will be skipped automatically during import.
                </span>
              )}
            </div>

            {/* Preview Table */}
            <div className="border border-slate-800 rounded-xl overflow-x-auto max-h-72">
              <table className="w-full text-left text-xs text-slate-200 border-collapse">
                <thead className="bg-slate-950 text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-800 sticky top-0 z-10 font-semibold select-none">
                  <tr>
                    <th scope="col" className="px-3 py-2 w-12 text-center">Row</th>
                    <th scope="col" className="px-3 py-2">Status</th>
                    <th scope="col" className="px-3 py-2">Name</th>
                    <th scope="col" className="px-3 py-2">SKU</th>
                    <th scope="col" className="px-3 py-2">Category</th>
                    <th scope="col" className="px-3 py-2">Price</th>
                    <th scope="col" className="px-3 py-2">Inventory</th>
                    <th scope="col" className="px-3 py-2">Diagnostics</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 bg-slate-900/60">
                  {displayedRows.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-4 py-6 text-center text-slate-400 italic">
                        No rows matching the current filter.
                      </td>
                    </tr>
                  ) : (
                    displayedRows.map((row) => (
                      <tr
                        key={row.rowNumber}
                        className={`transition-colors ${
                          row.isValid ? 'hover:bg-slate-800/40' : 'bg-red-950/15 hover:bg-red-950/25'
                        }`}
                      >
                        <td className="px-3 py-2 font-mono text-center text-slate-500">
                          {row.rowNumber}
                        </td>
                        <td className="px-3 py-2">
                          {row.isValid ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-1.5 py-0.5 rounded-full">
                              <Check className="w-3 h-3" aria-hidden="true" />
                              <span>Valid</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-red-400 bg-red-950/60 border border-red-500/30 px-1.5 py-0.5 rounded-full">
                              <XCircle className="w-3 h-3" aria-hidden="true" />
                              <span>Error</span>
                            </span>
                          )}
                        </td>
                        <td className="px-3 py-2 font-medium text-white truncate max-w-[160px]">
                          {row.name || <span className="text-red-400 italic">Missing</span>}
                        </td>
                        <td className="px-3 py-2 font-mono text-orange-400">
                          {row.sku || <span className="text-red-400 italic">Missing</span>}
                        </td>
                        <td className="px-3 py-2 text-slate-300">
                          {row.category}
                        </td>
                        <td className="px-3 py-2 font-mono">
                          ${row.priceUsd.toFixed(2)}
                        </td>
                        <td className="px-3 py-2 font-mono">
                          {row.inventory}
                        </td>
                        <td className="px-3 py-2">
                          {row.errors.length > 0 ? (
                            <div className="flex flex-col gap-0.5">
                              {row.errors.map((err, errIdx) => (
                                <span
                                  key={errIdx}
                                  className="text-[10px] text-red-300 font-semibold bg-red-900/40 px-1.5 py-0.5 rounded border border-red-500/20"
                                >
                                  {err}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span className="text-[11px] text-emerald-400">Ready to import</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </AdminModal>
  );
}
