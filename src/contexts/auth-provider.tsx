
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
  setUser: Dispatch<SetStateAction<UserProfile | null>>; // This sets the "actual" internal user state
  // Dummy auth methods
  loginWithDummyCredentials?: (email: string, password?: string) => Promise<UserProfile | null>;
  registerDummyUser?: (details: Omit<UserProfile, 'uid'> & { password?: string }) => Promise<UserProfile | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [actualUser, setActualUser] = useState<UserProfile | null>(null); // Renamed to distinguish from context user
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
        setActualUser(loggedInDummyUser);
        setFirebaseUser({
          uid: loggedInDummyUser.uid,
          email: loggedInDummyUser.email,
          displayName: loggedInDummyUser.displayName,
          photoURL: loggedInDummyUser.photoURL,
          phoneNumber: loggedInDummyUser.phoneNumber,
          getIdTokenResult: async () => ({
            claims: { role: loggedInDummyUser.role }, // Reflects the actual role of the dummy user
            token: 'dummy-token',
          } as Partial<IdTokenResult> as IdTokenResult),
        } as FirebaseUser);
      } else {
        const previewAdminUser: UserProfile = {
          uid: 'preview-admin-default-000',
          email: 'preview@admin.genesis',
          displayName: 'Preview Admin',
          role: 'admin',
          photoURL: null,
          phoneNumber: null,
        };
        setActualUser(previewAdminUser);
        setFirebaseUser({ 
          uid: previewAdminUser.uid,
          email: previewAdminUser.email,
          displayName: previewAdminUser.displayName,
          photoURL: previewAdminUser.photoURL,
          phoneNumber: previewAdminUser.phoneNumber,
          getIdTokenResult: async () => ({
            claims: { role: previewAdminUser.role },
            token: 'dummy-preview-token',
          } as Partial<IdTokenResult> as IdTokenResult),
        } as FirebaseUser);
      }
      setLoading(false);
      return; 
    }

    const unsubscribe = onAuthStateChanged(
      auth,
      async (currentFirebaseUser) => {
        setFirebaseUser(currentFirebaseUser);
        if (currentFirebaseUser) {
          try {
            const userProfile = await fetchUserProfile(currentFirebaseUser);
            setActualUser(userProfile);
          } catch (e) {
            console.error("Error fetching user profile:", e);
            setError(e instanceof Error ? e : new Error('Failed to fetch profile'));
            setActualUser(null);
          }
        } else {
          setActualUser(null);
        }
        setLoading(false);
      },
      (err) => {
        console.error("Auth state change error:", err);
        setError(err);
        setActualUser(null);
        setFirebaseUser(null);
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, [configured]);
  
  // This derived user is what gets exposed via the context.
  // If not configured, it ensures the role is 'admin' for UI purposes.
  const contextUser = useMemo(() => {
    if (!configured && actualUser) {
      return { ...actualUser, role: 'admin' as Role };
    }
    return actualUser;
  }, [actualUser, configured]);

  useEffect(() => {
    if (!loading) { 
      const isAuthPage = pathname.startsWith('/login') || pathname.startsWith('/register') || pathname.startsWith('/mfa');
      // Use contextUser for redirection logic as this reflects the "effective" user for the UI
      if (contextUser && isAuthPage) {
        router.replace('/dashboard');
      } else if (!contextUser && !isAuthPage && pathname !== '/' && !pathname.startsWith('/api')) {
         // router.replace('/login'); // Commented out to allow access to pages when no user for preview
      }
    }
  }, [contextUser, loading, pathname, router]);

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

    if (foundUser && (!foundUser.password || foundUser.password === password)) { 
      setActualUser(foundUser); // Set the actual logged-in dummy user
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
      return foundUser; // Return the actual user profile
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
      role: details.role || rolesConfig.defaultRole, 
    };
    dummyUsers.push(newUser);
    saveDummyUsers(dummyUsers);
    
    setActualUser(newUser); // Set the actual registered dummy user
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
    return newUser; // Return the actual user profile
  };

  const dummyLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(CURRENT_DUMMY_USER_KEY);
    }
    // After dummy logout, set to preview admin
     const previewAdminUser: UserProfile = {
        uid: 'preview-admin-default-000',
        email: 'preview@admin.genesis',
        displayName: 'Preview Admin',
        role: 'admin',
        photoURL: null,
        phoneNumber: null,
      };
    setActualUser(previewAdminUser); // Set actual user to preview admin
    setFirebaseUser({
        uid: previewAdminUser.uid,
        email: previewAdminUser.email,
        displayName: previewAdminUser.displayName,
        getIdTokenResult: async () => ({ claims: { role: previewAdminUser.role }, token: 'dummy-preview-token' } as Partial<IdTokenResult> as IdTokenResult),
    } as FirebaseUser);
    router.push('/login'); 
  };

  const logout = async () => {
    setLoading(true);
    if (configured && auth) {
      try {
        await firebaseSignOut(auth);
        // onAuthStateChanged will set actualUser and firebaseUser to null
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
    user: contextUser, // This is the (potentially role-modified) user for consumers
    firebaseUser,
    loading,
    error,
    isConfigured: configured,
    logout,
    setUser: setActualUser, // Expose the setter for the "actual" user state
    ...(configured ? {} : { loginWithDummyCredentials, registerDummyUser })
  }), [contextUser, firebaseUser, loading, error, configured, logout, setActualUser]);

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
