
import { Metadata } from 'next';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { KeyRound } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Verify Your Identity | Genesis Template',
  description: 'Enter your multi-factor authentication code.',
};

// Basic OTP Input component (can be improved using shadcn/ui input-otp when available or custom styled inputs)
function OtpInput() {
  return (
    <div className="flex justify-center space-x-2">
      {[...Array(6)].map((_, i) => (
        <Input
          key={i}
          type="text"
          maxLength={1}
          className="h-12 w-10 text-center text-xl md:h-14 md:w-12"
          aria-label={`OTP digit ${i + 1}`}
        />
      ))}
    </div>
  );
}


export default function MfaPage() {
  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
          <KeyRound className="h-8 w-8" />
        </div>
        <CardTitle className="text-2xl">Two-Factor Authentication</CardTitle>
        <CardDescription>
          Enter the code from your authenticator app or SMS. This feature is a placeholder.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
          <OtpInput />
          <Button type="submit" className="w-full" disabled> {/* Disabled as it's a placeholder */}
            Verify Code
          </Button>
        </form>
        <div className="text-center text-sm">
          <p className="text-muted-foreground">
            Didn&apos;t receive a code?{' '}
            <Button variant="link" className="p-0 h-auto" disabled>Resend</Button>
          </p>
          <Button variant="link" className="mt-2 p-0 h-auto" asChild disabled>
            <Link href="/login">Back to Login</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
