
'use client';

import axios from 'axios';
import type { UserProfile, Role } from '@/types';
import { 
    initialMockUsersData,
    previewAdminUserProfile, // Used if a specific user profile is needed and not found
} from '@/data/dummy-data';

// Ensure dummy data is mutable for mocks, or clone it if necessary.
// For this example, we'll operate on a mutable copy if operations modify it.
let currentMockUsers: UserProfile[] = JSON.parse(JSON.stringify(initialMockUsersData));

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// --- User Management ---
export const fetchUsers = async (): Promise<UserProfile[]> => {
  console.log('API Service: Mock fetchUsers called');
  // In a real app: const response = await apiClient.get('/users'); return response.data;
  return Promise.resolve([...currentMockUsers]); // Return a copy
};

export const addUser = async (userData: Omit<UserProfile, 'uid' | 'photoURL'> & { password?: string }): Promise<UserProfile> => {
  console.log('API Service: Mock addUser called with', userData);
  const newUser: UserProfile = {
    uid: `mock-api-${Date.now()}`,
    email: userData.email,
    displayName: userData.displayName,
    role: userData.role,
    photoURL: null, 
    phoneNumber: userData.phoneNumber || null,
    password: userData.password, // Storing password in mock, remove in real scenarios
  };
  currentMockUsers.unshift(newUser);
  return Promise.resolve(newUser);
};

export const updateUser = async (uid: string, userData: Partial<Omit<UserProfile, 'uid' | 'email'>>): Promise<UserProfile> => {
  console.log('API Service: Mock updateUser called for', uid, 'with', userData);
  const userIndex = currentMockUsers.findIndex(u => u.uid === uid);
  if (userIndex > -1) {
    currentMockUsers[userIndex] = { ...currentMockUsers[userIndex], ...userData };
    return Promise.resolve(currentMockUsers[userIndex]);
  }
  return Promise.reject(new Error('User not found for update'));
};

export const deleteUser = async (uid: string): Promise<void> => {
  console.log('API Service: Mock deleteUser called for', uid);
  const initialLength = currentMockUsers.length;
  currentMockUsers = currentMockUsers.filter(u => u.uid !== uid);
  if (currentMockUsers.length < initialLength) {
    return Promise.resolve();
  }
  return Promise.reject(new Error('User not found for deletion'));
};

// --- Profile Management ---
export const fetchUserProfile = async (uid: string): Promise<UserProfile | null> => {
    console.log('API Service: Mock fetchUserProfile called for', uid);
    const user = currentMockUsers.find(u => u.uid === uid);
    if (user) return Promise.resolve({...user}); // Return a copy
    // Fallback for preview or if user not in mock list, could return a generic profile or previewAdmin
    // For simplicity, if UID matches previewAdmin, return that.
    if (uid === previewAdminUserProfile.uid) return Promise.resolve({...previewAdminUserProfile});
    return Promise.resolve(null);
};

export const updateUserProfile = async (uid: string, profileData: { displayName?: string | null; photoURL?: string | null; phoneNumber?: string | null }): Promise<UserProfile> => {
  console.log('API Service: Mock updateUserProfile called for', uid, 'with', profileData);
  const userIndex = currentMockUsers.findIndex(u => u.uid === uid);
  if (userIndex > -1) {
    if(profileData.displayName !== undefined) currentMockUsers[userIndex].displayName = profileData.displayName;
    if(profileData.photoURL !== undefined) currentMockUsers[userIndex].photoURL = profileData.photoURL;
    if(profileData.phoneNumber !== undefined) currentMockUsers[userIndex].phoneNumber = profileData.phoneNumber;
    return Promise.resolve({...currentMockUsers[userIndex]}); // Return a copy
  }
  return Promise.reject(new Error('User not found for profile update'));
};

export const changeUserPassword = async (uid: string, currentPassword?: string, newPassword?: string): Promise<void> => {
  console.log('API Service: Mock changeUserPassword called for', uid);
  const user = currentMockUsers.find(u => u.uid === uid);
  if (!user) return Promise.reject(new Error('User not found.'));
  if (currentPassword && user.password && user.password !== currentPassword) {
      return Promise.reject(new Error('Incorrect current password.'));
  }
  if (!newPassword) return Promise.reject(new Error('New password not provided.'));
  // Simulate password update
  user.password = newPassword;
  return Promise.resolve();
};

// --- Authentication Mocks ---
// These functions would typically hit /auth/login, /auth/register on a real backend.
// For now, they manipulate the dummy user store directly or use existing dummy logic.
export const loginUser = async (email: string, password?: string): Promise<UserProfile> => {
    console.log('API Service: Mock loginUser');
    const user = currentMockUsers.find(u => u.email === email && u.password === password);
    if (user) return Promise.resolve({...user});
    return Promise.reject(new Error('Invalid credentials'));
};

export const registerUser = async (userData: Omit<UserProfile, 'uid' | 'photoURL'> & { password?: string }): Promise<UserProfile> => {
    console.log('API Service: Mock registerUser');
    if (currentMockUsers.some(u => u.email === userData.email)) {
        return Promise.reject(new Error('Email already exists'));
    }
    return addUser(userData); // Re-use the addUser logic
};


// Function to reset mock users to initial state for testing or specific scenarios
export const resetMockUsers = () => {
  currentMockUsers = JSON.parse(JSON.stringify(initialMockUsersData));
  console.log('API Service: Mock users reset to initial state.');
};

// To be called if initial users need to be loaded from localStorage for dummy mode,
// although AuthProvider now handles its own dummy user persistence.
// This could be used by other services if needed.
export const loadMockUsersFromStorage = (storageKey: string) => {
    if (typeof window !== 'undefined') {
        const storedUsers = localStorage.getItem(storageKey);
        if (storedUsers) {
            currentMockUsers = JSON.parse(storedUsers);
            console.log('API Service: Mock users loaded from localStorage.');
        }
    }
};


export default apiClient;
