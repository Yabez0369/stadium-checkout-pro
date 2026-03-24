import { Banknote, CreditCard, Split, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface TenderScreenProps {
  total: number;
  onSelect: (method: 'cash' | 'card' | 'split') => void;
  onBack: () => void;
}

export default function TenderScreen({ total, onSelect, onBack }: TenderScreenProps) {
  return (
    <div className="flex flex-col h-full items-center justify-center pos-fade-in">
      <div className="absolute top-5 left-6">
        <Button variant="pos-ghost" size="pos-icon" onClick={onBack}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
      </div>

      <div className="text-center mb-10">
        <p className="text-muted-foreground text-base mb-1">Amount Due</p>
        <p className="text-5xl font-extrabold text-primary">${total.toFixed(2)}</p>
      </div>

      <div className="flex gap-5">
        {[
          { method: 'cash' as const, icon: Banknote, label: 'Cash', desc: 'Cash payment' },
          { method: 'card' as const, icon: CreditCard, label: 'Card', desc: 'Tap / Insert / Swipe' },
          { method: 'split' as const, icon: Split, label: 'Split', desc: 'Cash + Card' },
        ].map(({ method, icon: Icon, label, desc }) => (
          <button
            key={method}
            onClick={() => onSelect(method)}
            className="w-48 h-52 pos-card-elevated flex flex-col items-center justify-center gap-4 hover:ring-2 hover:ring-primary/40 pos-transition active:scale-[0.96] rounded-2xl"
          >
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Icon className="w-8 h-8 text-primary" />
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-foreground">{label}</p>
              <p className="text-sm text-muted-foreground">{desc}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
