
import type { Dispatch, SetStateAction } from 'react';
import { createContext } from 'react';
import type { UserProfile, AuthResponse, MfaVerificationResponse } from '@/types';

export interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  error: Error | null;
  isMfaVerified: boolean;
  login: (email: string, password?: string) => Promise<AuthResponse | null>;
  register: (details: Omit<UserProfile, 'uid' | 'photoURL'> & { password?: string }) => Promise<AuthResponse | null>;
  verifyMfa: (uid: string, otp: string) => Promise<MfaVerificationResponse>;
  logout: () => Promise<void>;
  fetchCurrentUserInfo: () => Promise<UserProfile | null>; // Used to refresh/get full profile
  setUser: Dispatch<SetStateAction<UserProfile | null>>; // For direct state manipulation if needed by provider
  setIsMfaVerified: (verified: boolean) => void;
  updateUserPreferencesInContext: (preferences: Partial<UserProfile['preferences']>) => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);
