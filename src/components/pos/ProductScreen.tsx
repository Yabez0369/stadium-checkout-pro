import { Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Product, PRODUCTS, CATEGORIES } from '@/data/posProducts';
import { useState, useRef, useEffect } from 'react';
import VariantSelector from './VariantSelector';

interface ProductScreenProps {
  onAddProduct: (product: Product, variantId?: string) => void;
  activeCategory: string;
  onCategoryChange: (cat: string) => void;
}

export default function ProductScreen({ onAddProduct, activeCategory, onCategoryChange }: ProductScreenProps) {
  const [search, setSearch] = useState('');
  const [variantProduct, setVariantProduct] = useState<Product | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const filtered = PRODUCTS.filter(p => {
    const matchCat = activeCategory === 'all' || p.category === activeCategory;
    const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const handleProductTap = (product: Product) => {
    if (product.variants && product.variants.length > 0) {
      setVariantProduct(product);
    } else {
      onAddProduct(product);
    }
  };

  return (
    <div className="flex flex-col h-full pos-fade-in">
      {/* Search Bar */}
      <div className="px-4 pt-4 pb-3">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Scan barcode or search products..."
            className="w-full h-12 pl-12 pr-10 rounded-xl bg-secondary border-none text-foreground placeholder:text-muted-foreground text-base focus:outline-none focus:ring-2 focus:ring-primary/40"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Category Tabs */}
      <div className="px-4 pb-3 flex gap-2 overflow-x-auto no-scrollbar">
        {CATEGORIES.map(cat => (
          <button
            key={cat.id}
            onClick={() => onCategoryChange(cat.id)}
            className={`flex items-center gap-1.5 px-4 h-10 rounded-xl text-sm font-medium whitespace-nowrap pos-transition ${
              activeCategory === cat.id
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-secondary-foreground hover:bg-accent'
            }`}
          >
            <span>{cat.emoji}</span>
            {cat.label}
          </button>
        ))}
      </div>

      {/* Product Grid */}
      <div className="flex-1 overflow-y-auto px-4 pb-4">
        <div className="grid grid-cols-3 gap-3">
          {filtered.map(product => (
            <button
              key={product.id}
              disabled={!product.inStock}
              onClick={() => handleProductTap(product)}
              className={`pos-card-elevated p-3 text-left pos-transition active:scale-[0.97] ${
                !product.inStock ? 'opacity-40 cursor-not-allowed' : 'hover:ring-1 hover:ring-primary/30'
              }`}
            >
              <div
                className="w-full aspect-square rounded-lg mb-2.5 flex items-center justify-center text-4xl"
                style={{ backgroundColor: product.color + '33' }}
              >
                {product.emoji}
              </div>
              <p className="text-sm font-semibold text-foreground truncate">{product.name}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{product.sku}</p>
              <div className="flex items-center justify-between mt-2">
                <span className="text-base font-bold text-primary">${product.price.toFixed(2)}</span>
                {!product.inStock && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-destructive/10 text-destructive font-medium">Out of Stock</span>
                )}
                {product.variants && product.inStock && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">Sizes</span>
                )}
              </div>
            </button>
          ))}
        </div>
        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
            <Search className="w-10 h-10 mb-3 opacity-30" />
            <p className="text-base">No products found</p>
          </div>
        )}
      </div>

      {/* Variant Selector Overlay */}
      {variantProduct && (
        <VariantSelector
          product={variantProduct}
          onSelect={(variantId) => {
            onAddProduct(variantProduct, variantId);
            setVariantProduct(null);
          }}
          onClose={() => setVariantProduct(null)}
        />
      )}
    </div>
  );
}
