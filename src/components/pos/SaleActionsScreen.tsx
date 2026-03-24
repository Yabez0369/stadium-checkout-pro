import { useState } from 'react';
import { ArrowLeft, ArrowRight, Tag, StickyNote, Gift } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SaleActionsScreenProps {
  orderNote: string;
  discountCode: string;
  isGift: boolean;
  giftReceipt: boolean;
  onUpdate: (data: { orderNote: string; discountCode: string; isGift: boolean; giftReceipt: boolean }) => void;
  onBack: () => void;
  onNext: () => void;
}

export default function SaleActionsScreen({ orderNote, discountCode, isGift, giftReceipt, onUpdate, onBack, onNext }: SaleActionsScreenProps) {
  const [note, setNote] = useState(orderNote);
  const [code, setCode] = useState(discountCode);
  const [gift, setGift] = useState(isGift);
  const [gReceipt, setGReceipt] = useState(giftReceipt);

  const handleNext = () => {
    onUpdate({ orderNote: note, discountCode: code, isGift: gift, giftReceipt: gReceipt });
    onNext();
  };

  return (
    <div className="flex flex-col h-full pos-fade-in">
      <div className="px-6 pt-5 pb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="pos-ghost" size="pos-icon" onClick={onBack}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h2 className="text-xl font-bold text-foreground">Sale Options</h2>
            <p className="text-sm text-muted-foreground">Optional — add notes, discounts, or gift settings</p>
          </div>
        </div>
        <Button variant="pos" size="pos-md" onClick={handleNext}>
          Continue to Payment <ArrowRight className="w-5 h-5 ml-1" />
        </Button>
      </div>

      <div className="flex-1 flex items-start justify-center px-6 pt-8">
        <div className="w-full max-w-xl space-y-5">
          {/* Discount Code */}
          <div className="pos-card-elevated p-5">
            <div className="flex items-center gap-3 mb-3">
              <Tag className="w-5 h-5 text-primary" />
              <h3 className="font-semibold text-foreground">Discount Code</h3>
            </div>
            <input
              type="text"
              placeholder="Enter discount code..."
              className="w-full h-12 px-4 rounded-xl bg-secondary text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
              value={code}
              onChange={e => setCode(e.target.value)}
            />
          </div>

          {/* Order Note */}
          <div className="pos-card-elevated p-5">
            <div className="flex items-center gap-3 mb-3">
              <StickyNote className="w-5 h-5 text-primary" />
              <h3 className="font-semibold text-foreground">Order Note</h3>
            </div>
            <textarea
              placeholder="Add a note for this sale..."
              className="w-full h-20 px-4 py-3 rounded-xl bg-secondary text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none"
              value={note}
              onChange={e => setNote(e.target.value)}
            />
          </div>

          {/* Gift Options */}
          <div className="pos-card-elevated p-5">
            <div className="flex items-center gap-3 mb-3">
              <Gift className="w-5 h-5 text-primary" />
              <h3 className="font-semibold text-foreground">Gift Options</h3>
            </div>
            <div className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <div
                  className={`w-6 h-6 rounded-md border-2 flex items-center justify-center pos-transition ${gift ? 'bg-primary border-primary' : 'border-muted-foreground/30'}`}
                  onClick={() => setGift(!gift)}
                >
                  {gift && <span className="text-primary-foreground text-sm font-bold">✓</span>}
                </div>
                <span className="text-sm text-foreground" onClick={() => setGift(!gift)}>Mark as gift</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <div
                  className={`w-6 h-6 rounded-md border-2 flex items-center justify-center pos-transition ${gReceipt ? 'bg-primary border-primary' : 'border-muted-foreground/30'}`}
                  onClick={() => setGReceipt(!gReceipt)}
                >
                  {gReceipt && <span className="text-primary-foreground text-sm font-bold">✓</span>}
                </div>
                <span className="text-sm text-foreground" onClick={() => setGReceipt(!gReceipt)}>Include gift receipt (no prices)</span>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
