
import { RegisterForm } from '@/components/auth/register-form';
import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Create Account | Genesis Template',
  description: 'Sign up for a new Genesis Template account.',
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
