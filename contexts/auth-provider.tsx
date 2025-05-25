'use client';

import React, { useEffect, useMemo, useCallback, useState } from 'react';
import type { ReactNode } from 'react';
import type { UserProfile, MfaSentResponse, LoginSuccessResponse, ThemeSettings } from '@/types';
import { AuthContext, type AuthContextType } from './auth-context';
import { useRouter, usePathname } from 'next/navigation';
import { rolesConfig } from '@/config/roles.config';
import * as Api from '@/services/api'; // Now imports from the unified api.ts
import Cookies from 'js-cookie';
import { useToast } from '@/hooks/use-toast';

const JWT_COOKIE_NAME = 'genesis_token';

// Helper to decode JWT payload (client-side, no verification)
function decodeJwtPayload(token: string): { sub?: string; email?: string; role?: string; [key: string]: any } | null {
  try {
    const base64Url = token.split('.')[1];
    if (!base64Url) return null;
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(function (c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    console.error("Failed to decode JWT payload:", e);
    return null;
  }
}


export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isMfaVerified, setIsMfaVerifiedState] = useState(false);
  const [authEmailForMfa, setAuthEmailForMfa] = useState<string | null>(null);
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();

  const setIsMfaVerified = useCallback((verified: boolean) => {
    setIsMfaVerifiedState(verified);
  }, []);

  const fetchCurrentUserInfo = useCallback(async (uid: string, emailFromToken?: string, roleFromToken?: UserProfile['role']): Promise<UserProfile | null> => {
    try {
      // Try to fetch user details from API
      let fetchedProfile: UserProfile | null = null;
      if (!projectConfig.mockApiMode) {
        try {
          const response = await fetch('/auth/me');
          if (response.ok) {
            fetchedProfile = await response.json();
          }
        } catch (err) {
          console.error('Error fetching user details from API:', err);
        }
      }

      // Fall back to dummy data if needed
      if (!fetchedProfile) {
        fetchedProfile = await Api.fetchUserProfile(uid, emailFromToken, roleFromToken);
      }
      
      if (fetchedProfile) {
        setUser(fetchedProfile);
        return fetchedProfile;
      }
      throw new Error(`User profile could not be established for UID: ${uid}`);
    } catch (err: any) {
      console.error("Error fetching/establishing current user info:", err);
      setError(err);
      setUser(null);
      Cookies.remove(JWT_COOKIE_NAME);
      setIsMfaVerified(false);
      return null;
    }
  }, [setIsMfaVerified]);

  // Initial auth check from cookie
  useEffect(() => {
    const attemptAutoLogin = async () => {
      setLoading(true);
      const tokenFromCookie = Cookies.get(JWT_COOKIE_NAME);
      if (tokenFromCookie) {
        const decoded = decodeJwtPayload(tokenFromCookie);
        if (decoded && decoded.sub && decoded.email && decoded.role) {
          // Fetch/create user profile
          const profile = await fetchCurrentUserInfo(decoded.sub, decoded.email, decoded.role as UserProfile['role']);
          if (profile) {
            setIsMfaVerified(true); // Assume MFA was verified if token exists and profile fetched
          } else {
            // Failed to fetch profile even with token, clear session
            Cookies.remove(JWT_COOKIE_NAME);
            setUser(null);
            setIsMfaVerified(false);
          }
        } else {
          // Invalid or incomplete token, clear it
          Cookies.remove(JWT_COOKIE_NAME);
          setUser(null);
          setIsMfaVerified(false);
        }
      }
      setLoading(false);
    };
    attemptAutoLogin();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Navigation logic based on auth state
  useEffect(() => {
    if (loading) return;

    const isAuthRoute = pathname.startsWith('/auth/');
    const isMfaPage = pathname === '/auth/mfa';

    if (user && isMfaVerified && Cookies.get(JWT_COOKIE_NAME)) { // Fully authenticated
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
    } else if (authEmailForMfa && !isMfaVerified) { // Needs MFA
      if (!isMfaPage) {
          router.replace('/auth/mfa');
      }
    } else { // Not authenticated or MFA pending from a previous uncompleted session
      if (!isAuthRoute && pathname !== '/') {
          router.replace('/auth/login');
      } else if (pathname === '/' && !isAuthRoute ) { // Handle root path redirect if not an auth route
          router.replace('/auth/login');
      }
    }
  }, [user, isMfaVerified, loading, pathname, router, authEmailForMfa, toast]);

  const login = useCallback(async (email: string, password?: string): Promise<MfaSentResponse | null> => {
    setLoading(true);
    setError(null);
    try {
      const response = await Api.loginUser(email, password); // Calls unified api.ts
      if (response.codeSent) {
        setAuthEmailForMfa(email);
        // Don't set user yet, wait for MFA
        router.push('/auth/mfa');
        return response;
      } else {
        throw new Error(response.message || "Login failed before MFA step.");
      }
    } catch (err: any) {
      console.error("Login API error in AuthProvider:", err);
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
       throw new Error(response.message || "Registration failed before MFA step.");
    } catch (err: any) {
      console.error("Register API error in AuthProvider:", err);
      setError(err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [router]);

  const verifyMfa = useCallback(async (mfaCode: string): Promise<LoginSuccessResponse | null> => {
    setLoading(true);
    setError(null);
    try {
      const response = await Api.verifyMfa(mfaCode);
      if (response && response.accessToken) {
        const decodedPayload = decodeJwtPayload(response.accessToken);
        const uidFromToken = decodedPayload?.sub;

        if (!uidFromToken) {
          throw new Error("Could not extract UID from access token.");
        }

        Cookies.set(JWT_COOKIE_NAME, response.accessToken, { 
          secure: true,
          sameSite: 'strict',
          expires: 1 // 1 day
        });

        // Fetch user profile
        const userProfile = await fetchCurrentUserInfo(uidFromToken, response.email, response.role);
        if (!userProfile) {
          throw new Error("Failed to fetch user profile after MFA verification");
        }

        setIsMfaVerified(true);
        setAuthEmailForMfa(null);

        router.push('/dashboard');
        toast({
          title: "Welcome Back!",
          message: "Successfully authenticated.",
          variant: "success",
        });

        return response;
      }
      throw new Error("Invalid MFA response");
    } catch (err: any) {
      console.error('MFA verification failed:', err);
      setError(err);
      setUser(null);
      Cookies.remove(JWT_COOKIE_NAME);
      setIsMfaVerified(false);
      return null;
    } finally {
      setLoading(false);
    }
  }, [fetchCurrentUserInfo, router, setIsMfaVerified, toast]);

  const logout = useCallback(async () => {
    setLoading(true);
    setError(null);
    await Api.logoutUser(); // Calls unified api.ts; backend handles token invalidation
    
    // Clear all client-side session information
    Cookies.remove(JWT_COOKIE_NAME);
    setUser(null);
    setIsMfaVerified(false);
    setAuthEmailForMfa(null);
    router.push('/auth/login');
    setLoading(false);
  }, [router, setIsMfaVerified]);

  const updateUserPreferencesInContext = useCallback((preferences: Partial<ThemeSettings>) => {
    setUser(prevUser => {
      if (!prevUser) return null;
      const updatedUser = {
        ...prevUser,
        preferences: { ...(prevUser.preferences || {}), ...preferences },
      };
      return updatedUser;
    });
  }, []);

  const updateCurrentLocalUser = useCallback((updatedProfileData: Partial<UserProfile>) => {
    setUser(prevUser => {
      if (!prevUser) return null;
      return { ...prevUser, ...updatedProfileData };
    });
  }, []);

  const contextValue = useMemo<AuthContextType>(() => ({
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
