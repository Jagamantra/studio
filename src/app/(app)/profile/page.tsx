
'use client';

import * as React from 'react';
import { useAuth } from '@/contexts/auth-provider';
import { Loader2 } from 'lucide-react';
import { PersonalInformationForm } from '@/components/profile/personal-information-form';
import { ChangePasswordForm } from '@/components/profile/change-password-form';
import { AdvancedSettingsForm } from '@/components/profile/advanced-settings-form';

export default function ProfilePage() {
  // user from useAuth is UserProfile | null
  // firebaseUser from useAuth is MockFirebaseUser | null (or removed if not used)
  const { user, loading: authLoading, setUser: setAuthUserContext } = useAuth(); 
  const [anyLoading, setAnyLoading] = React.useState(false); 

  // Local state for the page's user profile, initialized from AuthContext
  // This allows child components to update it optimistically or after API calls
  const [pageUser, setPageUser] = React.useState(user);

  React.useEffect(() => {
    setPageUser(user); // Keep pageUser in sync with AuthContext user
  }, [user]);


  if (authLoading) return <div className="flex flex-1 items-center justify-center p-4"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  
  // Use pageUser for rendering and passing to forms
  if (!pageUser) return <div className="flex flex-1 items-center justify-center p-4"><p>Please log in to view your profile.</p></div>;

  return (
    <div className="space-y-6 md:space-y-8 min-w-0"> 
      <div className="flex items-center justify-between">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">My Profile</h1>
      </div>

      <PersonalInformationForm
        user={pageUser}
        // firebaseUser prop removed
        setUser={setPageUser} // Child forms can update this page-local state
        anyLoading={anyLoading}
        setAnyLoading={setAnyLoading}
      />

      <ChangePasswordForm
        // firebaseUser prop removed
        anyLoading={anyLoading}
        setAnyLoading={setAnyLoading}
      />
      
      <AdvancedSettingsForm
        user={pageUser}
        setUser={setPageUser} // Child forms can update this page-local state
        anyLoading={anyLoading}
        setAnyLoading={setAnyLoading}
      />
    </div>
  );
}
