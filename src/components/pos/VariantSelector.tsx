import { Product } from '@/data/posProducts';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface VariantSelectorProps {
  product: Product;
  onSelect: (variantId: string) => void;
  onClose: () => void;
}

export default function VariantSelector({ product, onSelect, onClose }: VariantSelectorProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm pos-fade-in" onClick={onClose}>
      <div className="pos-card-elevated p-6 w-[400px] max-w-[90vw] pos-scale-in" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-lg font-bold text-foreground">{product.name}</h3>
            <p className="text-sm text-muted-foreground">${product.price.toFixed(2)} · Select Size</p>
          </div>
          <button onClick={onClose} className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center hover:bg-accent pos-transition">
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {product.variants?.map(v => (
            <Button
              key={v.id}
              variant="pos-secondary"
              size="pos-lg"
              disabled={!v.inStock}
              onClick={() => onSelect(v.id)}
              className={!v.inStock ? 'opacity-40' : 'hover:ring-1 hover:ring-primary/40'}
            >
              {v.label}
              {!v.inStock && <span className="text-xs text-destructive ml-1">N/A</span>}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
