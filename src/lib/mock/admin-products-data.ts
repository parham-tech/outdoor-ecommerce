import type { AdminStockStatus } from '@/types/admin';
import type { AdminProductItem, AdminCategoryOption } from '@/types/admin-product';

/**
 * 4 Primary Outdoor Equipment Categories defined in REQUIREMENTS.md §3.1
 */
export const ADMIN_PRODUCT_CATEGORIES: AdminCategoryOption[] = [
  {
    id: 'cat-tents',
    name: 'Tents & Shelters',
    slug: 'tents-shelters',
    description: 'Backpacking tents, 4-season expedition shelters, ultralight tarps, and footprints.',
  },
  {
    id: 'cat-packs',
    name: 'Backpacks & Packs',
    slug: 'backpacks-packs',
    description: 'Multi-day expedition packs, technical daypacks, and hydration packs.',
  },
  {
    id: 'cat-kitchen',
    name: 'Camp Kitchen',
    slug: 'camp-kitchen',
    description: 'Canister/liquid stoves, titanium cookware, mess kits, and water filtration systems.',
  },
  {
    id: 'cat-apparel',
    name: 'Outdoor Apparel',
    slug: 'outdoor-apparel',
    description: 'Weatherproof technical shells, insulated jackets, hiking boots, and thermal layers.',
  },
];

/**
 * Available preset images located in project public assets
 */
export const PRESET_PRODUCT_IMAGES = [
  {
    label: 'Gear Placeholder SVG',
    url: '/images/products/placeholder-gear.svg',
  },
  {
    label: 'Alpha 2-Person Tent',
    url: '/images/shop/alpha-2-person-tent.jpg',
  },
  {
    label: 'Trail 45L Backpack',
    url: '/images/shop/trail-45l-backpack.jpg',
  },
  {
    label: 'Summit Sleeping Bag',
    url: '/images/shop/summit-sleeping-bag.jpg',
  },
  {
    label: 'Trail Rechargeable Spotlight',
    url: '/images/shop/trail-rechargeable-spotlight.jpg',
  },
];

/**
 * Derives the standard AdminStockStatus according to REQUIREMENTS.md §3.1:
 * - > 3: IN_STOCK
 * - 1 <= inventory <= 3: LOW_STOCK
 * - 0: OUT_OF_STOCK
 */
export function calculateStockStatus(inventory: number): AdminStockStatus {
  if (inventory <= 0) return 'OUT_OF_STOCK';
  if (inventory <= 3) return 'LOW_STOCK';
  return 'IN_STOCK';
}

/**
 * Converts integer cents to formatted USD string (e.g. 28999 -> "$289.99")
 */
export function formatPriceFromCents(priceInCents: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(priceInCents / 100);
}

/**
 * Strict USD Price format regex:
 * Accepts e.g. "29.99", "$29.99", "34", "$250", "$1,249.99", "1,000,000.00".
 * Rejects arbitrary letters ("sd34", "abc100", "34 USD"), bad commas ("1,24.99"),
 * extra decimals ("12.345"), negatives ("-76"), and empty strings.
 */
export const PRICE_FORMAT_REGEX = /^\$?\s*(?:\d{1,3}(?:,\d{3})+|\d+)(?:\.\d{1,2})?$/;

/**
 * Converts formatted or decimal USD string to integer cents (e.g. "289.99" -> 28999).
 * Returns 0 if input is invalid, negative, or empty. Negative prices are explicitly rejected.
 */
export function parsePriceToCents(usdString: string): number {
  const trimmed = usdString.trim();
  // Reject empty or negative prices explicitly (e.g., "-15.00", "-$15", or accounting "(15.00)")
  if (!trimmed || trimmed.includes('-') || (trimmed.startsWith('(') && trimmed.endsWith(')'))) {
    return 0;
  }
  // Validate format before any sanitization (reject letters, malformed decimals/separators)
  if (!PRICE_FORMAT_REGEX.test(trimmed)) {
    return 0;
  }
  const sanitized = trimmed.replace(/[^0-9.]/g, '');
  const parsed = parseFloat(sanitized);
  if (isNaN(parsed) || parsed <= 0) return 0;
  return Math.round(parsed * 100);
}

