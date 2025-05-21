
'use client';

import React, { useEffect, useMemo, useCallback, useState } from 'react';
import type { ReactNode } from 'react';
import type { UserProfile, MfaSentResponse, LoginSuccessResponse, ThemeSettings } from '@/types';
import { AuthContext, type AuthContextType } from './auth-context';
import { useRouter, usePathname } from 'next/navigation';
import { rolesConfig } from '@/config/roles.config';
import * as Api from '@/services/api'; 
import Cookies from 'js-cookie'; 

const JWT_COOKIE_NAME = 'genesis_token'; // This might be the name of your HttpOnly cookie set by the backend

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isMfaVerified, setIsMfaVerifiedState] = useState(false);
  const [authEmailForMfa, setAuthEmailForMfa] = useState<string | null>(null); // To store email between login/register and MFA
  const router = useRouter();
  const pathname = usePathname();

  const setIsMfaVerified = useCallback((verified: boolean) => {
    setIsMfaVerifiedState(verified);
    // In real API mode, MFA state is session-based, not stored in localStorage.
  }, []);

  const fetchCurrentUserInfo = useCallback(async (email?: string, role?: string, uid?: string): Promise<UserProfile | null> => {
    setLoading(true);
    setError(null);
    try {
      // If uid is provided (e.g., from verifyMfa response), fetch full profile.
      // Otherwise, if only a token is present (e.g., on page refresh),
      // a /users/me endpoint would be ideal. For now, we depend on having uid.
      const targetUid = user?.uid || uid;
      if (!targetUid) {
        console.warn("fetchCurrentUserInfo: No UID available. Cannot fetch profile without UID or a /users/me endpoint.");
        setLoading(false);
        // If there's an email and role from a token but no UID, create a partial user.
        if (email && role) {
          const partialUser: UserProfile = { 
            uid: 'unknown-uid-from-token', // Placeholder UID
            email, 
            role: role as UserProfile['role'], 
            displayName: email, // Default display name
            photoURL: null, 
            phoneNumber: null,
            preferences: {}
          };
          setUser(partialUser);
          return partialUser;
        }
        return null;
      }
      
      const fetchedProfile = await Api.fetchUserProfile(targetUid); // This uses dummy data for now.
      if (fetchedProfile) {
        setUser(fetchedProfile);
        return fetchedProfile;
      } else {
        // If profile fetch fails for a known UID, it's an issue. Clear session.
        throw new Error(`User profile not found for UID: ${targetUid}`);
      }
    } catch (err: any) {
      console.error("Error fetching current user info (real):", err);
      setError(err);
      setUser(null);
      Cookies.remove(JWT_COOKIE_NAME); // Clear any token cookie
      setIsMfaVerified(false);
      return null;
    } finally {
      setLoading(false);
    }
  }, [user?.uid, setIsMfaVerified]);

  // Initial auth check
  useEffect(() => {
    const token = Cookies.get(JWT_COOKIE_NAME);
    if (token) {
      // Token exists. Ideally, verify token with a /auth/me endpoint.
      // Since we don't have that, we assume the token is valid if present
      // and try to reconstruct basic user info if needed, or wait for MFA.
      // The actual user object with full details will be set after successful MFA.
      // For now, if a token exists, we assume user is partially authenticated but needs MFA.
      console.log("Token found on initial load. User will proceed to MFA or dashboard if already verified.");
      // We can't get UID, email, role from an HttpOnly cookie directly.
      // This state will be properly set after MFA verification.
      // For now, we just know a session *might* exist.
      // Let the navigation logic handle redirection.
      // Set loading to false to allow navigation logic to proceed.
      // If we had a /auth/me endpoint, we'd call it here.
      // If the user was already MFA verified in this "session" (e.g. another tab),
      // this isn't tracked client-side for real API, backend drives it.
      // We assume MFA is always needed after app load if token present but no user state.
    } else {
      setUser(null);
      setIsMfaVerified(false);
    }
    setLoading(false);
  }, [setIsMfaVerified]);


  // Navigation logic
  useEffect(() => {
    if (loading) return;

    const isAuthRoute = pathname.startsWith('/auth/');
    const isMfaPage = pathname === '/auth/mfa';
    const token = Cookies.get(JWT_COOKIE_NAME); // HttpOnly cookie set by backend

    if (user && isMfaVerified && token) { // User object exists, MFA verified, and token is present
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
    } else if (token && authEmailForMfa && !isMfaVerified) { // Token exists, email for MFA is set, but MFA not done
        if (!isMfaPage) {
            router.replace('/auth/mfa');
        }
    } else if (token && !authEmailForMfa && !isMfaVerified && !user) {
        // Token exists, but we don't have client-side user/email state yet (e.g. page refresh)
        // This state is tricky. Backend should protect routes.
        // Client might redirect to login if it can't establish user state.
        // Or, if on auth page, allow it. If on protected page, backend should deny.
        // For a smoother UX, a /auth/me endpoint that returns user based on cookie is best here.
        // Without it, we might default to redirecting to login if not on an auth page.
        console.log("Token present, but no user/MFA email context. Relying on backend route protection or redirecting to login if necessary.");
        if (!isAuthRoute && pathname !== '/') {
             // router.replace('/auth/login'); // Potentially too aggressive. Let backend handle for now.
        }
    } else { // No user object or no token, or MFA step pending
      if (!isAuthRoute && pathname !== '/') {
        router.replace('/auth/login');
      } else if (pathname === '/' && !isAuthRoute) { // Root should go to login if not authenticated
        router.replace('/auth/login');
      }
    }
  }, [user, isMfaVerified, loading, pathname, router, authEmailForMfa]);


  const login = useCallback(async (email: string, password?: string): Promise<MfaSentResponse | null> => {
    setLoading(true);
    setError(null);
    try {
      const response = await Api.loginUser(email, password); 
      if (response.codeSent) {
        setAuthEmailForMfa(email); // Store email for MFA step
        router.push('/auth/mfa');
      } else {
        throw new Error(response.message || "MFA code not sent despite successful-ish login call.");
      }
      return response;
    } catch (err: any) {
      setError(err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [router]);

  const register = useCallback(async (details: { email: string, password?: string }): Promise<MfaSentResponse | null> => {
    setLoading(true);
    setError(null);
    try {
      const response = await Api.registerUser(details); 
      if (response.codeSent) {
        setAuthEmailForMfa(details.email); // Store email for MFA step
        router.push('/auth/mfa');
      } else {
        throw new Error(response.message || "MFA code not sent despite successful-ish registration call.");
      }
      return response;
    } catch (err: any) {
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
        setError(new Error("Email for MFA verification is missing. Please log in again."));
        setLoading(false);
        router.push('/auth/login');
        return null;
    }

    try {
      const response = await Api.verifyMfa(authEmailForMfa, mfaCode);
      // response includes { accessToken, email, role, uid, expiresIn }
      // The accessToken is an HttpOnly cookie set by backend.
      // We use email, role, uid to set the client-side user object.
      const userProfile: UserProfile = {
        uid: response.uid,
        email: response.email,
        role: response.role as UserProfile['role'],
        displayName: response.email, // Or fetch full profile if displayName is different
        photoURL: null, // Fetch full profile for this
        phoneNumber: null, // Fetch full profile for this
        preferences: response.preferences || {}, // Use preferences from response if available
      };
      setUser(userProfile);
      setIsMfaVerified(true);
      setAuthEmailForMfa(null); // Clear email used for MFA
      
      // Optionally, fetch more detailed profile info if verifyMfa response is basic
      // await fetchCurrentUserInfo(userProfile.uid, userProfile.email, userProfile.role);

      router.push('/dashboard');
      return response;
    } catch (err: any) {
      setError(err);
      setIsMfaVerified(false); // Ensure MFA is not marked as verified on error
      return null;
    } finally {
      setLoading(false);
    }
  }, [authEmailForMfa, router, setIsMfaVerified, fetchCurrentUserInfo]);

  const logout = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      await Api.logoutUser(); 
    } catch (e) {
      console.warn("Error during backend logout:", e); 
    }
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
        // Actual persistence is by ThemeProvider calling Api.updateUserPreferences.
        // This context update is for immediate UI reflection.
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
    authEmailForMfa, // expose this if MFA page needs it directly (though verifyMfa in context is preferred)
    login,
    register,
    verifyMfa,
    logout,
    fetchCurrentUserInfo,
    setUser, // Exposing for direct manipulation if needed, e.g., by ThemeProvider loading from user.preferences
    setIsMfaVerified,
    updateUserPreferencesInContext,
    updateCurrentLocalUser,
  }), [
      user, loading, error, isMfaVerified, authEmailForMfa, 
      login, register, verifyMfa, logout, fetchCurrentUserInfo, 
      setIsMfaVerified, updateUserPreferencesInContext, updateCurrentLocalUser
    ]);

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
}
