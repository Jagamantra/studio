
import { ForgotPasswordForm } from '@/components/auth/forgot-password-form';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Forgot Password | Genesis Template',
  description: 'Reset your Genesis Template account password.',
};

export default function ForgotPasswordPage() {
  return (
    <>
      <ForgotPasswordForm />
    </>
  );
}
