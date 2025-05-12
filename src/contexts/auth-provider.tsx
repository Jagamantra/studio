
'use client';

import type { ReactNode, Dispatch, SetStateAction } from 'react';
import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';
import type { UserProfile } from '@/types';
import { rolesConfig } from '@/config/roles.config';
import { useRouter, usePathname } from 'next/navigation';
import { 
    DUMMY_USERS_STORAGE_KEY, 
    CURRENT_DUMMY_USER_STORAGE_KEY, 
    initialDummyUsersForAuth, 
    // previewAdminUserProfile, // No longer using previewAdmin for initial state
} from '@/data/dummy-data';
import * as api from '@/services/api'; 

interface MockFirebaseUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  phoneNumber: string | null;
}

interface AuthContextType {
  user: UserProfile | null;
  firebaseUser: MockFirebaseUser | null; 
  loading: boolean;
  error: Error | null;
  isConfigured: boolean; 
  logout: () => Promise<void>;
  setUser: Dispatch<SetStateAction<UserProfile | null>>;
  loginWithDummyCredentials: (email: string, password?: string) => Promise<UserProfile | null>;
  registerDummyUser: (details: Omit<UserProfile, 'uid' | 'photoURL'> & { password?: string }) => Promise<UserProfile | null>;
  updateCurrentLocalUser: (updatedProfile: Partial<UserProfile>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null); 
  const [mockFirebaseUser, setMockFirebaseUser] = useState<MockFirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  const configured = false; 

  const getDummyUsersFromStorage = useCallback((): UserProfile[] => {
    if (typeof window === 'undefined') return [];
    const usersJson = localStorage.getItem(DUMMY_USERS_STORAGE_KEY);
    return usersJson ? JSON.parse(usersJson) : [];
  }, []);

