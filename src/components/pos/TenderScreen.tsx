import { Banknote, CreditCard, Split, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

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
    <div className="flex flex-col h-full items-center justify-center pos-fade-in relative">
      <div className="absolute top-5 left-6">
        <Button variant="pos-ghost" size="pos-icon" onClick={onBack}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
      </div>

      <p className="text-sm text-muted-foreground uppercase tracking-wider mb-2">Amount Due</p>
      <p className="text-5xl font-extrabold text-primary mb-12">${total.toFixed(2)}</p>

      <div className="flex gap-5">
        {methods.map(({ method, icon: Icon, label, desc }) => (
          <button
            key={method}
            onClick={() => onSelect(method)}
            className="w-44 h-48 pos-card-elevated flex flex-col items-center justify-center gap-3 hover:ring-2 hover:ring-primary/30 pos-transition active:scale-[0.96] rounded-2xl"
          >
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Icon className="w-7 h-7 text-primary" />
            </div>
            <div className="text-center">
              <p className="text-base font-bold text-foreground">{label}</p>
              <p className="text-xs text-muted-foreground">{desc}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
