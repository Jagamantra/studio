
'use client';

import React, { useEffect, useMemo, useCallback, useState } from 'react';
import type { ReactNode } from 'react';
import type { UserProfile, AuthResponse, MfaVerificationResponse } from '@/types';
import { AuthContext, type AuthContextType } from './auth-context';
import { useRouter, usePathname } from 'next/navigation';
import { rolesConfig } from '@/config/roles.config';
import * as MockApi from '@/services/api.mock'; // Using direct mock imports
import { 
    CURRENT_DUMMY_USER_STORAGE_KEY,
    MFA_VERIFIED_STORAGE_KEY,
} from '@/data/dummy-data';

export function MockAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isMfaVerified, setIsMfaVerifiedState] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

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

  // Load user from localStorage on initial mount
  useEffect(() => {
    setLoading(true);
    if (typeof window !== 'undefined') {
      const storedUserJson = localStorage.getItem(CURRENT_DUMMY_USER_STORAGE_KEY);
      const storedMfaVerified = localStorage.getItem(MFA_VERIFIED_STORAGE_KEY);
      if (storedUserJson) {
        try {
          const loggedInUser: UserProfile = JSON.parse(storedUserJson);
          setUser(loggedInUser);
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

  // Navigation logic based on auth state
   useEffect(() => {
    if (loading) return;

    const isAuthRoute = pathname.startsWith('/auth/');
    const isMfaPage = pathname === '/auth/mfa';

    if (user) { // User is logged in (at least basic profile loaded)
      if (!isMfaVerified) { // MFA not yet verified
        if (!isMfaPage) {
          router.replace('/auth/mfa'); // Redirect to MFA page
        }
        // If on MFA page, do nothing, let the user verify
      } else { // User is logged in and MFA verified
        if (isAuthRoute) { // If on any auth page (login, register, mfa)
          router.replace('/dashboard'); // Redirect to dashboard
        } else { // On a protected page, check role
          const baseRoute = `/${pathname.split('/')[1]}`;
          const requiredRoles = rolesConfig.routePermissions[pathname as keyof typeof rolesConfig.routePermissions] ||
                                rolesConfig.routePermissions[baseRoute as keyof typeof rolesConfig.routePermissions];
          if (requiredRoles && !requiredRoles.includes(user.role)) {
            router.replace('/dashboard?toast_message=access_denied_role');
          }
        }
      }
    } else { // No user logged in
      if (!isAuthRoute && pathname !== '/') { // If not on an auth page and not the root
        router.replace('/auth/login');
      } else if (pathname === '/') { // If on the root page
         router.replace('/auth/login');
      }
      // If on an auth page, do nothing, let the user authenticate
    }
  }, [user, isMfaVerified, loading, pathname, router]);

  const login = useCallback(async (email: string, password?: string): Promise<AuthResponse | null> => {
    setLoading(true);
    setError(null);
    try {
      const response = await MockApi._mockLoginUser(email, password);
      const loggedInUser = await MockApi._mockFetchUserProfile(response.user.uid); // Fetch full profile
      setUser(loggedInUser);
      if (typeof window !== 'undefined') {
        localStorage.setItem(CURRENT_DUMMY_USER_STORAGE_KEY, JSON.stringify(loggedInUser));
      }
      setIsMfaVerified(false); // Require MFA after login
      router.push('/auth/mfa');
      return response;
    } catch (err: any) {
      setError(err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [router, setIsMfaVerified]);

  const register = useCallback(async (details: Omit<UserProfile, 'uid' | 'photoURL'> & { password?: string }): Promise<AuthResponse | null> => {
    setLoading(true);
    setError(null);
    try {
      const response = await MockApi._mockRegisterUser(details);
      const registeredUser = await MockApi._mockFetchUserProfile(response.user.uid);
      setUser(registeredUser);
       if (typeof window !== 'undefined') {
        localStorage.setItem(CURRENT_DUMMY_USER_STORAGE_KEY, JSON.stringify(registeredUser));
      }
      setIsMfaVerified(false); // Require MFA after registration
      router.push('/auth/mfa');
      return response;
    } catch (err: any) {
      setError(err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [router, setIsMfaVerified]);

  const verifyMfa = useCallback(async (uid: string, otp: string): Promise<MfaVerificationResponse> => {
    setLoading(true);
    setError(null);
    try {
      const response = await MockApi._mockVerifyMfa(uid, otp);
      if (response.success && response.user) {
        setUser(response.user); // Update user state with potentially updated profile from MFA
        if (typeof window !== 'undefined') {
          localStorage.setItem(CURRENT_DUMMY_USER_STORAGE_KEY, JSON.stringify(response.user));
        }
        setIsMfaVerified(true);
        router.push('/dashboard');
      } else {
        setIsMfaVerified(false);
        setError(new Error(response.message || 'MFA verification failed'));
      }
      return response;
    } catch (err: any) {
      setError(err);
      setIsMfaVerified(false);
      return { success: false, message: err.message };
    } finally {
      setLoading(false);
    }
  }, [router, setIsMfaVerified]);

  const logout = useCallback(async () => {
    setLoading(true);
    setError(null);
    await MockApi._mockLogoutUser();
    if (typeof window !== 'undefined') {
      localStorage.removeItem(CURRENT_DUMMY_USER_STORAGE_KEY);
      localStorage.removeItem(MFA_VERIFIED_STORAGE_KEY);
    }
    setUser(null);
    setIsMfaVerified(false);
    router.push('/auth/login');
    setLoading(false);
  }, [router, setIsMfaVerified]);

  const fetchCurrentUserInfo = useCallback(async (): Promise<UserProfile | null> => {
    if (!user?.uid) return null;
    setLoading(true);
    try {
      const profile = await MockApi._mockFetchUserProfile(user.uid);
      setUser(profile);
      return profile;
    } catch (err: any) {
      setError(err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [user?.uid]);

  const updateUserPreferencesInContext = useCallback((preferences: Partial<UserProfile['preferences']>) => {
    setUser(prevUser => {
        if (!prevUser) return null;
        const updatedUser = {
            ...prevUser,
            preferences: { ...(prevUser.preferences || {}), ...preferences },
        };
        if (typeof window !== 'undefined') {
            localStorage.setItem(CURRENT_DUMMY_USER_STORAGE_KEY, JSON.stringify(updatedUser));
        }
        return updatedUser;
    });
  }, []);

  const contextValue: AuthContextType = useMemo(() => ({
    user,
    loading,
    error,
    isMfaVerified,
    login,
    register,
    verifyMfa,
    logout,
    fetchCurrentUserInfo,
    setUser, // Expose setUser for direct manipulation if ever needed by this provider itself
    setIsMfaVerified,
    updateUserPreferencesInContext,
  }), [user, loading, error, isMfaVerified, login, register, verifyMfa, logout, fetchCurrentUserInfo, setIsMfaVerified, updateUserPreferencesInContext]);

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
}
