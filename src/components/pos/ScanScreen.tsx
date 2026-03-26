import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Scan, Minus, Plus, ArrowRight, X, Camera, MinusCircle, LogOut, House } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CameraBarcodeScanDialog } from '@/components/pos/CameraBarcodeScanDialog';
import CustomerDisplayLaunchButton from '@/components/pos/CustomerDisplayLaunchButton';
import { CartItem, Product, searchProducts, findProductByBarcode, getCartSubtotal, getCartTax, getCartTotal } from '@/data/posProducts';
import { formatCameraAccessError, needsHttpsForCamera, preflightCameraPermission } from '@/lib/cameraSecureContext';
import { toast } from '@/components/ui/sonner';
import { setPosAuthenticated } from '@/lib/posAuth';

function cartLineIndexForProduct(cart: CartItem[], product: Product, variantId?: string): number {
  const variant = variantId ? product.variants?.find((v) => v.id === variantId) : undefined;
  return cart.findIndex(
    (i) => i.product.id === product.id && i.selectedVariant?.id === variant?.id,
  );
}

interface ScanScreenProps {
  cart: CartItem[];
  orderDiscount: number;
  onAddProduct: (product: Product, variantId?: string) => void;
  onRemoveProductFromCart: (product: Product, variantId?: string) => void;
  onUpdateQty: (itemId: string, delta: number) => void;
  onRemove: (itemId: string) => void;
  onClear: () => void;
  onCheckout: () => void;
}

