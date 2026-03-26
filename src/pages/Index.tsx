import { Navigate, useSearchParams } from 'react-router-dom';
import HomePage from '@/pages/HomePage';
import { CUSTOMER_DISPLAY_PATH } from '@/lib/customerDisplaySync';
import { isPosAuthenticated } from '@/lib/posAuth';

export default function Index() {
  const [searchParams] = useSearchParams();
  const isCustomerView = searchParams.get('view') === 'customer';

  if (isCustomerView) {
    return <Navigate to={CUSTOMER_DISPLAY_PATH} replace />;
  }

  if (!isPosAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  return <HomePage />;
}
