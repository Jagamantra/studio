
'use client';

import React, { useEffect, useMemo, useCallback, useState } from 'react';
import type { ReactNode } from 'react';
import type { UserProfile, MfaSentResponse, LoginSuccessResponse, ThemeSettings } from '@/types';
import { AuthContext, type AuthContextType } from './auth-context';
import { useRouter, usePathname } from 'next/navigation';
import { rolesConfig } from '@/config/roles.config';
import { 
    CURRENT_DUMMY_USER_STORAGE_KEY,
    MFA_VERIFIED_STORAGE_KEY,
    initialDummyUsersForAuth, // This will be our "database"
} from '@/data/dummy-data';

// Helper to manage dummy users in localStorage for the mock provider
const getMockUsers = (): UserProfile[] => {
    if (typeof window === 'undefined') return [...initialDummyUsersForAuth];
    const stored = localStorage.getItem('genesis_dummy_users_db');
    try {
        return stored ? JSON.parse(stored) : [...initialDummyUsersForAuth];
    } catch {
        return [...initialDummyUsersForAuth];
    }
};

const saveMockUsers = (users: UserProfile[]) => {
    if (typeof window !== 'undefined') {
        localStorage.setItem('genesis_dummy_users_db', JSON.stringify(users));
    }
};

// Initialize DB if it doesn't exist
if (typeof window !== 'undefined' && !localStorage.getItem('genesis_dummy_users_db')) {
    saveMockUsers([...initialDummyUsersForAuth]);
}


