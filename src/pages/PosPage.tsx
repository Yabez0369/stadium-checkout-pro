import { Navigate } from 'react-router-dom';
import POSTerminal from '@/components/pos/POSTerminal';
import { isPosAuthenticated } from '@/lib/posAuth';

/** Billing / scan terminal — only reachable when signed in. */
export default function PosPage() {
  if (!isPosAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  return <POSTerminal />;
}
