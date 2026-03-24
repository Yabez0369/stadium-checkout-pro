import { useState } from 'react';
import { ArrowLeft, Banknote, Check } from 'lucide-react';
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

  const handleQuick = (amount: number) => {
    setReceived(prev => prev + amount);
  };

  const handleExact = () => setReceived(Math.ceil(total * 100) / 100);

  const handleClear = () => setReceived(0);

  return (
    <div className="flex h-full pos-fade-in">
      {/* Left - Amount display */}
      <div className="flex-1 flex flex-col items-center justify-center px-8">
        <div className="absolute top-5 left-6">
          <Button variant="pos-ghost" size="pos-icon" onClick={onBack}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </div>

        <div className="text-center mb-8">
          <p className="text-muted-foreground mb-1">Amount Due</p>
          <p className="text-4xl font-extrabold text-foreground">${total.toFixed(2)}</p>
        </div>

        <div className="pos-card-elevated p-8 w-full max-w-sm text-center">
          <p className="text-muted-foreground text-sm mb-1">Cash Received</p>
          <p className="text-5xl font-extrabold text-primary mb-4">${received.toFixed(2)}</p>

          {canComplete && (
            <div className="pt-4 border-t border-border/50">
              <p className="text-muted-foreground text-sm mb-1">Change Due</p>
              <p className="text-3xl font-extrabold text-success">${change.toFixed(2)}</p>
            </div>
          )}
        </div>

        {canComplete && (
          <div className="mt-4 flex items-center gap-2 text-sm text-pos-gold-soft">
            <Banknote className="w-4 h-4" />
            <span>Open cash drawer</span>
          </div>
        )}
      </div>

      {/* Right - Denominations */}
      <div className="w-80 bg-card border-l border-border/50 p-5 flex flex-col">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">Quick Amounts</h3>
        <div className="grid grid-cols-2 gap-3 mb-4">
          {QUICK_AMOUNTS.map(amt => (
            <Button key={amt} variant="pos-secondary" size="pos-lg" onClick={() => handleQuick(amt)}>
              ${amt}
            </Button>
          ))}
        </div>
        <div className="flex gap-3 mb-4">
          <Button variant="pos-secondary" size="pos-md" className="flex-1" onClick={handleExact}>
            Exact
          </Button>
          <Button variant="pos-ghost" size="pos-md" className="flex-1" onClick={handleClear}>
            Clear
          </Button>
        </div>
        <div className="mt-auto">
          <Button
            variant="pos-success"
            size="pos-xl"
            className="w-full"
            disabled={!canComplete}
            onClick={() => onComplete(received)}
          >
            <Check className="w-6 h-6 mr-2" />
            Confirm Payment
          </Button>
        </div>
      </div>
    </div>
  );
}
