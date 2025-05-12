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
    previewAdminUserProfile, 
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
        setUserProfile(previewAdminUserProfile); 
        setMockFirebaseUser(previewAdminUserProfile as MockFirebaseUser);
      }
    } else {
      setUserProfile(previewAdminUserProfile);
      setMockFirebaseUser(previewAdminUserProfile as MockFirebaseUser);
    }
    setLoading(false);
  }, []);
  
  const contextDisplayUser = useMemo(() => {
    if (!configured && userProfile) {
      return userProfile;
    }
    return userProfile;
  }, [userProfile, configured]);

  useEffect(() => {
    if (!loading) {
      const isAuthRelatedPage = pathname.startsWith('/auth/');
      const isLoginPage = pathname === '/auth/login';
      const isRegisterPage = pathname === '/auth/register';
      // const isMfaPage = pathname === '/auth/mfa'; // Not strictly needed here for general logic

      if (contextDisplayUser && contextDisplayUser.uid !== previewAdminUserProfile.uid) {
        // A "real" dummy user is logged in (primary auth done, MFA might be pending or done)
        if (isLoginPage || isRegisterPage) { 
          // If they are on login/register page, but already "logged in" (e.g. token exists),
          // they should be on dashboard or MFA if that's the next step.
          // Since login/register now push to MFA, if they somehow land here while user is set,
          // push to dashboard (assuming MFA was completed if user is fully set).
          router.replace('/dashboard'); 
        }
      } else if (contextDisplayUser && contextDisplayUser.uid === previewAdminUserProfile.uid) {
        // Preview admin is active
        if (isAuthRelatedPage && !isLoginPage && !isRegisterPage) { // e.g. trying to access /auth/mfa directly
            router.replace('/auth/login');
        }
      } else if (!contextDisplayUser) { 
        if (!isAuthRelatedPage && pathname !== '/') {
           router.replace('/auth/login');
        }
      }
    }
  }, [contextDisplayUser, loading, pathname, router]);


  const getDummyUsersFromStorage = (): UserProfile[] => {
    if (typeof window === 'undefined') return [];
    const usersJson = localStorage.getItem(DUMMY_USERS_STORAGE_KEY);
    return usersJson ? JSON.parse(usersJson) : [];
  };

  const saveDummyUsersToStorage = (users: UserProfile[]) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(DUMMY_USERS_STORAGE_KEY, JSON.stringify(users));
      api.resetMockUsers(); 
      api.loadMockUsersFromStorage(DUMMY_USERS_STORAGE_KEY);
    }
  };
  
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
      router.push('/auth/mfa'); 
      return user;
    } catch (err: any) {
      setError(err);
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

      router.push('/auth/mfa'); 
      return newUser;
    } catch (err: any) {
      setError(err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [router]);

  const logout = useCallback(async () => {
    setLoading(true);
    setError(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem(CURRENT_DUMMY_USER_STORAGE_KEY);
    }
    setUserProfile(previewAdminUserProfile); 
    setMockFirebaseUser(previewAdminUserProfile as MockFirebaseUser);
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
  }, []);


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
  }), [contextDisplayUser, mockFirebaseUser, loading, error, configured, logout, setUserProfile, loginWithDummyCredentials, registerDummyUser, updateCurrentLocalUser]);

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
