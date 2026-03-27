import type { CartItem } from './posProducts';

const STORAGE_KEY = 'scs-tix-parked-sales';

/** Subset of sale state persisted when parking (matches plan; extend when SaleState gains fields). */
export interface SaleSnapshot {
  cart: CartItem[];
  orderDiscount: number;
  customerId: string | null;
}

export interface ParkedSale {
  id: string;
  createdAt: string;
  label: string;
  saleSnapshot: SaleSnapshot;
  note?: string;
}

export const MAX_PARKED_SALES = 10;

export type ParkSaleResult =
  | { ok: true; parked: ParkedSale }
  | { ok: false; reason: 'max_reached' };

function generateId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `park-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

export function formatParkedLabel(date: Date = new Date()): string {
  return `Parked ${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}`;
}

function isCartItem(row: unknown): row is CartItem {
  return (
    !!row &&
    typeof row === 'object' &&
    typeof (row as CartItem).id === 'string' &&
    typeof (row as CartItem).quantity === 'number' &&
    (row as CartItem).product &&
    typeof (row as CartItem).product === 'object'
  );
}

function parseSaleSnapshot(raw: unknown): SaleSnapshot | null {
  if (!raw || typeof raw !== 'object') return null;
  const o = raw as Record<string, unknown>;
  const cart = o.cart;
  if (!Array.isArray(cart) || !cart.every(isCartItem)) return null;
  if (typeof o.orderDiscount !== 'number') return null;
  const cid = o.customerId;
  if (cid !== null && typeof cid !== 'string') return null;
  return {
    cart,
    orderDiscount: o.orderDiscount,
    customerId: cid,
  };
}

function readAll(): ParkedSale[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map((row): ParkedSale | null => {
        if (!row || typeof row !== 'object') return null;
        const r = row as Record<string, unknown>;
        if (typeof r.id !== 'string' || typeof r.createdAt !== 'string' || typeof r.label !== 'string')
          return null;
        const snap = parseSaleSnapshot(r.saleSnapshot);
        if (!snap) return null;
        const parked: ParkedSale = {
          id: r.id,
          createdAt: r.createdAt,
          label: r.label,
          saleSnapshot: snap,
        };
        if (typeof r.note === 'string' && r.note.trim()) parked.note = r.note.trim();
        return parked;
      })
      .filter((x): x is ParkedSale => x !== null);
  } catch {
    return [];
  }
}

function writeAll(items: ParkedSale[]): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export function getAllParkedSales(): ParkedSale[] {
  return readAll().sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function getParkedSaleById(id: string): ParkedSale | undefined {
  return readAll().find(p => p.id === id);
}

export function getParkedSalesCount(): number {
  return readAll().length;
}

export function parkSale(
  saleSnapshot: SaleSnapshot,
  options?: { note?: string; label?: string }
): ParkSaleResult {
  const all = readAll();
  if (all.length >= MAX_PARKED_SALES) {
    return { ok: false, reason: 'max_reached' };
  }
  const parked: ParkedSale = {
    id: generateId(),
    createdAt: new Date().toISOString(),
    label: options?.label ?? formatParkedLabel(),
    saleSnapshot: JSON.parse(JSON.stringify(saleSnapshot)) as SaleSnapshot,
    ...(options?.note?.trim() ? { note: options.note.trim() } : {}),
  };
  all.push(parked);
  writeAll(all);
  return { ok: true, parked };
}

export function removeParkedSale(id: string): boolean {
  const all = readAll();
  const next = all.filter(p => p.id !== id);
  if (next.length === all.length) return false;
  writeAll(next);
  return true;
}