export function MockAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isMfaVerified, setIsMfaVerifiedState] = useState(false);
  const [authEmailForMfa, setAuthEmailForMfa] = useState<string | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  const setUser = useCallback((newUser: UserProfile | null) => {
      setUserState(newUser);
      if (typeof window !== 'undefined') {
          if (newUser) {
              localStorage.setItem(CURRENT_DUMMY_USER_STORAGE_KEY, JSON.stringify(newUser));
          } else {
              localStorage.removeItem(CURRENT_DUMMY_USER_STORAGE_KEY);
          }
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
    if (typeof window !== 'undefined') {
      const storedUserJson = localStorage.getItem(CURRENT_DUMMY_USER_STORAGE_KEY);
      const storedMfaVerified = localStorage.getItem(MFA_VERIFIED_STORAGE_KEY);
      if (storedUserJson) {
        try {
          const loggedInUser: UserProfile = JSON.parse(storedUserJson);
          setUserState(loggedInUser); // Use setUserState to avoid recursion with setUser
          setIsMfaVerified(storedMfaVerified === 'true');
        } catch (e) {
          console.error("Error parsing stored user (mock):", e);
          localStorage.removeItem(CURRENT_DUMMY_USER_STORAGE_KEY);
          localStorage.removeItem(MFA_VERIFIED_STORAGE_KEY);
        }
      }
    }
    setLoading(false);
  }, [setIsMfaVerified]);

   useEffect(() => {
    if (loading) return;

    const isAuthRoute = pathname.startsWith('/auth/');
    const isMfaPage = pathname === '/auth/mfa';

    if (user) { 
      if (!isMfaVerified) { 
        if (!isMfaPage) {
          router.replace('/auth/mfa'); 
        }
      } else { 
        if (isAuthRoute) { 
          router.replace('/dashboard'); 
        } else { 
          const baseRoute = `/${pathname.split('/')[1]}`;
          const requiredRoles = rolesConfig.routePermissions[pathname as keyof typeof rolesConfig.routePermissions] ||
                                rolesConfig.routePermissions[baseRoute as keyof typeof rolesConfig.routePermissions];
          if (requiredRoles && !requiredRoles.includes(user.role)) {
            router.replace('/dashboard?toast_message=access_denied_role');
          }
        }
      }
    } else { 
      if (!isAuthRoute && pathname !== '/') { 
        router.replace('/auth/login');
      } else if (pathname === '/' && !isAuthRoute) { 
         router.replace('/auth/login');
      }
    }
  }, [user, isMfaVerified, loading, pathname, router]);

  const login = useCallback(async (email: string, password?: string): Promise<MfaSentResponse | null> => {
    setLoading(true);
    setError(null);
    const mockUsers = getMockUsers();
    const foundUser = mockUsers.find(u => u.email === email && u.password === password);
    
    if (foundUser) {
      // Don't set user here, only set email for MFA and redirect
      setAuthEmailForMfa(email);
      setIsMfaVerified(false); // Require MFA
      router.push('/auth/mfa');
      setLoading(false);
      return { codeSent: true, message: "Mock MFA code should be displayed. Please enter it." };
    } else {
      setError(new Error('Invalid mock credentials.'));
      setLoading(false);
      return null;
    }
  }, [router, setIsMfaVerified]);

  const register = useCallback(async (details: { email: string, password?: string, displayName?: string }): Promise<MfaSentResponse | null> => {
    setLoading(true);
    setError(null);
    let mockUsers = getMockUsers();
    if (mockUsers.some(u => u.email === details.email)) {
      setError(new Error('Mock: Email already exists'));
      setLoading(false);
      return null;
    }
    const newUser: UserProfile = {
      uid: `mock-user-${Date.now()}`,
      email: details.email,
      displayName: details.displayName || details.email,
      role: rolesConfig.defaultRole,
      photoURL: null,
      phoneNumber: null,
      password: details.password,
      preferences: {}, 
    };
    mockUsers.push(newUser);
    saveMockUsers(mockUsers);

    setAuthEmailForMfa(details.email); // Store email for MFA step
    setIsMfaVerified(false); // Require MFA
    router.push('/auth/mfa');
    setLoading(false);
    return { codeSent: true, message: "Mock registration successful. Mock MFA code should be displayed." };
  }, [router, setIsMfaVerified]);

  const verifyMfa = useCallback(async (mfaCode: string): Promise<LoginSuccessResponse | null> => {
    setLoading(true);
    setError(null);
    if (!authEmailForMfa) {
      setError(new Error("Mock: Email for MFA verification is missing."));
      setLoading(false);
      router.push('/auth/login');
      return null;
    }
    const mockUsers = getMockUsers();
    const foundUser = mockUsers.find(u => u.email === authEmailForMfa);

    // Mock OTP is typically 6 digits, check this or any other fixed mock code
    const isValidMockOtp = mfaCode.length === 6 && /^\d+$/.test(mfaCode); 

    if (foundUser && isValidMockOtp) {
      setUser(foundUser); // Set the full user profile
      setIsMfaVerified(true);
      setAuthEmailForMfa(null); // Clear email for MFA
      router.push('/dashboard');
      setLoading(false);
      return { 
        accessToken: `mock-token-for-${foundUser.uid}`, 
        email: foundUser.email!,
        role: foundUser.role,
        uid: foundUser.uid,
        expiresIn: 3600,
        preferences: foundUser.preferences,
      };
    } else {
      setError(new Error('Mock: Invalid MFA code.'));
      setIsMfaVerified(false);
      setLoading(false);
      return null;
    }
  }, [authEmailForMfa, router, setIsMfaVerified, setUser]);

  const logout = useCallback(async () => {
    setLoading(true);
    setError(null);
    localStorage.removeItem(CURRENT_DUMMY_USER_STORAGE_KEY);
    localStorage.removeItem(MFA_VERIFIED_STORAGE_KEY);
    setUser(null);
    setIsMfaVerified(false);
    setAuthEmailForMfa(null);
    router.push('/auth/login');
    setLoading(false);
  }, [router, setIsMfaVerified, setUser]);

  const fetchCurrentUserInfo = useCallback(async (uid?: string, email?: string, role?: UserProfile['role']): Promise<UserProfile | null> => {
    // In mock mode, user state is the source of truth.
    // If a uid is passed, ensure it matches current user, or load if state is empty.
    setLoading(true);
    const targetUid = uid || user?.uid;
    if (!targetUid) {
      setLoading(false);
      return null;
    }
    const mockUsers = getMockUsers();
    const foundUser = mockUsers.find(u => u.uid === targetUid);
    if (foundUser) {
        setUser(foundUser); // ensure local state is sync with "DB"
    }
    setLoading(false);
    return foundUser || null;
  }, [user?.uid, setUser]);

  const updateUserPreferencesInContext = useCallback((preferences: Partial<ThemeSettings>) => {
    setUserState(prevUser => { // use setUserState directly
        if (!prevUser) return null;
        const updatedUser = {
            ...prevUser,
            preferences: { ...(prevUser.preferences || {}), ...preferences },
        };
        // Persist to localStorage for mock provider
        if (typeof window !== 'undefined') {
            localStorage.setItem(CURRENT_DUMMY_USER_STORAGE_KEY, JSON.stringify(updatedUser));
            // Also update in the "dummy DB"
            let mockUsers = getMockUsers();
            const userIndex = mockUsers.findIndex(u => u.uid === updatedUser.uid);
            if (userIndex > -1) {
                mockUsers[userIndex] = updatedUser;
                saveMockUsers(mockUsers);
            }
        }
        return updatedUser;
    });
  }, []);

  const updateCurrentLocalUser = useCallback((updatedProfileData: Partial<UserProfile>) => {
    setUserState(prevUser => { // use setUserState directly
      if (!prevUser) return null;
      const newFullUser = { ...prevUser, ...updatedProfileData };
       if (typeof window !== 'undefined') {
          localStorage.setItem(CURRENT_DUMMY_USER_STORAGE_KEY, JSON.stringify(newFullUser));
          let mockUsers = getMockUsers();
          const userIndex = mockUsers.findIndex(u => u.uid === newFullUser.uid);
          if (userIndex > -1) {
              mockUsers[userIndex] = newFullUser;
              saveMockUsers(mockUsers);
          }
      }
      return newFullUser;
    });
  }, []);


  const contextValue: AuthContextType = useMemo(() => ({
    user,
    loading,
    error,
    isMfaVerified,
    authEmailForMfa,
    login,
    register,
    verifyMfa,
    logout,
    fetchCurrentUserInfo,
    setUser,
    setIsMfaVerified,
    updateUserPreferencesInContext,
    updateCurrentLocalUser,
  }), [
      user, loading, error, isMfaVerified, authEmailForMfa,
      login, register, verifyMfa, logout, fetchCurrentUserInfo, 
      setUser, setIsMfaVerified, updateUserPreferencesInContext, updateCurrentLocalUser
    ]);

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
}
