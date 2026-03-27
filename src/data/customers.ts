const STORAGE_KEY = 'scs-tix-customers';

export interface Customer {
  id: string;
  displayName: string;
  phone?: string;
  email?: string;
  createdAt: string;
  loyaltyId?: string;
}

export type CreateCustomerInput = {
  displayName: string;
  phone?: string;
  email?: string;
  loyaltyId?: string;
};

function generateId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `cust-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

function readAll(): Customer[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (row): row is Customer =>
        row &&
        typeof row === 'object' &&
        typeof row.id === 'string' &&
        typeof row.displayName === 'string' &&
        typeof row.createdAt === 'string'
    );
  } catch {
    return [];
  }
}

function writeAll(customers: Customer[]): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(customers));
}

export function getAllCustomers(): Customer[] {
  return readAll();
}

export function getCustomerById(id: string): Customer | undefined {
  return readAll().find(c => c.id === id);
}

export function searchCustomers(query: string): Customer[] {
  const q = query.trim().toLowerCase();
  if (!q) return getAllCustomers();
  return getAllCustomers().filter(c => {
    const name = c.displayName.toLowerCase();
    const phone = (c.phone ?? '').toLowerCase();
    const email = (c.email ?? '').toLowerCase();
    const loyalty = (c.loyaltyId ?? '').toLowerCase();
    return (
      name.includes(q) ||
      phone.includes(q) ||
      email.includes(q) ||
      loyalty.includes(q)
    );
  });
}

export function createCustomer(input: CreateCustomerInput): Customer {
  const customer: Customer = {
    id: generateId(),
    displayName: input.displayName.trim(),
    createdAt: new Date().toISOString(),
    ...(input.phone?.trim() ? { phone: input.phone.trim() } : {}),
    ...(input.email?.trim() ? { email: input.email.trim() } : {}),
    ...(input.loyaltyId?.trim() ? { loyaltyId: input.loyaltyId.trim() } : {}),
  };
  const all = readAll();
  all.push(customer);
  writeAll(all);
  return customer;
}

export function updateCustomer(
  id: string,
  patch: Partial<Pick<Customer, 'displayName' | 'phone' | 'email' | 'loyaltyId'>>
): Customer | undefined {
  const all = readAll();
  const idx = all.findIndex(c => c.id === id);
  if (idx === -1) return undefined;
  const next = { ...all[idx] };
  if (patch.displayName !== undefined) next.displayName = patch.displayName.trim();
  if (patch.phone !== undefined) {
    const t = patch.phone.trim();
    if (t) next.phone = t;
    else delete next.phone;
  }
  if (patch.email !== undefined) {
    const t = patch.email.trim();
    if (t) next.email = t;
    else delete next.email;
  }
  if (patch.loyaltyId !== undefined) {
    const t = patch.loyaltyId.trim();
    if (t) next.loyaltyId = t;
    else delete next.loyaltyId;
  }
  all[idx] = next;
  writeAll(all);
  return next;
}

export function deleteCustomer(id: string): boolean {
  const all = readAll();
  const next = all.filter(c => c.id !== id);
  if (next.length === all.length) return false;
  writeAll(next);
  return true;
}
