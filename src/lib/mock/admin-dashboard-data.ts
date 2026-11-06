import type {
  AdminKPIMetric,
  AdminRevenueDataPoint,
  AdminRecentOrder,
  AdminInventoryAlert,
} from '@/types/admin';

/**
 * High-fidelity simulated data for the ALTITUDE Admin Dashboard prototype.
 * All metrics, transactions, and order records are explicitly designated as simulated demonstration data.
 */

export const ADMIN_DEMO_DISCLAIMER =
  'PROTOTYPE DEMONSTRATION: All financial metrics, transaction records, inventory alerts, and customer activity displayed in this console are simulated mock data for platform verification. No real monetary transactions or order dispatches have occurred.';

export const MOCK_KPI_METRICS: AdminKPIMetric[] = [
  {
    id: 'kpi-revenue',
    label: 'Total Revenue',
    value: '$42,850.00',
    changePercentage: 14.2,
    trend: 'up',
    timeframe: 'vs last 30 days',
    description: 'Gross sales volume (Simulated)',
    isSimulated: true,
  },
  {
    id: 'kpi-orders',
    label: 'Total Orders',
    value: '268',
    changePercentage: 8.5,
    trend: 'up',
    timeframe: 'vs last 30 days',
    description: '14 orders awaiting fulfillment (Simulated)',
    isSimulated: true,
  },
  {
    id: 'kpi-inventory',
    label: 'Stock Alerts',
    value: '5',
    changePercentage: -25.0,
    trend: 'down',
    timeframe: 'vs last week',
    description: '2 out of stock, 3 low stock (Simulated)',
    isSimulated: true,
  },
  {
    id: 'kpi-customers',
    label: 'Active Customers',
    value: '1,420',
    changePercentage: 18.0,
    trend: 'up',
    timeframe: 'vs last 30 days',
    description: 'Registered outdoor member accounts (Simulated)',
    isSimulated: true,
  },
];

export const MOCK_REVENUE_TREND: AdminRevenueDataPoint[] = [
  { date: '2026-10-12', label: 'Mon', revenueInCents: 412000, orderCount: 24 },
  { date: '2026-10-13', label: 'Tue', revenueInCents: 528000, orderCount: 31 },
  { date: '2026-10-14', label: 'Wed', revenueInCents: 635000, orderCount: 38 },
  { date: '2026-10-15', label: 'Thu', revenueInCents: 590000, orderCount: 35 },
  { date: '2026-10-16', label: 'Fri', revenueInCents: 742000, orderCount: 46 },
  { date: '2026-10-17', label: 'Sat', revenueInCents: 890000, orderCount: 52 },
  { date: '2026-10-18', label: 'Sun', revenueInCents: 688000, orderCount: 42 },
];

export const MOCK_RECENT_ORDERS: AdminRecentOrder[] = [
  {
    id: 'ord-001',
    orderNumber: 'ORD-20261018-9104',
    customerName: 'Alex Morgan',
    customerEmail: 'alex.morgan@example.com',
    totalInCents: 57998,
    status: 'PENDING',
    itemsCount: 2,
    createdAt: '12 minutes ago',
  },
  {
    id: 'ord-002',
    orderNumber: 'ORD-20261018-8742',
    customerName: 'Elena Vance',
    customerEmail: 'elena.vance@example.com',
    totalInCents: 38999,
    status: 'CONFIRMED',
    itemsCount: 1,
    createdAt: '1 hour ago',
  },
  {
    id: 'ord-003',
    orderNumber: 'ORD-20261017-7621',
    customerName: 'Marcus Chen',
    customerEmail: 'marcus.chen@example.com',
    totalInCents: 12999,
    status: 'SHIPPED',
    itemsCount: 1,
    createdAt: '4 hours ago',
  },
  {
    id: 'ord-004',
    orderNumber: 'ORD-20261016-6419',
    customerName: 'Sarah Jenkins',
    customerEmail: 'sarah.jenkins@example.com',
    totalInCents: 24999,
    status: 'DELIVERED',
    itemsCount: 1,
    createdAt: '1 day ago',
  },
  {
    id: 'ord-005',
    orderNumber: 'ORD-20261015-5201',
    customerName: 'David Ross',
    customerEmail: 'david.ross@example.com',
    totalInCents: 8999,
    status: 'CANCELLED',
    itemsCount: 1,
    createdAt: '2 days ago',
  },
];

export const MOCK_CRITICAL_INVENTORY: AdminInventoryAlert[] = [
  {
    id: 'prod-003',
    name: 'Ultralight Silnylon Bivy Shelter',
    sku: 'TNT-ULB-003',
    categoryName: 'Tents & Shelters',
    stock: 0,
    stockStatus: 'OUT_OF_STOCK',
  },
  {
    id: 'prod-012',
    name: 'Portable Windproof Camp Stove',
    sku: 'KIT-PWS-004',
    categoryName: 'Camp Kitchen',
    stock: 0,
    stockStatus: 'OUT_OF_STOCK',
  },
  {
    id: 'prod-010',
    name: 'Titanium 2-Pot Ultralight Cookset',
    sku: 'KIT-TP2-002',
    categoryName: 'Camp Kitchen',
    stock: 1,
    stockStatus: 'LOW_STOCK',
  },
  {
    id: 'prod-005',
    name: 'Traverse Pro 65L Expedition Pack',
    sku: 'BPK-TP65-001',
    categoryName: 'Backpacks & Packs',
    stock: 2,
    stockStatus: 'LOW_STOCK',
  },
  {
    id: 'prod-002',
    name: 'Alpine Fortress 4-Season Expedition Tent',
    sku: 'TNT-AF4-002',
    categoryName: 'Tents & Shelters',
    stock: 3,
    stockStatus: 'LOW_STOCK',
  },
];
