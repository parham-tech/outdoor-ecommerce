import type { Metadata } from 'next';
import { CartPageContent } from '@/components/cart/CartPageContent';

export const metadata: Metadata = {
  title: 'Shopping Cart | ALTITUDE Outdoors',
  description:
    'Review your selected expedition-grade outdoor equipment and select shipping.',
};

export default function CartPage() {
  return <CartPageContent />;
}
