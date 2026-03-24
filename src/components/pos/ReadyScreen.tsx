import { Clock, User, ShoppingBag, Pause, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ReadyScreenProps {
  cashierName: string;
  onNewSale: () => void;
}

export default function ReadyScreen({ cashierName, onNewSale }: ReadyScreenProps) {
  const now = new Date();
  const time = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  const date = now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
  const greeting = now.getHours() < 12 ? 'Good Morning' : now.getHours() < 17 ? 'Good Afternoon' : 'Good Evening';

  return (
    <div className="flex flex-col items-center justify-center h-full pos-fade-in">
      {/* Club badge area */}
      <div className="flex flex-col items-center gap-6 mb-12">
        <div className="w-20 h-20 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
          <span className="text-4xl">⚽</span>
        </div>
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">FC United Store</h1>
          <p className="text-muted-foreground mt-1 text-base">Stadium Merchandise · Terminal 01</p>
        </div>
      </div>

      {/* Greeting */}
      <div className="text-center mb-12">
        <div className="flex items-center gap-2 justify-center mb-2">
          <Sun className="w-5 h-5 text-primary" />
          <p className="text-primary font-medium text-lg">{greeting}</p>
        </div>
        <div className="flex items-center gap-2 justify-center">
          <User className="w-4 h-4 text-muted-foreground" />
          <p className="text-muted-foreground">{cashierName}</p>
        </div>
        <div className="flex items-center gap-2 justify-center mt-1">
          <Clock className="w-4 h-4 text-muted-foreground" />
          <p className="text-muted-foreground">{time} · {date}</p>
        </div>
      </div>

      {/* Main CTA */}
      <Button
        variant="pos"
        size="pos-xl"
        className="mb-4 min-w-[280px] animate-pulse-ring"
        onClick={onNewSale}
      >
        <ShoppingBag className="w-6 h-6 mr-2" />
        New Sale
      </Button>

      {/* Secondary actions */}
      <Button
        variant="pos-ghost"
        size="pos-md"
        className="min-w-[200px]"
        disabled
      >
        <Pause className="w-4 h-4 mr-1" />
        Resume Held Sale
      </Button>

      {/* Footer stats */}
      <div className="absolute bottom-6 flex gap-8 text-sm text-pos-text-muted">
        <span>Today's Sales: 23</span>
        <span>·</span>
        <span>Revenue: $2,847.50</span>
      </div>
    </div>
  );
}
