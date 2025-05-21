
import type { Dispatch, SetStateAction } from 'react';
import { createContext, useContext } from 'react'; // Added useContext
import type { UserProfile, AuthResponse, MfaVerificationResponse, ThemeSettings } from '@/types';

export interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  error: Error | null;
  isMfaVerified: boolean;
  login: (email: string, password?: string) => Promise<AuthResponse | null>;
  register: (details: Omit<UserProfile, 'uid' | 'photoURL' | 'preferences'> & { password?: string }) => Promise<AuthResponse | null>;
  verifyMfa: (uid: string, otp: string) => Promise<MfaVerificationResponse>;
  logout: () => Promise<void>;
  fetchCurrentUserInfo: (tokenPresent?: boolean) => Promise<UserProfile | null>;
  setUser: Dispatch<SetStateAction<UserProfile | null>>;
  setIsMfaVerified: (verified: boolean) => void;
  updateUserPreferencesInContext: (preferences: Partial<ThemeSettings>) => void;
  updateCurrentLocalUser: (updatedProfile: Partial<UserProfile>) => void; // Added to update local state after profile edits
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
