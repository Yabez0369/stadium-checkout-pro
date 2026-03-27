import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Scan, Minus, Plus, ArrowRight, X, Camera, MinusCircle, LogOut, House } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CameraBarcodeScanDialog } from '@/components/pos/CameraBarcodeScanDialog';
import CustomerDisplayLaunchButton from '@/components/pos/CustomerDisplayLaunchButton';
import CustomerToolbar from '@/components/pos/CustomerToolbar';
import { CartItem, Product, searchProducts, findProductByBarcode, getCartSubtotal, getCartTax, getCartTotal } from '@/data/posProducts';
import { getCustomerById } from '@/data/customers';
import type { ParkSaleResult } from '@/data/parkedSales';
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
  customerId: string | null;
  parkedCount: number;
  onAddProduct: (product: Product, variantId?: string) => void;
  onRemoveProductFromCart: (product: Product, variantId?: string) => void;
  onUpdateQty: (itemId: string, delta: number) => void;
  onRemove: (itemId: string) => void;
  onClear: () => void;
  onCheckout: () => void;
  onAttachCustomer: (customerId: string | null) => void;
  onClearCustomer: () => void;
  onParkSale: () => ParkSaleResult;
  onRecallParkedSale: (parkedId: string) => void;
}

export default function ScanScreen({
  cart,
  orderDiscount,
  customerId,
  parkedCount,
  onAddProduct,
  onRemoveProductFromCart,
  onUpdateQty,
  onRemove,
  onClear,
  onCheckout,
  onAttachCustomer,
  onClearCustomer,
  onParkSale,
  onRecallParkedSale,
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
  const customerDisplayName =
    customerId != null ? getCustomerById(customerId)?.displayName ?? 'Customer' : null;

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
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden md:flex-row pos-fade-in">
      {/* LEFT — Scan Console */}
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        {/* Top bar — single baseline: all controls vertically centered */}
        <header className="pos-register-header px-4 md:px-8 ipad:px-10 xl:px-10 ipad-pro:px-12">
          <div className="flex min-w-0 flex-1 items-center gap-3 md:gap-4">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="inline-flex h-10 shrink-0 items-center gap-2 rounded-xl border border-border/60 bg-background px-3 text-xs font-medium text-muted-foreground hover:bg-accent hover:text-foreground pos-transition md:h-11 md:px-4 md:text-sm"
              title="Back to home"
            >
              <House className="h-4 w-4 shrink-0 md:h-[1.125rem] md:w-[1.125rem]" />
              Home
            </button>
            <div className="hidden h-8 w-px shrink-0 bg-border/60 sm:block" aria-hidden />
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/12 ring-1 ring-primary/15 md:h-11 md:w-11">
                <span className="text-base font-bold leading-none text-primary md:text-lg">⚽</span>
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold tracking-tight text-foreground md:text-base">
                  <span className="text-foreground">SCS</span>
                  <span className="text-primary">-TIX</span>
                </p>
                <p className="truncate text-[11px] leading-none text-muted-foreground md:text-xs">Terminal 1</p>
              </div>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2 md:gap-3">
            <CustomerDisplayLaunchButton variant="compact" />
            <button
              type="button"
              onClick={() => {
                setPosAuthenticated(false);
                navigate('/login', { replace: true });
              }}
              className="inline-flex h-10 items-center gap-2 rounded-xl border border-border/60 bg-background px-3 text-xs font-medium text-muted-foreground hover:bg-accent hover:text-foreground pos-transition md:h-11 md:px-4 md:text-sm"
              title="Sign out"
            >
              <LogOut className="h-4 w-4 shrink-0 md:h-[1.125rem] md:w-[1.125rem]" />
              <span className="hidden sm:inline">Sign out</span>
            </button>
            <div className="hidden min-w-0 border-l border-border/50 pl-3 text-right sm:block md:pl-4">
              <p className="text-xs font-medium leading-tight text-foreground md:text-sm">Alex T.</p>
              <p className="mt-0.5 text-[11px] tabular-nums leading-tight text-muted-foreground md:text-xs">
                <span>{dateStr}</span>
                <span className="mx-1 text-border/70">·</span>
                <span className="font-medium text-foreground">{timeStr}</span>
              </p>
            </div>
          </div>
        </header>

        {/* Main scan area */}
        <div className="flex min-h-0 flex-1 flex-col items-center justify-center overflow-y-auto px-4 py-5 md:overflow-hidden md:px-8 md:py-5 ipad:px-10 lg:px-10 xl:px-12 ipad-pro:px-14">
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

      {/* RIGHT — Cart rail: sale tools + cart (split from scan header for calmer layout) */}
      <aside className="pos-cart-rail flex min-h-0 w-full min-w-0 shrink-0 flex-col overflow-hidden md:w-[min(100%,36rem)] md:min-w-[28rem] lg:min-w-[30rem] xl:min-w-[31rem] ipad-pro:min-w-[33rem]">
        <CustomerToolbar
          customerId={customerId}
          cartItemCount={itemCount}
          parkedCount={parkedCount}
          onAttachCustomer={onAttachCustomer}
          onClearCustomer={onClearCustomer}
          onParkSale={onParkSale}
          onRecallParkedSale={onRecallParkedSale}
        />
        {cart.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center px-6 py-10">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-border/60 bg-background shadow-sm">
              <Scan className="h-8 w-8 text-muted-foreground/45" />
            </div>
            <p className="text-base font-semibold text-muted-foreground">No items yet</p>
            <p className="mt-1 text-center text-sm text-muted-foreground/80">Scan a product to begin</p>
            <p className="mt-4 text-center text-xs text-muted-foreground/90">
              {customerDisplayName != null ? `Customer: ${customerDisplayName}` : 'No customer'}
            </p>
          </div>
        ) : (
          <>
            <div className="flex h-16 shrink-0 items-center justify-between gap-3 border-b border-border/40 bg-card/60 px-5 md:px-6">
              <div className="min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground md:text-xs md:tracking-[0.2em]">
                  Current sale
                </p>
                <p className="mt-0.5 text-sm text-foreground">
                  {itemCount} line{itemCount !== 1 ? 's' : ''}
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground/90">
                  {customerDisplayName != null ? `Customer: ${customerDisplayName}` : 'No customer'}
                </p>
                {removeMode && (
                  <p className="mt-1 text-[11px] font-medium text-destructive">Tap a line to remove</p>
                )}
              </div>
              <button
                type="button"
                onClick={onClear}
                className="shrink-0 rounded-lg px-3 py-2 text-sm font-medium text-destructive/80 hover:bg-destructive/10 hover:text-destructive pos-transition"
              >
                Clear
              </button>
            </div>

            <div className="min-h-0 flex-1 space-y-2 overflow-y-auto px-5 py-3 md:px-6">
              {cart.map((item, idx) => (
                <div
                  key={item.id}
                  className="rounded-xl border border-border/50 bg-card px-4 py-3 shadow-sm pos-slide-up"
                  style={{ animationDelay: `${idx * 30}ms` }}
                >
                  <div
                    className={`flex items-start gap-3 ${removeMode ? 'cursor-pointer rounded-lg hover:bg-muted/50 pos-transition' : ''}`}
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
                      <button
                        type="button"
                        onClick={() => onUpdateQty(item.id, -1)}
                        className="flex h-10 w-10 items-center justify-center rounded-lg border border-border/60 bg-background shadow-sm hover:bg-accent pos-transition active:scale-95"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="min-w-[2.5rem] text-center text-sm font-bold tabular-nums text-foreground">{item.quantity}</span>
                      <button
                        type="button"
                        onClick={() => onUpdateQty(item.id, 1)}
                        className="flex h-10 w-10 items-center justify-center rounded-lg border border-border/60 bg-background shadow-sm hover:bg-accent pos-transition active:scale-95"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                    <span className="text-base font-bold text-foreground tabular-nums">${(item.product.price * item.quantity).toFixed(2)}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="shrink-0 border-t border-border/40 bg-card/40 px-5 pb-6 pt-4 md:px-6">
              <div className="mb-4 grid grid-cols-[1fr_auto] gap-x-6 gap-y-1.5 text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="text-right font-medium tabular-nums text-foreground">${subtotal.toFixed(2)}</span>
                <span className="text-muted-foreground">Tax (8%)</span>
                <span className="text-right font-medium tabular-nums text-foreground">${tax.toFixed(2)}</span>
              </div>
              <div className="mb-5 flex items-end justify-between gap-4 border-t border-border/30 pt-4">
                <span className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">Total</span>
                <span className="text-3xl font-extrabold tabular-nums leading-none text-primary md:text-4xl">${total.toFixed(2)}</span>
              </div>
              <Button variant="pos" size="pos-xl" className="h-14 w-full text-base font-semibold md:h-[3.75rem] md:text-lg" onClick={onCheckout}>
                Charge ${total.toFixed(2)}
                <ArrowRight className="ml-2 h-5 w-5 md:h-6 md:w-6" />
              </Button>
            </div>
          </>
        )}
      </aside>

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
