
import { RegisterForm } from '@/components/auth/register-form';
import type { Metadata } from 'next';
import Link from 'next/link';
import { projectConfig } from '@/config/project.config';

export const metadata: Metadata = {
  title: `Create Account | ${projectConfig.appName}`,
  description: `Sign up for a new ${projectConfig.appName} account.`,
};

export default function RegisterPage() {
  return (
    <>
      <RegisterForm />
      <p className="mt-4 text-center text-sm text-muted-foreground">
        Already have an account?{' '}
        <Link
          href="/auth/login"
          className="font-medium text-primary hover:underline underline-offset-4"
        >
          Sign in
        </Link>
      </p>
    </>
  );
}

