import type { Metadata } from 'next';
import { CustomerLoginForm } from '@/components/auth/CustomerLoginForm';

export const metadata: Metadata = {
  title: 'Sign In | ALTITUDE Outdoors',
  description: 'Sign in to your ALTITUDE customer account to track orders, manage wishlist gear, and access member benefits.',
};

export default function LoginPage() {
  return (
    <div className="bg-[#F7F5F0] min-h-[calc(100vh-140px)] py-10 sm:py-16 px-4 sm:px-6 lg:px-8 flex flex-col justify-center items-center">
      <CustomerLoginForm />
    </div>
  );
}
