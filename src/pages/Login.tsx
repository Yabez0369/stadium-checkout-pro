import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, Ticket, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/sonner';
import {
  HARDCODED_POS_PASSWORD,
  HARDCODED_POS_USERNAME,
  isPosAuthenticated,
  tryPosLogin,
} from '@/lib/posAuth';

export default function Login() {
  const navigate = useNavigate();
  const [username, setUsername] = useState(HARDCODED_POS_USERNAME);
  const [password, setPassword] = useState(HARDCODED_POS_PASSWORD);
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isPosAuthenticated()) navigate('/', { replace: true });
  }, [navigate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const ok = tryPosLogin(username, password);
    setSubmitting(false);
    if (ok) {
      toast.success('Signed in — welcome to SCS-TIX');
      navigate('/', { replace: true });
    } else {
      toast.error('Invalid username or password');
    }
  };

  return (
    <div className="flex h-dvh min-h-0 flex-col overflow-hidden bg-[#070b14] text-white select-text lg:flex-row">
      {/* Brand panel */}
      <div className="relative flex min-h-[200px] shrink-0 flex-col justify-between overflow-hidden px-8 py-8 md:min-h-[min(28vh,11rem)] md:py-7 lg:min-h-screen lg:w-[46%] lg:px-14 lg:py-16">
        <div
          className="pointer-events-none absolute inset-0 opacity-90"
          style={{
            background:
              'radial-gradient(ellipse 120% 80% at 20% 20%, hsl(221 83% 45% / 0.35) 0%, transparent 55%), radial-gradient(ellipse 100% 60% at 80% 90%, hsl(262 60% 35% / 0.25) 0%, transparent 50%), linear-gradient(165deg, hsl(222 47% 8%) 0%, hsl(225 50% 6%) 45%, hsl(230 45% 5%) 100%)',
          }}
        />
        <div className="pointer-events-none absolute -right-24 top-1/2 h-[min(90vw,520px)] w-[min(90vw,520px)] -translate-y-1/2 rounded-full bg-primary/15 blur-3xl" />
        <div className="pointer-events-none absolute left-1/4 bottom-0 h-64 w-64 rounded-full bg-violet-500/10 blur-3xl" />

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/20 backdrop-blur-sm">
              <Ticket className="h-5 w-5 text-primary" strokeWidth={2.25} />
            </div>
            <span className="text-xs font-semibold uppercase tracking-[0.25em] text-white/50">Terminal</span>
          </div>
          <h1 className="font-extrabold tracking-tight text-white">
            <span className="block text-4xl sm:text-5xl lg:text-[3.25rem] leading-[1.05]">
              <span className="text-white">SCS</span>
              <span className="text-primary">-TIX</span>
            </span>
          </h1>
          <p className="mt-4 max-w-sm text-lg text-white/65 leading-relaxed font-medium">
            Point of sale access — sign in with your credentials for a fast, secure checkout.
          </p>
        </div>

        <div className="relative z-10 hidden lg:block">
          <div className="flex gap-8 border-t border-white/10 pt-8">
            <div>
              <p className="text-2xl font-bold tabular-nums text-white">24/7</p>
              <p className="text-xs font-medium uppercase tracking-wider text-white/40 mt-1">Operations</p>
            </div>
            <div>
              <p className="text-2xl font-bold tabular-nums text-white">PCI</p>
              <p className="text-xs font-medium uppercase tracking-wider text-white/40 mt-1">Ready stack</p>
            </div>
          </div>
        </div>
      </div>

      {/* Form panel */}
      <div className="relative flex min-h-0 flex-1 flex-col items-center justify-center overflow-y-auto bg-background px-5 py-6 sm:px-8 md:overflow-hidden md:py-5 lg:rounded-tl-[2.5rem] lg:shadow-[-24px_0_80px_-20px_rgba(0,0,0,0.45)] lg:py-10 text-foreground">
        <div className="absolute inset-0 bg-[linear-gradient(180deg,hsl(var(--muted)/0.35)_0%,transparent_35%)] pointer-events-none lg:rounded-tl-[2.5rem]" />

        <div className="relative w-full max-w-[420px] md:max-w-[480px] lg:max-w-[520px]">
          <div className="mb-6 lg:hidden md:mb-5">
            <p className="text-2xl font-extrabold tracking-tight text-foreground">
              <span className="text-foreground">SCS</span>
              <span className="text-primary">-TIX</span>
            </p>
            <p className="mt-1 text-sm text-muted-foreground">Sign in to open the register</p>
          </div>

          <div className="mb-6 hidden lg:block">
            <h2 className="text-2xl font-bold tracking-tight text-foreground">Welcome back</h2>
            <p className="mt-2 text-muted-foreground">Sign in with your credentials to continue.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="font-semibold text-foreground md:text-base">
                Username
              </Label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-muted-foreground pointer-events-none" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter username"
                  className="h-14 rounded-2xl border-border/80 bg-card pl-12 pr-4 text-base text-neutral-950 shadow-sm placeholder:text-muted-foreground focus-visible:ring-primary/30 md:h-16 md:pl-14 md:text-lg"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <Label htmlFor="password" className="font-semibold text-foreground md:text-base">
                  Password
                </Label>
                <button
                  type="button"
                  onClick={() =>
                    toast.message('Forgot password', {
                      description: 'Contact your venue IT admin or support@scstix.com to reset access.',
                    })
                  }
                  className="text-sm font-medium text-primary hover:text-primary/80 transition-colors"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-muted-foreground pointer-events-none" />
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  className="h-14 rounded-2xl border-border/80 bg-card pl-12 pr-14 text-base text-neutral-950 shadow-sm placeholder:text-muted-foreground focus-visible:ring-primary/30 md:h-16 md:pl-14 md:pr-16 md:text-lg"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-xl p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground md:right-4 md:p-2.5"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="h-5 w-5 md:h-6 md:w-6" /> : <Eye className="h-5 w-5 md:h-6 md:w-6" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              variant="pos"
              size="pos-xl"
              disabled={submitting}
              className="w-full rounded-2xl text-lg shadow-lg shadow-primary/25 md:h-[4.25rem] md:text-xl"
            >
              {submitting ? 'Signing in…' : 'Sign in to terminal'}
            </Button>
          </form>

          <p className="mt-8 text-center text-xs text-muted-foreground leading-relaxed">
            Valid login must match the terminal credentials configured for this device.
          </p>
        </div>
      </div>
    </div>
  );
}
