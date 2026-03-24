import { useState } from 'react';
import { ArrowLeft, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CashPaymentScreenProps {
  total: number;
  onComplete: (cashReceived: number) => void;
  onBack: () => void;
}

const QUICK_AMOUNTS = [5, 10, 20, 50, 100, 200];

export default function CashPaymentScreen({ total, onComplete, onBack }: CashPaymentScreenProps) {
  const [received, setReceived] = useState(0);
  const change = received - total;
  const canComplete = received >= total;

  return (
    <div className="flex h-full pos-fade-in">
      {/* Left — Display */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 relative">
        <div className="absolute top-5 left-6">
          <Button variant="pos-ghost" size="pos-icon" onClick={onBack}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </div>

        <p className="text-sm text-muted-foreground uppercase tracking-wider mb-1">Amount Due</p>
        <p className="text-4xl font-extrabold text-foreground mb-10">${total.toFixed(2)}</p>

        <div className="pos-card-elevated p-8 w-full max-w-sm text-center">
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

      {/* Right — Denominations */}
      <div className="w-72 bg-card/50 border-l border-border/30 p-5 flex flex-col">
        <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium mb-4">Quick Amounts</p>
        <div className="grid grid-cols-2 gap-2.5 mb-4">
          {QUICK_AMOUNTS.map(amt => (
            <Button key={amt} variant="pos-secondary" size="pos-lg" onClick={() => setReceived(prev => prev + amt)}>
              ${amt}
            </Button>
          ))}
        </div>
        <div className="flex gap-2.5 mb-4">
          <Button variant="pos-secondary" size="pos-md" className="flex-1" onClick={() => setReceived(Math.ceil(total * 100) / 100)}>
            Exact
          </Button>
          <Button variant="pos-ghost" size="pos-md" className="flex-1" onClick={() => setReceived(0)}>
            Clear
          </Button>
        </div>
        <div className="mt-auto">
          <Button variant="pos-success" size="pos-xl" className="w-full" disabled={!canComplete} onClick={() => onComplete(received)}>
            <Check className="w-5 h-5 mr-2" />
            Confirm
          </Button>
        </div>
      </div>
    </div>
  );
}
