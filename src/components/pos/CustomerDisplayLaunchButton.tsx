import { Monitor } from 'lucide-react';
import { toast } from '@/components/ui/sonner';
import { openCustomerDisplayWindow } from '@/lib/customerDisplaySync';

type Props = {
  /** compact = icon + short label; default = slightly more copy */
  variant?: 'compact' | 'default';
  className?: string;
};

export default function CustomerDisplayLaunchButton({ variant = 'default', className = '' }: Props) {
  const handleClick = () => {
    const w = openCustomerDisplayWindow();
    if (!w) {
      toast.error('Could not open window', {
        description: 'Allow pop-ups for this site, or open Customer display from the browser menu.',
      });
    }
  };

  const base =
    'inline-flex items-center justify-center gap-2 rounded-xl border border-border/60 bg-background/90 font-medium text-muted-foreground shadow-sm backdrop-blur-sm pos-transition hover:border-primary/35 hover:bg-primary/[0.06] hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40';

  if (variant === 'compact') {
    return (
      <button type="button" onClick={handleClick} className={`${base} px-2.5 py-2 text-xs md:px-3 md:py-2 md:text-sm ${className}`} title="Open customer display window">
        <Monitor className="h-4 w-4 shrink-0 md:h-[1.125rem] md:w-[1.125rem]" strokeWidth={2} />
        <span className="hidden min-[380px]:inline">Display</span>
      </button>
    );
  }

  return (
    <button type="button" onClick={handleClick} className={`${base} px-3 py-2 text-xs md:px-4 md:text-sm ${className}`} title="Open customer-facing display in a new window">
      <Monitor className="h-4 w-4 shrink-0 md:h-5 md:w-5" strokeWidth={2} />
      <span className="hidden sm:inline">Customer display</span>
      <span className="sm:hidden">Display</span>
    </button>
  );
}
