import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeftRight,
  CreditCard,
  LogOut,
  RotateCcw,
  ShoppingBag,
  Ticket,
} from 'lucide-react';
import { toast } from '@/components/ui/sonner';
import CustomerDisplayLaunchButton from '@/components/pos/CustomerDisplayLaunchButton';
import { setPosAuthenticated } from '@/lib/posAuth';

const comingSoon = (label: string) => {
  toast.message(`${label}`, {
    description: 'This area will be available in a future update.',
  });
};

const cardBase =
  'flex min-h-0 flex-col rounded-2xl text-left pos-transition md:h-full md:min-h-0 md:overflow-hidden md:p-4 lg:rounded-3xl lg:p-5';

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="flex h-dvh min-h-0 flex-col overflow-hidden bg-background pos-fade-in">
      <header className="flex h-14 shrink-0 items-center justify-between gap-4 border-b border-border/40 bg-card/40 px-5 backdrop-blur-sm sm:px-8 md:h-[3.75rem] md:px-10">
        <div className="flex min-w-0 items-center gap-3 md:gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/15 ring-1 ring-primary/20 md:h-10 md:w-10">
            <Ticket className="h-4 w-4 text-primary md:h-5 md:w-5" strokeWidth={2.25} />
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-bold tracking-tight text-foreground md:text-base">
              <span>SCS</span>
              <span className="text-primary">-TIX</span>
            </p>
            <p className="truncate text-xs text-muted-foreground md:text-sm">Point of sale hub</p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <CustomerDisplayLaunchButton />
          <button
            type="button"
            onClick={() => {
              setPosAuthenticated(false);
              navigate('/login', { replace: true });
            }}
            className="inline-flex shrink-0 items-center gap-2 rounded-xl border border-border/60 bg-background px-3 py-2 text-xs font-medium text-muted-foreground hover:bg-accent hover:text-foreground pos-transition md:px-4 md:text-sm"
          >
            <LogOut className="h-4 w-4 md:h-5 md:w-5" />
            <span className="hidden sm:inline">Sign out</span>
          </button>
        </div>
      </header>

      {/* Phone: scroll. Tablet+: one screen, no scroll */}
      <main className="mx-auto flex w-full min-h-0 flex-1 flex-col overflow-y-auto px-4 py-5 pb-10 sm:px-6 md:max-w-6xl md:overflow-hidden md:px-8 md:py-4 md:pb-5 lg:max-w-7xl lg:px-10">
        <div className="mb-5 shrink-0 text-center sm:mb-4 sm:text-left md:mb-3">
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl md:text-[clamp(1.35rem,2.8vw,2rem)] lg:text-4xl">
            What would you like to do?
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground md:mt-1.5 md:text-[clamp(0.8rem,1.6vw,1rem)]">
            Choose a workflow. Billing opens the register and scan screen.
          </p>
        </div>

        <div
          className={`
            grid min-h-0 flex-1 grid-cols-1 gap-4 sm:grid-cols-2
            md:grid-rows-2 md:gap-3 md:[grid-template-rows:repeat(2,minmax(0,1fr))]
            lg:gap-4
          `}
        >
          <Link
            to="/pos"
            className={`group relative border-2 border-primary/35 bg-gradient-to-br from-primary/[0.07] to-primary/[0.02] p-5 shadow-[0_8px_40px_-12px_hsl(var(--primary)/0.35)] hover:border-primary/55 hover:shadow-[0_12px_40px_-12px_hsl(var(--primary)/0.4)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${cardBase}`}
          >
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-md shadow-primary/20 group-hover:scale-[1.02] md:h-12 md:w-12 lg:h-14 lg:w-14">
              <CreditCard className="h-5 w-5 md:h-6 md:w-6" strokeWidth={2} />
            </div>
            <h2 className="mt-4 text-lg font-bold tracking-tight text-foreground md:mt-3 md:text-xl lg:text-2xl">
              Billing
            </h2>
            <p className="mt-1.5 flex-1 text-sm leading-snug text-muted-foreground md:text-[0.8125rem] md:leading-snug lg:text-sm">
              New sale — scan items, take payment, and print receipt.
            </p>
            <p className="mt-3 text-sm font-semibold text-primary group-hover:underline md:mt-2">
              Open register →
            </p>
          </Link>

          <button
            type="button"
            onClick={() => comingSoon('Return & refund')}
            className={`group border border-border/80 bg-card p-5 shadow-sm hover:bg-accent/30 hover:shadow-md ${cardBase}`}
          >
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-secondary text-foreground md:h-12 md:w-12 lg:h-14 lg:w-14">
              <RotateCcw className="h-5 w-5 md:h-6 md:w-6" strokeWidth={2} />
            </div>
            <h2 className="mt-4 text-lg font-bold tracking-tight text-foreground md:mt-3 md:text-xl lg:text-2xl">
              Return & refund
            </h2>
            <p className="mt-1.5 flex-1 text-sm leading-snug text-muted-foreground md:text-[0.8125rem] lg:text-sm">
              Process returns, partial refunds, and store credit.
            </p>
          </button>

          <button
            type="button"
            onClick={() => comingSoon('Exchange')}
            className={`group border border-border/80 bg-card p-5 shadow-sm hover:bg-accent/30 hover:shadow-md ${cardBase}`}
          >
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-secondary text-foreground md:h-12 md:w-12 lg:h-14 lg:w-14">
              <ArrowLeftRight className="h-5 w-5 md:h-6 md:w-6" strokeWidth={2} />
            </div>
            <h2 className="mt-4 text-lg font-bold tracking-tight text-foreground md:mt-3 md:text-xl lg:text-2xl">
              Exchange
            </h2>
            <p className="mt-1.5 flex-1 text-sm leading-snug text-muted-foreground md:text-[0.8125rem] lg:text-sm">
              Swap items, adjust price differences, and update inventory.
            </p>
          </button>

          <button
            type="button"
            onClick={() => comingSoon('Online orders')}
            className={`group border border-border/80 bg-card p-5 shadow-sm hover:bg-accent/30 hover:shadow-md ${cardBase}`}
          >
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-secondary text-foreground md:h-12 md:w-12 lg:h-14 lg:w-14">
              <ShoppingBag className="h-5 w-5 md:h-6 md:w-6" strokeWidth={2} />
            </div>
            <h2 className="mt-4 text-lg font-bold tracking-tight text-foreground md:mt-3 md:text-xl lg:text-2xl">
              Online orders
            </h2>
            <p className="mt-1.5 flex-1 text-sm leading-snug text-muted-foreground md:text-[0.8125rem] lg:text-sm">
              Pick up, ship-from-store, and web order fulfillment.
            </p>
          </button>
        </div>
      </main>
    </div>
  );
}
