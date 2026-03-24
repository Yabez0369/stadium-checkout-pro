import { useSearchParams } from 'react-router-dom';
import POSTerminal from '@/components/pos/POSTerminal';
import CustomerDisplay from '@/components/pos/CustomerDisplay';
import { createEmptySale, getCartTotal } from '@/data/posProducts';

export default function Index() {
  const [searchParams] = useSearchParams();
  const isCustomerView = searchParams.get('view') === 'customer';

  if (isCustomerView) {
    // Demo customer display with empty state
    const sale = createEmptySale();
    return (
      <CustomerDisplay
        cart={sale.cart}
        orderDiscount={sale.orderDiscount}
        paymentState="scanning"
        total={getCartTotal(sale.cart, sale.orderDiscount)}
      />
    );
  }

  return <POSTerminal />;
}
