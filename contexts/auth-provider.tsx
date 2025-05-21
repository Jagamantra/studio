
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

const JWT_COOKIE_NAME = 'genesis_session_token'; // Example cookie name if backend sets it

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
  const [sessionToken, setSessionToken] = useState<string | null>(null); // In-memory token
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

  const fetchCurrentUserInfo = useCallback(async (uid: string, email?: string, role?: UserProfile['role']): Promise<UserProfile | null> => {
    setLoading(true);
    setError(null);
    try {
      // In real API mode, this would fetch from backend. For now, uses dummy data.
      const fetchedProfileFromDummy = await Api.fetchUserProfile(uid); 
      
      if (fetchedProfileFromDummy) {
        // Ensure email and role from token/MFA response are authoritative if dummy data is sparse
        const finalProfile: UserProfile = {
            ...fetchedProfileFromDummy, // Base from dummy
            uid, // Ensure UID from token is used
            email: email || fetchedProfileFromDummy.email, // Prioritize email from auth flow
            role: role || fetchedProfileFromDummy.role,   // Prioritize role from auth flow
        };
        setUser(finalProfile);
        return finalProfile;
      } else if (email && role) {
        // If dummy data doesn't have this user, create a partial profile
        const partialUser: UserProfile = { 
          uid, 
          email, 
          role, 
          displayName: email, 
          photoURL: null, 
          phoneNumber: null,
          preferences: {}
        };
        setUser(partialUser);
        return partialUser;
      }
      throw new Error(`User profile not found for UID: ${uid} (checked dummy data)`);
    } catch (err: any) {
      console.error("Error fetching current user info:", err);
      setError(err);
      setUser(null);
      setSessionToken(null); // Clear token if profile fetch fails
      Cookies.remove(JWT_COOKIE_NAME); 
      setIsMfaVerified(false);
      return null;
    } finally {
      setLoading(false);
    }
  }, [setIsMfaVerified]);

  // Initial auth check - simplified as backend HttpOnly cookie would be main driver
  useEffect(() => {
    const tokenFromCookie = Cookies.get(JWT_COOKIE_NAME); // Check if backend set a session cookie
    if (tokenFromCookie) {
      // If a session cookie exists, we might assume a session is active.
      // The actual user object will be set after successful MFA or if state is restored.
      // This part is tricky without a /me endpoint to verify the cookie and get user details.
      // For now, we'll rely on the MFA flow to establish the user and sessionToken state.
      console.log("Session token cookie found on initial load. User state will be determined by subsequent actions or MFA.");
      setSessionToken(tokenFromCookie); // Potentially store it if needed for direct use, though HttpOnly means JS can't read its value for API headers.
    }
    setLoading(false);
  }, []);


  // Navigation logic
  useEffect(() => {
    if (loading) return;

    const isAuthRoute = pathname.startsWith('/auth/');
    const isMfaPage = pathname === '/auth/mfa';

    if (user && isMfaVerified && sessionToken) { 
      if (isAuthRoute) {
        router.replace('/dashboard');
      } else {
        const baseRoute = `/${pathname.split('/')[1]}`;
        const requiredRoles = rolesConfig.routePermissions[pathname as keyof typeof rolesConfig.routePermissions] ||
                              rolesConfig.routePermissions[baseRoute as keyof typeof rolesConfig.routePermissions];
        if (requiredRoles && !requiredRoles.includes(user.role)) {
          toast({ title: 'Access Denied', message: 'You do not have permission for the requested page.', variant: 'destructive' });
          router.replace('/dashboard'); // Redirect to dashboard instead of adding toast_message to URL
        }
      }
    } else if (authEmailForMfa && !isMfaVerified) { 
        if (!isMfaPage) {
            router.replace('/auth/mfa');
        }
    } else if (!user && !isAuthRoute && pathname !== '/') { 
        router.replace('/auth/login');
    } else if (pathname === '/' && !isAuthRoute && !user) { 
        router.replace('/auth/login');
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
        // No error message if codeSent is true
        return response;
      } else {
        // This case should ideally not happen if API adheres to spec (either codeSent or error)
        throw new Error(response.message || "MFA code not sent and no error provided by API.");
      }
    } catch (err: any) {
      console.error("Login API error:", err);
      setError(err); // This error will be picked up by the login form
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
    } catch (err: any)
     {
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
        const mfaError = new Error("Email for MFA verification is missing. Please log in again.");
        setError(mfaError);
        setLoading(false);
        router.push('/auth/login');
        return null;
    }

    try {
      const response = await Api.verifyMfa(authEmailForMfa, mfaCode);
      // Response: { accessToken, email, role, expiresIn }
      
      setSessionToken(response.accessToken);
      // Backend might set an HttpOnly cookie, client stores token in memory if needed for other things or if not HttpOnly.
      // If your backend sets an HttpOnly cookie named JWT_COOKIE_NAME, this line can be conditional or for other types of tokens.
      // Cookies.set(JWT_COOKIE_NAME, response.accessToken, { expires: response.expiresIn / (24 * 60 * 60) });


      const decodedPayload = decodeJwtPayload(response.accessToken);
      const uidFromToken = decodedPayload?.sub;

      if (!uidFromToken) {
        throw new Error("Could not extract UID (sub) from access token.");
      }

      // Use email and role from API response, UID from token.
      // Then fetch full profile details.
      await fetchCurrentUserInfo(uidFromToken, response.email, response.role);
      
      setIsMfaVerified(true);
      setAuthEmailForMfa(null); 
      
      toast({
          title: 'Verification Successful',
          message: 'You have been successfully verified. Welcome!',
          variant: 'success',
      });
      router.push('/dashboard');
      return {...response, uid: uidFromToken }; // Add uid to the response for consistency if needed elsewhere
    } catch (err: any) {
      console.error("Verify MFA API error or processing error:", err);
      setError(err);
      setIsMfaVerified(false); 
      setSessionToken(null);
      // Cookies.remove(JWT_COOKIE_NAME);
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
      console.warn("Error during backend logout:", e); 
    }
    Cookies.remove(JWT_COOKIE_NAME); 
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
