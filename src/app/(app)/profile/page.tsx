
'use client';

import * as React from 'react';
import { useAuth } from '@/contexts/auth-provider';
import { Loader2 } from 'lucide-react';
import { PersonalInformationForm } from '@/components/profile/personal-information-form';
import { ChangePasswordForm } from '@/components/profile/change-password-form';
import { AdvancedSettingsForm } from '@/components/profile/advanced-settings-form';

export default function ProfilePage() {
  const { user, firebaseUser, setUser, loading: authLoading } = useAuth();
  const [anyLoading, setAnyLoading] = React.useState(false); // Centralized loading state for all forms

  if (authLoading) return <div className="flex flex-1 items-center justify-center p-4"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  if (!user) return <div className="flex flex-1 items-center justify-center p-4"><p>Please log in to view your profile.</p></div>;

  return (
    <div className="space-y-6 md:space-y-8"> {/* Removed flex-1 */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">My Profile</h1>
      </div>

      <PersonalInformationForm
        user={user}
        firebaseUser={firebaseUser}
        setUser={setUser}
        anyLoading={anyLoading}
        setAnyLoading={setAnyLoading}
      />

      <ChangePasswordForm
        firebaseUser={firebaseUser}
        anyLoading={anyLoading}
        setAnyLoading={setAnyLoading}
      />
      
      <AdvancedSettingsForm
        user={user}
        setUser={setUser}
        anyLoading={anyLoading}
        setAnyLoading={setAnyLoading}
      />
    </div>
  );
}

