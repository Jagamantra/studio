'use client';

import React, { useState, useEffect } from 'react'; 
import { useAuth } from '@/contexts/auth-provider';
import { Loader2 } from 'lucide-react';
import { PersonalInformationForm } from '@/components/profile/personal-information-form';
import { ChangePasswordForm } from '@/components/profile/change-password-form';
import { AdvancedSettingsForm } from '@/components/profile/advanced-settings-form';
import { AuthenticatedPageLayout } from '@/components/layout/authenticated-page-layout';
// Removed Metadata import as it's not used for client components
// import type { Metadata } from 'next';
// import { projectConfig } from '@/config/project.config'; // For appName (now handled by useTheme)
import { PageTitleWithIcon } from '@/components/layout/page-title-with-icon';
import { useTheme } from '@/contexts/theme-provider'; // Import useTheme

// Removed static metadata export, as this is a client component.
// Title will be set dynamically using useEffect.

export default function ProfilePage() {
  const { user, loading: authLoading, updateCurrentLocalUser } = useAuth(); 
  const [anyLoading, setAnyLoading] = useState(false); 
  const [pageUser, setPageUser] = useState(user); // Initialize with user from context
  const { appName } = useTheme(); // Get appName from theme for dynamic title

  useEffect(() => {
    document.title = `My Profile | ${appName}`;
  }, [appName]);

  useEffect(() => {
    // Update pageUser if the user from context changes (e.g., after a global update)
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
    // This case should ideally be handled by AuthProvider redirecting if no user
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
          setUser={setPageUser} // This will update local pageUser state
          updateAuthContextUser={updateCurrentLocalUser} // Pass function to update AuthContext
          anyLoading={anyLoading}
          setAnyLoading={setAnyLoading}
        />

        <ChangePasswordForm
          anyLoading={anyLoading}
          setAnyLoading={setAnyLoading}
        />
        
        <AdvancedSettingsForm
          user={pageUser}
          setUser={setPageUser} // This will update local pageUser state
          updateAuthContextUser={updateCurrentLocalUser} // Pass function to update AuthContext
          anyLoading={anyLoading}
          setAnyLoading={setAnyLoading}
        />
      </div>
    </AuthenticatedPageLayout>
  );
}
