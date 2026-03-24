import { CartItem, getCartSubtotal, getCartTax, getCartTotal } from '@/data/posProducts';
import { Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CartSidebarProps {
  cart: CartItem[];
  orderDiscount: number;
  onUpdateQty: (itemId: string, delta: number) => void;
  onRemove: (itemId: string) => void;
  onClear: () => void;
  onCheckout: () => void;
  onHoldSale: () => void;
}

export default function CartSidebar({ cart, orderDiscount, onUpdateQty, onRemove, onClear, onCheckout, onHoldSale }: CartSidebarProps) {
  const subtotal = getCartSubtotal(cart);
  const tax = getCartTax(cart, orderDiscount);
  const total = getCartTotal(cart, orderDiscount);
  const itemCount = cart.reduce((s, i) => s + i.quantity, 0);

  if (cart.length === 0) {
    return (
      <div className="flex flex-col h-full items-center justify-center px-6">
        <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center mb-4">
          <ShoppingBag className="w-7 h-7 text-muted-foreground" />
        </div>
        <p className="text-base font-medium text-muted-foreground">Cart is empty</p>
        <p className="text-sm text-pos-text-muted mt-1">Scan or tap products to start</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Cart header */}
      <div className="px-5 pt-4 pb-3 flex items-center justify-between border-b border-border/50">
        <div>
          <h2 className="text-base font-bold text-foreground">Current Sale</h2>
          <p className="text-xs text-muted-foreground">{itemCount} item{itemCount !== 1 ? 's' : ''}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="pos-ghost" size="pos-sm" onClick={onHoldSale} className="text-xs">
            Hold
          </Button>
          <Button variant="pos-danger" size="pos-sm" onClick={onClear} className="text-xs">
            Clear
          </Button>
        </div>
      </div>

      {/* Cart items */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
        {cart.map(item => (
          <div key={item.id} className="pos-card-elevated p-3 pos-slide-up">
            <div className="flex items-start gap-3">
              <div
                className="w-11 h-11 rounded-lg flex items-center justify-center text-xl flex-shrink-0"
                style={{ backgroundColor: item.product.color + '33' }}
              >
                {item.product.emoji}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">{item.product.name}</p>
                {item.selectedVariant && (
                  <p className="text-xs text-muted-foreground">Size: {item.selectedVariant.label}</p>
                )}
                <p className="text-xs text-muted-foreground">${item.product.price.toFixed(2)} each</p>
              </div>
              <button onClick={() => onRemove(item.id)} className="p-1.5 rounded-lg hover:bg-destructive/10 pos-transition">
                <Trash2 className="w-4 h-4 text-destructive/60" />
              </button>
            </div>
            <div className="flex items-center justify-between mt-2.5">
              <div className="flex items-center gap-1">
                <button
                  onClick={() => onUpdateQty(item.id, -1)}
                  className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center hover:bg-accent pos-transition active:scale-95"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-10 text-center text-sm font-bold">{item.quantity}</span>
                <button
                  onClick={() => onUpdateQty(item.id, 1)}
                  className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center hover:bg-accent pos-transition active:scale-95"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <span className="text-sm font-bold text-foreground">
                ${(item.product.price * item.quantity).toFixed(2)}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Totals */}
      <div className="px-5 pt-3 pb-4 border-t border-border/50 bg-card/50 backdrop-blur-sm">
        <div className="space-y-1.5 mb-3">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Subtotal</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
          {orderDiscount > 0 && (
            <div className="flex justify-between text-sm text-success">
              <span>Discount</span>
              <span>-${orderDiscount.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Tax (8%)</span>
            <span>${tax.toFixed(2)}</span>
          </div>
        </div>
        <div className="flex justify-between items-baseline mb-4 pt-2 border-t border-border/50">
          <span className="text-lg font-bold text-foreground">Total</span>
          <span className="text-2xl font-extrabold text-primary">${total.toFixed(2)}</span>
        </div>
        <Button variant="pos" size="pos-lg" className="w-full" onClick={onCheckout}>
          Proceed to Checkout
        </Button>
      </div>
    </div>
  );
}
