import { useState, useEffect } from 'react';
import { ArrowLeft, CreditCard, Wifi, Check, X, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import CustomerDisplayLaunchButton from '@/components/pos/CustomerDisplayLaunchButton';

interface CardPaymentScreenProps {
  total: number;
  onComplete: () => void;
  onBack: () => void;
}

type CardState = 'waiting' | 'processing' | 'approved' | 'declined';

export default function CardPaymentScreen({ total, onComplete, onBack }: CardPaymentScreenProps) {
  const [state, setState] = useState<CardState>('waiting');

  // Simulate card processing
  const simulatePayment = (shouldSucceed = true) => {
    setState('processing');
    setTimeout(() => {
      setState(shouldSucceed ? 'approved' : 'declined');
    }, 2000);
  };

  useEffect(() => {
    if (state === 'approved') {
      const timer = setTimeout(onComplete, 1500);
      return () => clearTimeout(timer);
    }
  }, [state, onComplete]);

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden pos-fade-in">
      <header className="pos-register-header grid shrink-0 grid-cols-[1fr_auto_1fr] items-center gap-2 px-4 md:px-8 xl:px-10 ipad-pro:px-12">
        <div className="flex justify-start">
          <Button variant="pos-ghost" size="pos-icon" onClick={onBack} className="h-11 w-11 rounded-2xl md:h-12 md:w-12">
            <ArrowLeft className="h-5 w-5 md:h-6 md:w-6" />
          </Button>
        </div>
        <p className="text-center text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground md:text-xs">Card</p>
        <div className="flex justify-end">
          <CustomerDisplayLaunchButton variant="compact" />
        </div>
      </header>

      <div className="flex min-h-0 flex-1 flex-col items-center justify-center overflow-y-auto px-4 py-6 md:overflow-hidden md:px-8 md:py-8">
      <div className="mb-5 shrink-0 text-center md:mb-6">
        <p className="mb-1 text-muted-foreground md:text-lg">Charging</p>
        <p className="text-4xl font-extrabold text-foreground md:text-5xl lg:text-6xl">${total.toFixed(2)}</p>
      </div>

      <div className="w-full max-w-md shrink-0 rounded-2xl border border-border/50 bg-card p-6 text-center shadow-sm md:max-w-lg md:p-10">
        {state === 'waiting' && (
          <>
            <div className="w-20 h-20 rounded-2xl bg-primary/10 mx-auto mb-6 flex items-center justify-center animate-pulse">
              <Wifi className="w-10 h-10 text-primary" />
            </div>
            <p className="text-lg font-semibold text-foreground mb-1">Ready for Card</p>
            <p className="text-sm text-muted-foreground mb-6">Tap, insert, or swipe card on terminal</p>
            {/* Demo buttons */}
            <div className="flex gap-3">
              <Button variant="pos-secondary" size="pos-md" className="flex-1" onClick={() => simulatePayment(true)}>
                Simulate Approve
              </Button>
              <Button variant="pos-ghost" size="pos-md" className="flex-1" onClick={() => simulatePayment(false)}>
                Simulate Decline
              </Button>
            </div>
          </>
        )}

        {state === 'processing' && (
          <>
            <div className="w-20 h-20 rounded-2xl bg-primary/10 mx-auto mb-6 flex items-center justify-center">
              <CreditCard className="w-10 h-10 text-primary animate-pulse" />
            </div>
            <p className="text-lg font-semibold text-foreground mb-1">Processing...</p>
            <p className="text-sm text-muted-foreground">Communicating with card terminal</p>
          </>
        )}

        {state === 'approved' && (
          <>
            <div className="w-20 h-20 rounded-2xl bg-success/20 mx-auto mb-6 flex items-center justify-center">
              <Check className="w-10 h-10 text-success" />
            </div>
            <p className="text-lg font-semibold text-success mb-1">Approved</p>
            <p className="text-sm text-muted-foreground">Payment successful</p>
          </>
        )}

        {state === 'declined' && (
          <>
            <div className="w-20 h-20 rounded-2xl bg-destructive/10 mx-auto mb-6 flex items-center justify-center">
              <X className="w-10 h-10 text-destructive" />
            </div>
            <p className="text-lg font-semibold text-destructive mb-1">Declined</p>
            <p className="text-sm text-muted-foreground mb-6">Card was declined. Try again or use another method.</p>
            <div className="flex gap-3">
              <Button variant="pos-secondary" size="pos-md" className="flex-1" onClick={() => setState('waiting')}>
                <RotateCcw className="w-4 h-4 mr-1" /> Retry
              </Button>
              <Button variant="pos-ghost" size="pos-md" className="flex-1" onClick={onBack}>
                Other Method
              </Button>
            </div>
          </>
        )}
      </div>

      {/* Terminal status */}
      <div className="mt-6 flex shrink-0 items-center gap-2 text-sm text-pos-text-muted">
        <div className="h-2 w-2 animate-pulse rounded-full bg-success" />
        <span>Terminal connected</span>
      </div>
      </div>
    </div>
  );
}
