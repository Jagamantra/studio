
'use client';

import React, { useEffect, useMemo, useCallback, useState } from 'react';
import type { ReactNode } from 'react';
import type { UserProfile, AuthResponse, MfaVerificationResponse } from '@/types';
import { AuthContext, type AuthContextType } from './auth-context';
import { useRouter, usePathname } from 'next/navigation';
import { rolesConfig } from '@/config/roles.config';
import * as Api from '@/services/api'; // Using the main api.ts dispatcher
import Cookies from 'js-cookie'; // For client-side cookie management (primarily for clearing)

const JWT_COOKIE_NAME = 'genesis_token'; // Example cookie name

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isMfaVerified, setIsMfaVerifiedState] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const setIsMfaVerified = useCallback((verified: boolean) => {
    setIsMfaVerifiedState(verified);
    // No local storage for MFA state in real API mode; backend drives this.
  }, []);

  const fetchCurrentUserInfo = useCallback(async (tokenPresent: boolean = false): Promise<UserProfile | null> => {
    // This function tries to fetch user info if a token might exist
    // Or if we have a UID from a previous state (e.g., post-MFA)
    // It's crucial for rehydrating state or getting full profile after basic login response
    setLoading(true);
    setError(null);
    try {
      // If there's no user.uid yet but a token might be in cookies (e.g. page refresh)
      // The backend's /users/me (or similar) endpoint would use the cookie to identify the user.
      // For now, we assume login/register gives us a basic user object with UID.
      // This function will be more robust if backend has a dedicated /me endpoint.
      
      // For the current flow, we primarily use this after login/register/MFA provides a UID.
      // If we have a user object (even basic) with UID, fetch their full profile.
      let profileToFetchUid: string | undefined = user?.uid;

      if (!profileToFetchUid) {
         // Attempt to get UID from token if no user object is set yet
         const token = Cookies.get(JWT_COOKIE_NAME);
         if (token) {
            // In a real app, you might have a /auth/me endpoint that returns user based on token
            // For now, we can't get UID from an HttpOnly cookie on client.
            // This part highlights a dependency on backend design or a different token strategy (e.g. non-HttpOnly for UID).
            // Assuming login/register flow will set a basic user object with UID.
            console.warn("Trying to fetch user info without UID, relying on cookie for backend to identify user.");
            // If you had a /auth/me endpoint:
            // const { data: meUser } = await Api.apiClient.get('/auth/me');
            // setUser(meUser); setLoading(false); return meUser;
            // Since we don't, and UID is needed for fetchUserProfile:
            setLoading(false);
            return null; // Or handle differently if backend /auth/me exists
         } else {
            setLoading(false);
            return null;
         }
      }
      
      const fetchedProfile = await Api.fetchUserProfile(profileToFetchUid);
      setUser(fetchedProfile);
      return fetchedProfile;
    } catch (err: any) {
      console.error("Error fetching current user info (real):", err);
      setError(err);
      setUser(null); // Clear user on error
      Cookies.remove(JWT_COOKIE_NAME); // Clear token cookie on error
      return null;
    } finally {
      setLoading(false);
    }
  }, [user?.uid]);


  // Initial auth check
  useEffect(() => {
    const token = Cookies.get(JWT_COOKIE_NAME);
    if (token) {
      // Token exists, try to fetch user profile.
      // `fetchCurrentUserInfo` will set user and loading states.
      // The navigation useEffect will then handle redirection based on fetched user.
      // We need a mechanism to get UID if only token is present. For now, this path is tricky.
      // This highlights the need for a /auth/me endpoint or initial user data post-login.
      // For simplicity, if token exists but no user, we assume login is needed or state is stale.
      // A robust app might try a /auth/me here.
      // For now, if user is not set, but token is, this means we might be in an inconsistent state
      // or relying on backend to redirect if token is invalid at protected route.
      // Let's assume if user is null but token exists, user needs to go through login to re-establish session state with UID.
      // This is a simplification. A real app might try a /me endpoint.
      if(!user){
        console.log("Token found, but no user in state. User might need to re-login or /auth/me needs to be called.");
        // Potentially call fetchCurrentUserInfo if it can work without UID (e.g. /auth/me)
        // For now, let the navigation logic handle it. If user is null, it will redirect to login.
         setLoading(false); // Stop loading as we can't fetch without UID here
      } else {
         fetchCurrentUserInfo(true);
      }
    } else {
      setUser(null);
      setIsMfaVerified(false);
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Runs once on mount


  // Navigation logic
 useEffect(() => {
    if (loading) return;

    const isAuthRoute = pathname.startsWith('/auth/');
    const isMfaPage = pathname === '/auth/mfa';
    const token = Cookies.get(JWT_COOKIE_NAME);

    if (user && token) { // User object exists and token is present
      if (!isMfaVerified) {
        if (!isMfaPage) {
          router.replace('/auth/mfa');
        }
      } else { // User logged in and MFA verified
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
    } else { // No user object or no token
      if (token && !user && !loading) {
        // Token exists but user object not loaded yet (e.g. after refresh)
        // Attempt to fetch user info. This should ideally be handled by an /auth/me endpoint on backend.
        // For now, this situation might lead to brief redirect to login if fetchCurrentUserInfo isn't triggered correctly.
        // This logic relies on fetchCurrentUserInfo being effective when only a token is present.
        // If not, it falls through to redirecting to login.
         // This path might be redundant if initial useEffect handles it, but kept for safety.
         console.log("Token exists, user object not yet loaded. Consider /auth/me or ensure initial fetch covers this.")
      } else if (!isAuthRoute && pathname !== '/') {
        router.replace('/auth/login');
      } else if (pathname === '/') {
        router.replace('/auth/login');
      }
    }
  }, [user, isMfaVerified, loading, pathname, router]);


  const login = useCallback(async (email: string, password?: string): Promise<AuthResponse | null> => {
    setLoading(true);
    setError(null);
    try {
      const response = await Api.loginUser(email, password); // Backend sets HttpOnly cookie
      // Assuming response.user contains basic info { uid, email, role, preferences? }
      setUser({ ...response.user, preferences: response.user.preferences || {} } as UserProfile); 
      setIsMfaVerified(false); // Always require MFA after login
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
      const response = await Api.registerUser(details); // Backend sets HttpOnly cookie
      setUser({ ...response.user, preferences: response.user.preferences || {} } as UserProfile);
      setIsMfaVerified(false); // Always require MFA after registration
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
    if (!user && !uid) { // uid might come from user state or passed if user state not yet full
        setError(new Error("User ID not available for MFA verification."));
        setLoading(false);
        return { success: false, message: "User ID not available." };
    }
    const targetUid = user?.uid || uid;

    try {
      const response = await Api.verifyMfa(targetUid, otp);
      if (response.success) {
        // Fetch full user profile again to ensure all data is up-to-date including preferences
        const fullUserProfile = await Api.fetchUserProfile(targetUid);
        setUser(fullUserProfile);
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
  }, [user, router, setIsMfaVerified]);

  const logout = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      await Api.logoutUser(); // Call backend logout if exists
    } catch (e) {
      console.warn("Error during backend logout:", e); // Log but continue client-side logout
    }
    Cookies.remove(JWT_COOKIE_NAME); // Remove client-accessible cookie if any (though HttpOnly is preferred)
    setUser(null);
    setIsMfaVerified(false);
    router.push('/auth/login');
    setLoading(false);
  }, [router, setIsMfaVerified]);

  const updateUserPreferencesInContext = useCallback((preferences: Partial<UserProfile['preferences']>) => {
    setUser(prevUser => {
        if (!prevUser) return null;
        const updatedUser = {
            ...prevUser,
            preferences: { ...(prevUser.preferences || {}), ...preferences },
        };
        // In real mode, this state update is temporary. Actual persistence is by ThemeProvider calling updateUserPreferences API.
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
    setUser,
    setIsMfaVerified,
    updateUserPreferencesInContext,
  }), [user, loading, error, isMfaVerified, login, register, verifyMfa, logout, fetchCurrentUserInfo, setIsMfaVerified, updateUserPreferencesInContext]);

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
}
