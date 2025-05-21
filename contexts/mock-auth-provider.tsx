'use client';

import React, { useEffect, useMemo, useCallback, useState } from 'react';
import type { ReactNode } from 'react';
import type { UserProfile, MfaSentResponse, LoginSuccessResponse, ThemeSettings } from '@/types';
import { AuthContext, type AuthContextType } from './auth-context';
import { useRouter, usePathname } from 'next/navigation';
import { rolesConfig } from '@/config/roles.config';
import * as Api from '@/services/api'; // Now imports from the unified api.ts
import { 
    CURRENT_DUMMY_USER_STORAGE_KEY,
    MFA_VERIFIED_STORAGE_KEY,
} from '@/data/dummy-data';
import { useToast } from '@/hooks/use-toast';


export function MockAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isMfaVerified, setIsMfaVerifiedState] = useState(false);
  const [authEmailForMfa, setAuthEmailForMfa] = useState<string | null>(null);
  const [sessionToken, setSessionToken] = useState<string | null>(null); // Mock token
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();


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

  // Initial auth check from localStorage for mock mode
  useEffect(() => {
    setLoading(true);
    if (typeof window !== 'undefined') {
      const storedUserJson = localStorage.getItem(CURRENT_DUMMY_USER_STORAGE_KEY);
      const storedMfaVerified = localStorage.getItem(MFA_VERIFIED_STORAGE_KEY);
      if (storedUserJson) {
        try {
          const loggedInUser: UserProfile = JSON.parse(storedUserJson);
          setUserState(loggedInUser);
          setIsMfaVerified(storedMfaVerified === 'true');
          if (storedMfaVerified === 'true') {
            setSessionToken(`mock-token-for-${loggedInUser.uid}`); // Set a mock session token
          }
        } catch (e) {
          console.error("Error parsing stored user (mock):", e);
          localStorage.removeItem(CURRENT_DUMMY_USER_STORAGE_KEY);
          localStorage.removeItem(MFA_VERIFIED_STORAGE_KEY);
        }
      }
    }
    setLoading(false);
  }, [setIsMfaVerified]); // setUserState is stable, setIsMfaVerified added

   // Navigation logic based on auth state (specific to mock provider)
   useEffect(() => {
    if (loading) return;

    const isAuthRoute = pathname.startsWith('/auth/');
    const isMfaPage = pathname === '/auth/mfa';

    if (user && sessionToken) { // User object exists and sessionToken (implies MFA verified for mock)
      if (!isMfaVerified) { // Should have been caught by sessionToken logic, but double check
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
            toast({ title: 'Access Denied', message: 'You do not have permission for the requested page.', variant: 'destructive' });
            router.replace('/dashboard');
          }
        }
      }
    } else if (authEmailForMfa && !isMfaVerified) { // Needs MFA (email set, but not verified yet)
        if (!isMfaPage) {
          router.replace('/auth/mfa');
        }
    } else { // Not authenticated
      if (!isAuthRoute && pathname !== '/') { 
        router.replace('/auth/login');
      } else if (pathname === '/' && !isAuthRoute) { 
         router.replace('/auth/login');
      }
    }
  }, [user, isMfaVerified, loading, pathname, router, authEmailForMfa, sessionToken, toast]);

  const login = useCallback(async (email: string, password?: string): Promise<MfaSentResponse | null> => {
    setLoading(true);
    setError(null);
    try {
      const response = await Api.loginUser(email, password); // Calls unified api.ts (which will use mock path)
      if (response.codeSent) {
        setAuthEmailForMfa(email);
        // Don't set user yet, wait for MFA
        router.push('/auth/mfa');
        return response;
      }
      // Should not happen if API handles errors properly
      throw new Error(response.message || "Mock login failed before MFA.");
    } catch (err: any) {
      console.error("Mock Login error in MockAuthProvider:", err);
      setError(err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [router]);

  const register = useCallback(async (details: { email: string, password?: string, displayName?: string }): Promise<MfaSentResponse | null> => {
    setLoading(true);
    setError(null);
    try {
      const response = await Api.registerUser(details); // Calls unified api.ts
      if (response.codeSent) {
        setAuthEmailForMfa(details.email);
        router.push('/auth/mfa');
        return response;
      }
       throw new Error(response.message || "Mock registration failed before MFA.");
    } catch (err: any) {
      console.error("Mock Register error in MockAuthProvider:", err);
      setError(err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [router]);

  const verifyMfa = useCallback(async (mfaCode: string): Promise<LoginSuccessResponse | null> => {
    setLoading(true);
    setError(null);
    if (!authEmailForMfa) {
      setError(new Error("Mock: Email for MFA verification is missing."));
      setLoading(false);
      router.push('/auth/login');
      return null;
    }
    try {
      // Api.verifyMfa will use mock path and handle localStorage for CURRENT_DUMMY_USER and MFA_VERIFIED
      const response = await Api.verifyMfa(authEmailForMfa, mfaCode);
      
      // Re-fetch user from localStorage to ensure state consistency, though Api.verifyMfa (mock) should set it
      const storedUserJson = localStorage.getItem(CURRENT_DUMMY_USER_STORAGE_KEY);
      if (storedUserJson) {
        const loggedInUser: UserProfile = JSON.parse(storedUserJson);
        setUser(loggedInUser);
        setSessionToken(response.accessToken); // Store mock token
        setIsMfaVerified(true);
        setAuthEmailForMfa(null);
        toast({
            title: 'Verification Successful (Mock)',
            message: 'You have been successfully verified. Welcome!',
            variant: 'success',
        });
        router.push('/dashboard');
        return response; // Contains uid, email, role, accessToken, preferences
      } else {
        throw new Error("Mock MFA verification seemed to succeed but user not found in storage.");
      }
    } catch (err: any) {
      console.error("Mock Verify MFA error in MockAuthProvider:", err);
      setError(err);
      setIsMfaVerified(false); // Ensure MFA is not marked verified
      return null;
    } finally {
      setLoading(false);
    }
  }, [authEmailForMfa, router, setIsMfaVerified, setUser, toast]);

  const logout = useCallback(async () => {
    setLoading(true);
    setError(null);
    await Api.logoutUser(); // Calls unified api.ts (mock path clears localStorage)
    setUser(null);
    setSessionToken(null);
    setIsMfaVerified(false);
    setAuthEmailForMfa(null);
    router.push('/auth/login');
    setLoading(false);
  }, [router, setIsMfaVerified, setUser]);

  const fetchCurrentUserInfo = useCallback(async (uid?: string, email?: string, role?: UserProfile['role']): Promise<UserProfile | null> => {
    setLoading(true);
    // In mock mode, current user is primarily from localStorage, or initialized from dummy data.
    const targetUid = uid || user?.uid;
    if (!targetUid) {
      setLoading(false);
      return null;
    }
    // Api.fetchUserProfile in mock mode will use the DUMMY_USERS_DB_INSTANCE
    const fetchedProfile = await Api.fetchUserProfile(targetUid, email, role as UserProfile['role']);
    if (fetchedProfile) {
        setUser(fetchedProfile); // Ensure local state and localStorage are in sync via Api.fetchUserProfile
    } else {
        setUser(null); // If somehow not found, clear state
    }
    setLoading(false);
    return fetchedProfile;
  }, [user?.uid, setUser]);

  const updateUserPreferencesInContext = useCallback((preferences: Partial<ThemeSettings>) => {
    setUserState(prevUser => {
        if (!prevUser) return null;
        const updatedUser = {
            ...prevUser,
            preferences: { ...(prevUser.preferences || {}), ...preferences },
        };
        // Persist to localStorage for mock provider (API layer handles this for DUMMY_USERS_DB)
        if (typeof window !== 'undefined') {
            localStorage.setItem(CURRENT_DUMMY_USER_STORAGE_KEY, JSON.stringify(updatedUser));
            // Also ensure the main DUMMY_USERS_DB_INSTANCE is updated if this user came from there.
            // This is handled by Api.updateUserPreferences which ThemeProvider calls.
        }
        return updatedUser;
    });
  }, []);

  const updateCurrentLocalUser = useCallback((updatedProfileData: Partial<UserProfile>) => {
    setUserState(prevUser => {
      if (!prevUser) return null;
      const newFullUser = { ...prevUser, ...updatedProfileData };
       if (typeof window !== 'undefined') {
          localStorage.setItem(CURRENT_DUMMY_USER_STORAGE_KEY, JSON.stringify(newFullUser));
          // Also update DUMMY_USERS_DB_INSTANCE via API call
          // Api.updateUserProfile(newFullUser.uid, updatedProfileData); // This is called from profile page
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
    sessionToken,
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
      user, loading, error, isMfaVerified, authEmailForMfa, sessionToken,
      login, register, verifyMfa, logout, fetchCurrentUserInfo, 
      setUser, setIsMfaVerified, updateUserPreferencesInContext, updateCurrentLocalUser
    ]);

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
}
