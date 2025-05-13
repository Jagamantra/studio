
'use client';

import * as React from 'react';
import { useAuth } from '@/contexts/auth-provider';
import { Loader2 } from 'lucide-react';
import { PersonalInformationForm } from '@/components/profile/personal-information-form';
import { ChangePasswordForm } from '@/components/profile/change-password-form';
import { AdvancedSettingsForm } from '@/components/profile/advanced-settings-form';
import { AuthenticatedPageLayout } from '@/components/layout/authenticated-page-layout';

export default function ProfilePage() {
  const { user, loading: authLoading, setUser: setAuthUserContext } = useAuth(); 
  const [anyLoading, setAnyLoading] = React.useState(false); 
  const [pageUser, setPageUser] = React.useState(user);

  React.useEffect(() => {
    setPageUser(user);
  }, [user]);


  if (authLoading) {
    return (
      <AuthenticatedPageLayout>
        <div className="flex flex-1 items-center justify-center p-4"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
      </AuthenticatedPageLayout>
    );
  }
  
  if (!pageUser) {
    return (
      <AuthenticatedPageLayout>
        <div className="flex flex-1 items-center justify-center p-4"><p>Please log in to view your profile.</p></div>
      </AuthenticatedPageLayout>
    );
  }

  return (
    <AuthenticatedPageLayout>
      <div className="space-y-6 md:space-y-8 min-w-0"> 
        <div className="flex items-center justify-between">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">My Profile</h1>
        </div>

        <PersonalInformationForm
          user={pageUser}
          setUser={setPageUser}
          anyLoading={anyLoading}
          setAnyLoading={setAnyLoading}
        />

        <ChangePasswordForm
          anyLoading={anyLoading}
          setAnyLoading={setAnyLoading}
        />
        
        <AdvancedSettingsForm
          user={pageUser}
          setUser={setPageUser}
          anyLoading={anyLoading}
          setAnyLoading={setAnyLoading}
        />
      </div>
    </AuthenticatedPageLayout>
  );
}

