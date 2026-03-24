import { useState, useCallback } from 'react';
import {
  POSScreen, SaleState, CartItem, Product,
  createEmptySale, generateTransactionId, getCartTotal,
} from '@/data/posProducts';

import ScanScreen from './ScanScreen';
import TenderScreen from './TenderScreen';
import CashPaymentScreen from './CashPaymentScreen';
import CardPaymentScreen from './CardPaymentScreen';
import SplitTenderScreen from './SplitTenderScreen';
import ReceiptScreen from './ReceiptScreen';

export default function POSTerminal() {
  const [screen, setScreen] = useState<POSScreen>('scanning');
  const [sale, setSale] = useState<SaleState>(createEmptySale());

  const updateSale = useCallback((updates: Partial<SaleState>) => {
    setSale(prev => ({ ...prev, ...updates }));
  }, []);

  const addProduct = useCallback((product: Product, variantId?: string) => {
    setSale(prev => {
      const variant = variantId ? product.variants?.find(v => v.id === variantId) : undefined;
      const existingIdx = prev.cart.findIndex(
        i => i.product.id === product.id && i.selectedVariant?.id === variant?.id
      );
      if (existingIdx >= 0) {
        const updated = [...prev.cart];
        updated[existingIdx] = { ...updated[existingIdx], quantity: updated[existingIdx].quantity + 1 };
        return { ...prev, cart: updated };
      }
      const newItem: CartItem = {
        id: `ci-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        product, selectedVariant: variant, quantity: 1, lineDiscount: 0,
      };
      return { ...prev, cart: [...prev.cart, newItem] };
    });
  }, []);

  const updateQty = useCallback((itemId: string, delta: number) => {
    setSale(prev => {
      const updated = prev.cart.map(i => {
        if (i.id === itemId) {
          const newQty = i.quantity + delta;
          return newQty > 0 ? { ...i, quantity: newQty } : i;
        }
        return i;
      }).filter(i => i.quantity > 0);
      return { ...prev, cart: updated };
    });
  }, []);

  const removeItem = useCallback((itemId: string) => {
    setSale(prev => ({ ...prev, cart: prev.cart.filter(i => i.id !== itemId) }));
  }, []);

  const clearCart = useCallback(() => {
    setSale(prev => ({ ...prev, cart: [] }));
  }, []);

  const resetSale = useCallback(() => {
    setSale(createEmptySale());
    setScreen('scanning');
  }, []);

  const total = getCartTotal(sale.cart, sale.orderDiscount);

  if (screen === 'scanning') {
    return (
      <div className="h-screen bg-background">
        <ScanScreen
          cart={sale.cart}
          orderDiscount={sale.orderDiscount}
          onAddProduct={addProduct}
          onUpdateQty={updateQty}
          onRemove={removeItem}
          onClear={clearCart}
          onCheckout={() => setScreen('tender')}
        />
      </div>
    );
  }

  if (screen === 'tender') {
    return (
      <div className="h-screen bg-background">
        <TenderScreen
          total={total}
          onSelect={(method) => {
            updateSale({ tenderMethod: method, transactionId: generateTransactionId() });
            if (method === 'cash') setScreen('cashPayment');
            else if (method === 'card') setScreen('cardPayment');
            else setScreen('splitTender');
          }}
          onBack={() => setScreen('scanning')}
        />
      </div>
    );
  }

  if (screen === 'cashPayment') {
    return (
      <div className="h-screen bg-background">
        <CashPaymentScreen
          total={total}
          onComplete={(cashReceived) => {
            updateSale({ cashReceived });
            setScreen('receipt');
          }}
          onBack={() => setScreen('tender')}
        />
      </div>
    );
  }

  if (screen === 'cardPayment') {
    return (
      <div className="h-screen bg-background">
        <CardPaymentScreen
          total={total}
          onComplete={() => setScreen('receipt')}
          onBack={() => setScreen('tender')}
        />
      </div>
    );
  }

  if (screen === 'splitTender') {
    return (
      <div className="h-screen bg-background">
        <SplitTenderScreen
          total={total}
          onComplete={(cashAmount) => {
            updateSale({ splitCashAmount: cashAmount });
            setScreen('receipt');
          }}
          onBack={() => setScreen('tender')}
        />
      </div>
    );
  }

  if (screen === 'receipt') {
    return (
      <div className="h-screen bg-background">
        <ReceiptScreen
          total={total}
          tenderMethod={sale.tenderMethod!}
          cashReceived={sale.cashReceived}
          splitCashAmount={sale.splitCashAmount}
          transactionId={sale.transactionId}
          onNewSale={resetSale}
        />
      </div>
    );
  }

  return null;
}
