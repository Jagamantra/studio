
import { LoginForm } from '@/components/auth/login-form';
import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Login | Genesis Template',
  description: 'Sign in to your Genesis Template account.',
};

export default function LoginPage() {
  return (
    <>
      <LoginForm />
      <p className="mt-4 text-center text-sm text-muted-foreground">
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
