import { CartItem, getCartSubtotal, getCartTax, getCartTotal } from '@/data/posProducts';
import { Minus, Plus, Trash2, ArrowLeft, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CartReviewScreenProps {
  cart: CartItem[];
  orderDiscount: number;
  onUpdateQty: (itemId: string, delta: number) => void;
  onRemove: (itemId: string) => void;
  onBack: () => void;
  onNext: () => void;
}

export default function CartReviewScreen({ cart, orderDiscount, onUpdateQty, onRemove, onBack, onNext }: CartReviewScreenProps) {
  const subtotal = getCartSubtotal(cart);
  const tax = getCartTax(cart, orderDiscount);
  const total = getCartTotal(cart, orderDiscount);

  return (
    <div className="flex flex-col h-full pos-fade-in">
      <div className="px-6 pt-5 pb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="pos-ghost" size="pos-icon" onClick={onBack}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h2 className="text-xl font-bold text-foreground">Review Cart</h2>
            <p className="text-sm text-muted-foreground">Confirm items before payment</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm text-muted-foreground">Total</p>
          <p className="text-2xl font-extrabold text-primary">${total.toFixed(2)}</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6">
        <div className="space-y-3">
          {cart.map(item => (
            <div key={item.id} className="pos-card-elevated p-4 flex items-center gap-4">
              <div
                className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
                style={{ backgroundColor: item.product.color + '33' }}
              >
                {item.product.emoji}
              </div>
              <div className="flex-1">
                <p className="font-semibold text-foreground">{item.product.name}</p>
                {item.selectedVariant && <p className="text-sm text-muted-foreground">Size: {item.selectedVariant.label}</p>}
                <p className="text-sm text-muted-foreground">${item.product.price.toFixed(2)} × {item.quantity}</p>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => onUpdateQty(item.id, -1)} className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center hover:bg-accent pos-transition active:scale-95">
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-8 text-center font-bold">{item.quantity}</span>
                <button onClick={() => onUpdateQty(item.id, 1)} className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center hover:bg-accent pos-transition active:scale-95">
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <span className="font-bold text-foreground w-20 text-right">${(item.product.price * item.quantity).toFixed(2)}</span>
              <button onClick={() => onRemove(item.id)} className="p-2 rounded-xl hover:bg-destructive/10 pos-transition">
                <Trash2 className="w-5 h-5 text-destructive/60" />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="px-6 py-4 border-t border-border/50">
        <div className="flex justify-between max-w-md ml-auto mb-2 text-sm text-muted-foreground">
          <span>Subtotal</span><span>${subtotal.toFixed(2)}</span>
        </div>
        {orderDiscount > 0 && (
          <div className="flex justify-between max-w-md ml-auto mb-2 text-sm text-success">
            <span>Discount</span><span>-${orderDiscount.toFixed(2)}</span>
          </div>
        )}
        <div className="flex justify-between max-w-md ml-auto mb-4 text-sm text-muted-foreground">
          <span>Tax (8%)</span><span>${tax.toFixed(2)}</span>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <span className="text-lg font-bold text-foreground">Grand Total: </span>
            <span className="text-2xl font-extrabold text-primary">${total.toFixed(2)}</span>
          </div>
          <Button variant="pos" size="pos-lg" onClick={onNext}>
            Continue <ArrowRight className="w-5 h-5 ml-1" />
          </Button>
        </div>
      </div>
    </div>
  );
}
