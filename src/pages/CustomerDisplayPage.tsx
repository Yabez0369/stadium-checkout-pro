import { createEmptySale, getCartTotal } from '@/data/posProducts';
import CustomerDisplay from '@/components/pos/CustomerDisplay';
import { useCustomerDisplayReceiver } from '@/lib/customerDisplaySync';

const idle = createEmptySale();

export default function CustomerDisplayPage() {
  const live = useCustomerDisplayReceiver();

  const cart = live?.cart ?? idle.cart;
  const orderDiscount = live?.orderDiscount ?? idle.orderDiscount;
  const total = live?.total ?? getCartTotal(cart, orderDiscount);
  const paymentState = live?.paymentState ?? 'scanning';
  const tenderMethod = live?.tenderMethod ?? null;
  const transactionId = live?.transactionId ?? '';

  return (
    <CustomerDisplay
      cart={cart}
      orderDiscount={orderDiscount}
      paymentState={paymentState}
      total={total}
      tenderMethod={tenderMethod}
      transactionId={transactionId}
      awaitingRegister={!live}
    />
  );
}
