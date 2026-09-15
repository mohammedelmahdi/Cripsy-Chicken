/**
 * Centralized Type Definitions for Cripsy Chicken POS (Phase 0 Foundation)
 */

// User Roles & Authentication
export enum UserRole {
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER',
  CASHIER = 'CASHIER',
  KITCHEN = 'KITCHEN'
}

export interface User {
  id: string;
  name: string;
  role: UserRole;
  pinHash: string; // PINs are never stored as plain text
  createdAt: string;
}

export interface Session {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
}

// Order Types & Centralized States
export enum OrderType {
  COUNTER = 'COUNTER',
  DINE_IN = 'DINE_IN',
  DELIVERY = 'DELIVERY',
  ONLINE = 'ONLINE'
}

export enum OrderStatus {
  DRAFT = 'DRAFT',
  NEW_ONLINE = 'NEW_ONLINE', // Customer submitted, pending cashier acceptance
  REJECTED = 'REJECTED',     // Online order rejected
  CONFIRMED = 'CONFIRMED',   // Confirmed by cashier
  PAID = 'PAID',             // Payment received
  PRINTED = 'PRINTED',       // Receipt printed
  PREPARING = 'PREPARING',   // Being prepared in the kitchen
  READY = 'READY',           // Ready for delivery/takeaway
  COMPLETED = 'COMPLETED'    // Order finalized
}

// Order State Lifecycle Validation Helper
export const ORDER_LIFECYCLE_STEPS: Record<OrderType, OrderStatus[]> = {
  [OrderType.COUNTER]: [
    OrderStatus.DRAFT,
    OrderStatus.CONFIRMED,
    OrderStatus.PAID,
    OrderStatus.PRINTED,
    OrderStatus.COMPLETED
  ],
  [OrderType.DINE_IN]: [
    OrderStatus.DRAFT, // Select table -> Create order
    OrderStatus.CONFIRMED,
    OrderStatus.PAID, // Dine-in payment can happen before order or after
    OrderStatus.PRINTED,
    OrderStatus.PREPARING,
    OrderStatus.COMPLETED
  ],
  [OrderType.DELIVERY]: [
    OrderStatus.DRAFT,
    OrderStatus.CONFIRMED, // Payment (Cash on delivery) happens later
    OrderStatus.PRINTED,
    OrderStatus.PREPARING,
    OrderStatus.READY,
    OrderStatus.COMPLETED // Completed on delivery payment
  ],
  [OrderType.ONLINE]: [
    OrderStatus.NEW_ONLINE, // Customer submits
    OrderStatus.CONFIRMED,  // Cashier accepts -> converted to POS order
    OrderStatus.PRINTED,    // Kitchen print
    OrderStatus.PREPARING,
    OrderStatus.READY,
    OrderStatus.COMPLETED
  ]
};

// Payment Methods
export enum PaymentMethod {
  CASH = 'CASH',
  CASH_ON_DELIVERY = 'CASH_ON_DELIVERY',
  ONLINE_CARD = 'ONLINE_CARD'
}

// Product Categories
export enum ProductCategory {
  BURGERS = 'BURGERS',
  TACOS = 'TACOS',
  SANDWICHES = 'SANDWICHES',
  PIZZA = 'PIZZA',
  MENUS_COMBOS = 'MENUS_COMBOS',
  DRINKS = 'DRINKS',
  DESSERTS = 'DESSERTS',
  EXTRAS = 'EXTRAS',
  OTHER = 'OTHER'
}

// Centralized Application Configuration (Multi-Restaurant-Ready)
export interface RestaurantBranding {
  primaryColor: string;    // Crispy Orange
  accentColor: string;     // Golden Crunch
  backgroundColor: string; // Cream White
  textColor: string;       // Dark Cocoa
  logoUrl?: string;
  fontFamily: string;
}

export interface ReceiptSettings {
  showLogo: boolean;
  headerText?: string;
  footerText?: string;
  showCashierName: boolean;
  printKitchenTicket: boolean;
}

export interface PrinterSettings {
  ipAddress?: string;
  port?: number;
  paperWidth: '58mm' | '80mm';
  printCopies: number;
}

export interface RestaurantConfig {
  id: string;
  name: string;
  address: string;
  phone: string;
  currency: string;      // DZD / DA
  defaultLanguage: 'ar' | 'en';
  branding: RestaurantBranding;
  receiptSettings: ReceiptSettings;
  printerSettings: PrinterSettings;
}

// Language and Localization Types
export type SupportedLanguage = 'ar' | 'en';

export interface TranslationSchema {
  common: {
    dashboard: string;
    login: string;
    logout: string;
    save: string;
    cancel: string;
    back: string;
    search: string;
    status: string;
    actions: string;
    total: string;
    loading: string;
    error: string;
    success: string;
  };
  auth: {
    enterPin: string;
    invalidPin: string;
    authRequired: string;
    loginSuccess: string;
    clear: string;
  };
  pos: {
    title: string;
    newOrder: string;
    cart: string;
    checkout: string;
    selectCategory: string;
    emptyCart: string;
    customerName: string;
    paymentMethod: string;
    orderType: string;
  };
  menu: {
    burgers: string;
    tacos: string;
    sandwiches: string;
    pizza: string;
    combos: string;
    drinks: string;
    desserts: string;
    extras: string;
    other: string;
  };
  sections: {
    pos: string;
    tables: string;
    orders: string;
    onlineOrders: string;
    products: string;
    inventory: string;
    suppliers: string;
    expenses: string;
    reports: string;
    staff: string;
    settings: string;
    auditLog: string;
  };
}

// Local Database (IndexedDB) & Sync Models
export interface SyncQueueItem {
  id: string; // UUID to prevent collisions
  operation: 'CREATE' | 'UPDATE' | 'DELETE';
  entity: string; // e.g., 'orders', 'payments', 'cash_sessions'
  entityId: string;
  payload: any;
  status: 'PENDING' | 'SYNCING' | 'FAILED' | 'SUCCESS';
  retryCount: number;
  createdAt: string;
  syncedAt?: string;
}

// Cash Register Session
export interface CashSession {
  id: string;
  openedByUserId: string;
  openedAt: string;
  closedAt?: string;
  openingCash: number;
  closingCashExpected?: number;
  closingCashActual?: number;
  difference?: number;
  status: 'OPEN' | 'CLOSED';
}
