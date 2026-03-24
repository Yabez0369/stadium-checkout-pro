export interface ProductVariant {
  id: string;
  label: string;
  type: 'size' | 'color';
  inStock: boolean;
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  price: number;
  category: string;
  emoji: string;
  variants?: ProductVariant[];
  inStock: boolean;
  color: string; // bg color for product card
}

export interface CartItem {
  id: string;
  product: Product;
  selectedVariant?: ProductVariant;
  quantity: number;
  lineDiscount: number;
}

export type POSScreen =
  | 'ready'
  | 'selling'
  | 'cartReview'
  | 'customerAttach'
  | 'saleActions'
  | 'tender'
  | 'cashPayment'
  | 'cardPayment'
  | 'splitTender'
  | 'paymentSuccess'
  | 'receipt';

export interface SaleState {
  cart: CartItem[];
  customer: { name: string; memberId: string } | null;
  orderNote: string;
  orderDiscount: number;
  discountCode: string;
  isGift: boolean;
  giftReceipt: boolean;
  tenderMethod: 'cash' | 'card' | 'split' | null;
  cashReceived: number;
  splitCashAmount: number;
  transactionId: string;
}

export const CATEGORIES = [
  { id: 'all', label: 'All Items', emoji: '⚡' },
  { id: 'jerseys', label: 'Jerseys', emoji: '👕' },
  { id: 'headwear', label: 'Headwear', emoji: '🧢' },
  { id: 'accessories', label: 'Accessories', emoji: '⌚' },
  { id: 'drinkware', label: 'Drinkware', emoji: '☕' },
  { id: 'footwear', label: 'Footwear', emoji: '👟' },
  { id: 'fan-items', label: 'Fan Items', emoji: '🏟️' },
];

export const PRODUCTS: Product[] = [
  {
    id: 'p1',
    name: 'Home Jersey 24/25',
    sku: 'JRS-HOME-2425',
    price: 89.99,
    category: 'jerseys',
    emoji: '👕',
    color: '#1a3a5c',
    inStock: true,
    variants: [
      { id: 'v1', label: 'S', type: 'size', inStock: true },
      { id: 'v2', label: 'M', type: 'size', inStock: true },
      { id: 'v3', label: 'L', type: 'size', inStock: true },
      { id: 'v4', label: 'XL', type: 'size', inStock: true },
      { id: 'v5', label: 'XXL', type: 'size', inStock: false },
    ],
  },
  {
    id: 'p2',
    name: 'Away Jersey 24/25',
    sku: 'JRS-AWAY-2425',
    price: 89.99,
    category: 'jerseys',
    emoji: '👕',
    color: '#f5f5f0',
    inStock: true,
    variants: [
      { id: 'v6', label: 'S', type: 'size', inStock: true },
      { id: 'v7', label: 'M', type: 'size', inStock: true },
      { id: 'v8', label: 'L', type: 'size', inStock: false },
      { id: 'v9', label: 'XL', type: 'size', inStock: true },
    ],
  },
  {
    id: 'p3',
    name: 'Club Scarf',
    sku: 'ACC-SCRF-001',
    price: 24.99,
    category: 'accessories',
    emoji: '🧣',
    color: '#8b1a1a',
    inStock: true,
  },
  {
    id: 'p4',
    name: 'Black Cap',
    sku: 'HW-CAP-BLK',
    price: 29.99,
    category: 'headwear',
    emoji: '🧢',
    color: '#1a1a1a',
    inStock: true,
  },
  {
    id: 'p5',
    name: 'Stadium Mug',
    sku: 'DW-MUG-STD',
    price: 14.99,
    category: 'drinkware',
    emoji: '☕',
    color: '#2d4a3e',
    inStock: true,
  },
  {
    id: 'p6',
    name: 'Supporter Wristband',
    sku: 'ACC-WB-001',
    price: 7.99,
    category: 'accessories',
    emoji: '💪',
    color: '#4a3d8f',
    inStock: true,
  },
  {
    id: 'p7',
    name: 'Mini Football',
    sku: 'FAN-BALL-MINI',
    price: 19.99,
    category: 'fan-items',
    emoji: '⚽',
    color: '#3d6b35',
    inStock: true,
  },
  {
    id: 'p8',
    name: 'Training Tee',
    sku: 'JRS-TRAIN-001',
    price: 39.99,
    category: 'jerseys',
    emoji: '👕',
    color: '#2a2a3d',
    inStock: true,
    variants: [
      { id: 'v10', label: 'S', type: 'size', inStock: true },
      { id: 'v11', label: 'M', type: 'size', inStock: true },
      { id: 'v12', label: 'L', type: 'size', inStock: true },
      { id: 'v13', label: 'XL', type: 'size', inStock: true },
    ],
  },
  {
    id: 'p9',
    name: 'Sports Bottle',
    sku: 'DW-BTL-SPT',
    price: 16.99,
    category: 'drinkware',
    emoji: '🍶',
    color: '#1a4a6b',
    inStock: true,
  },
  {
    id: 'p10',
    name: 'Fan Flag',
    sku: 'FAN-FLG-001',
    price: 12.99,
    category: 'fan-items',
    emoji: '🚩',
    color: '#6b3a1a',
    inStock: false,
  },
];

export const TAX_RATE = 0.08;

export function generateTransactionId(): string {
  const now = new Date();
  const datePart = now.toISOString().slice(2, 10).replace(/-/g, '');
  const rand = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `TXN-${datePart}-${rand}`;
}

export function createEmptySale(): SaleState {
  return {
    cart: [],
    customer: null,
    orderNote: '',
    orderDiscount: 0,
    discountCode: '',
    isGift: false,
    giftReceipt: false,
    tenderMethod: null,
    cashReceived: 0,
    splitCashAmount: 0,
    transactionId: '',
  };
}

export function getCartSubtotal(cart: CartItem[]): number {
  return cart.reduce((sum, item) => sum + item.product.price * item.quantity - item.lineDiscount, 0);
}

export function getCartTax(cart: CartItem[], orderDiscount: number): number {
  return (getCartSubtotal(cart) - orderDiscount) * TAX_RATE;
}

export function getCartTotal(cart: CartItem[], orderDiscount: number): number {
  const sub = getCartSubtotal(cart) - orderDiscount;
  return sub + sub * TAX_RATE;
}
