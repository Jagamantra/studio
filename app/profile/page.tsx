
'use client';

import React, { useState, useEffect } from 'react'; 
import { useAuth } from '@/contexts/auth-provider';
import { Loader2 } from 'lucide-react';
import { PersonalInformationForm } from '@/components/profile/personal-information-form';
import { ChangePasswordForm } from '@/components/profile/change-password-form';
import { AdvancedSettingsForm } from '@/components/profile/advanced-settings-form';
import { AuthenticatedPageLayout } from '@/components/layout/authenticated-page-layout';
import { PageTitleWithIcon } from '@/components/layout/page-title-with-icon';
import { useTheme } from '@/contexts/theme-provider'; 

export default function ProfilePage() {
  const { user, loading: authLoading, updateCurrentLocalUser } = useAuth(); 
  const [anyLoading, setAnyLoading] = useState(false); 
  const [pageUser, setPageUser] = useState(user); 
  const { appName } = useTheme(); 

  useEffect(() => {
    // Set document title dynamically
    document.title = `My Profile | ${appName}`;
  }, [appName]);

  useEffect(() => {
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
        <PageTitleWithIcon title="My Profile" />

        <PersonalInformationForm
          user={pageUser}
          setUser={setPageUser} 
          updateAuthContextUser={updateCurrentLocalUser} 
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
          updateAuthContextUser={updateCurrentLocalUser} 
          anyLoading={anyLoading}
          setAnyLoading={setAnyLoading}
        />
      </div>
    </AuthenticatedPageLayout>
  );
}

