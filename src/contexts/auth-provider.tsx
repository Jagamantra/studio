
'use client';

import type { ReactNode, Dispatch, SetStateAction } from 'react';
import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { onAuthStateChanged, signOut as firebaseSignOut, type User as FirebaseUser } from 'firebase/auth';
import { auth, isFirebaseConfigured } from '@/lib/firebase';
import type { UserProfile, Role } from '@/types';
import { rolesConfig } from '@/config/roles.config';
import { useRouter, usePathname } from 'next/navigation';

// Simulate fetching detailed user profile (e.g., from Firestore)
async function fetchUserProfile(firebaseUser: FirebaseUser): Promise<UserProfile> {
  // In a real app, fetch from your database (e.g., Firestore)
  // For this template, we'll create a mock profile
  // You'd typically have a 'users' collection where user.uid maps to their profile data including role
  
  // Placeholder: fetch role from custom claims or Firestore
  let role: Role = rolesConfig.defaultRole; // Default role
  try {
    const idTokenResult = await firebaseUser.getIdTokenResult();
    if (idTokenResult.claims.role && rolesConfig.roles.includes(idTokenResult.claims.role as Role)) {
      role = idTokenResult.claims.role as Role;
    } else {
      // If no custom claim, check Firestore or default
      // console.warn(`User ${firebaseUser.uid} has no role claim or invalid role, defaulting to '${rolesConfig.defaultRole}'. Consider setting custom claims for roles.`);
    }
  } catch (error) {
    console.error("Error fetching ID token result for role:", error);
  }


  return {
    uid: firebaseUser.uid,
    email: firebaseUser.email,
    displayName: firebaseUser.displayName,
    photoURL: firebaseUser.photoURL,
    phoneNumber: firebaseUser.phoneNumber,
    role: role, // This should come from your DB or custom claims
  };
}


interface AuthContextType {
  user: UserProfile | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  error: Error | null;
  isConfigured: boolean;
  logout: () => Promise<void>;
  setUser: Dispatch<SetStateAction<UserProfile | null>>; // To allow manual updates, e.g. after profile edit
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  const configured = isFirebaseConfigured();

  useEffect(() => {
    if (!configured) {
      setLoading(false);
      console.warn("Firebase is not configured. Auth features will be disabled.");
      // Redirect to a setup page or show a global banner if critical
      return;
    }

    const unsubscribe = onAuthStateChanged(
      auth,
      async (currentFirebaseUser) => {
        setFirebaseUser(currentFirebaseUser);
        if (currentFirebaseUser) {
          try {
            const userProfile = await fetchUserProfile(currentFirebaseUser);
            setUser(userProfile);
          } catch (e) {
            console.error("Error fetching user profile:", e);
            setError(e instanceof Error ? e : new Error('Failed to fetch profile'));
            setUser(null); // Ensure user is null on error
          }
        } else {
          setUser(null);
        }
        setLoading(false);
      },
      (err) => {
        console.error("Auth state change error:", err);
        setError(err);
        setUser(null);
        setFirebaseUser(null);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [configured]);

  useEffect(() => {
    if (!loading && configured) {
      const isAuthPage = pathname.startsWith('/login') || pathname.startsWith('/register') || pathname.startsWith('/mfa');
      if (user && isAuthPage) {
        router.replace('/dashboard');
      } else if (!user && !isAuthPage && !pathname.startsWith('/api')) { // don't redirect api routes
         // Allow access to root page for initial redirect logic
        if (pathname !== '/') {
          router.replace('/login');
        }
      }
    }
  }, [user, loading, pathname, router, configured]);


  const logout = async () => {
    if (!configured) return;
    setLoading(true);
    try {
      await firebaseSignOut(auth);
      setUser(null);
      setFirebaseUser(null);
      router.push('/login'); // Redirect to login after logout
    } catch (e) {
      console.error("Logout error:", e);
      setError(e instanceof Error ? e : new Error('Failed to logout'));
    } finally {
      setLoading(false);
    }
  };

  const contextValue = useMemo(() => ({
    user,
    firebaseUser,
    loading,
    error,
    isConfigured: configured,
    logout,
    setUser,
  }), [user, firebaseUser, loading, error, configured, logout]);

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