/**
 * Authoritative 14-Item Seed Product Catalog defined in REQUIREMENTS.md §4.
 */
export const MOCK_ADMIN_PRODUCTS: AdminProductItem[] = [
  {
    id: 'prod-001',
    sku: 'TNT-SR2-001',
    name: 'Summit Ridge 2-Person Backpacking Tent',
    slug: 'summit-ridge-2-person-backpacking-tent',
    categoryId: 'cat-tents',
    categoryName: 'Tents & Shelters',
    priceInCents: 28999,
    salePriceInCents: 24999,
    inventory: 14,
    stockStatus: 'IN_STOCK',
    imageUrl: '/images/shop/alpha-2-person-tent.jpg',
    description: 'Ultra-durable, weather-sealed 3-season backpacking shelter featuring DAC aluminum poles and seam-taped rainfly.',
    technicalSpecs: {
      'Capacity': '2-person',
      'Season': '3-season',
      'Packed Weight': '4.2 lbs (1.9 kg)',
      'Floor Fabric': '68D Polyester Taffeta 3000mm',
    },
    rating: 4.8,
    reviewCount: 38,
    isFeatured: true,
    createdAt: '2026-09-01T10:00:00Z',
    updatedAt: '2026-10-18T14:20:00Z',
  },
  {
    id: 'prod-002',
    sku: 'TNT-AF4-002',
    name: 'Alpine Fortress 4-Season Expedition Tent',
    slug: 'alpine-fortress-4-season-expedition-tent',
    categoryId: 'cat-tents',
    categoryName: 'Tents & Shelters',
    priceInCents: 59999,
    salePriceInCents: null,
    inventory: 3,
    stockStatus: 'LOW_STOCK',
    imageUrl: '/images/products/placeholder-gear.svg',
    description: 'Rugged geodesic mountaineering shelter engineered to withstand hurricane-force alpine winds and heavy snow loads.',
    technicalSpecs: {
      'Capacity': '4-person',
      'Season': '4-season / Expedition',
      'Packed Weight': '9.8 lbs (4.4 kg)',
      'Pole Architecture': 'Geodesic 7001-T6 Aluminum',
    },
    rating: 4.9,
    reviewCount: 19,
    isFeatured: true,
    createdAt: '2026-09-03T11:30:00Z',
    updatedAt: '2026-10-17T09:15:00Z',
  },
  {
    id: 'prod-003',
    sku: 'TNT-ULB-003',
    name: 'Ultralight Silnylon Bivy Shelter',
    slug: 'ultralight-silnylon-bivy-shelter',
    categoryId: 'cat-tents',
    categoryName: 'Tents & Shelters',
    priceInCents: 11999,
    salePriceInCents: null,
    inventory: 0,
    stockStatus: 'OUT_OF_STOCK',
    imageUrl: '/images/products/placeholder-gear.svg',
    description: 'Minimalist solo fastpacking shelter crafted from 20D waterproof silnylon with breathable top mesh panel.',
    technicalSpecs: {
      'Capacity': '1-person',
      'Packed Weight': '1.1 lbs (500g)',
      'Fabric': '20D Silnylon 3000mm coating',
      'Packed Size': '8 x 4 in',
    },
    rating: 4.5,
    reviewCount: 14,
    isFeatured: false,
    createdAt: '2026-09-05T08:00:00Z',
    updatedAt: '2026-10-18T16:00:00Z',
  },
  {
    id: 'prod-004',
    sku: 'TNT-HEX-004',
    name: 'Trailside Waterproof Hex Tarp',
    slug: 'trailside-waterproof-hex-tarp',
    categoryId: 'cat-tents',
    categoryName: 'Tents & Shelters',
    priceInCents: 7999,
    salePriceInCents: 6499,
    inventory: 22,
    stockStatus: 'IN_STOCK',
    imageUrl: '/images/products/placeholder-gear.svg',
    description: 'Versatile catenary-cut hexagonal rain tarp offering maximum coverage for hammocks and open bivouac camping.',
    technicalSpecs: {
      'Dimensions': '12 x 10 ft (3.6 x 3.0 m)',
      'Packed Weight': '1.8 lbs (815g)',
      'Fabric': '210T Ripstop Polyester with PU coating',
      'Tie-outs': '6 reinforced perimeter points',
    },
    rating: 4.7,
    reviewCount: 42,
    isFeatured: false,
    createdAt: '2026-09-08T14:10:00Z',
    updatedAt: '2026-10-15T12:00:00Z',
  },
  {
    id: 'prod-005',
    sku: 'BPK-TP65-001',
    name: 'Traverse Pro 65L Expedition Pack',
    slug: 'traverse-pro-65l-expedition-pack',
    categoryId: 'cat-packs',
    categoryName: 'Backpacks & Packs',
    priceInCents: 32999,
    salePriceInCents: null,
    inventory: 2,
    stockStatus: 'LOW_STOCK',
    imageUrl: '/images/shop/trail-45l-backpack.jpg',
    description: 'Heavy-duty multi-day expedition backpack featuring dynamic pivot suspension, integrated rain cover, and hydration sleeve.',
    technicalSpecs: {
      'Volume': '65 Liters',
      'Weight': '4.6 lbs (2.1 kg)',
      'Suspension': 'Adjustable aluminum wishbone frame',
      'Torso Fit': '16 - 21 inches',
    },
    rating: 4.8,
    reviewCount: 29,
    isFeatured: true,
    createdAt: '2026-09-10T09:00:00Z',
    updatedAt: '2026-10-17T18:00:00Z',
  },
  {
    id: 'prod-006',
    sku: 'BPK-SK30-002',
    name: 'Skyline 30L Daypack & Hydration Rig',
    slug: 'skyline-30l-daypack-hydration-rig',
    categoryId: 'cat-packs',
    categoryName: 'Backpacks & Packs',
    priceInCents: 12999,
    salePriceInCents: 9999,
    inventory: 18,
    stockStatus: 'IN_STOCK',
    imageUrl: '/images/shop/trail-45l-backpack.jpg',
    description: 'Streamlined technical daypack equipped with ventilated back panel and insulated 2.5L hydration bladder compartment.',
    technicalSpecs: {
      'Volume': '30 Liters',
      'Weight': '2.1 lbs (950g)',
      'Reservoir': '2.5L BPA-free hydration bladder included',
      'Material': '420D High-Tenacity Nylon',
    },
    rating: 4.6,
    reviewCount: 51,
    isFeatured: false,
    createdAt: '2026-09-12T13:45:00Z',
    updatedAt: '2026-10-16T11:20:00Z',
  },
  {
    id: 'prod-007',
    sku: 'BPK-RR45-003',
    name: 'RidgeRunner Ultralight 45L Fastpack',
    slug: 'ridgerunner-ultralight-45l-fastpack',
    categoryId: 'cat-packs',
    categoryName: 'Backpacks & Packs',
    priceInCents: 21999,
    salePriceInCents: null,
    inventory: 8,
    stockStatus: 'IN_STOCK',
    imageUrl: '/images/products/placeholder-gear.svg',
    description: 'Frameless roll-top thru-hiking pack constructed from waterproof Dyneema Composite Fabric with vest-style harness.',
    technicalSpecs: {
      'Volume': '45 Liters',
      'Weight': '2.3 lbs (1.04 kg)',
      'Closure': 'Roll-top drybag seal',
      'Fabric': 'Dyneema Composite / 210D Robic',
    },
    rating: 4.7,
    reviewCount: 22,
    isFeatured: false,
    createdAt: '2026-09-15T15:20:00Z',
    updatedAt: '2026-10-14T10:00:00Z',
  },
  {
    id: 'prod-008',
    sku: 'BPK-PS10-004',
    name: 'PeakSummit Hydration Lumbar Pack',
    slug: 'peaksummit-hydration-lumbar-pack',
    categoryId: 'cat-packs',
    categoryName: 'Backpacks & Packs',
    priceInCents: 6999,
    salePriceInCents: null,
    inventory: 0,
    stockStatus: 'OUT_OF_STOCK',
    imageUrl: '/images/products/placeholder-gear.svg',
    description: 'Ergonomic lumbar pack designed for trail runners and peak baggers wanting low center of gravity hydration.',
    technicalSpecs: {
      'Volume': '10 Liters',
      'Weight': '1.2 lbs (545g)',
      'Bladder': '1.5L lumbar contour bladder',
      'Belt': 'Dual zippered compression wings',
    },
    rating: 4.4,
    reviewCount: 16,
    isFeatured: false,
    createdAt: '2026-09-18T10:10:00Z',
    updatedAt: '2026-10-18T12:00:00Z',
  },
  {
    id: 'prod-009',
    sku: 'KIT-BMS-001',
    name: 'Backcountry Micro Canister Stove',
    slug: 'backcountry-micro-canister-stove',
    categoryId: 'cat-kitchen',
    categoryName: 'Camp Kitchen',
    priceInCents: 4999,
    salePriceInCents: null,
    inventory: 25,
    stockStatus: 'IN_STOCK',
    imageUrl: '/images/products/placeholder-gear.svg',
    description: 'Pocket-sized backpacking canister stove producing 10,000 BTU output with micro-regulating flame control valve.',
    technicalSpecs: {
      'Weight': '2.6 oz (73g)',
      'Heat Output': '10,000 BTU/hr',
      'Boil Time': '3.5 min per 1 liter water',
      'Ignition': 'Push-button Piezo spark igniter',
    },
    rating: 4.9,
    reviewCount: 84,
    isFeatured: true,
    createdAt: '2026-09-20T08:30:00Z',
    updatedAt: '2026-10-18T15:00:00Z',
  },
  {
    id: 'prod-010',
    sku: 'KIT-TP2-002',
    name: 'Titanium 2-Pot Ultralight Cookset',
    slug: 'titanium-2-pot-ultralight-cookset',
    categoryId: 'cat-kitchen',
    categoryName: 'Camp Kitchen',
    priceInCents: 8999,
    salePriceInCents: 7499,
    inventory: 1,
    stockStatus: 'LOW_STOCK',
    imageUrl: '/images/products/placeholder-gear.svg',
    description: 'Pure Grade-1 titanium nesting pot set with folding insulated handles, volume markings, and mesh carry sack.',
    technicalSpecs: {
      'Capacity': '800ml main pot + 500ml mini pot/lid',
      'Total Weight': '7.4 oz (210g)',
      'Material': 'Grade 1 Pure Titanium (0.4mm)',
      'Nesting': 'Houses standard 100g gas canister and micro stove',
    },
    rating: 4.8,
    reviewCount: 31,
    isFeatured: false,
    createdAt: '2026-09-22T14:00:00Z',
    updatedAt: '2026-10-18T17:30:00Z',
  },
  {
    id: 'prod-011',
    sku: 'KIT-GFW-003',
    name: 'GravityFlow Backcountry Water Filter',
    slug: 'gravityflow-backcountry-water-filter',
    categoryId: 'cat-kitchen',
    categoryName: 'Camp Kitchen',
    priceInCents: 6499,
    salePriceInCents: null,
    inventory: 16,
    stockStatus: 'IN_STOCK',
    imageUrl: '/images/products/placeholder-gear.svg',
    description: 'High-volume gravity-fed hollow fiber water filtration system delivering 1.5 liters per minute of purified water.',
    technicalSpecs: {
      'Pore Size': '0.1 Micron absolute hollow fiber',
      'Capacity': '4 Liter dirty reservoir',
      'Flow Rate': '1.5 Liters/min',
      'Lifespan': 'Up to 1,500 Gallons',
    },
    rating: 4.7,
    reviewCount: 46,
    isFeatured: false,
    createdAt: '2026-09-25T11:15:00Z',
    updatedAt: '2026-10-16T14:40:00Z',
  },
  {
    id: 'prod-012',
    sku: 'KIT-PWS-004',
    name: 'Portable Windproof Camp Stove',
    slug: 'portable-windproof-camp-stove',
    categoryId: 'cat-kitchen',
    categoryName: 'Camp Kitchen',
    priceInCents: 3999,
    salePriceInCents: null,
    inventory: 0,
    stockStatus: 'OUT_OF_STOCK',
    imageUrl: '/images/products/placeholder-gear.svg',
    description: 'Sturdy fold-out camping stove featuring circular wind baffles and broad serrated pot supports for basecamp meals.',
    technicalSpecs: {
      'Weight': '11.2 oz (318g)',
      'Fuel': 'Isobutane / Propane canister mix',
      'Baffles': 'Integrated stainless honeycomb shield',
      'Max Load': '12 lbs cookware capacity',
    },
    rating: 4.3,
    reviewCount: 20,
    isFeatured: false,
    createdAt: '2026-09-27T09:40:00Z',
    updatedAt: '2026-10-18T11:00:00Z',
  },
  {
    id: 'prod-013',
    sku: 'APP-SS3-001',
    name: 'StormShield 3-Layer GORE-TEX Shell',
    slug: 'stormshield-3-layer-gore-tex-shell',
    categoryId: 'cat-apparel',
    categoryName: 'Outdoor Apparel',
    priceInCents: 38999,
    salePriceInCents: 32999,
    inventory: 6,
    stockStatus: 'IN_STOCK',
    imageUrl: '/images/products/placeholder-gear.svg',
    description: 'High-performance mountain jacket featuring 3-layer GORE-TEX Pro membrane, dual pit zips, and helmet-compatible storm hood.',
    technicalSpecs: {
      'Membrane': '3-Layer GORE-TEX Pro 28,000mm',
      'Weight': '14.8 oz (420g)',
      'Zippers': 'YKK AquaGuard water-repellent zippers',
      'Pockets': '2 harness-accessible alpine chest pockets',
    },
    rating: 4.9,
    reviewCount: 65,
    isFeatured: true,
    createdAt: '2026-09-29T16:00:00Z',
    updatedAt: '2026-10-17T12:00:00Z',
  },
  {
    id: 'prod-014',
    sku: 'APP-TLD-002',
    name: 'ThermalLoft 800-Fill Down Jacket',
    slug: 'thermalloft-800-fill-down-jacket',
    categoryId: 'cat-apparel',
    categoryName: 'Outdoor Apparel',
    priceInCents: 25999,
    salePriceInCents: null,
    inventory: 2,
    stockStatus: 'LOW_STOCK',
    imageUrl: '/images/products/placeholder-gear.svg',
    description: 'Ultralight cold-weather insulator packed with responsibly sourced 800-fill power water-resistant hydrophobic down.',
    technicalSpecs: {
      'Insulation': '800-fill power goose down (RDS Certified)',
      'Shell': '10D Pertex Quantum ripstop nylon with DWR',
      'Weight': '13.0 oz (368g)',
      'Packability': 'Stuffs into its own internal chest pocket',
    },
    rating: 4.8,
    reviewCount: 41,
    isFeatured: true,
    createdAt: '2026-10-02T13:20:00Z',
    updatedAt: '2026-10-18T10:00:00Z',
  },
];

