
'use client';

import type { UserProfile, AuthResponse, MfaVerificationResponse, ThemeSettings } from '@/types';
import { projectConfig } from '@/config/project.config';
import * as MockApi from './api.mock';
import * as RealApi from './api.real';
import apiClient from './apiClient'; // Import the shared apiClient instance

// --- Authentication ---
export const loginUser = async (email: string, password?: string): Promise<AuthResponse> => {
  if (projectConfig.mockApiMode) {
    return MockApi._mockLoginUser(email, password);
  }
  return RealApi._realLoginUser(email, password);
};

export const registerUser = async (details: Omit<UserProfile, 'uid' | 'photoURL'> & { password?: string }): Promise<AuthResponse> => {
  if (projectConfig.mockApiMode) {
    return MockApi._mockRegisterUser(details);
  }
  return RealApi._realRegisterUser(details);
};

export const verifyMfa = async (uid: string, otp: string): Promise<MfaVerificationResponse> => {
   if (projectConfig.mockApiMode) {
    return MockApi._mockVerifyMfa(uid, otp);
  }
  return RealApi._realVerifyMfa(uid, otp);
};

export const forgotPassword = async (email: string): Promise<void> => {
  if (projectConfig.mockApiMode) {
    return MockApi._mockForgotPassword(email);
  }
  return RealApi._realForgotPassword(email);
};

export const changeUserPassword = async (uid: string, currentPassword?: string, newPassword?: string): Promise<void> => {
  if (projectConfig.mockApiMode) {
    return MockApi._mockChangeUserPassword(uid, currentPassword, newPassword);
  }
  return RealApi._realChangeUserPassword(uid, currentPassword, newPassword);
};

export const logoutUser = async (): Promise<void> => {
  if (projectConfig.mockApiMode) {
    return MockApi._mockLogoutUser();
  }
  return RealApi._realLogoutUser();
};


// --- User Profile & Preferences ---
export const fetchUserProfile = async (uid: string): Promise<UserProfile | null> => {
  if (projectConfig.mockApiMode) {
    return MockApi._mockFetchUserProfile(uid);
  }
  return RealApi._realFetchUserProfile(uid);
};

export const updateUserProfile = async (uid: string, profileData: Partial<Omit<UserProfile, 'uid' | 'email' | 'role' | 'preferences'>>): Promise<UserProfile> => {
  if (projectConfig.mockApiMode) {
    return MockApi._mockUpdateUserProfile(uid, profileData);
  }
  return RealApi._realUpdateUserProfile(uid, profileData);
};

export const updateUserPreferences = async (uid: string, preferences: Partial<ThemeSettings>): Promise<UserProfile> => {
  if (projectConfig.mockApiMode) {
    return MockApi._mockUpdateUserPreferences(uid, preferences);
  }
  return RealApi._realUpdateUserPreferences(uid, preferences);
};


// --- User Management (Admin) ---
export const fetchUsers = async (): Promise<UserProfile[]> => {
  if (projectConfig.mockApiMode) {
    return MockApi._mockFetchUsers();
  }
  return RealApi._realFetchUsers();
};

export const addUser = async (userData: Omit<UserProfile, 'uid' | 'photoURL'> & { password?: string }): Promise<UserProfile> => {
  if (projectConfig.mockApiMode) {
    return MockApi._mockAddUser(userData);
  }
  return RealApi._realAddUser(userData);
};

export const updateUser = async (uid: string, userData: Partial<Omit<UserProfile, 'uid' | 'email'>>): Promise<UserProfile> => {
  if (projectConfig.mockApiMode) {
    return MockApi._mockUpdateUser(uid, userData);
  }
  return RealApi._realUpdateUser(uid, userData);
};

export const deleteUser = async (uid: string): Promise<void> => {
  if (projectConfig.mockApiMode) {
    return MockApi._mockDeleteUser(uid);
  }
  return RealApi._realDeleteUser(uid);
};

export { apiClient }; // Export the configured axios instance
