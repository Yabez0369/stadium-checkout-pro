import { Banknote, CreditCard, Split, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import CustomerDisplayLaunchButton from '@/components/pos/CustomerDisplayLaunchButton';

interface TenderScreenProps {
  total: number;
  onSelect: (method: 'cash' | 'card' | 'split') => void;
  onBack: () => void;
}

const methods = [
  { method: 'cash' as const, icon: Banknote, label: 'Cash', desc: 'Cash payment' },
  { method: 'card' as const, icon: CreditCard, label: 'Card', desc: 'Tap · Insert · Swipe' },
  { method: 'split' as const, icon: Split, label: 'Split', desc: 'Cash + Card' },
];

export default function TenderScreen({ total, onSelect, onBack }: TenderScreenProps) {
  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden pos-fade-in">
      <header className="pos-register-header grid shrink-0 grid-cols-[1fr_auto_1fr] items-center gap-2 px-4 md:px-8 xl:px-10 ipad-pro:px-12">
        <div className="flex justify-start">
          <Button variant="pos-ghost" size="pos-icon" onClick={onBack} className="h-11 w-11 rounded-2xl md:h-12 md:w-12">
            <ArrowLeft className="h-5 w-5 md:h-6 md:w-6" />
          </Button>
        </div>
        <p className="text-center text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground md:text-xs">Payment</p>
        <div className="flex justify-end">
          <CustomerDisplayLaunchButton variant="compact" />
        </div>
      </header>

      <div className="flex min-h-0 flex-1 flex-col items-center justify-center overflow-y-auto px-4 py-6 md:overflow-hidden md:px-8 md:py-8">
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground md:text-xs md:tracking-[0.22em]">
          Amount due
        </p>
        <p className="mb-8 text-5xl font-extrabold tabular-nums tracking-tight text-primary md:mb-10 md:text-6xl lg:text-7xl">
          ${total.toFixed(2)}
        </p>

        <div className="flex w-full max-w-4xl flex-wrap items-stretch justify-center gap-4 md:gap-6 lg:gap-8">
          {methods.map(({ method, icon: Icon, label, desc }) => (
            <button
              key={method}
              type="button"
              onClick={() => onSelect(method)}
              className="flex min-h-[11rem] w-[min(100%,10.5rem)] flex-col items-center justify-center gap-3 rounded-2xl border border-border/50 bg-card px-4 py-5 text-center shadow-sm pos-transition hover:border-primary/35 hover:shadow-md active:scale-[0.98] sm:min-h-[12rem] sm:w-44 md:min-h-[13rem] md:w-48 md:gap-4 lg:h-56 lg:w-52"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 md:h-16 md:w-16">
                <Icon className="h-7 w-7 text-primary md:h-8 md:w-8" />
              </div>
              <div>
                <p className="text-base font-bold text-foreground md:text-lg">{label}</p>
                <p className="mt-1 text-xs leading-snug text-muted-foreground md:text-sm">{desc}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
