import { Check, Printer, Mail, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PaymentSuccessScreenProps {
  total: number;
  tenderMethod: 'cash' | 'card' | 'split';
  cashReceived: number;
  splitCashAmount: number;
  transactionId: string;
  onNewSale: () => void;
}

export default function PaymentSuccessScreen({ total, tenderMethod, cashReceived, splitCashAmount, transactionId, onNewSale }: PaymentSuccessScreenProps) {
  const change = tenderMethod === 'cash' ? cashReceived - total : 0;

  return (
    <div className="flex flex-col h-full items-center justify-center pos-fade-in">
      {/* Success animation */}
      <div className="w-24 h-24 rounded-full bg-success/20 flex items-center justify-center mb-6 pos-scale-in">
        <Check className="w-12 h-12 text-success" strokeWidth={3} />
      </div>

      <h1 className="text-3xl font-bold text-foreground mb-1">Payment Complete</h1>
      <p className="text-muted-foreground mb-8">{transactionId}</p>

      {/* Payment summary */}
      <div className="pos-card-elevated p-6 w-96 mb-8">
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Total Paid</span>
            <span className="font-bold text-foreground">${total.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Method</span>
            <span className="font-medium text-foreground capitalize">
              {tenderMethod === 'split' ? 'Cash + Card' : tenderMethod}
            </span>
          </div>
          {tenderMethod === 'cash' && (
            <>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Cash Received</span>
                <span className="text-foreground">${cashReceived.toFixed(2)}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-border/50">
                <span className="text-muted-foreground">Change</span>
                <span className="font-bold text-success text-lg">${change.toFixed(2)}</span>
              </div>
            </>
          )}
          {tenderMethod === 'split' && (
            <>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Cash Portion</span>
                <span className="text-foreground">${splitCashAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Card Portion</span>
                <span className="text-foreground">${(total - splitCashAmount).toFixed(2)}</span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Receipt options */}
      <div className="flex gap-4 mb-8">
        <Button variant="pos-secondary" size="pos-lg" className="w-36">
          <Printer className="w-5 h-5 mr-2" />
          Print
        </Button>
        <Button variant="pos-secondary" size="pos-lg" className="w-36">
          <Mail className="w-5 h-5 mr-2" />
          Email
        </Button>
        <Button variant="pos-ghost" size="pos-lg" className="w-36">
          <X className="w-5 h-5 mr-2" />
          No Receipt
        </Button>
      </div>

      {/* New sale */}
      <Button variant="pos" size="pos-xl" onClick={onNewSale} className="min-w-[250px]">
        Start New Sale
      </Button>
    </div>
  );
}