/**
 * Generates an RFC 4180 compliant CSV string for sample template download.
 */
export function generateSampleCsvTemplate(): string {
  const headers = ['Name', 'SKU', 'Category', 'Price', 'Inventory', 'Description', 'ImageUrl'];
  const sampleRows = [
    [
      'Alpine Pro 3-Season Tent',
      'TNT-AP3-099',
      'tents-shelters',
      '319.99',
      '12',
      'Lightweight backpacking dome tent with dual vestibules',
      '/images/products/placeholder-gear.svg',
    ],
    [
      'TrailMaster 55L Pack',
      'BPK-TM55-088',
      'backpacks-packs',
      '249.50',
      '7',
      'Multi-day technical backpack with ergonomic hip belt',
      '/images/shop/trail-45l-backpack.jpg',
    ],
    [
      'Titanium Solo Stove',
      'KIT-TSS-077',
      'camp-kitchen',
      '59.95',
      '15',
      'Compact wood-burning titanium backpacking stove',
      '/images/products/placeholder-gear.svg',
    ],
  ];

  const escapeCsv = (val: string) => {
    if (val.includes(',') || val.includes('"') || val.includes('\n')) {
      return `"${val.replace(/"/g, '""')}"`;
    }
    return val;
  };

  const csvLines = [
    headers.join(','),
    ...sampleRows.map((r) => r.map(escapeCsv).join(',')),
  ];

  return csvLines.join('\r\n');
}
