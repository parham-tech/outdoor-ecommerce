import type { Metadata } from 'next';
import { CustomerForgotPasswordForm } from '@/components/auth/CustomerForgotPasswordForm';

export const metadata: Metadata = {
  title: 'Reset Password | ALTITUDE Outdoors',
  description: 'Recover access to your ALTITUDE customer account with secure email reset instructions.',
};

export default function ForgotPasswordPage() {
  return (
    <div className="bg-[#F7F5F0] min-h-[calc(100vh-140px)] py-10 sm:py-16 px-4 sm:px-6 lg:px-8 flex flex-col justify-center items-center">
      <CustomerForgotPasswordForm />
    </div>
  );
}
