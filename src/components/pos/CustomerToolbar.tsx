import { useEffect, useMemo, useState } from 'react';
import { User, UserPlus, ParkingCircle, History } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { createCustomer, getCustomerById, searchCustomers, type Customer } from '@/data/customers';
import { getCartTotal } from '@/data/posProducts';
import { getAllParkedSales, MAX_PARKED_SALES, type ParkedSale, type ParkSaleResult } from '@/data/parkedSales';
import { toast } from '@/components/ui/sonner';
import { cn } from '@/lib/utils';

/** One row inside h-16 — matches register header / Display & Sign out height */
const BTN =
  'relative inline-flex h-10 min-h-0 w-full min-w-0 flex-col items-center justify-center gap-0 rounded-xl border border-border/50 bg-card px-1 py-0 text-[10px] font-semibold leading-tight text-foreground shadow-sm pos-transition hover:bg-accent/80 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-40 md:h-11 md:flex-row md:gap-1.5 md:px-1.5 md:text-[11px]';

interface CustomerToolbarProps {
  customerId: string | null;
  cartItemCount: number;
  parkedCount: number;
  onAttachCustomer: (customerId: string | null) => void;
  onClearCustomer: () => void;
  onParkSale: () => ParkSaleResult;
  onRecallParkedSale: (parkedId: string) => void;
}

