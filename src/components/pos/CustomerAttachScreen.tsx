import { useState } from 'react';
import { Search, User, ArrowLeft, ArrowRight, UserX } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CustomerAttachScreenProps {
  onAttach: (customer: { name: string; memberId: string }) => void;
  onSkip: () => void;
  onBack: () => void;
}

const MOCK_CUSTOMERS = [
  { name: 'James Wilson', memberId: 'MBR-4521', phone: '555-0123' },
  { name: 'Sarah Connor', memberId: 'MBR-8834', phone: '555-0456' },
  { name: 'David Miller', memberId: 'MBR-2290', phone: '555-0789' },
];

export default function CustomerAttachScreen({ onAttach, onSkip, onBack }: CustomerAttachScreenProps) {
  const [search, setSearch] = useState('');
  const results = search.length > 0
    ? MOCK_CUSTOMERS.filter(c => c.name.toLowerCase().includes(search.toLowerCase()) || c.memberId.includes(search) || c.phone.includes(search))
    : [];

  return (
    <div className="flex flex-col h-full pos-fade-in">
      <div className="px-6 pt-5 pb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="pos-ghost" size="pos-icon" onClick={onBack}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h2 className="text-xl font-bold text-foreground">Customer</h2>
            <p className="text-sm text-muted-foreground">Optional — attach a member or skip</p>
          </div>
        </div>
        <Button variant="pos-secondary" size="pos-md" onClick={onSkip}>
          Skip <ArrowRight className="w-5 h-5 ml-1" />
        </Button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-start px-6 pt-6">
        <div className="w-full max-w-lg">
          <div className="relative mb-4">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by name, phone, or member ID..."
              className="w-full h-14 pl-12 pr-4 rounded-xl bg-secondary text-foreground placeholder:text-muted-foreground text-base focus:outline-none focus:ring-2 focus:ring-primary/40"
              value={search}
              onChange={e => setSearch(e.target.value)}
              autoFocus
            />
          </div>

          {results.length > 0 ? (
            <div className="space-y-2">
              {results.map(c => (
                <button
                  key={c.memberId}
                  onClick={() => onAttach({ name: c.name, memberId: c.memberId })}
                  className="w-full pos-card-elevated p-4 flex items-center gap-4 hover:ring-1 hover:ring-primary/30 pos-transition active:scale-[0.98]"
                >
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="w-5 h-5 text-primary" />
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-foreground">{c.name}</p>
                    <p className="text-sm text-muted-foreground">{c.memberId} · {c.phone}</p>
                  </div>
                  <div className="ml-auto px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
                    Member
                  </div>
                </button>
              ))}
            </div>
          ) : search.length > 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              <UserX className="w-10 h-10 mx-auto mb-3 opacity-40" />
              <p>No customers found</p>
            </div>
          ) : (
            <div className="text-center py-10 text-muted-foreground">
              <User className="w-10 h-10 mx-auto mb-3 opacity-20" />
              <p>Search to find a member</p>
              <p className="text-sm mt-1 text-pos-text-muted">Or skip to continue as guest</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
