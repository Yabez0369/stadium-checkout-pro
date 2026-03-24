import { useState, useCallback } from 'react';
import {
  POSScreen,
  SaleState,
  CartItem,
  Product,
  createEmptySale,
  generateTransactionId,
  getCartTotal,
  PRODUCTS,
} from '@/data/posProducts';

import ReadyScreen from './ReadyScreen';
import ProductScreen from './ProductScreen';
import CartSidebar from './CartSidebar';
import CartReviewScreen from './CartReviewScreen';
import CustomerAttachScreen from './CustomerAttachScreen';
import SaleActionsScreen from './SaleActionsScreen';
import TenderScreen from './TenderScreen';
import CashPaymentScreen from './CashPaymentScreen';
import CardPaymentScreen from './CardPaymentScreen';
import SplitTenderScreen from './SplitTenderScreen';
import PaymentSuccessScreen from './PaymentSuccessScreen';

const CASHIER_NAME = 'Alex Thompson';

export default function POSTerminal() {
  const [screen, setScreen] = useState<POSScreen>('ready');
  const [sale, setSale] = useState<SaleState>(createEmptySale());
  const [activeCategory, setActiveCategory] = useState('all');

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
        product,
        selectedVariant: variant,
        quantity: 1,
        lineDiscount: 0,
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
    setScreen('ready');
  }, []);

  const resetSale = useCallback(() => {
    setSale(createEmptySale());
    setActiveCategory('all');
    setScreen('ready');
  }, []);

  const total = getCartTotal(sale.cart, sale.orderDiscount);

  // Render logic
  if (screen === 'ready') {
    return (
      <div className="h-screen bg-background">
        <ReadyScreen cashierName={CASHIER_NAME} onNewSale={() => setScreen('selling')} />
      </div>
    );
  }

  if (screen === 'selling') {
    return (
      <div className="h-screen bg-background flex">
        <div className="flex-1 border-r border-border/50">
          <ProductScreen
            onAddProduct={addProduct}
            activeCategory={activeCategory}
            onCategoryChange={setActiveCategory}
          />
        </div>
        <div className="w-[380px] bg-card">
          <CartSidebar
            cart={sale.cart}
            orderDiscount={sale.orderDiscount}
            onUpdateQty={updateQty}
            onRemove={removeItem}
            onClear={clearCart}
            onCheckout={() => setScreen('cartReview')}
            onHoldSale={() => setScreen('ready')}
          />
        </div>
      </div>
    );
  }

  if (screen === 'cartReview') {
    return (
      <div className="h-screen bg-background">
        <CartReviewScreen
          cart={sale.cart}
          orderDiscount={sale.orderDiscount}
          onUpdateQty={updateQty}
          onRemove={removeItem}
          onBack={() => setScreen('selling')}
          onNext={() => setScreen('customerAttach')}
        />
      </div>
    );
  }

  if (screen === 'customerAttach') {
    return (
      <div className="h-screen bg-background">
        <CustomerAttachScreen
          onAttach={(customer) => {
            updateSale({ customer });
            setScreen('saleActions');
          }}
          onSkip={() => setScreen('saleActions')}
          onBack={() => setScreen('cartReview')}
        />
      </div>
    );
  }

  if (screen === 'saleActions') {
    return (
      <div className="h-screen bg-background">
        <SaleActionsScreen
          orderNote={sale.orderNote}
          discountCode={sale.discountCode}
          isGift={sale.isGift}
          giftReceipt={sale.giftReceipt}
          onUpdate={(data) => updateSale(data)}
          onBack={() => setScreen('customerAttach')}
          onNext={() => setScreen('tender')}
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
          onBack={() => setScreen('saleActions')}
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
            setScreen('paymentSuccess');
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
          onComplete={() => setScreen('paymentSuccess')}
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
            setScreen('paymentSuccess');
          }}
          onBack={() => setScreen('tender')}
        />
      </div>
    );
  }

  if (screen === 'paymentSuccess') {
    return (
      <div className="h-screen bg-background">
        <PaymentSuccessScreen
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
