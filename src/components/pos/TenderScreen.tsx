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
    <div className="relative flex min-h-0 flex-1 flex-col items-center justify-center overflow-y-auto px-4 pos-fade-in md:overflow-hidden">
      <div className="absolute top-5 left-6 md:top-8 md:left-10">
        <Button variant="pos-ghost" size="pos-icon" onClick={onBack} className="h-12 w-12 md:h-14 md:w-14 rounded-2xl">
          <ArrowLeft className="h-5 w-5 md:h-6 md:w-6" />
        </Button>
      </div>
      <div className="absolute top-5 right-6 md:top-8 md:right-10">
        <CustomerDisplayLaunchButton variant="compact" />
      </div>

      <p className="mb-1.5 text-sm md:text-base text-muted-foreground uppercase tracking-wider">Amount Due</p>
      <p className="mb-6 text-5xl font-extrabold text-primary md:mb-8 md:text-6xl lg:mb-10 lg:text-7xl">${total.toFixed(2)}</p>

      <div className="flex flex-wrap justify-center gap-3 md:gap-5 lg:gap-8">
        {methods.map(({ method, icon: Icon, label, desc }) => (
          <button
            key={method}
            type="button"
            onClick={() => onSelect(method)}
            className="flex h-44 w-40 flex-col items-center justify-center gap-2 rounded-2xl pos-card-elevated pos-transition hover:ring-2 hover:ring-primary/30 active:scale-[0.96] sm:h-48 sm:w-44 md:h-52 md:w-48 lg:h-56 lg:w-52"
          >
            <div className="flex h-14 w-14 md:h-16 md:w-16 items-center justify-center rounded-2xl bg-primary/10">
              <Icon className="h-7 w-7 text-primary md:h-8 md:w-8" />
            </div>
            <div className="text-center">
              <p className="text-base font-bold text-foreground md:text-lg">{label}</p>
              <p className="text-xs text-muted-foreground md:text-sm">{desc}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
