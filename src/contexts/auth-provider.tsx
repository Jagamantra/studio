
'use client';

import type { ReactNode, Dispatch, SetStateAction } from 'react';
import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';
// import { isFirebaseConfigured } from '@/lib/firebase'; // Firebase is removed
import type { UserProfile, Role } from '@/types';
import { rolesConfig } from '@/config/roles.config';
import { useRouter, usePathname } from 'next/navigation';
import { 
    DUMMY_USERS_STORAGE_KEY, 
    CURRENT_DUMMY_USER_STORAGE_KEY, 
    initialDummyUsersForAuth, // Initial set of users if local storage is empty
    previewAdminUserProfile, // Default user when not "logged in" in dummy mode
} from '@/data/dummy-data';
import * as api from '@/services/api'; // Import mock API service

// Mock FirebaseUser structure for compatibility if needed by other parts of the app expecting it
// For simplicity, we'll primarily use UserProfile
interface MockFirebaseUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  phoneNumber: string | null;
  // Add other FirebaseUser properties if your app relies on them
}


interface AuthContextType {
  user: UserProfile | null;
  firebaseUser: MockFirebaseUser | null; // Using MockFirebaseUser
  loading: boolean;
  error: Error | null;
  isConfigured: boolean; // Will always be false
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

  const configured = false; // Firebase is removed, so it's never configured.

  // Initialize dummy users in localStorage if not present
  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (!localStorage.getItem(DUMMY_USERS_STORAGE_KEY)) {
        localStorage.setItem(DUMMY_USERS_STORAGE_KEY, JSON.stringify(initialDummyUsersForAuth));
      }
      api.loadMockUsersFromStorage(DUMMY_USERS_STORAGE_KEY); // Load into API service's mock store
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
        localStorage.removeItem(CURRENT_DUMMY_USER_STORAGE_KEY); // Clear corrupted data
        setUserProfile(previewAdminUserProfile); // Fallback to preview admin
        setMockFirebaseUser(previewAdminUserProfile as MockFirebaseUser);
      }
    } else {
      // If no dummy user logged in, set to preview admin for UI consistency
      setUserProfile(previewAdminUserProfile);
      setMockFirebaseUser(previewAdminUserProfile as MockFirebaseUser);
    }
    setLoading(false);
  }, []);
  
  // This computed user ensures that when in "dummy mode" (isConfigured is false),
  // the user always has an 'admin' role for UI demonstration purposes if a user object exists.
  // If no user is "logged in" (userProfile is null, which means previewAdmin is active),
  // previewAdmin already has 'admin' role.
  const contextDisplayUser = useMemo(() => {
    if (!configured && userProfile) {
       // For local development and UI consistency, treat any logged-in dummy user as admin.
       // Or, respect the role from dummy data: return userProfile;
       // For this iteration, respecting the role from dummy data is better.
      return userProfile;
    }
    return userProfile;
  }, [userProfile, configured]);

  useEffect(() => {
    if (!loading) { 
      const isAuthPage = pathname.startsWith('/auth/'); // Check for /auth/ prefix
      
      if (contextDisplayUser && contextDisplayUser.uid !== previewAdminUserProfile.uid && isAuthPage) {
        // If a "real" dummy user is logged in and on an auth page, redirect to dashboard
        router.replace('/dashboard');
      } else if (contextDisplayUser && contextDisplayUser.uid === previewAdminUserProfile.uid && !isAuthPage && pathname !== '/') {
        // If it's the preview admin and on a protected page, allow (as it's for preview)
        // This logic might need refinement based on desired preview behavior
      } else if (!contextDisplayUser && !isAuthPage && pathname !== '/') { 
        // If no user at all (should not happen due to previewAdmin fallback) and not on auth page
        router.replace('/auth/login'); // Redirect to /auth/login
      }
    }
  }, [contextDisplayUser, loading, pathname, router, configured]);

  const getDummyUsersFromStorage = (): UserProfile[] => {
    if (typeof window === 'undefined') return [];
    const usersJson = localStorage.getItem(DUMMY_USERS_STORAGE_KEY);
    return usersJson ? JSON.parse(usersJson) : [];
  };

  const saveDummyUsersToStorage = (users: UserProfile[]) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(DUMMY_USERS_STORAGE_KEY, JSON.stringify(users));
      api.resetMockUsers(); // Ensure API service also knows about this version of users
      api.loadMockUsersFromStorage(DUMMY_USERS_STORAGE_KEY);
    }
  };
  
  const loginWithDummyCredentials = useCallback(async (email: string, password?: string): Promise<UserProfile | null> => {
    setLoading(true);
    setError(null);
    try {
      const user = await api.loginUser(email, password); // Use mock API
      setUserProfile(user);
      setMockFirebaseUser(user as MockFirebaseUser);
      if (typeof window !== 'undefined') {
        localStorage.setItem(CURRENT_DUMMY_USER_STORAGE_KEY, JSON.stringify(user));
      }
      router.push('/dashboard');
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
      const newUser = await api.registerUser({ ...details, role: details.role || rolesConfig.defaultRole }); // Use mock API
      setUserProfile(newUser);
      setMockFirebaseUser(newUser as MockFirebaseUser);
      if (typeof window !== 'undefined') {
        localStorage.setItem(CURRENT_DUMMY_USER_STORAGE_KEY, JSON.stringify(newUser));
      }
      // Update the DUMMY_USERS_STORAGE_KEY as well
      const currentUsers = getDummyUsersFromStorage();
      currentUsers.push(newUser);
      saveDummyUsersToStorage(currentUsers);

      router.push('/dashboard');
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
    router.push('/auth/login'); // Redirect to /auth/login
    setLoading(false);
  }, [router]);

  const updateCurrentLocalUser = useCallback((updatedProfileData: Partial<UserProfile>) => {
    setUserProfile(prev => {
      if (!prev) return null;
      const newProfile = { ...prev, ...updatedProfileData };
      if (typeof window !== 'undefined') {
        localStorage.setItem(CURRENT_DUMMY_USER_STORAGE_KEY, JSON.stringify(newProfile));
        // Also update the main dummy users list if this user is in it
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
    isConfigured: configured, // always false
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
