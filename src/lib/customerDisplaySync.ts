import { useEffect, useState } from 'react';
import type { CartItem, POSScreen, SaleState } from '@/data/posProducts';
import { getCartTotal } from '@/data/posProducts';

export const CUSTOMER_DISPLAY_CHANNEL = 'scs-tix-customer-display';

/** Dedicated route for the customer-facing screen (second monitor / pole display). */
export const CUSTOMER_DISPLAY_PATH = '/customer-display';

/** Opens (or focuses) the customer display window — same name reuses one window. */
export function openCustomerDisplayWindow(): Window | null {
  const url = `${window.location.origin}${CUSTOMER_DISPLAY_PATH}`;
  return window.open(
    url,
    'scsTixCustomerDisplay',
    'noopener,noreferrer,width=1200,height=1600,menubar=no,toolbar=no,location=no,status=no',
  );
}

export type CustomerDisplayPaymentState = 'scanning' | 'paying' | 'processing' | 'complete';

export type CustomerDisplayPayload = {
  cart: CartItem[];
  orderDiscount: number;
  total: number;
  paymentState: CustomerDisplayPaymentState;
  tenderMethod: 'cash' | 'card' | 'split' | null;
  transactionId: string;
};

export function mapScreenToCustomerPaymentState(screen: POSScreen): CustomerDisplayPaymentState {
  switch (screen) {
    case 'scanning':
      return 'scanning';
    case 'tender':
      return 'paying';
    case 'cashPayment':
    case 'cardPayment':
    case 'splitTender':
      return 'processing';
    case 'receipt':
      return 'complete';
    default:
      return 'scanning';
  }
}

export function buildCustomerDisplayPayload(
  sale: SaleState,
  screen: POSScreen,
): CustomerDisplayPayload {
  return {
    cart: sale.cart,
    orderDiscount: sale.orderDiscount,
    total: getCartTotal(sale.cart, sale.orderDiscount),
    paymentState: mapScreenToCustomerPaymentState(screen),
    tenderMethod: sale.tenderMethod,
    transactionId: sale.transactionId,
  };
}

function getChannel(): BroadcastChannel | null {
  if (typeof BroadcastChannel === 'undefined') return null;
  return new BroadcastChannel(CUSTOMER_DISPLAY_CHANNEL);
}

const SNAPSHOT_KEY = 'scs-tix-customer-display-snapshot';

function persistSnapshot(payload: CustomerDisplayPayload): void {
  try {
    localStorage.setItem(SNAPSHOT_KEY, JSON.stringify(payload));
  } catch {
    /* private mode / quota */
  }
}

export function readCustomerDisplaySnapshot(): CustomerDisplayPayload | null {
  try {
    const raw = localStorage.getItem(SNAPSHOT_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as CustomerDisplayPayload;
  } catch {
    return null;
  }
}

export function broadcastCustomerDisplay(payload: CustomerDisplayPayload): void {
  persistSnapshot(payload);
  const ch = getChannel();
  if (!ch) return;
  try {
    ch.postMessage(payload);
  } finally {
    ch.close();
  }
}

/** Call from the register — mirrors live cart & payment step to any open customer display window. */
export function useCustomerDisplayBroadcast(sale: SaleState, screen: POSScreen): void {
  useEffect(() => {
    broadcastCustomerDisplay(buildCustomerDisplayPayload(sale, screen));
  }, [sale, screen]);
}

export function useCustomerDisplayReceiver(): CustomerDisplayPayload | null {
  const [state, setState] = useState<CustomerDisplayPayload | null>(() => readCustomerDisplaySnapshot());

  useEffect(() => {
    const apply = (data: CustomerDisplayPayload | null) => {
      if (data && typeof data === 'object' && 'cart' in data) setState(data);
    };

    const ch = getChannel();
    const onMessage = (ev: MessageEvent<CustomerDisplayPayload>) => {
      apply(ev.data);
    };
    if (ch) ch.addEventListener('message', onMessage);

    const onStorage = (e: StorageEvent) => {
      if (e.key === SNAPSHOT_KEY && e.newValue) {
        try {
          apply(JSON.parse(e.newValue) as CustomerDisplayPayload);
        } catch {
          /* ignore */
        }
      }
    };
    window.addEventListener('storage', onStorage);

    return () => {
      if (ch) {
        ch.removeEventListener('message', onMessage);
        ch.close();
      }
      window.removeEventListener('storage', onStorage);
    };
  }, []);

  return state;
}