  const saveDummyUsersToStorage = useCallback((users: UserProfile[]) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(DUMMY_USERS_STORAGE_KEY, JSON.stringify(users));
      api.resetMockUsers(); 
      api.loadMockUsersFromStorage(DUMMY_USERS_STORAGE_KEY);
    }
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (!localStorage.getItem(DUMMY_USERS_STORAGE_KEY)) {
        localStorage.setItem(DUMMY_USERS_STORAGE_KEY, JSON.stringify(initialDummyUsersForAuth));
      }
      api.loadMockUsersFromStorage(DUMMY_USERS_STORAGE_KEY); 
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    const storedUserJson = localStorage.getItem(CURRENT_DUMMY_USER_STORAGE_KEY);
    if (storedUserJson) {
      try {
        const loggedInDummyUser: UserProfile = JSON.parse(storedUserJson);
        setUserProfile(loggedInDummyUser);
        setMockFirebaseUser({
          uid: loggedInDummyUser.uid,
          email: loggedInDummyUser.email,
          displayName: loggedInDummyUser.displayName,
          photoURL: loggedInDummyUser.photoURL,
          phoneNumber: loggedInDummyUser.phoneNumber,
        });
      } catch (e) {
        console.error("Error parsing stored dummy user:", e);
        localStorage.removeItem(CURRENT_DUMMY_USER_STORAGE_KEY); 
        setUserProfile(null); 
        setMockFirebaseUser(null);
      }
    } else {
      setUserProfile(null);
      setMockFirebaseUser(null);
    }
    setLoading(false);
  }, []);
  
  const contextDisplayUser = useMemo(() => {
    return userProfile;
  }, [userProfile]);

  useEffect(() => {
    if (loading) return; 

    const isAuthPage = pathname.startsWith('/auth/');
    const isPublicRoot = pathname === '/';

    if (contextDisplayUser) { 
        // User object exists. Login/Register functions redirect to /auth/mfa.
        // MFA page handles redirection to /dashboard upon success.
        // If user is "logged in" (user object exists) but tries to access login/register again,
        // they should be redirected to /auth/mfa (if not already there or on dashboard).
        if ((pathname === '/auth/login' || pathname === '/auth/register') && pathname !== '/auth/mfa') {
             router.replace('/auth/mfa');
        }
        // If user is "logged in" and on a non-auth page other than dashboard, direct to MFA.
        // This handles cases where user might try to access protected routes directly.
        // MFA page will then take them to dashboard if verified.
        else if (!isAuthPage && pathname !== '/dashboard') {
            router.replace('/auth/mfa');
        }

    } else { 
      // No user object (contextDisplayUser is null) - User is not authenticated.
      if (!isAuthPage && !isPublicRoot) { // If on a protected page
        router.replace('/auth/login');
      } else if (isPublicRoot) { // If on the root page
        router.replace('/auth/login'); 
      }
      // If already on an auth page (e.g., /auth/login, /auth/register, /auth/mfa), let them stay.
    }
  }, [contextDisplayUser, loading, pathname, router]);


  const loginWithDummyCredentials = useCallback(async (email: string, password?: string): Promise<UserProfile | null> => {
    setLoading(true);
    setError(null);
    try {
      const user = await api.loginUser(email, password); 
      setUserProfile(user);
      setMockFirebaseUser(user as MockFirebaseUser);
      if (typeof window !== 'undefined') {
        localStorage.setItem(CURRENT_DUMMY_USER_STORAGE_KEY, JSON.stringify(user));
      }
      router.push('/auth/mfa'); // Redirect to MFA after setting user
      return user;
    } catch (err: any) {
      setError(err);
      // Toast for login failure is handled in LoginForm
      return null;
    } finally {
      setLoading(false); 
    }
  }, [router]);

  const registerDummyUser = useCallback(async (details: Omit<UserProfile, 'uid' | 'photoURL'> & { password?: string }): Promise<UserProfile | null> => {
    setLoading(true);
    setError(null);
    try {
      const newUser = await api.registerUser({ ...details, role: details.role || rolesConfig.defaultRole }); 
      setUserProfile(newUser);
      setMockFirebaseUser(newUser as MockFirebaseUser);
      if (typeof window !== 'undefined') {
        localStorage.setItem(CURRENT_DUMMY_USER_STORAGE_KEY, JSON.stringify(newUser));
      }
      
      const currentUsers = getDummyUsersFromStorage();
      currentUsers.push(newUser);
      saveDummyUsersToStorage(currentUsers);

      router.push('/auth/mfa'); // Redirect to MFA after setting user
      return newUser;
    } catch (err: any) {
      setError(err);
      // Toast for registration failure is handled in RegisterForm
      return null;
    } finally {
      setLoading(false);
    }
  }, [router, getDummyUsersFromStorage, saveDummyUsersToStorage]);

  const logout = useCallback(async () => {
    setLoading(true);
    setError(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem(CURRENT_DUMMY_USER_STORAGE_KEY);
    }
    setUserProfile(null); 
    setMockFirebaseUser(null);
    router.push('/auth/login'); 
    setLoading(false);
  }, [router]);

  const updateCurrentLocalUser = useCallback((updatedProfileData: Partial<UserProfile>) => {
    setUserProfile(prev => {
      if (!prev) return null;
      const newProfile = { ...prev, ...updatedProfileData };
      if (typeof window !== 'undefined') {
        localStorage.setItem(CURRENT_DUMMY_USER_STORAGE_KEY, JSON.stringify(newProfile));
        const allUsers = getDummyUsersFromStorage();
        const userIndex = allUsers.findIndex(u => u.uid === newProfile.uid);
        if (userIndex > -1) {
          allUsers[userIndex] = { ...allUsers[userIndex], ...newProfile };
          saveDummyUsersToStorage(allUsers);
        }
      }
      return newProfile;
    });
     setMockFirebaseUser(prev => prev ? { ...prev, ...updatedProfileData } : null);
  }, [getDummyUsersFromStorage, saveDummyUsersToStorage]);


  const contextValue = useMemo(() => ({
    user: contextDisplayUser, 
    firebaseUser: mockFirebaseUser,
    loading,
    error,
    isConfigured: configured, 
    logout,
    setUser: setUserProfile, 
    loginWithDummyCredentials,
    registerDummyUser,
    updateCurrentLocalUser,
  }), [contextDisplayUser, mockFirebaseUser, loading, error, configured, logout, loginWithDummyCredentials, registerDummyUser, updateCurrentLocalUser]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
