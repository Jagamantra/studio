
import { ForgotPasswordForm } from '@/components/auth/forgot-password-form';
import type { Metadata } from 'next';
import { projectConfig } from '@/config/project.config';

export const metadata: Metadata = {
  title: `Forgot Password | ${projectConfig.appName}`,
  description: `Reset your ${projectConfig.appName} account password.`,
};

export default function ForgotPasswordPage() {
  return (
    <>
      <ForgotPasswordForm />
    </>
  );
}

