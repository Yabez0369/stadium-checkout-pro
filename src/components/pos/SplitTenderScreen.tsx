import { useState } from 'react';
import { ArrowLeft, Banknote, CreditCard, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import CustomerDisplayLaunchButton from '@/components/pos/CustomerDisplayLaunchButton';

interface SplitTenderScreenProps {
  total: number;
  onComplete: (cashAmount: number) => void;
  onBack: () => void;
}

type SplitStep = 'enter-cash' | 'card-remainder' | 'done';

export default function SplitTenderScreen({ total, onComplete, onBack }: SplitTenderScreenProps) {
  const [step, setStep] = useState<SplitStep>('enter-cash');
  const [cashAmount, setCashAmount] = useState('');
  const cashNum = parseFloat(cashAmount) || 0;
  const remainder = total - cashNum;
  const validCash = cashNum > 0 && cashNum < total;

  const handleProcessCard = () => {
    setStep('card-remainder');
    setTimeout(() => {
      setStep('done');
      setTimeout(() => onComplete(cashNum), 1200);
    }, 2000);
  };

  return (
    <div className="relative flex min-h-0 flex-1 overflow-hidden pos-fade-in">
      {/* Left - Split summary */}
      <div className="relative flex min-h-0 flex-1 flex-col items-center justify-center overflow-y-auto px-6 md:overflow-hidden md:px-10">
        <div className="absolute left-6 top-5 md:left-10 md:top-8">
          <Button variant="pos-ghost" size="pos-icon" onClick={onBack} className="h-12 w-12 md:h-14 md:w-14 rounded-2xl">
            <ArrowLeft className="h-5 w-5 md:h-6 md:w-6" />
          </Button>
        </div>
        <div className="absolute right-6 top-5 md:right-10 md:top-8">
          <CustomerDisplayLaunchButton variant="compact" />
        </div>

        <h2 className="mb-1 text-xl font-bold text-foreground">Split Payment</h2>
        <p className="mb-5 text-muted-foreground md:mb-6">Pay with Cash + Card</p>

        {/* Visual breakdown */}
        <div className="w-full max-w-sm space-y-4">
          <div className="pos-card-elevated p-5 text-center">
            <p className="text-sm text-muted-foreground mb-1">Total Due</p>
            <p className="text-3xl font-extrabold text-foreground">${total.toFixed(2)}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className={`pos-card-elevated p-4 text-center border-2 ${cashNum > 0 ? 'border-primary/40' : 'border-transparent'}`}>
              <Banknote className="w-6 h-6 text-primary mx-auto mb-2" />
              <p className="text-xs text-muted-foreground">Cash</p>
              <p className="text-xl font-bold text-foreground">${cashNum.toFixed(2)}</p>
              {step !== 'enter-cash' && <p className="text-xs text-success mt-1">✓ Received</p>}
            </div>
            <div className={`pos-card-elevated p-4 text-center border-2 ${step === 'card-remainder' ? 'border-primary/40' : 'border-transparent'}`}>
              <CreditCard className="w-6 h-6 text-primary mx-auto mb-2" />
              <p className="text-xs text-muted-foreground">Card</p>
              <p className="text-xl font-bold text-foreground">${(validCash ? remainder : 0).toFixed(2)}</p>
              {step === 'done' && <p className="text-xs text-success mt-1">✓ Approved</p>}
              {step === 'card-remainder' && <p className="text-xs text-primary animate-pulse mt-1">Processing...</p>}
            </div>
          </div>

          {validCash && (
            <div className="text-center text-sm text-muted-foreground">
              Remaining on card: <span className="font-bold text-foreground">${remainder.toFixed(2)}</span>
            </div>
          )}
        </div>
      </div>

      {/* Right - Input */}
      <div className="flex h-full min-h-0 w-[min(100%,22rem)] shrink-0 flex-col overflow-y-auto border-l border-border/50 bg-card p-5 md:w-96 md:overflow-hidden md:p-7">
        {step === 'enter-cash' && (
          <>
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">Cash Amount</h3>
            <input
              type="number"
              placeholder="0.00"
              className="w-full h-16 px-4 rounded-xl bg-secondary text-2xl font-bold text-foreground text-center placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 mb-4"
              value={cashAmount}
              onChange={e => setCashAmount(e.target.value)}
              autoFocus
            />
            <div className="grid grid-cols-2 gap-3 mb-4">
              {[10, 20, 50, 100].map(amt => (
                <Button key={amt} variant="pos-secondary" size="pos-md" onClick={() => setCashAmount(String(amt))}>
                  ${amt}
                </Button>
              ))}
            </div>
            <div className="mt-auto">
              <Button
                variant="pos"
                size="pos-xl"
                className="w-full"
                disabled={!validCash}
                onClick={handleProcessCard}
              >
                Collect Cash & Charge Card
              </Button>
            </div>
          </>
        )}

        {step === 'card-remainder' && (
          <div className="flex-1 flex flex-col items-center justify-center">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center animate-pulse mb-4">
              <CreditCard className="w-8 h-8 text-primary" />
            </div>
            <p className="text-lg font-semibold text-foreground">Processing Card</p>
            <p className="text-sm text-muted-foreground">${remainder.toFixed(2)} on card</p>
          </div>
        )}

        {step === 'done' && (
          <div className="flex-1 flex flex-col items-center justify-center">
            <div className="w-16 h-16 rounded-2xl bg-success/20 flex items-center justify-center mb-4">
              <Check className="w-8 h-8 text-success" />
            </div>
            <p className="text-lg font-semibold text-success">All Paid!</p>
          </div>
        )}
      </div>
    </div>
  );
}
