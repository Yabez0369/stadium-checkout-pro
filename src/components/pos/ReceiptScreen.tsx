import { Check, Printer, Mail, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import CustomerDisplayLaunchButton from '@/components/pos/CustomerDisplayLaunchButton';

interface ReceiptScreenProps {
  total: number;
  tenderMethod: 'cash' | 'card' | 'split';
  cashReceived: number;
  splitCashAmount: number;
  transactionId: string;
  onNewSale: () => void;
}

export default function ReceiptScreen({
  total,
  tenderMethod,
  cashReceived,
  splitCashAmount,
  transactionId,
  onNewSale,
}: ReceiptScreenProps) {
  const change = tenderMethod === 'cash' ? cashReceived - total : 0;

  return (
    <div className="relative flex min-h-0 flex-1 flex-col items-center justify-center overflow-y-auto overflow-x-hidden pos-fade-in md:overflow-hidden">
      <div className="absolute right-6 top-5 z-30 md:right-10 md:top-8">
        <CustomerDisplayLaunchButton variant="compact" />
      </div>
      {/* Ambient backdrop */}
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_85%_55%_at_50%_-5%,hsl(var(--primary)/0.09),transparent_55%)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_100%,hsl(var(--success)/0.06),transparent_50%)]"
        aria-hidden
      />

      <div className="relative z-10 flex w-full max-w-md flex-col items-center px-6 py-6 md:max-w-xl md:px-10 md:py-8 lg:py-10">
        {/* Success */}
        <div className="relative mb-4 md:mb-5">
          <div
            className="absolute inset-0 scale-125 rounded-full bg-success/20 blur-2xl"
            aria-hidden
          />
          <div className="relative flex h-[5.25rem] w-[5.25rem] items-center justify-center rounded-full bg-gradient-to-b from-success/20 to-success/10 shadow-[0_8px_32px_-8px_hsl(var(--success)/0.45)] ring-1 ring-success/25 pos-scale-in">
            <div className="flex h-[4.25rem] w-[4.25rem] items-center justify-center rounded-full bg-background/80 shadow-inner">
              <Check className="h-11 w-11 text-success" strokeWidth={2.75} />
            </div>
          </div>
        </div>

        <h1 className="text-center text-3xl font-bold tracking-tight text-foreground md:text-4xl lg:text-5xl">
          Payment Complete
        </h1>
        <p className="mt-2 font-mono text-xs font-medium tracking-wide text-muted-foreground md:text-sm">
          {transactionId}
        </p>

        {/* Summary */}
        <div className="mt-5 w-full rounded-2xl border border-border/60 bg-card/90 p-5 shadow-[0_12px_48px_-18px_rgba(15,23,42,0.18)] backdrop-blur-sm md:mt-6 md:p-7 lg:p-8">
          <div className="space-y-4">
            <div className="flex items-baseline justify-between gap-4">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Total
              </span>
              <span className="text-xl font-bold tabular-nums tracking-tight text-foreground">
                ${total.toFixed(2)}
              </span>
            </div>
            <div className="flex items-baseline justify-between gap-4">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Method
              </span>
              <span className="text-base font-semibold capitalize text-foreground">
                {tenderMethod === 'split' ? 'Cash + Card' : tenderMethod}
              </span>
            </div>
            {tenderMethod === 'cash' && change > 0 && (
              <div className="flex items-baseline justify-between gap-4 border-t border-border/40 pt-4">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Change
                </span>
                <span className="text-xl font-bold tabular-nums tracking-tight text-success">
                  ${change.toFixed(2)}
                </span>
              </div>
            )}
            {tenderMethod === 'split' && (
              <div className="space-y-3 border-t border-border/40 pt-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Cash</span>
                  <span className="font-medium tabular-nums text-foreground">${splitCashAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Card</span>
                  <span className="font-medium tabular-nums text-foreground">
                    ${(total - splitCashAmount).toFixed(2)}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Receipt actions — two primary */}
        <div className="mt-5 grid w-full grid-cols-2 gap-3 md:mt-6 md:gap-4">
          <Button
            type="button"
            variant="outline"
            size="pos-lg"
            className="h-12 rounded-xl border-border/70 bg-background/80 text-sm font-semibold text-foreground shadow-sm transition-all hover:border-primary/35 hover:bg-primary/[0.06] hover:shadow-md md:h-14 md:text-base"
          >
            <Printer className="mr-2 h-4 w-4 text-primary md:h-5 md:w-5" strokeWidth={2} />
            Receipt printed
          </Button>
          <Button
            type="button"
            variant="outline"
            size="pos-lg"
            className="h-12 rounded-xl border-border/70 bg-background/80 text-sm font-semibold text-foreground shadow-sm transition-all hover:border-primary/35 hover:bg-primary/[0.06] hover:shadow-md md:h-14 md:text-base"
          >
            <Mail className="mr-2 h-4 w-4 text-primary md:h-5 md:w-5" strokeWidth={2} />
            Email
          </Button>
        </div>

        <Button
          variant="pos"
          size="pos-xl"
          onClick={onNewSale}
          className="mt-6 w-full max-w-sm rounded-2xl text-lg shadow-[0_12px_40px_-12px_hsl(var(--primary)/0.55)] transition-all hover:shadow-[0_16px_44px_-12px_hsl(var(--primary)/0.5)] md:mt-8 md:h-[4.25rem] md:max-w-md md:text-xl lg:mt-10"
        >
          New Sale
          <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}
