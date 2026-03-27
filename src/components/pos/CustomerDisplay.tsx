import { CartItem, getCartSubtotal, getCartTax } from '@/data/posProducts';
import { Check, CreditCard, Loader2, Sparkles, Ticket, UserRound } from 'lucide-react';

interface CustomerDisplayProps {
  cart: CartItem[];
  orderDiscount: number;
  paymentState: 'scanning' | 'paying' | 'processing' | 'complete';
  total: number;
  tenderMethod?: 'cash' | 'card' | 'split' | null;
  /** Shown on receipt step */
  transactionId?: string;
  /** Shown when the sale is linked to a customer */
  customerName?: string | null;
  /** True when no register has connected yet (BroadcastChannel idle) */
  awaitingRegister?: boolean;
}

function tenderLabel(method: 'cash' | 'card' | 'split' | null | undefined): string {
  if (method === 'split') return 'Cash + Card';
  if (method === 'cash') return 'Cash';
  if (method === 'card') return 'Card';
  return 'Payment';
}

export default function CustomerDisplay({
  cart,
  orderDiscount,
  paymentState,
  total,
  tenderMethod,
  transactionId,
  customerName,
  awaitingRegister,
}: CustomerDisplayProps) {
  const subtotal = getCartSubtotal(cart);
  const tax = getCartTax(cart, orderDiscount);
  const itemCount = cart.reduce((s, i) => s + i.quantity, 0);
  const hasItems = cart.length > 0;

  return (
    <div className="customer-display-root pos-app-shell relative overflow-hidden bg-[#f8fafc] text-slate-900">
      {/* Ambient layers — light, airy */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 100% 70% at 50% -15%, hsl(221 83% 53% / 0.12) 0%, transparent 55%), radial-gradient(ellipse 60% 45% at 100% 100%, hsl(199 89% 48% / 0.08) 0%, transparent 50%), linear-gradient(180deg, #f8fafc 0%, #f1f5f9 45%, #f8fafc 100%)',
        }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2248%22%20height%3D%2248%22%3E%3Cpath%20d%3D%22M0%2048h48M48%200v48%22%20stroke%3D%22%230f172a%22%20stroke-opacity%3D%220.04%22%2F%3E%3C%2Fsvg%3E')]"
        aria-hidden
      />

      {/* Header */}
      <header className="relative z-10 flex h-[3.75rem] shrink-0 items-center justify-between border-b border-slate-200/80 bg-white/70 px-5 shadow-sm backdrop-blur-md sm:h-16 sm:px-8 md:h-[4.25rem] md:px-10 xl:px-12 ipad-pro:px-14">
        <div className="flex min-w-0 items-center gap-3 md:gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/15 to-primary/5 ring-1 ring-primary/20 md:h-12 md:w-12">
            <Ticket className="h-5 w-5 text-primary md:h-6 md:w-6" strokeWidth={2.25} />
          </div>
          <div className="min-w-0">
            <p className="truncate text-base font-bold tracking-tight md:text-lg">
              <span className="text-slate-900">SCS</span>
              <span className="bg-gradient-to-r from-primary to-sky-600 bg-clip-text text-transparent">-TIX</span>
            </p>
            <p className="truncate text-[11px] font-medium uppercase tracking-[0.2em] text-slate-500 md:text-xs">
              Customer display
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 rounded-full border border-slate-200/90 bg-white/90 px-3 py-1.5 shadow-sm md:px-4">
          <Sparkles className="h-3.5 w-3.5 text-amber-500 md:h-4 md:w-4" />
          <span className="text-[11px] font-medium text-slate-600 md:text-xs">Your order</span>
        </div>
      </header>

      {/* Body */}
      <div className="relative z-10 flex min-h-0 flex-1 gap-0 overflow-hidden md:gap-px">
        {/* Line items */}
        <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
          <div className="shrink-0 border-b border-slate-200/80 bg-white/40 px-5 py-3 sm:px-8 md:px-10 md:py-4 xl:px-12 ipad-pro:px-14">
            <h2 className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500 md:text-xs">
              {hasItems ? 'Items in your order' : 'Order'}
            </h2>
            {customerName ? (
              <div className="mt-2 flex items-center gap-2 text-sm text-slate-600 md:text-base">
                <UserRound className="h-4 w-4 shrink-0 text-slate-400" aria-hidden />
                <span className="min-w-0 truncate">
                  <span className="font-medium text-slate-500">Customer · </span>
                  <span className="font-semibold text-slate-800">{customerName}</span>
                </span>
              </div>
            ) : null}
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4 sm:px-8 md:px-10 md:py-6 xl:px-12 xl:py-8 ipad-pro:px-14">
            {awaitingRegister && !hasItems ? (
              <div className="flex h-full min-h-[12rem] flex-col items-center justify-center text-center">
                <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-3xl border border-slate-200 bg-white shadow-[0_12px_40px_-16px_rgba(15,23,42,0.12)]">
                  <Loader2 className="h-10 w-10 animate-spin text-primary" strokeWidth={2} />
                </div>
                <p className="text-xl font-semibold tracking-tight text-slate-900 md:text-2xl">Waiting for register</p>
                <p className="mt-2 max-w-sm text-sm leading-relaxed text-slate-500">
                  Open Billing on the terminal — this screen will mirror the sale live.
                </p>
              </div>
            ) : !hasItems ? (
              <div className="flex h-full min-h-[12rem] flex-col items-center justify-center text-center">
                <div className="mb-8 flex h-28 w-28 items-center justify-center rounded-[2rem] border border-slate-200/90 bg-white text-5xl shadow-[0_8px_30px_-12px_rgba(15,23,42,0.1)]">
                  ⚽
                </div>
                <p className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl lg:text-4xl">Welcome</p>
                <p className="mt-3 max-w-md text-base leading-relaxed text-slate-500 md:text-lg">
                  Your items will appear here as they are added.
                </p>
              </div>
            ) : (
              <ul className="space-y-3 md:space-y-4">
                {cart.map((item, idx) => (
                  <li
                    key={item.id}
                    className="pos-slide-up flex items-center gap-4 rounded-2xl border border-slate-200/90 bg-white p-4 shadow-[0_4px_24px_-8px_rgba(15,23,42,0.08)] md:gap-5 md:p-5"
                    style={{ animationDelay: `${idx * 40}ms` }}
                  >
                    <div
                      className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-2xl shadow-inner md:h-16 md:w-16 md:text-3xl"
                      style={{ backgroundColor: `${item.product.color}28` }}
                    >
                      {item.product.emoji}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-base font-semibold text-slate-900 md:text-lg">{item.product.name}</p>
                      {item.selectedVariant && (
                        <p className="mt-0.5 text-sm text-slate-500">Size {item.selectedVariant.label}</p>
                      )}
                      <p className="mt-1 text-xs tabular-nums text-slate-500">
                        ${item.product.price.toFixed(2)} × {item.quantity}
                      </p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-lg font-bold tabular-nums text-slate-900 md:text-xl">
                        ${(item.product.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Totals rail */}
        <aside className="flex w-full min-w-0 shrink-0 flex-col border-t border-slate-200/90 bg-white/90 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.8)] backdrop-blur-xl sm:w-[min(100%,22rem)] md:w-[min(100%,26rem)] md:border-l md:border-t-0 lg:w-[min(100%,28rem)] xl:w-[min(100%,30rem)] ipad-pro:w-[min(100%,32rem)]">
          <div className="flex min-h-0 flex-1 flex-col justify-end p-5 sm:p-6 md:p-8 xl:p-10 ipad-pro:p-12">
            {hasItems && (
              <div className="space-y-3 border-b border-slate-200/80 pb-6">
                <div className="flex justify-between text-sm text-slate-500">
                  <span>
                    Subtotal · {itemCount} item{itemCount !== 1 ? 's' : ''}
                  </span>
                  <span className="tabular-nums font-medium text-slate-800">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm text-slate-500">
                  <span>Tax</span>
                  <span className="tabular-nums font-medium text-slate-800">${tax.toFixed(2)}</span>
                </div>
              </div>
            )}

            <div className={hasItems ? 'pt-6' : ''}>
              <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-slate-500">Total due</p>
              <p className="mt-2 bg-gradient-to-br from-primary via-sky-600 to-sky-700 bg-clip-text text-5xl font-extrabold tabular-nums tracking-tight text-transparent md:text-6xl lg:text-7xl">
                ${total.toFixed(2)}
              </p>
              {transactionId && paymentState === 'complete' && (
                <p className="mt-3 font-mono text-[11px] text-slate-500 md:text-xs">{transactionId}</p>
              )}
            </div>

            {/* Payment state */}
            <div className="mt-8 space-y-4">
              {paymentState === 'paying' && (
                <div className="rounded-2xl border border-primary/25 bg-gradient-to-br from-primary/[0.08] to-sky-50/80 p-6 text-center shadow-[0_8px_32px_-12px_hsl(221_83%_53%/0.2)] pos-fade-in">
                  <CreditCard className="mx-auto mb-3 h-9 w-9 text-primary md:h-10 md:w-10" strokeWidth={1.75} />
                  <p className="text-lg font-semibold text-slate-900 md:text-xl">Payment due</p>
                  <p className="mt-1 text-sm text-slate-600">
                    {tenderMethod ? tenderLabel(tenderMethod) : 'Follow prompts on the terminal'}
                  </p>
                </div>
              )}

              {paymentState === 'processing' && (
                <div className="rounded-2xl border border-slate-200 bg-slate-50/90 p-6 text-center pos-fade-in">
                  <Loader2 className="mx-auto mb-3 h-9 w-9 animate-spin text-primary md:h-10 md:w-10" />
                  <p className="text-lg font-semibold text-slate-900 md:text-xl">Processing payment</p>
                  <p className="mt-1 text-sm text-slate-600">
                    {tenderMethod ? `${tenderLabel(tenderMethod)} · ` : ''}Please wait
                  </p>
                </div>
              )}

              {paymentState === 'complete' && (
                <div className="rounded-2xl border border-emerald-200/90 bg-gradient-to-br from-emerald-50 to-white p-6 text-center shadow-[0_8px_32px_-12px_hsl(152_55%_36%/0.15)] pos-scale-in">
                  <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100">
                    <Check className="h-8 w-8 text-emerald-600" strokeWidth={2.5} />
                  </div>
                  <p className="text-xl font-bold text-emerald-800 md:text-2xl">Thank you</p>
                  <p className="mt-1 text-sm text-slate-600">Your transaction is complete</p>
                </div>
              )}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
