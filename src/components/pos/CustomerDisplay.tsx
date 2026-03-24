import { CartItem, getCartSubtotal, getCartTax, getCartTotal } from '@/data/posProducts';
import { Check, CreditCard, Loader2 } from 'lucide-react';

interface CustomerDisplayProps {
  cart: CartItem[];
  orderDiscount: number;
  paymentState: 'scanning' | 'paying' | 'processing' | 'complete';
  total: number;
  tenderMethod?: 'cash' | 'card' | 'split' | null;
}

export default function CustomerDisplay({ cart, orderDiscount, paymentState, total, tenderMethod }: CustomerDisplayProps) {
  const subtotal = getCartSubtotal(cart);
  const tax = getCartTax(cart, orderDiscount);
  const itemCount = cart.reduce((s, i) => s + i.quantity, 0);

  return (
    <div className="h-screen bg-background flex flex-col pos-fade-in">
      {/* Header */}
      <div className="h-14 px-8 flex items-center justify-between border-b border-border/20">
        <div className="flex items-center gap-2">
          <span className="text-lg">⚽</span>
          <span className="text-sm font-semibold text-foreground tracking-tight">Stadium Store</span>
        </div>
        <p className="text-xs text-muted-foreground">Your transaction</p>
      </div>

      {/* Content */}
      <div className="flex-1 flex">
        {/* Items */}
        <div className="flex-1 px-8 py-6 overflow-y-auto">
          {cart.length === 0 ? (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <p className="text-lg font-medium text-muted-foreground/40">Welcome</p>
                <p className="text-sm text-muted-foreground/30 mt-1">Items will appear as they are scanned</p>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              {cart.map((item) => (
                <div key={item.id} className="flex items-center justify-between py-2.5 border-b border-border/15 pos-slide-up">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm" style={{ backgroundColor: item.product.color + '20' }}>
                      {item.product.emoji}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{item.product.name}</p>
                      {item.selectedVariant && (
                        <p className="text-xs text-muted-foreground">Size {item.selectedVariant.label}</p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-foreground">${(item.product.price * item.quantity).toFixed(2)}</p>
                    {item.quantity > 1 && (
                      <p className="text-xs text-muted-foreground">×{item.quantity}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Summary panel */}
        <div className="w-72 bg-card/30 border-l border-border/20 p-6 flex flex-col justify-end">
          {cart.length > 0 && (
            <div>
              <div className="space-y-1.5 mb-4">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{itemCount} item{itemCount !== 1 ? 's' : ''}</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Tax</span>
                  <span>${tax.toFixed(2)}</span>
                </div>
              </div>
              <div className="pt-3 border-t border-border/20">
                <div className="flex justify-between items-baseline">
                  <span className="text-sm font-medium text-muted-foreground">Total</span>
                  <span className="text-3xl font-extrabold text-primary">${total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          )}

          {/* Payment states */}
          {paymentState === 'paying' && (
            <div className="mt-6 p-4 rounded-xl bg-primary/5 text-center pos-fade-in">
              <CreditCard className="w-6 h-6 text-primary mx-auto mb-2 animate-pulse" />
              <p className="text-sm font-medium text-foreground">Please pay</p>
              <p className="text-xs text-muted-foreground capitalize">{tenderMethod === 'split' ? 'Split payment' : tenderMethod}</p>
            </div>
          )}
          {paymentState === 'processing' && (
            <div className="mt-6 p-4 rounded-xl bg-primary/5 text-center pos-fade-in">
              <Loader2 className="w-6 h-6 text-primary mx-auto mb-2 animate-spin" />
              <p className="text-sm font-medium text-foreground">Processing...</p>
            </div>
          )}
          {paymentState === 'complete' && (
            <div className="mt-6 p-4 rounded-xl bg-success/10 text-center pos-scale-in">
              <Check className="w-6 h-6 text-success mx-auto mb-2" strokeWidth={3} />
              <p className="text-sm font-bold text-success">Thank you!</p>
              <p className="text-xs text-muted-foreground mt-0.5">Transaction complete</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
