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
  const [sessionToken, setSessionToken] = useState<string | null>(null);
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
    setLoading(true);
    setError(null);
    try {
      // Api.fetchUserProfile will use dummy data store but can create a placeholder if needed
      const fetchedProfile = await Api.fetchUserProfile(uid, emailFromToken, roleFromToken);
      
      if (fetchedProfile) {
        setUser(fetchedProfile);
        return fetchedProfile;
      }
      throw new Error(`User profile could not be established for UID: ${uid}`);
    } catch (err: any) {
      console.error("Error fetching/establishing current user info:", err);
      setError(err);
      setUser(null);
      setSessionToken(null);
      Cookies.remove(JWT_COOKIE_NAME);
      setIsMfaVerified(false);
      return null;
    } finally {
      // setLoading(false) will be handled by the calling function or useEffect
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
          setSessionToken(tokenFromCookie);
          // Fetch/create user profile (potentially from dummy store if real profile endpoint not ready)
          const profile = await fetchCurrentUserInfo(decoded.sub, decoded.email, decoded.role as UserProfile['role']);
          if (profile) {
            setIsMfaVerified(true); // Assume MFA was verified if token exists and profile fetched
          } else {
            // Failed to fetch profile even with token, clear session
            Cookies.remove(JWT_COOKIE_NAME);
            setSessionToken(null);
            setUser(null);
            setIsMfaVerified(false);
          }
        } else {
          // Invalid or incomplete token, clear it
          Cookies.remove(JWT_COOKIE_NAME);
          setSessionToken(null);
          setUser(null);
          setIsMfaVerified(false);
        }
      }
      setLoading(false);
    };
    attemptAutoLogin();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Runs once on mount


  // Navigation logic based on auth state
  useEffect(() => {
    if (loading) return;

    const isAuthRoute = pathname.startsWith('/auth/');
    const isMfaPage = pathname === '/auth/mfa';

    if (user && isMfaVerified && sessionToken) { // Fully authenticated
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
  }, [user, isMfaVerified, loading, pathname, router, authEmailForMfa, sessionToken, toast]);


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
        // This case should ideally not happen if API returns error for failed login attempt before MFA
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
      } else {
        throw new Error(response.message || "Registration failed before MFA step.");
      }
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
    if (!authEmailForMfa) {
        const mfaError = new Error("Session context lost for MFA. Please log in again.");
        setError(mfaError);
        setLoading(false);
        router.push('/auth/login'); // Redirect to login if MFA context is lost
        return null;
    }

    try {
      // Response: { accessToken, email, role, expiresIn }
      const response = await Api.verifyMfa(authEmailForMfa, mfaCode); // Calls unified api.ts
      
      const decodedPayload = decodeJwtPayload(response.accessToken);
      const uidFromToken = decodedPayload?.sub;

      if (!uidFromToken) {
        throw new Error("Could not extract UID (sub) from access token.");
      }
      
      setSessionToken(response.accessToken);
      // Backend is expected to set HttpOnly cookie. Client stores token in memory.
      // If not HttpOnly, Cookies.set(JWT_COOKIE_NAME, response.accessToken, { expires: response.expiresIn / (24 * 60 * 60), path: '/' });

      // Fetch/create user profile (using dummy data store for non-auth details)
      await fetchCurrentUserInfo(uidFromToken, response.email, response.role as UserProfile['role']);
      
      setIsMfaVerified(true);
      setAuthEmailForMfa(null); // Clear MFA email context
      
      toast({
          title: 'Verification Successful',
          message: 'You have been successfully verified. Welcome!',
          variant: 'success',
      });
      router.push('/dashboard');
      return {...response, uid: uidFromToken };
    } catch (err: any) {
      console.error("Verify MFA API error or processing error in AuthProvider:", err);
      setError(err);
      // Clear potentially partially set states on error
      setUser(null);
      setSessionToken(null);
      // Cookies.remove(JWT_COOKIE_NAME); // Only if client was setting it.
      setIsMfaVerified(false);
      return null;
    } finally {
      setLoading(false);
    }
  }, [authEmailForMfa, router, setIsMfaVerified, fetchCurrentUserInfo, toast]);

  const logout = useCallback(async () => {
    setLoading(true);
    setError(null);
    await Api.logoutUser(); // Calls unified api.ts; backend handles token invalidation
    
    // Clear all client-side session information
    Cookies.remove(JWT_COOKIE_NAME); // Remove auth cookie if it was set client-side or for good measure
    setSessionToken(null);
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
        // No need to persist to localStorage here, ThemeProvider does that.
        // And Api.updateUserPreferences is called by ThemeProvider.
        return updatedUser;
    });
  }, []);

  const updateCurrentLocalUser = useCallback((updatedProfileData: Partial<UserProfile>) => {
    setUser(prevUser => {
      if (!prevUser) return null;
      // Persist to localStorage through API layer for mock mode.
      // Real mode will rely on backend for profile persistence.
      // Api.updateUserProfile(prevUser.uid, updatedProfileData); // Called from profile page directly
      return { ...prevUser, ...updatedProfileData };
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
      setIsMfaVerified, updateUserPreferencesInContext, updateCurrentLocalUser
    ]);

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
}
