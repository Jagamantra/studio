
'use client';

import type { ReactNode, Dispatch, SetStateAction } from 'react';
import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { onAuthStateChanged, signOut as firebaseSignOut, type User as FirebaseUser, type IdTokenResult } from 'firebase/auth';
import { auth, isFirebaseConfigured } from '@/lib/firebase';
import type { UserProfile, Role } from '@/types';
import { rolesConfig } from '@/config/roles.config';
import { useRouter, usePathname } from 'next/navigation';

// Simulate fetching detailed user profile (e.g., from Firestore)
async function fetchUserProfile(firebaseUser: FirebaseUser): Promise<UserProfile> {
  let role: Role = rolesConfig.defaultRole;
  try {
    const idTokenResult = await firebaseUser.getIdTokenResult();
    if (idTokenResult.claims.role && rolesConfig.roles.includes(idTokenResult.claims.role as Role)) {
      role = idTokenResult.claims.role as Role;
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
    role: role,
  };
}

const DUMMY_USERS_KEY = 'genesis_dummy_users';
const CURRENT_DUMMY_USER_KEY = 'genesis_current_dummy_user';


interface AuthContextType {
  user: UserProfile | null;
  firebaseUser: FirebaseUser | null; // Can be actual FirebaseUser or a mock
  loading: boolean;
  error: Error | null;
  isConfigured: boolean;
  logout: () => Promise<void>;
  setUser: Dispatch<SetStateAction<UserProfile | null>>;
  // Dummy auth methods
  loginWithDummyCredentials?: (email: string, password?: string) => Promise<UserProfile | null>;
  registerDummyUser?: (details: Omit<UserProfile, 'uid'> & { password?: string }) => Promise<UserProfile | null>;
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

  // Initialize dummy users if not configured and not present in localStorage
  useEffect(() => {
    if (typeof window !== 'undefined' && !configured) {
      if (!localStorage.getItem(DUMMY_USERS_KEY)) {
        const initialDummyUsers: UserProfile[] = [
          { uid: 'dummy-admin-001', email: 'admin@dummy.com', displayName: 'Dummy Admin', role: 'admin', photoURL: null, phoneNumber: null, password: 'password123' },
          { uid: 'dummy-user-002', email: 'user@dummy.com', displayName: 'Dummy User', role: 'user', photoURL: null, phoneNumber: null, password: 'password123' },
        ];
        localStorage.setItem(DUMMY_USERS_KEY, JSON.stringify(initialDummyUsers));
      }
    }
  }, [configured]);


  useEffect(() => {
    if (!configured) {
      setLoading(true);
      const storedUserJson = localStorage.getItem(CURRENT_DUMMY_USER_KEY);
      if (storedUserJson) {
        const loggedInDummyUser: UserProfile = JSON.parse(storedUserJson);
        setUser(loggedInDummyUser);
        setFirebaseUser({
          uid: loggedInDummyUser.uid,
          email: loggedInDummyUser.email,
          displayName: loggedInDummyUser.displayName,
          photoURL: loggedInDummyUser.photoURL,
          phoneNumber: loggedInDummyUser.phoneNumber,
          getIdTokenResult: async () => ({
            claims: { role: loggedInDummyUser.role },
            token: 'dummy-token',
          } as Partial<IdTokenResult> as IdTokenResult),
        } as FirebaseUser);
      } else {
        // If no dummy user is logged in, and Firebase is not configured,
        // default to a preview admin user for the AuthContext.
        // This ensures admin-specific sidebar links are visible by default for preview.
        const previewAdminUser: UserProfile = {
          uid: 'preview-admin-default-000',
          email: 'preview@admin.genesis',
          displayName: 'Preview Admin',
          role: 'admin', // Crucial for showing admin links
          photoURL: null,
          phoneNumber: null,
        };
        setUser(previewAdminUser);
        setFirebaseUser({ // Mock a FirebaseUser object for this preview admin
          uid: previewAdminUser.uid,
          email: previewAdminUser.email,
          displayName: previewAdminUser.displayName,
          photoURL: previewAdminUser.photoURL,
          phoneNumber: previewAdminUser.phoneNumber,
          // Mock getIdTokenResult to provide the admin role
          getIdTokenResult: async () => ({
            claims: { role: previewAdminUser.role },
            token: 'dummy-preview-token',
          } as Partial<IdTokenResult> as IdTokenResult),
        } as FirebaseUser);
      }
      setLoading(false);
      return; // Skip Firebase auth listener setup
    }

    // Firebase is configured, proceed with Firebase auth
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
            setUser(null);
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
    if (!loading) { // Only redirect after initial auth state is resolved
      const isAuthPage = pathname.startsWith('/login') || pathname.startsWith('/register') || pathname.startsWith('/mfa');
      if (user && isAuthPage) {
        router.replace('/dashboard');
      } else if (!user && !isAuthPage && pathname !== '/' && !pathname.startsWith('/api')) {
        // Allow access to homepage for unauthenticated users, redirect others to login
        // router.replace('/login');
      }
    }
  }, [user, loading, pathname, router]);

  const getDummyUsers = (): UserProfile[] => {
    if (typeof window === 'undefined') return [];
    const usersJson = localStorage.getItem(DUMMY_USERS_KEY);
    return usersJson ? JSON.parse(usersJson) : [];
  };

  const saveDummyUsers = (users: UserProfile[]) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(DUMMY_USERS_KEY, JSON.stringify(users));
    }
  };
  
  const loginWithDummyCredentials = async (email: string, password?: string): Promise<UserProfile | null> => {
    if (configured) {
      setError(new Error("Dummy login attempted while Firebase is configured."));
      return null;
    }
    setLoading(true);
    const dummyUsers = getDummyUsers();
    const foundUser = dummyUsers.find(u => u.email === email);

    if (foundUser && (!foundUser.password || foundUser.password === password)) { // Simple password check
      setUser(foundUser);
      setFirebaseUser({
        uid: foundUser.uid,
        email: foundUser.email,
        displayName: foundUser.displayName,
        getIdTokenResult: async () => ({ claims: { role: foundUser.role }, token: 'dummy-token' } as Partial<IdTokenResult> as IdTokenResult),
      } as FirebaseUser);
      if (typeof window !== 'undefined') {
        localStorage.setItem(CURRENT_DUMMY_USER_KEY, JSON.stringify(foundUser));
      }
      setError(null);
      setLoading(false);
      router.push('/dashboard');
      return foundUser;
    }
    setError(new Error("Invalid dummy credentials."));
    setLoading(false);
    return null;
  };

  const registerDummyUser = async (details: Omit<UserProfile, 'uid'> & { password?: string }): Promise<UserProfile | null> => {
    if (configured) {
       setError(new Error("Dummy registration attempted while Firebase is configured."));
      return null;
    }
    setLoading(true);
    let dummyUsers = getDummyUsers();
    if (dummyUsers.some(u => u.email === details.email)) {
      setError(new Error("Email already exists in dummy users."));
      setLoading(false);
      return null;
    }
    const newUser: UserProfile = {
      ...details,
      uid: `dummy-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      role: details.role || rolesConfig.defaultRole, // Ensure role is set
    };
    dummyUsers.push(newUser);
    saveDummyUsers(dummyUsers);
    
    setUser(newUser);
    setFirebaseUser({
      uid: newUser.uid,
      email: newUser.email,
      displayName: newUser.displayName,
      getIdTokenResult: async () => ({ claims: { role: newUser.role }, token: 'dummy-token' } as Partial<IdTokenResult> as IdTokenResult),
    } as FirebaseUser);
    if (typeof window !== 'undefined') {
      localStorage.setItem(CURRENT_DUMMY_USER_KEY, JSON.stringify(newUser));
    }
    setError(null);
    setLoading(false);
    router.push('/dashboard');
    return newUser;
  };

  const dummyLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(CURRENT_DUMMY_USER_KEY);
    }
    setUser(null);
    setFirebaseUser(null);
    // After dummy logout, set to preview admin to keep admin links visible
     const previewAdminUser: UserProfile = {
        uid: 'preview-admin-default-000',
        email: 'preview@admin.genesis',
        displayName: 'Preview Admin',
        role: 'admin',
        photoURL: null,
        phoneNumber: null,
      };
    setUser(previewAdminUser);
    setFirebaseUser({
        uid: previewAdminUser.uid,
        email: previewAdminUser.email,
        displayName: previewAdminUser.displayName,
        getIdTokenResult: async () => ({ claims: { role: previewAdminUser.role }, token: 'dummy-preview-token' } as Partial<IdTokenResult> as IdTokenResult),
    } as FirebaseUser);
    router.push('/login'); // Still redirect to login, but AuthContext retains preview admin
  };

  const logout = async () => {
    setLoading(true);
    if (configured && auth) {
      try {
        await firebaseSignOut(auth);
        // setUser and setFirebaseUser will be updated by onAuthStateChanged which sets user to null
        // Then, for the sidebar to show admin links after logout (in unconfigured mode),
        // we might want to explicitly set a preview admin if !configured after signout.
        // However, onAuthStateChanged will set user to null.
        // The logic in the main useEffect handles the !configured case.
      } catch (e) {
        console.error("Firebase Logout error:", e);
        setError(e instanceof Error ? e : new Error('Failed to logout from Firebase'));
      }
    } else if (!configured) {
      dummyLogout();
    }
    setLoading(false);
  };


  const contextValue = useMemo(() => ({
    user,
    firebaseUser,
    loading,
    error,
    isConfigured: configured,
    logout,
    setUser,
    ...(configured ? {} : { loginWithDummyCredentials, registerDummyUser })
  }), [user, firebaseUser, loading, error, configured, logout]); // Removed setUser from deps as it's stable

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