export default function ScanScreen({
  cart,
  orderDiscount,
  onAddProduct,
  onRemoveProductFromCart,
  onUpdateQty,
  onRemove,
  onClear,
  onCheckout,
}: ScanScreenProps) {
  const navigate = useNavigate();
  const [scanInput, setScanInput] = useState('');
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [removeMode, setRemoveMode] = useState(false);
  const [scanFeedback, setScanFeedback] = useState<'idle' | 'success' | 'notfound' | 'notincart'>('idle');
  const [lastScanned, setLastScanned] = useState<string>('');
  const [variantProduct, setVariantProduct] = useState<Product | null>(null);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [cameraBusy, setCameraBusy] = useState(false);
  const scanRef = useRef<HTMLInputElement>(null);

  const subtotal = getCartSubtotal(cart);
  const tax = getCartTax(cart, orderDiscount);
  const total = getCartTotal(cart, orderDiscount);
  const itemCount = cart.reduce((s, i) => s + i.quantity, 0);

  // Auto-focus scan input
  useEffect(() => {
    if (!variantProduct) {
      scanRef.current?.focus();
    }
  }, [variantProduct]);

  const handleSelectProduct = useCallback(
    (product: Product) => {
      if (product.variants && product.variants.length > 0) {
        setVariantProduct(product);
      } else if (removeMode) {
        if (cartLineIndexForProduct(cart, product) >= 0) {
          onRemoveProductFromCart(product);
          setScanFeedback('success');
          setLastScanned(product.name);
          setTimeout(() => setScanFeedback('idle'), 1500);
        } else {
          setScanFeedback('notincart');
          setLastScanned(product.name);
          setTimeout(() => setScanFeedback('idle'), 2000);
        }
      } else {
        onAddProduct(product);
        setScanFeedback('success');
        setLastScanned(product.name);
        setTimeout(() => setScanFeedback('idle'), 1500);
      }
      setScanInput('');
      setSearchResults([]);
    },
    [cart, onAddProduct, onRemoveProductFromCart, removeMode],
  );

  const handleScan = useCallback(
    (raw: string) => {
      const q = raw.trim();
      const product = findProductByBarcode(q);
      if (product) {
        if (product.variants && product.variants.length > 0) {
          setVariantProduct(product);
          setScanFeedback('idle');
        } else if (removeMode) {
          if (cartLineIndexForProduct(cart, product) >= 0) {
            onRemoveProductFromCart(product);
            setScanFeedback('success');
            setLastScanned(product.name);
            setTimeout(() => setScanFeedback('idle'), 1500);
          } else {
            setScanFeedback('notincart');
            setLastScanned(product.name);
            setTimeout(() => setScanFeedback('idle'), 2000);
          }
        } else {
          onAddProduct(product);
          setScanFeedback('success');
          setLastScanned(product.name);
          setTimeout(() => setScanFeedback('idle'), 1500);
        }
      } else {
        const matches = searchProducts(q);
        if (matches.length === 1) {
          handleSelectProduct(matches[0]);
          return;
        }
        setScanFeedback('notfound');
        setLastScanned(q);
        setTimeout(() => setScanFeedback('idle'), 2000);
      }
      setScanInput('');
      setSearchResults([]);
    },
    [cart, onAddProduct, onRemoveProductFromCart, removeMode, handleSelectProduct],
  );

  const handleScanKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && scanInput.trim()) {
      handleScan(scanInput);
    }
  };

  const onCameraBarcode = useCallback(
    (barcode: string) => {
      handleScan(barcode);
    },
    [handleScan],
  );

  const handleSelectVariant = (variantId: string) => {
    if (!variantProduct) return;
    if (removeMode) {
      if (cartLineIndexForProduct(cart, variantProduct, variantId) >= 0) {
        onRemoveProductFromCart(variantProduct, variantId);
        setScanFeedback('success');
        setLastScanned(variantProduct.name);
        setTimeout(() => setScanFeedback('idle'), 1500);
      } else {
        setScanFeedback('notincart');
        setLastScanned(variantProduct.name);
        setTimeout(() => setScanFeedback('idle'), 2000);
      }
    } else {
      onAddProduct(variantProduct, variantId);
    }
    setVariantProduct(null);
  };

  const currentTime = new Date();
  const timeStr = currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  const dateStr = currentTime.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

  return (
    <div className="flex min-h-0 flex-1 overflow-hidden pos-fade-in">
      {/* LEFT — Scan Console */}
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        {/* Top bar — Home sits low on the left; brand + actions align to top row */}
        <div className="flex h-[4.5rem] shrink-0 items-start justify-between gap-4 border-b border-border/30 px-4 pt-2.5 md:h-[5rem] md:px-8 md:pt-3">
          <div className="flex min-w-0 flex-1 items-stretch gap-0 md:gap-1">
            <div className="flex flex-col justify-end pb-1 pr-3 md:pr-4">
              <button
                type="button"
                onClick={() => navigate('/')}
                className="inline-flex shrink-0 items-center gap-2 rounded-xl border border-border/60 bg-background px-3 py-2 text-xs font-medium text-muted-foreground hover:bg-accent hover:text-foreground pos-transition md:px-4 md:text-sm"
                title="Back to home"
              >
                <House className="h-4 w-4 shrink-0 md:h-5 md:w-5" />
                Home
              </button>
            </div>
            <div className="flex min-w-0 items-center gap-2.5 border-l border-border/50 pl-3 md:gap-3 md:pl-5">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/15 md:h-10 md:w-10">
                <span className="text-sm font-bold text-primary md:text-base">⚽</span>
              </div>
              <div className="min-w-0 leading-tight">
                <p className="truncate text-sm font-semibold tracking-tight text-foreground md:text-base">
                  <span className="text-foreground">SCS</span>
                  <span className="text-primary">-TIX</span>
                </p>
                <p className="truncate text-[11px] text-muted-foreground md:text-xs">Terminal 1</p>
              </div>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2.5 sm:gap-3 md:gap-4">
            <CustomerDisplayLaunchButton variant="compact" />
            <button
              type="button"
              onClick={() => {
                setPosAuthenticated(false);
                navigate('/login', { replace: true });
              }}
              className="inline-flex items-center gap-2 rounded-xl border border-border/60 bg-background px-3 py-2 text-xs font-medium text-muted-foreground hover:bg-accent hover:text-foreground pos-transition md:px-4 md:text-sm"
              title="Sign out"
            >
              <LogOut className="h-4 w-4 shrink-0 md:h-5 md:w-5" />
              <span className="hidden sm:inline">Sign out</span>
            </button>
            <div className="text-right text-[11px] text-muted-foreground md:text-sm">
              <p className="font-medium leading-snug text-foreground">Alex T.</p>
              <p className="mt-0.5 tabular-nums leading-snug">
                <span>{dateStr}</span>
                <span className="mx-1 text-border/80">·</span>
                <span className="font-medium text-foreground">{timeStr}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Main scan area */}
        <div className="flex min-h-0 flex-1 flex-col items-center justify-center overflow-y-auto px-4 py-5 md:overflow-hidden md:px-8 md:py-5 lg:px-10">
          {/* Scan dock */}
          <div className="w-full max-w-2xl md:max-w-3xl">
            {/* Status indicator */}
            <div className="mb-4 shrink-0 text-center md:mb-5">
              {scanFeedback === 'idle' && (
                <p className="text-base font-semibold uppercase tracking-[0.2em] text-muted-foreground md:text-lg md:tracking-[0.22em]">
                  {removeMode ? 'Remove mode — scan or search' : 'Ready to scan'}
                </p>
              )}
              {scanFeedback === 'success' && (
                <div className="pos-scale-in">
                  <p className="text-lg font-semibold text-success">
                    {removeMode ? '✓ Removed — ' : '✓ Added — '}
                    {lastScanned}
                  </p>
                </div>
              )}
              {scanFeedback === 'notfound' && (
                <div className="pos-scale-in">
                  <p className="text-lg font-semibold text-destructive">Barcode not found — {lastScanned}</p>
                </div>
              )}
              {scanFeedback === 'notincart' && (
                <div className="pos-scale-in">
                  <p className="text-lg font-semibold text-amber-600 dark:text-amber-500">Not in cart — {lastScanned}</p>
                </div>
              )}
            </div>

            {/* Scan input — the hero element */}
            <div className={`
              relative rounded-3xl border-2 pos-transition overflow-hidden
              ${scanFeedback === 'success' ? 'border-success/50 shadow-[0_0_30px_hsl(var(--success)/0.15)]' :
                scanFeedback === 'notfound' ? 'border-destructive/50 shadow-[0_0_30px_hsl(var(--destructive)/0.15)]' :
                scanFeedback === 'notincart' ? 'border-amber-500/40 shadow-[0_0_24px_hsl(43 96% 56% / 0.12)]' :
                removeMode ? 'border-destructive/35 shadow-[0_0_32px_hsl(var(--destructive)/0.08)] focus-within:border-destructive/45' :
                'border-border/60 shadow-[0_0_40px_hsl(var(--pos-accent)/0.08)] focus-within:border-primary/50 focus-within:shadow-[0_0_50px_hsl(var(--pos-accent)/0.15)]'}
            `}>
              <div
                className={`flex items-center gap-4 px-5 py-5 sm:px-6 sm:py-6 md:gap-5 md:px-8 md:py-7 ${removeMode ? 'bg-destructive/[0.06]' : 'bg-card/80'}`}
              >
                <div
                  className={`
                  flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl pos-transition sm:h-16 sm:w-16 md:h-[4.5rem] md:w-[4.5rem]
                  ${scanFeedback === 'idle' ? (removeMode ? 'bg-destructive/15' : 'bg-primary/10 animate-pulse-ring') :
                    scanFeedback === 'success' ? 'bg-success/15' :
                    scanFeedback === 'notincart' ? 'bg-amber-500/15' : 'bg-destructive/15'}
                `}>
                  {removeMode && scanFeedback === 'idle' ? (
                    <MinusCircle className="h-7 w-7 text-destructive/80 sm:h-8 sm:w-8 md:h-9 md:w-9" />
                  ) : (
                    <Scan
                      className={`h-7 w-7 sm:h-8 sm:w-8 md:h-9 md:w-9 ${scanFeedback === 'idle' ? 'text-primary' : scanFeedback === 'success' ? 'text-success' : scanFeedback === 'notincart' ? 'text-amber-600' : 'text-destructive'}`}
                    />
                  )}
                </div>
                <input
                  ref={scanRef}
                  type="text"
                  value={scanInput}
                  onChange={(e) => {
                    const v = e.target.value;
                    setScanInput(v);
                    setSearchResults(v.trim() ? searchProducts(v) : []);
                  }}
                  onKeyDown={handleScanKeyDown}
                  placeholder={
                    removeMode
                      ? 'Scan to remove from cart…'
                      : 'Scan barcode, search by name or SKU…'
                  }
                  className="min-w-0 flex-1 bg-transparent text-xl font-semibold text-foreground outline-none placeholder:text-muted-foreground/50 sm:text-2xl md:text-3xl"
                  autoComplete="off"
                />
                {scanInput && (
                  <button
                    type="button"
                    onClick={() => {
                      setScanInput('');
                      setSearchResults([]);
                    }}
                    className="p-2 rounded-xl hover:bg-accent pos-transition shrink-0"
                  >
                    <X className="w-6 h-6 text-muted-foreground" />
                  </button>
                )}
              </div>
            </div>

            <div className="mt-4 flex justify-center">
              <div
                className="inline-flex rounded-2xl border border-border/60 bg-secondary/40 p-1 shadow-inner"
                role="group"
                aria-label="Scan action"
              >
                <button
                  type="button"
                  onClick={() => setRemoveMode(false)}
                  className={`rounded-xl px-5 py-2.5 text-sm font-semibold pos-transition sm:px-6 sm:py-3 sm:text-base ${
                    !removeMode ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Add
                </button>
                <button
                  type="button"
                  onClick={() => setRemoveMode(true)}
                  className={`rounded-xl px-5 py-2.5 text-sm font-semibold pos-transition sm:px-6 sm:py-3 sm:text-base ${
                    removeMode ? 'bg-destructive/15 text-destructive shadow-sm' : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Remove
                </button>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap items-center justify-center gap-3 md:mt-6">
              <Button
                type="button"
                variant="outline"
                size="pos-lg"
                disabled={cameraBusy}
                className="rounded-2xl gap-2 border-primary/30 bg-primary/5 font-semibold hover:bg-primary/10 md:h-16 md:px-10 md:text-lg"
                onClick={() => {
                  if (needsHttpsForCamera()) {
                    toast.error(formatCameraAccessError(null));
                    return;
                  }
                  setCameraBusy(true);
                  void (async () => {
                    try {
                      await preflightCameraPermission();
                      setCameraOpen(true);
                    } catch (e) {
                      toast.error(formatCameraAccessError(e));
                    } finally {
                      setCameraBusy(false);
                    }
                  })();
                }}
              >
                <Camera className="h-5 w-5 text-primary" />
                {cameraBusy ? 'Opening camera…' : 'Scan with camera'}
              </Button>
            </div>

            {/* Matches while typing (name / SKU / barcode) */}
            {searchResults.length > 0 && scanInput.trim() && (
              <div className="mt-4 max-h-[min(42vh,14rem)] overflow-y-auto pos-slide-up md:max-h-[min(36vh,12rem)]">
                <div className="bg-card border border-border/60 rounded-2xl overflow-hidden shadow-xl">
                  {searchResults.slice(0, 5).map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => handleSelectProduct(p)}
                      disabled={!p.inStock}
                      className="w-full flex items-center gap-4 px-4 py-3.5 hover:bg-accent/50 pos-transition text-left disabled:opacity-40 disabled:cursor-not-allowed border-b border-border/30 last:border-0"
                    >
                      <div
                        className="w-11 h-11 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
                        style={{ backgroundColor: p.color + '33' }}
                      >
                        {p.emoji}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-base font-semibold text-foreground truncate">{p.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {p.sku} · {p.barcode}
                        </p>
                      </div>
                      <span className="text-base font-bold text-foreground tabular-nums">${p.price.toFixed(2)}</span>
                      {!p.inStock && (
                        <span className="text-sm text-destructive font-medium">Out of stock</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* RIGHT — Cart Panel */}
      <div className="flex min-h-0 w-[min(100%,32rem)] min-w-[20rem] shrink-0 flex-col overflow-hidden border-l border-border/30 bg-card/50 sm:min-w-[24rem] md:min-w-[28rem] lg:min-w-[30rem]">
        {cart.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center px-8">
            <div className="w-16 h-16 rounded-2xl bg-secondary/60 flex items-center justify-center mb-4">
              <Scan className="w-8 h-8 text-muted-foreground/50" />
            </div>
            <p className="text-base font-semibold text-muted-foreground/70">No items yet</p>
            <p className="text-sm text-muted-foreground/50 mt-1.5">Scan a product to begin</p>
          </div>
        ) : (
          <>
            {/* Cart header */}
            <div className="px-6 pt-5 pb-4 flex items-center justify-between gap-3">
              <div>
                <p className="text-sm text-muted-foreground uppercase tracking-wider font-semibold">Current Sale</p>
                <p className="text-sm text-muted-foreground/70 mt-1">{itemCount} item{itemCount !== 1 ? 's' : ''}</p>
                {removeMode && (
                  <p className="text-xs text-destructive/80 font-medium mt-1.5">Tap a line to remove it from the cart</p>
                )}
              </div>
              <button onClick={onClear} className="text-sm font-medium text-destructive/70 hover:text-destructive px-3 py-2 rounded-lg hover:bg-destructive/10 pos-transition">
                Clear
              </button>
            </div>

            {/* Cart items */}
            <div className="flex-1 overflow-y-auto px-5 space-y-2">
              {cart.map((item, idx) => (
                <div key={item.id} className="bg-secondary/30 rounded-xl px-4 py-3 pos-slide-up" style={{ animationDelay: `${idx * 30}ms` }}>
                  <div
                    className={`flex items-center gap-3 rounded-lg -mx-1 px-1 ${removeMode ? 'cursor-pointer hover:bg-destructive/10 pos-transition' : ''}`}
                    onClick={removeMode ? () => onRemove(item.id) : undefined}
                    onKeyDown={
                      removeMode
                        ? (e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              onRemove(item.id);
                            }
                          }
                        : undefined
                    }
                    role={removeMode ? 'button' : undefined}
                    tabIndex={removeMode ? 0 : undefined}
                  >
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0" style={{ backgroundColor: item.product.color + '25' }}>
                      {item.product.emoji}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-base font-semibold text-foreground truncate leading-snug">{item.product.name}</p>
                      {item.selectedVariant && (
                        <p className="text-sm text-muted-foreground mt-0.5">Size {item.selectedVariant.label}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-2.5">
                    <div className="flex items-center gap-1">
                      <button onClick={() => onUpdateQty(item.id, -1)} className="w-9 h-9 rounded-lg bg-background/50 flex items-center justify-center hover:bg-accent pos-transition active:scale-90">
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-10 text-center text-sm font-bold tabular-nums">{item.quantity}</span>
                      <button onClick={() => onUpdateQty(item.id, 1)} className="w-9 h-9 rounded-lg bg-background/50 flex items-center justify-center hover:bg-accent pos-transition active:scale-90">
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                    <span className="text-base font-bold text-foreground tabular-nums">${(item.product.price * item.quantity).toFixed(2)}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Totals + CTA */}
            <div className="px-6 pt-4 pb-5 border-t border-border/20">
              <div className="space-y-1.5 mb-4">
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Subtotal</span>
                  <span className="font-medium tabular-nums">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Tax (8%)</span>
                  <span className="font-medium tabular-nums">${tax.toFixed(2)}</span>
                </div>
              </div>
              <div className="flex justify-between items-baseline mb-5 gap-4">
                <span className="text-base font-bold text-muted-foreground uppercase tracking-wide">Total</span>
                <span className="text-3xl font-extrabold text-primary tabular-nums">${total.toFixed(2)}</span>
              </div>
              <Button variant="pos" size="pos-xl" className="w-full text-lg" onClick={onCheckout}>
                Charge ${total.toFixed(2)}
                <ArrowRight className="w-6 h-6 ml-1" />
              </Button>
            </div>
          </>
        )}
      </div>

      <CameraBarcodeScanDialog open={cameraOpen} onOpenChange={setCameraOpen} onScan={onCameraBarcode} />

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
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-3">
              {removeMode ? 'Select size to remove' : 'Select Size'}
            </p>
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
