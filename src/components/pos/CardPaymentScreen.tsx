import { useState, useEffect } from 'react';
import { ArrowLeft, CreditCard, Wifi, Check, X, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

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
    <div className="flex flex-col h-full items-center justify-center pos-fade-in">
      <div className="absolute top-5 left-6">
        <Button variant="pos-ghost" size="pos-icon" onClick={onBack}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
      </div>

      <div className="text-center mb-8">
        <p className="text-muted-foreground mb-1">Charging</p>
        <p className="text-4xl font-extrabold text-foreground">${total.toFixed(2)}</p>
      </div>

      <div className="pos-card-elevated p-10 w-96 text-center">
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
      <div className="mt-6 flex items-center gap-2 text-sm text-pos-text-muted">
        <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
        <span>Terminal connected</span>
      </div>
    </div>
  );
}
