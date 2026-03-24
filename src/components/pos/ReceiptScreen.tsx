import { Check, Printer, Mail, X, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ReceiptScreenProps {
  total: number;
  tenderMethod: 'cash' | 'card' | 'split';
  cashReceived: number;
  splitCashAmount: number;
  transactionId: string;
  onNewSale: () => void;
}

export default function ReceiptScreen({ total, tenderMethod, cashReceived, splitCashAmount, transactionId, onNewSale }: ReceiptScreenProps) {
  const change = tenderMethod === 'cash' ? cashReceived - total : 0;

  return (
    <div className="flex flex-col h-full items-center justify-center pos-fade-in">
      {/* Success check */}
      <div className="w-20 h-20 rounded-full bg-success/15 flex items-center justify-center mb-5 pos-scale-in">
        <Check className="w-10 h-10 text-success" strokeWidth={3} />
      </div>

      <h1 className="text-2xl font-bold text-foreground mb-0.5">Payment Complete</h1>
      <p className="text-sm text-muted-foreground mb-8">{transactionId}</p>

      {/* Summary card */}
      <div className="pos-card-elevated p-5 w-80 mb-8">
        <div className="space-y-2.5">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Total</span>
            <span className="font-bold text-foreground">${total.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Method</span>
            <span className="font-medium text-foreground capitalize">
              {tenderMethod === 'split' ? 'Cash + Card' : tenderMethod}
            </span>
          </div>
          {tenderMethod === 'cash' && change > 0 && (
            <div className="flex justify-between text-sm pt-2 border-t border-border/30">
              <span className="text-muted-foreground">Change</span>
              <span className="font-bold text-success text-lg">${change.toFixed(2)}</span>
            </div>
          )}
          {tenderMethod === 'split' && (
            <>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Cash</span>
                <span className="text-foreground">${splitCashAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Card</span>
                <span className="text-foreground">${(total - splitCashAmount).toFixed(2)}</span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Receipt actions */}
      <div className="flex gap-3 mb-8">
        <Button variant="pos-secondary" size="pos-lg" className="w-32">
          <Printer className="w-4 h-4 mr-2" />
          Print
        </Button>
        <Button variant="pos-secondary" size="pos-lg" className="w-32">
          <Mail className="w-4 h-4 mr-2" />
          Email
        </Button>
        <Button variant="pos-ghost" size="pos-lg" className="w-32">
          <X className="w-4 h-4 mr-2" />
          Skip
        </Button>
      </div>

      {/* New sale */}
      <Button variant="pos" size="pos-xl" onClick={onNewSale} className="min-w-[240px]">
        New Sale
        <ArrowRight className="w-5 h-5 ml-2" />
      </Button>
    </div>
  );
}
