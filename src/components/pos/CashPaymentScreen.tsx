import { useState } from 'react';
import { ArrowLeft, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import CustomerDisplayLaunchButton from '@/components/pos/CustomerDisplayLaunchButton';

interface CashPaymentScreenProps {
  total: number;
  onComplete: (cashReceived: number) => void;
  onBack: () => void;
}

function parseCashInput(raw: string): number {
  const n = parseFloat(raw);
  return Number.isFinite(n) && n >= 0 ? n : 0;
}

export default function CashPaymentScreen({ total, onComplete, onBack }: CashPaymentScreenProps) {
  const [amountStr, setAmountStr] = useState('');
  const received = parseCashInput(amountStr);
  const change = received - total;
  const canComplete = received >= total;

  const handleAmountChange = (value: string) => {
    if (value === '') {
      setAmountStr('');
      return;
    }
    if (!/^\d*\.?\d{0,2}$/.test(value)) return;
    setAmountStr(value);
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden pos-fade-in">
      <header className="pos-register-header grid shrink-0 grid-cols-[1fr_auto_1fr] items-center gap-2 px-4 md:px-8 xl:px-10 ipad-pro:px-12">
        <div className="flex justify-start">
          <Button variant="pos-ghost" size="pos-icon" onClick={onBack} className="h-11 w-11 rounded-2xl md:h-12 md:w-12">
            <ArrowLeft className="h-5 w-5 md:h-6 md:w-6" />
          </Button>
        </div>
        <p className="text-center text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground md:text-xs">Cash</p>
        <div className="flex justify-end">
          <CustomerDisplayLaunchButton variant="compact" />
        </div>
      </header>

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden md:flex-row">
      {/* Summary */}
      <div className="relative flex min-h-0 flex-1 flex-col items-center justify-center overflow-y-auto px-6 py-6 md:overflow-hidden md:px-10 md:py-8">
        <p className="mb-1 text-sm uppercase tracking-wider text-muted-foreground md:text-base">Amount Due</p>
        <p className="mb-5 text-4xl font-extrabold text-foreground md:mb-6 md:text-5xl lg:mb-8 lg:text-6xl">${total.toFixed(2)}</p>

        <div className="w-full max-w-sm pos-card-elevated p-6 text-center md:max-w-md md:p-10">
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Cash Received</p>
          <p className="text-5xl font-extrabold text-primary mb-2">${received.toFixed(2)}</p>

          {canComplete && (
            <div className="pt-4 border-t border-border/30 mt-4">
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Change Due</p>
              <p className="text-3xl font-extrabold text-success">${change.toFixed(2)}</p>
            </div>
          )}
        </div>
      </div>

      {/* Entry */}
      <div className="flex min-h-0 w-full shrink-0 flex-col justify-center gap-4 overflow-y-auto border-t border-border/40 bg-card/60 p-5 md:w-[min(100%,28rem)] md:overflow-hidden md:border-l md:border-t-0 md:gap-5 md:p-7">
        <div>
          <label htmlFor="cash-received" className="text-xs text-muted-foreground uppercase tracking-wider font-medium block mb-2">
            Customer paid
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-bold text-muted-foreground">$</span>
            <input
              id="cash-received"
              type="text"
              inputMode="decimal"
              autoComplete="off"
              autoFocus
              placeholder="0.00"
              className="h-16 w-full rounded-xl bg-secondary pl-10 pr-4 text-right text-2xl font-bold text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/40 md:h-[4.25rem] md:pl-12 md:text-3xl"
              value={amountStr}
              onChange={e => handleAmountChange(e.target.value)}
            />
          </div>
          {amountStr !== '' && received < total && (
            <p className="text-sm text-destructive mt-2">
              Need ${(total - received).toFixed(2)} more
            </p>
          )}
        </div>

        <div className="flex gap-3">
          <Button
            type="button"
            variant="pos-secondary"
            size="pos-lg"
            className="flex-1"
            onClick={() => setAmountStr('')}
          >
            Clear
          </Button>
          <Button
            type="button"
            variant="pos-success"
            size="pos-lg"
            className="flex-[2]"
            disabled={!canComplete}
            onClick={() => onComplete(received)}
          >
            <Check className="w-5 h-5 mr-2" />
            Confirm
          </Button>
        </div>
      </div>
      </div>
    </div>
  );
}
