
'use client';

import type { ReactNode, Dispatch, SetStateAction } from 'react';
import React, { createContext, useContext, useEffect, useMemo, useCallback, useState } from 'react';
import type { UserProfile } from '@/types';
import { rolesConfig } from '@/config/roles.config';
import { useRouter, usePathname } from 'next/navigation';
import {
    DUMMY_USERS_STORAGE_KEY,
    CURRENT_DUMMY_USER_STORAGE_KEY,
    MFA_VERIFIED_STORAGE_KEY,
    initialDummyUsersForAuth,
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
  firebaseUser: MockFirebaseUser | null; // This will be null as Firebase is removed
  loading: boolean;
  error: Error | null;
  isConfigured: boolean; // Will always be false
  isMfaVerified: boolean;
  logout: () => Promise<void>;
  setUser: Dispatch<SetStateAction<UserProfile | null>>;
  setIsMfaVerified: (verified: boolean) => void;
  loginWithDummyCredentials: (email: string, password?: string) => Promise<UserProfile | null>;
  registerDummyUser: (details: Omit<UserProfile, 'uid' | 'photoURL'> & { password?: string }) => Promise<UserProfile | null>;
  updateCurrentLocalUser: (updatedProfile: Partial<UserProfile>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [mockFirebaseUser, setMockFirebaseUser] = useState<MockFirebaseUser | null>(null); // Will remain null
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isMfaVerified, setIsMfaVerifiedState] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  // Firebase is removed, so the application is always in "mock" mode.
  const configured = false;

  const getDummyUsersFromStorage = useCallback((): UserProfile[] => {
    if (typeof window === 'undefined') return [];
    const usersJson = localStorage.getItem(DUMMY_USERS_STORAGE_KEY);
    return usersJson ? JSON.parse(usersJson) : [];
  }, []);

  const saveDummyUsersToStorage = useCallback((users: UserProfile[]) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(DUMMY_USERS_STORAGE_KEY, JSON.stringify(users));
      // Ensure mock API service layer reflects this change if it caches users
      api.resetMockUsers();
      api.loadMockUsersFromStorage(DUMMY_USERS_STORAGE_KEY);
    }
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (!localStorage.getItem(DUMMY_USERS_STORAGE_KEY)) {
        localStorage.setItem(DUMMY_USERS_STORAGE_KEY, JSON.stringify(initialDummyUsersForAuth));
      }
      // Initialize the mock API service with users from local storage
      api.loadMockUsersFromStorage(DUMMY_USERS_STORAGE_KEY);
    }
  }, []);

  const setIsMfaVerified = useCallback((verified: boolean) => {
    setIsMfaVerifiedState(verified);
    if (typeof window !== 'undefined') {
      if (verified) {
        localStorage.setItem(MFA_VERIFIED_STORAGE_KEY, 'true');
      } else {
        localStorage.removeItem(MFA_VERIFIED_STORAGE_KEY);
      }
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    let mfaFlag = false;
    if (typeof window !== 'undefined') { // Ensure localStorage access is client-side
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

                const storedMfaVerified = localStorage.getItem(MFA_VERIFIED_STORAGE_KEY);
                if (storedMfaVerified === 'true') {
                    mfaFlag = true;
                }
            } catch (e) {
                console.error("Error parsing stored dummy user:", e);
                localStorage.removeItem(CURRENT_DUMMY_USER_STORAGE_KEY);
                localStorage.removeItem(MFA_VERIFIED_STORAGE_KEY);
                setUserProfile(null);
                setMockFirebaseUser(null);
            }
        } else {
            setUserProfile(null);
            setMockFirebaseUser(null);
            localStorage.removeItem(MFA_VERIFIED_STORAGE_KEY);
        }
    }
    setIsMfaVerifiedState(mfaFlag);
    setLoading(false);
  }, []);

  const contextDisplayUser = useMemo(() => userProfile, [userProfile]);

  useEffect(() => {
    if (loading) return;

    const isAuthRoute = pathname.startsWith('/auth/');
    const isMfaPage = pathname === '/auth/mfa';
    const isLoginPage = pathname === '/auth/login';
    const isRegisterPage = pathname === '/auth/register';
    const isPublicRoot = pathname === '/';

    if (contextDisplayUser) {
      if (!isMfaVerified) {
        if (!isMfaPage) {
          router.replace('/auth/mfa');
        }
      } else {
        if (isLoginPage || isRegisterPage || isMfaPage) {
          router.replace('/dashboard');
        }
      }
    } else {
      if (!isAuthRoute && !isPublicRoot) {
        router.replace('/auth/login');
      } else if (isPublicRoot) {
        router.replace('/auth/login');
      }
    }
  }, [contextDisplayUser, isMfaVerified, loading, pathname, router]);


  const loginWithDummyCredentials = useCallback(async (email: string, password?: string): Promise<UserProfile | null> => {
    setLoading(true);
    setError(null);
    try {
      const user = await api.loginUser(email, password); // Uses mock API
      setUserProfile(user);
      setMockFirebaseUser(user as MockFirebaseUser); // Kept for type consistency
      if (typeof window !== 'undefined') {
        localStorage.setItem(CURRENT_DUMMY_USER_STORAGE_KEY, JSON.stringify(user));
      }
      setIsMfaVerified(false);
      router.push('/auth/mfa');
      return user;
    } catch (err: any) {
      setError(err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [router, setIsMfaVerified]);

  const registerDummyUser = useCallback(async (details: Omit<UserProfile, 'uid' | 'photoURL'> & { password?: string }): Promise<UserProfile | null> => {
    setLoading(true);
    setError(null);
    try {
      const newUser = await api.registerUser({ ...details, role: details.role || rolesConfig.defaultRole }); // Uses mock API
      setUserProfile(newUser);
      setMockFirebaseUser(newUser as MockFirebaseUser); // Kept for type consistency
      if (typeof window !== 'undefined') {
        localStorage.setItem(CURRENT_DUMMY_USER_STORAGE_KEY, JSON.stringify(newUser));
      }

      const currentUsers = getDummyUsersFromStorage();
      currentUsers.push(newUser);
      saveDummyUsersToStorage(currentUsers);

      setIsMfaVerified(false);
      router.push('/auth/mfa');
      return newUser;
    } catch (err: any) {
      setError(err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [router, getDummyUsersFromStorage, saveDummyUsersToStorage, setIsMfaVerified]);

  const logout = useCallback(async () => {
    setLoading(true);
    setError(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem(CURRENT_DUMMY_USER_STORAGE_KEY);
      localStorage.removeItem(MFA_VERIFIED_STORAGE_KEY);
    }
    setUserProfile(null);
    setMockFirebaseUser(null); // Clear mock Firebase user
    setIsMfaVerified(false);
    router.push('/auth/login');
    setLoading(false);
  }, [router, setIsMfaVerified]);

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
    isConfigured: configured, // Always false
    isMfaVerified,
    logout,
    setUser: setUserProfile,
    setIsMfaVerified,
    loginWithDummyCredentials,
    registerDummyUser,
    updateCurrentLocalUser,
  }), [contextDisplayUser, mockFirebaseUser, loading, error, configured, isMfaVerified, logout, loginWithDummyCredentials, registerDummyUser, updateCurrentLocalUser, setIsMfaVerified]);

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
