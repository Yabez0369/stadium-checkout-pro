import { useState, useRef, useEffect, useCallback } from 'react';
import { Scan, Search, Minus, Plus, Trash2, ArrowRight, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CartItem, Product, searchProducts, findProductByBarcode, getCartSubtotal, getCartTax, getCartTotal } from '@/data/posProducts';

interface ScanScreenProps {
  cart: CartItem[];
  orderDiscount: number;
  onAddProduct: (product: Product, variantId?: string) => void;
  onUpdateQty: (itemId: string, delta: number) => void;
  onRemove: (itemId: string) => void;
  onClear: () => void;
  onCheckout: () => void;
}

export default function ScanScreen({ cart, orderDiscount, onAddProduct, onUpdateQty, onRemove, onClear, onCheckout }: ScanScreenProps) {
  const [scanInput, setScanInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [showSearch, setShowSearch] = useState(false);
  const [scanFeedback, setScanFeedback] = useState<'idle' | 'success' | 'notfound'>('idle');
  const [lastScanned, setLastScanned] = useState<string>('');
  const [variantProduct, setVariantProduct] = useState<Product | null>(null);
  const scanRef = useRef<HTMLInputElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const subtotal = getCartSubtotal(cart);
  const tax = getCartTax(cart, orderDiscount);
  const total = getCartTotal(cart, orderDiscount);
  const itemCount = cart.reduce((s, i) => s + i.quantity, 0);

  // Auto-focus scan input
  useEffect(() => {
    if (!showSearch && !variantProduct) {
      scanRef.current?.focus();
    }
  }, [showSearch, variantProduct]);

  const handleScan = useCallback((barcode: string) => {
    const product = findProductByBarcode(barcode.trim());
    if (product) {
      if (product.variants && product.variants.length > 0) {
        setVariantProduct(product);
      } else {
        onAddProduct(product);
      }
      setScanFeedback('success');
      setLastScanned(product.name);
      setTimeout(() => setScanFeedback('idle'), 1500);
    } else {
      setScanFeedback('notfound');
      setLastScanned(barcode.trim());
      setTimeout(() => setScanFeedback('idle'), 2000);
    }
    setScanInput('');
  }, [onAddProduct]);

  const handleScanKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && scanInput.trim()) {
      handleScan(scanInput);
    }
  };

  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    setSearchResults(val.trim() ? searchProducts(val) : []);
  };

  const handleSelectProduct = (product: Product) => {
    if (product.variants && product.variants.length > 0) {
      setVariantProduct(product);
    } else {
      onAddProduct(product);
    }
    setSearchQuery('');
    setSearchResults([]);
    setShowSearch(false);
  };

  const handleSelectVariant = (variantId: string) => {
    if (variantProduct) {
      onAddProduct(variantProduct, variantId);
      setVariantProduct(null);
    }
  };

  const currentTime = new Date();
  const timeStr = currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  const dateStr = currentTime.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

  return (
    <div className="h-screen flex pos-fade-in">
      {/* LEFT — Scan Console */}
      <div className="flex-1 flex flex-col">
        {/* Top bar */}
        <div className="h-14 px-6 flex items-center justify-between border-b border-border/30">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center">
              <span className="text-sm font-bold text-primary">⚽</span>
            </div>
            <span className="text-sm font-semibold text-foreground tracking-tight">Stadium Store</span>
            <span className="text-xs text-muted-foreground ml-2">Terminal 1</span>
          </div>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span>Alex T.</span>
            <span>{dateStr}</span>
            <span className="font-medium text-foreground">{timeStr}</span>
          </div>
        </div>

        {/* Main scan area */}
        <div className="flex-1 flex flex-col items-center justify-center px-8">
          {/* Scan dock */}
          <div className="w-full max-w-lg">
            {/* Status indicator */}
            <div className="text-center mb-6">
              {scanFeedback === 'idle' && (
                <p className="text-sm text-muted-foreground tracking-wide uppercase">Ready to scan</p>
              )}
              {scanFeedback === 'success' && (
                <div className="pos-scale-in">
                  <p className="text-sm font-semibold text-success">✓ Added — {lastScanned}</p>
                </div>
              )}
              {scanFeedback === 'notfound' && (
                <div className="pos-scale-in">
                  <p className="text-sm font-semibold text-destructive">Barcode not found — {lastScanned}</p>
                </div>
              )}
            </div>

            {/* Scan input — the hero element */}
            <div className={`
              relative rounded-2xl border-2 pos-transition overflow-hidden
              ${scanFeedback === 'success' ? 'border-success/50 shadow-[0_0_30px_hsl(var(--success)/0.15)]' :
                scanFeedback === 'notfound' ? 'border-destructive/50 shadow-[0_0_30px_hsl(var(--destructive)/0.15)]' :
                'border-border/60 shadow-[0_0_40px_hsl(var(--pos-gold)/0.08)] focus-within:border-primary/50 focus-within:shadow-[0_0_50px_hsl(var(--pos-gold)/0.15)]'}
            `}>
              <div className="flex items-center gap-3 px-5 py-4 bg-card/80">
                <div className={`
                  w-10 h-10 rounded-xl flex items-center justify-center pos-transition
                  ${scanFeedback === 'idle' ? 'bg-primary/10 animate-pulse-ring' : 
                    scanFeedback === 'success' ? 'bg-success/15' : 'bg-destructive/15'}
                `}>
                  <Scan className={`w-5 h-5 ${scanFeedback === 'idle' ? 'text-primary' : scanFeedback === 'success' ? 'text-success' : 'text-destructive'}`} />
                </div>
                <input
                  ref={scanRef}
                  type="text"
                  value={scanInput}
                  onChange={(e) => setScanInput(e.target.value)}
                  onKeyDown={handleScanKeyDown}
                  placeholder="Scan barcode..."
                  className="flex-1 bg-transparent text-lg font-medium text-foreground placeholder:text-muted-foreground/50 outline-none"
                  autoComplete="off"
                />
                {scanInput && (
                  <button onClick={() => setScanInput('')} className="p-1 rounded-lg hover:bg-accent pos-transition">
                    <X className="w-4 h-4 text-muted-foreground" />
                  </button>
                )}
              </div>
            </div>

            {/* Fallback search toggle */}
            <div className="mt-4 text-center">
              {!showSearch ? (
                <button
                  onClick={() => { setShowSearch(true); setTimeout(() => searchRef.current?.focus(), 100); }}
                  className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground pos-transition px-4 py-2 rounded-xl hover:bg-accent/50"
                >
                  <Search className="w-4 h-4" />
                  Search by name or SKU
                </button>
              ) : (
                <div className="pos-slide-up">
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      ref={searchRef}
                      type="text"
                      value={searchQuery}
                      onChange={(e) => handleSearchChange(e.target.value)}
                      placeholder="Type product name, SKU, or barcode..."
                      className="w-full pl-11 pr-10 py-3 bg-card/80 border border-border/60 rounded-xl text-sm text-foreground placeholder:text-muted-foreground/50 outline-none focus:border-primary/40"
                      autoComplete="off"
                    />
                    <button
                      onClick={() => { setShowSearch(false); setSearchQuery(''); setSearchResults([]); }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-lg hover:bg-accent"
                    >
                      <X className="w-4 h-4 text-muted-foreground" />
                    </button>
                  </div>

                  {/* Search results */}
                  {searchResults.length > 0 && (
                    <div className="mt-2 bg-card border border-border/60 rounded-xl overflow-hidden shadow-xl">
                      {searchResults.slice(0, 5).map(p => (
                        <button
                          key={p.id}
                          onClick={() => handleSelectProduct(p)}
                          disabled={!p.inStock}
                          className="w-full flex items-center gap-3 px-4 py-3 hover:bg-accent/50 pos-transition text-left disabled:opacity-40 disabled:cursor-not-allowed border-b border-border/30 last:border-0"
                        >
                          <div className="w-9 h-9 rounded-lg flex items-center justify-center text-base flex-shrink-0" style={{ backgroundColor: p.color + '33' }}>
                            {p.emoji}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground truncate">{p.name}</p>
                            <p className="text-xs text-muted-foreground">{p.sku} · {p.barcode}</p>
                          </div>
                          <span className="text-sm font-semibold text-foreground">${p.price.toFixed(2)}</span>
                          {!p.inStock && <span className="text-xs text-destructive font-medium">Out of stock</span>}
                        </button>
                      ))}
                    </div>
                  )}
                  {searchQuery.trim() && searchResults.length === 0 && (
                    <p className="mt-3 text-sm text-muted-foreground">No products found</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT — Cart Panel */}
      <div className="w-[360px] bg-card/50 border-l border-border/30 flex flex-col">
        {cart.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center px-6">
            <div className="w-14 h-14 rounded-2xl bg-secondary/60 flex items-center justify-center mb-3">
              <Scan className="w-6 h-6 text-muted-foreground/50" />
            </div>
            <p className="text-sm font-medium text-muted-foreground/60">No items yet</p>
            <p className="text-xs text-muted-foreground/40 mt-1">Scan a product to begin</p>
          </div>
        ) : (
          <>
            {/* Cart header */}
            <div className="px-5 pt-4 pb-3 flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Current Sale</p>
                <p className="text-xs text-muted-foreground/60 mt-0.5">{itemCount} item{itemCount !== 1 ? 's' : ''}</p>
              </div>
              <button onClick={onClear} className="text-xs text-destructive/60 hover:text-destructive px-3 py-1.5 rounded-lg hover:bg-destructive/10 pos-transition">
                Clear
              </button>
            </div>

            {/* Cart items */}
            <div className="flex-1 overflow-y-auto px-4 space-y-1.5">
              {cart.map((item, idx) => (
                <div key={item.id} className="group bg-secondary/30 rounded-xl px-3.5 py-2.5 pos-slide-up" style={{ animationDelay: `${idx * 30}ms` }}>
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm flex-shrink-0" style={{ backgroundColor: item.product.color + '25' }}>
                      {item.product.emoji}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate leading-tight">{item.product.name}</p>
                      {item.selectedVariant && (
                        <p className="text-[11px] text-muted-foreground">Size {item.selectedVariant.label}</p>
                      )}
                    </div>
                    <button onClick={() => onRemove(item.id)} className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-destructive/10 pos-transition">
                      <Trash2 className="w-3.5 h-3.5 text-destructive/50" />
                    </button>
                  </div>
                  <div className="flex items-center justify-between mt-1.5">
                    <div className="flex items-center gap-0.5">
                      <button onClick={() => onUpdateQty(item.id, -1)} className="w-7 h-7 rounded-lg bg-background/50 flex items-center justify-center hover:bg-accent pos-transition active:scale-90">
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-8 text-center text-xs font-bold">{item.quantity}</span>
                      <button onClick={() => onUpdateQty(item.id, 1)} className="w-7 h-7 rounded-lg bg-background/50 flex items-center justify-center hover:bg-accent pos-transition active:scale-90">
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                    <span className="text-sm font-semibold text-foreground">${(item.product.price * item.quantity).toFixed(2)}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Totals + CTA */}
            <div className="px-5 pt-3 pb-4 border-t border-border/20">
              <div className="space-y-1 mb-3">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Tax (8%)</span>
                  <span>${tax.toFixed(2)}</span>
                </div>
              </div>
              <div className="flex justify-between items-baseline mb-4">
                <span className="text-sm font-semibold text-muted-foreground">Total</span>
                <span className="text-2xl font-extrabold text-primary">${total.toFixed(2)}</span>
              </div>
              <Button variant="pos" size="pos-lg" className="w-full" onClick={onCheckout}>
                Charge ${total.toFixed(2)}
                <ArrowRight className="w-5 h-5 ml-1" />
              </Button>
            </div>
          </>
        )}
      </div>

      {/* Variant selector overlay */}
      {variantProduct && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 pos-fade-in" onClick={() => setVariantProduct(null)}>
          <div className="bg-card rounded-2xl p-6 w-80 shadow-2xl pos-scale-in" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl" style={{ backgroundColor: variantProduct.color + '33' }}>
                {variantProduct.emoji}
              </div>
              <div>
                <p className="font-semibold text-foreground">{variantProduct.name}</p>
                <p className="text-sm text-muted-foreground">${variantProduct.price.toFixed(2)}</p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-3">Select Size</p>
            <div className="grid grid-cols-4 gap-2">
              {variantProduct.variants?.map(v => (
                <button
                  key={v.id}
                  disabled={!v.inStock}
                  onClick={() => handleSelectVariant(v.id)}
                  className="h-12 rounded-xl border border-border/60 text-sm font-semibold text-foreground hover:border-primary hover:bg-primary/10 pos-transition active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  {v.label}
                </button>
              ))}
            </div>
            <button onClick={() => setVariantProduct(null)} className="mt-4 w-full text-sm text-muted-foreground hover:text-foreground py-2 pos-transition">
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
