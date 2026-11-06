import type { Metadata } from 'next';
import { CustomerRegisterForm } from '@/components/auth/CustomerRegisterForm';

export const metadata: Metadata = {
  title: 'Create Account | ALTITUDE Outdoors',
  description: 'Create an ALTITUDE customer account for expedited checkout, real-time order tracking, and field testing perks.',
};

export default function RegisterPage() {
  return (
    <div className="bg-[#F7F5F0] min-h-[calc(100vh-140px)] py-10 sm:py-16 px-4 sm:px-6 lg:px-8 flex flex-col justify-center items-center">
      <CustomerRegisterForm />
    </div>
  );
}