export default function CustomerToolbar({
  customerId,
  cartItemCount,
  parkedCount,
  onAttachCustomer,
  onClearCustomer,
  onParkSale,
  onRecallParkedSale,
}: CustomerToolbarProps) {
  const [customerSheetOpen, setCustomerSheetOpen] = useState(false);
  const [newOpen, setNewOpen] = useState(false);
  const [recallOpen, setRecallOpen] = useState(false);
  const [parkConfirmOpen, setParkConfirmOpen] = useState(false);
  const [replaceConfirmOpen, setReplaceConfirmOpen] = useState(false);
  const [pendingRecallId, setPendingRecallId] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [parkedList, setParkedList] = useState<ParkedSale[]>([]);

  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newEmail, setNewEmail] = useState('');

  const selectedCustomer = customerId ? getCustomerById(customerId) : undefined;

  const filteredCustomers = useMemo(() => searchCustomers(searchQuery), [searchQuery]);

  useEffect(() => {
    if (!recallOpen) return;
    setParkedList(getAllParkedSales());
  }, [recallOpen, parkedCount]);

  const cartEmpty = cartItemCount === 0;
  /** Park + Recall appear once there is a cart or parked sales to act on (progressive toolbar). */
  const showSaleLifecycleActions = cartItemCount > 0 || parkedCount > 0;
  const parkedAtMax = parkedCount >= MAX_PARKED_SALES;
  const canPark = !cartEmpty && !parkedAtMax;
  const canRecall = parkedCount > 0;
  /** Cart lines or attached customer — restoring would discard current register state */
  const hasPendingSale = cartItemCount > 0 || customerId != null;

  const handleParkConfirm = () => {
    const result = onParkSale();
    setParkConfirmOpen(false);
    if (result.ok) {
      toast.success('Sale parked', { description: 'Register cleared for the next guest.' });
    } else if (result.reason === 'max_reached') {
      toast.error('Park limit reached', {
        description: `You can park up to ${MAX_PARKED_SALES} sales. Recall or complete one first.`,
      });
    }
  };

  const openRecallRestore = (id: string) => {
    if (hasPendingSale) {
      setPendingRecallId(id);
      setReplaceConfirmOpen(true);
      return;
    }
    onRecallParkedSale(id);
    setRecallOpen(false);
    toast.success('Sale restored');
  };

  const confirmReplaceRecall = () => {
    if (pendingRecallId) {
      onRecallParkedSale(pendingRecallId);
      setRecallOpen(false);
      toast.success('Sale restored');
    }
    setPendingRecallId(null);
    setReplaceConfirmOpen(false);
  };

  const handleCreateCustomer = () => {
    const name = newName.trim();
    if (!name) {
      toast.error('Enter a name');
      return;
    }
    const c = createCustomer({
      displayName: name,
      phone: newPhone.trim() || undefined,
      email: newEmail.trim() || undefined,
    });
    onAttachCustomer(c.id);
    setNewName('');
    setNewPhone('');
    setNewEmail('');
    setNewOpen(false);
    toast.success('Customer created', { description: 'Attached to this sale.' });
  };

  const selectCustomer = (c: Customer) => {
    onAttachCustomer(c.id);
    toast.success('Customer attached', { description: c.displayName });
  };

  return (
    <>
      <div className={cn('pos-cart-toolbar w-full px-2 md:px-3')}>
        <div
          className={cn(
            'grid h-full w-full min-w-0 items-center gap-1.5 py-2 md:gap-2',
            showSaleLifecycleActions ? 'grid-cols-4' : 'grid-cols-2',
          )}
        >
          <button
            type="button"
            className={cn(BTN, 'border-primary/35 bg-primary/[0.06]')}
            onClick={() => {
              setSearchQuery('');
              setCustomerSheetOpen(true);
            }}
          >
            <User className="h-4 w-4 shrink-0 text-primary md:h-[1.125rem] md:w-[1.125rem]" />
            <span className="max-w-full truncate">Customer</span>
          </button>
          <button type="button" className={BTN} onClick={() => setNewOpen(true)}>
            <UserPlus className="h-4 w-4 shrink-0 text-muted-foreground md:h-[1.125rem] md:w-[1.125rem]" />
            <span className="max-w-full truncate">New</span>
          </button>
          {showSaleLifecycleActions && (
            <>
              <button
                type="button"
                className={BTN}
                disabled={!canPark}
                title={
                  parkedAtMax
                    ? `Park limit reached (${MAX_PARKED_SALES}). Recall or complete a parked sale first.`
                    : cartEmpty
                      ? 'Add items to the cart to park this sale'
                      : undefined
                }
                onClick={() => setParkConfirmOpen(true)}
              >
                <ParkingCircle className="h-4 w-4 shrink-0 text-muted-foreground md:h-[1.125rem] md:w-[1.125rem]" />
                <span className="max-w-full truncate">Park</span>
              </button>
              <button
                type="button"
                className={BTN}
                disabled={!canRecall}
                title={!canRecall ? 'No parked sales to recall' : undefined}
                onClick={() => setRecallOpen(true)}
              >
                <span className="relative inline-flex shrink-0 items-center justify-center">
                  <History className="h-4 w-4 text-muted-foreground md:h-[1.125rem] md:w-[1.125rem]" />
                  {parkedCount > 0 && (
                    <Badge
                      variant="secondary"
                      className="absolute -right-2 -top-2 flex h-4 min-w-[1rem] items-center justify-center px-0.5 text-[9px] font-bold leading-none"
                    >
                      {parkedCount > 99 ? '99+' : parkedCount}
                    </Badge>
                  )}
                </span>
                <span className="max-w-full truncate">Recall</span>
              </button>
            </>
          )}
        </div>
      </div>

      <Sheet open={customerSheetOpen} onOpenChange={setCustomerSheetOpen}>
        <SheetContent side="right" className="flex w-full flex-col sm:max-w-md">
          <SheetHeader className="text-left">
            <SheetTitle>Customer</SheetTitle>
            <SheetDescription>Search and attach a shopper to this sale.</SheetDescription>
          </SheetHeader>
          <div className="mt-4 space-y-4">
            <div className="rounded-2xl border border-border/50 bg-muted/30 px-4 py-3">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Selected
              </p>
              <p className="mt-1 text-base font-semibold text-foreground">
                {selectedCustomer?.displayName ?? 'No customer'}
              </p>
              {selectedCustomer && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="mt-3 rounded-xl"
                  onClick={() => {
                    onClearCustomer();
                    toast.message('Customer cleared');
                  }}
                >
                  Clear attachment
                </Button>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="customer-search" className="text-xs text-muted-foreground">
                Search name, phone, or email
              </Label>
              <Input
                id="customer-search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Type to search…"
                className="h-12 rounded-xl text-base"
              />
            </div>
            <ScrollArea className="h-[min(50vh,22rem)] rounded-2xl border border-border/50">
              <ul className="divide-y divide-border/40 p-1">
                {filteredCustomers.length === 0 ? (
                  <li className="px-4 py-8 text-center text-sm text-muted-foreground">
                    No customers match. Try New to add one.
                  </li>
                ) : (
                  filteredCustomers.map((c) => (
                    <li key={c.id}>
                      <button
                        type="button"
                        onClick={() => selectCustomer(c)}
                        className={cn(
                          'flex w-full flex-col items-start gap-0.5 rounded-xl px-4 py-3 text-left pos-transition hover:bg-accent/60',
                          customerId === c.id && 'bg-primary/10 ring-1 ring-primary/20',
                        )}
                      >
                        <span className="font-semibold text-foreground">{c.displayName}</span>
                        <span className="text-xs text-muted-foreground">
                          {[c.phone, c.email].filter(Boolean).join(' · ') || '—'}
                        </span>
                      </button>
                    </li>
                  ))
                )}
              </ul>
            </ScrollArea>
          </div>
        </SheetContent>
      </Sheet>

      <Dialog open={newOpen} onOpenChange={setNewOpen}>
        <DialogContent className="max-w-md rounded-2xl sm:rounded-2xl">
          <DialogHeader>
            <DialogTitle>New customer</DialogTitle>
            <DialogDescription>Add a minimal record and attach to this sale.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="new-name">Name</Label>
              <Input
                id="new-name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="h-12 rounded-xl"
                placeholder="Maria L."
                autoComplete="name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-phone">Phone (optional)</Label>
              <Input
                id="new-phone"
                type="tel"
                value={newPhone}
                onChange={(e) => setNewPhone(e.target.value)}
                className="h-12 rounded-xl"
                placeholder="555-0100"
                autoComplete="tel"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-email">Email (optional)</Label>
              <Input
                id="new-email"
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                className="h-12 rounded-xl"
                placeholder="maria@example.com"
                autoComplete="email"
              />
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" className="rounded-xl" onClick={() => setNewOpen(false)}>
              Cancel
            </Button>
            <Button type="button" className="rounded-xl" onClick={handleCreateCustomer}>
              Create &amp; attach
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Sheet open={recallOpen} onOpenChange={setRecallOpen}>
        <SheetContent side="right" className="flex w-full flex-col sm:max-w-md">
          <SheetHeader className="text-left">
            <SheetTitle>Recall parked sale</SheetTitle>
            <SheetDescription>Restore a suspended cart to this register.</SheetDescription>
          </SheetHeader>
          <ScrollArea className="mt-4 h-[min(60vh,28rem)] rounded-2xl border border-border/50">
            <ul className="divide-y divide-border/40 p-1">
              {parkedList.length === 0 ? (
                <li className="px-4 py-10 text-center text-sm text-muted-foreground">No parked sales.</li>
              ) : (
                parkedList.map((p) => {
                  const total = getCartTotal(p.saleSnapshot.cart, p.saleSnapshot.orderDiscount);
                  const cust =
                    p.saleSnapshot.customerId != null
                      ? getCustomerById(p.saleSnapshot.customerId)?.displayName ?? 'Customer'
                      : null;
                  return (
                    <li key={p.id} className="p-2">
                      <div className="flex flex-col gap-2 rounded-2xl border border-border/40 bg-card/80 px-4 py-3">
                        <div>
                          <p className="font-semibold text-foreground">{p.label}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(p.createdAt).toLocaleString()}
                          </p>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {cust ? <>Customer: {cust}</> : <>No customer</>}
                        </p>
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-lg font-bold tabular-nums text-primary">${total.toFixed(2)}</span>
                          <Button
                            type="button"
                            size="sm"
                            className="rounded-xl"
                            onClick={() => openRecallRestore(p.id)}
                          >
                            Restore
                          </Button>
                        </div>
                      </div>
                    </li>
                  );
                })
              )}
            </ul>
          </ScrollArea>
        </SheetContent>
      </Sheet>

      <AlertDialog open={parkConfirmOpen} onOpenChange={setParkConfirmOpen}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Park this sale?</AlertDialogTitle>
            <AlertDialogDescription>
              The current cart will be saved as parked and the register will clear for the next guest.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
            <AlertDialogAction className="rounded-xl" onClick={handleParkConfirm}>
              Park sale
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={replaceConfirmOpen}
        onOpenChange={(open) => {
          setReplaceConfirmOpen(open);
          if (!open) setPendingRecallId(null);
        }}
      >
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Replace current sale?</AlertDialogTitle>
            <AlertDialogDescription>
              {cartItemCount > 0
                ? 'This register has items in the cart. Restoring a parked sale will replace the current cart and customer on this sale.'
                : 'A customer is attached to this register. Restoring a parked sale will replace the current sale (including the customer link).'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              className="rounded-xl"
              onClick={() => {
                setPendingRecallId(null);
              }}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction className="rounded-xl" onClick={confirmReplaceRecall}>
              Replace and restore
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
