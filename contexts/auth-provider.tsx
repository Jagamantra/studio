
'use client';

import React, { useEffect, useMemo, useCallback, useState } from 'react';
import type { ReactNode } from 'react';
import type { UserProfile, MfaSentResponse, LoginSuccessResponse, ThemeSettings } from '@/types';
import { AuthContext, type AuthContextType } from './auth-context';
import { useRouter, usePathname } from 'next/navigation';
import { rolesConfig } from '@/config/roles.config';
import * as Api from '@/services/api'; 
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
  const [loading, setLoading] = useState(true); // Start as true for initial auth check
  const [error, setError] = useState<Error | null>(null);
  const [isMfaVerified, setIsMfaVerifiedState] = useState(false);
  const [authEmailForMfa, setAuthEmailForMfa] = useState<string | null>(null);
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();

  const setIsMfaVerified = useCallback((verified: boolean) => {
    setIsMfaVerifiedState(verified);
  }, []);

  const fetchCurrentUserInfo = useCallback(async (uid: string, email?: string, role?: UserProfile['role']): Promise<UserProfile | null> => {
    setLoading(true); // Ensure loading is true during fetch
    setError(null);
    try {
      const fetchedProfile = await Api.fetchUserProfile(uid, email, role); 
      
      if (fetchedProfile) {
        setUser(fetchedProfile);
        return fetchedProfile;
      }
      // If fetchUserProfile returns null (e.g., user not found in dummy data and couldn't be created),
      // it means we can't establish a full user session.
      throw new Error(`User profile could not be established for UID: ${uid}`);
    } catch (err: any) {
      console.error("Error fetching/establishing current user info:", err);
      setError(err);
      // Clear all session-related state if user info cannot be fetched
      setUser(null);
      setSessionToken(null);
      Cookies.remove(JWT_COOKIE_NAME); 
      setIsMfaVerified(false);
      return null;
    } finally {
      setLoading(false);
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
          setSessionToken(tokenFromCookie); // Set token from cookie
          const profile = await fetchCurrentUserInfo(decoded.sub, decoded.email, decoded.role as UserProfile['role']);
          if (profile) {
            setIsMfaVerified(true); // Assume MFA was verified if token exists and profile fetched
          } else {
            // Failed to fetch profile even with token, clear session
            Cookies.remove(JWT_COOKIE_NAME);
            setSessionToken(null);
            setIsMfaVerified(false);
          }
        } else {
          // Invalid or incomplete token, clear it
          Cookies.remove(JWT_COOKIE_NAME);
        }
      }
      setLoading(false);
    };
    attemptAutoLogin();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Runs once on mount


  // Navigation logic based on auth state
  useEffect(() => {
    if (loading) return; // Don't run navigation logic while initial auth check is happening

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
        } else if (pathname === '/' && !isAuthRoute ) { 
            router.replace('/auth/login');
        }
    }
  }, [user, isMfaVerified, loading, pathname, router, authEmailForMfa, sessionToken, toast]);


  const login = useCallback(async (email: string, password?: string): Promise<MfaSentResponse | null> => {
    setLoading(true);
    setError(null);
    try {
      const response = await Api.loginUser(email, password); 
      if (response.codeSent) {
        setAuthEmailForMfa(email); 
        router.push('/auth/mfa');
        return response;
      } else {
        throw new Error(response.message || "MFA code not sent and no error provided by API.");
      }
    } catch (err: any) {
      console.error("Login API error:", err);
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
      const response = await Api.registerUser(details); 
      if (response.codeSent) {
        setAuthEmailForMfa(details.email); 
        router.push('/auth/mfa');
        return response;
      } else {
        throw new Error(response.message || "MFA code not sent during registration and no error provided by API.");
      }
    } catch (err: any) {
      console.error("Register API error:", err);
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
        const mfaError = new Error("Session context lost. Please log in again.");
        setError(mfaError);
        setLoading(false);
        router.push('/auth/login');
        return null;
    }

    try {
      const response = await Api.verifyMfa(authEmailForMfa, mfaCode);
      // Response: { accessToken, email, role, expiresIn }
      
      const decodedPayload = decodeJwtPayload(response.accessToken);
      const uidFromToken = decodedPayload?.sub;

      if (!uidFromToken) {
        throw new Error("Could not extract UID (sub) from access token.");
      }
      
      setSessionToken(response.accessToken);
      Cookies.set(JWT_COOKIE_NAME, response.accessToken, { expires: response.expiresIn / (24 * 60 * 60), path: '/' });

      await fetchCurrentUserInfo(uidFromToken, response.email, response.role);
      
      setIsMfaVerified(true);
      setAuthEmailForMfa(null); 
      
      toast({
          title: 'Verification Successful',
          message: 'You have been successfully verified. Welcome!',
          variant: 'success',
      });
      router.push('/dashboard'); // Redirect after all state updates
      return {...response, uid: uidFromToken }; 
    } catch (err: any) {
      console.error("Verify MFA API error or processing error:", err);
      setError(err);
      // Clear potentially partially set states on error
      setUser(null);
      setSessionToken(null);
      Cookies.remove(JWT_COOKIE_NAME);
      setIsMfaVerified(false); 
      return null;
    } finally {
      setLoading(false);
    }
  }, [authEmailForMfa, router, setIsMfaVerified, fetchCurrentUserInfo, toast]);

  const logout = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      await Api.logoutUser(); 
    } catch (e) {
      console.warn("Error during backend logout (this may be expected if no specific endpoint):", e); 
    }
    // Clear all client-side session information
    Cookies.remove(JWT_COOKIE_NAME); 
    setSessionToken(null);
    setUser(null);
    setIsMfaVerified(false);
    setAuthEmailForMfa(null);
    router.push('/auth/login'); // Ensure redirect after state clear
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
