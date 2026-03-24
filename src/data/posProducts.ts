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
  barcode: string;
  price: number;
  category: string;
  emoji: string;
  variants?: ProductVariant[];
  inStock: boolean;
  color: string;
}

export interface CartItem {
  id: string;
  product: Product;
  selectedVariant?: ProductVariant;
  quantity: number;
  lineDiscount: number;
}

export type POSScreen =
  | 'scanning'
  | 'tender'
  | 'cashPayment'
  | 'cardPayment'
  | 'splitTender'
  | 'receipt';

export interface SaleState {
  cart: CartItem[];
  orderDiscount: number;
  tenderMethod: 'cash' | 'card' | 'split' | null;
  cashReceived: number;
  splitCashAmount: number;
  transactionId: string;
}

export const PRODUCTS: Product[] = [
  {
    id: 'p1', name: 'Home Jersey 24/25', sku: 'JRS-HOME-2425', barcode: '5901234123457',
    price: 89.99, category: 'jerseys', emoji: '👕', color: '#1a3a5c', inStock: true,
    variants: [
      { id: 'v1', label: 'S', type: 'size', inStock: true },
      { id: 'v2', label: 'M', type: 'size', inStock: true },
      { id: 'v3', label: 'L', type: 'size', inStock: true },
      { id: 'v4', label: 'XL', type: 'size', inStock: true },
      { id: 'v5', label: 'XXL', type: 'size', inStock: false },
    ],
  },
  {
    id: 'p2', name: 'Away Jersey 24/25', sku: 'JRS-AWAY-2425', barcode: '5901234123464',
    price: 89.99, category: 'jerseys', emoji: '👕', color: '#f5f5f0', inStock: true,
    variants: [
      { id: 'v6', label: 'S', type: 'size', inStock: true },
      { id: 'v7', label: 'M', type: 'size', inStock: true },
      { id: 'v8', label: 'L', type: 'size', inStock: false },
      { id: 'v9', label: 'XL', type: 'size', inStock: true },
    ],
  },
  {
    id: 'p3', name: 'Club Scarf', sku: 'ACC-SCRF-001', barcode: '5901234123471',
    price: 24.99, category: 'accessories', emoji: '🧣', color: '#8b1a1a', inStock: true,
  },
  {
    id: 'p4', name: 'Black Cap', sku: 'HW-CAP-BLK', barcode: '5901234123488',
    price: 29.99, category: 'headwear', emoji: '🧢', color: '#1a1a1a', inStock: true,
  },
  {
    id: 'p5', name: 'Stadium Mug', sku: 'DW-MUG-STD', barcode: '5901234123495',
    price: 14.99, category: 'drinkware', emoji: '☕', color: '#2d4a3e', inStock: true,
  },
  {
    id: 'p6', name: 'Supporter Wristband', sku: 'ACC-WB-001', barcode: '5901234123501',
    price: 7.99, category: 'accessories', emoji: '💪', color: '#4a3d8f', inStock: true,
  },
  {
    id: 'p7', name: 'Mini Football', sku: 'FAN-BALL-MINI', barcode: '5901234123518',
    price: 19.99, category: 'fan-items', emoji: '⚽', color: '#3d6b35', inStock: true,
  },
  {
    id: 'p8', name: 'Training Tee', sku: 'JRS-TRAIN-001', barcode: '5901234123525',
    price: 39.99, category: 'jerseys', emoji: '👕', color: '#2a2a3d', inStock: true,
    variants: [
      { id: 'v10', label: 'S', type: 'size', inStock: true },
      { id: 'v11', label: 'M', type: 'size', inStock: true },
      { id: 'v12', label: 'L', type: 'size', inStock: true },
      { id: 'v13', label: 'XL', type: 'size', inStock: true },
    ],
  },
  {
    id: 'p9', name: 'Sports Bottle', sku: 'DW-BTL-SPT', barcode: '5901234123532',
    price: 16.99, category: 'drinkware', emoji: '🍶', color: '#1a4a6b', inStock: true,
  },
  {
    id: 'p10', name: 'Fan Flag', sku: 'FAN-FLG-001', barcode: '5901234123549',
    price: 12.99, category: 'fan-items', emoji: '🚩', color: '#6b3a1a', inStock: false,
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
    orderDiscount: 0,
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

export function findProductByBarcode(barcode: string): Product | undefined {
  return PRODUCTS.find(p => p.barcode === barcode);
}

export function searchProducts(query: string): Product[] {
  const q = query.toLowerCase().trim();
  if (!q) return [];
  return PRODUCTS.filter(
    p => p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q) || p.barcode.includes(q)
  );
}
