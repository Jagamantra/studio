
import { LoginForm } from '@/components/auth/login-form';
import type { Metadata } from 'next';
import Link from 'next/link';
import { projectConfig } from '@/config/project.config';

export const metadata: Metadata = {
  title: `Login | ${projectConfig.appName}`,
  description: `Sign in to your ${projectConfig.appName} account.`,
};

export default function LoginPage() {
  return (
    <>
      <LoginForm />
      <p className="mt-4 text-center text-sm">
        Don&apos;t have an account?{' '}
        <Link
          href="/auth/register"
          className="font-medium text-primary hover:underline underline-offset-4"
        >
          Sign up
        </Link>
      </p>
    </>
  );
}

