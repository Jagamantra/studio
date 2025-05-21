
'use client';
import type { UserProfile, AuthResponse, MfaVerificationResponse, ThemeSettings } from '@/types';
import { 
    DUMMY_USERS_STORAGE_KEY,
    initialDummyUsersForAuth, // Renamed from initialMockUsersData to avoid confusion
} from '@/data/dummy-data';
import { rolesConfig } from '@/config/roles.config';

let mockUsers: UserProfile[] = [];

const getMockUsersFromStorage = (): UserProfile[] => {
  if (typeof window === 'undefined') return [...initialDummyUsersForAuth];
  const usersJson = localStorage.getItem(DUMMY_USERS_STORAGE_KEY);
  try {
    const parsedUsers = usersJson ? JSON.parse(usersJson) : initialDummyUsersForAuth;
    return Array.isArray(parsedUsers) ? parsedUsers : [...initialDummyUsersForAuth];
  } catch (e) {
    return [...initialDummyUsersForAuth];
  }
};

const saveMockUsersToStorage = (users: UserProfile[]) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(DUMMY_USERS_STORAGE_KEY, JSON.stringify(users));
  }
};

// Initialize mockUsers on load
if (typeof window !== 'undefined') {
  mockUsers = getMockUsersFromStorage();
  if (mockUsers.length === 0) { // First time load potentially
      mockUsers = [...initialDummyUsersForAuth];
      saveMockUsersToStorage(mockUsers);
  }
}


// --- Authentication ---
export const _mockLoginUser = async (email: string, password?: string): Promise<AuthResponse> => {
  mockUsers = getMockUsersFromStorage();
  const user = mockUsers.find(u => u.email === email && u.password === password);
  if (user) {
    // Simulate token generation and basic user info for AuthResponse
    return Promise.resolve({ 
        token: `mock-jwt-token-${user.uid}`, 
        user: { uid: user.uid, email: user.email, role: user.role, preferences: user.preferences || {} } 
    });
  }
  return Promise.reject(new Error('Invalid mock credentials.'));
};

export const _mockRegisterUser = async (details: Omit<UserProfile, 'uid' | 'photoURL'> & { password?: string }): Promise<AuthResponse> => {
  mockUsers = getMockUsersFromStorage();
  if (mockUsers.some(u => u.email === details.email)) {
    return Promise.reject(new Error('Mock: Email already exists'));
  }
  const newUser: UserProfile = {
    uid: `mock-user-${Date.now()}`,
    email: details.email,
    displayName: details.displayName,
    role: details.role || rolesConfig.defaultRole,
    photoURL: null,
    phoneNumber: details.phoneNumber || null,
    password: details.password,
    preferences: {}, // Default empty preferences
  };
  mockUsers.push(newUser);
  saveMockUsersToStorage(mockUsers);
  return Promise.resolve({
    token: `mock-jwt-token-${newUser.uid}`,
    user: { uid: newUser.uid, email: newUser.email, role: newUser.role, preferences: newUser.preferences }
  });
};

export const _mockVerifyMfa = async (uid: string, otp: string): Promise<MfaVerificationResponse> => {
  // In a real scenario, OTP would be validated. Here, we just check if it's the mock OTP.
  // The mock OTP is generated and shown on the MFA page itself for testing.
  // This function assumes the calling context (MFA page) handles mock OTP comparison.
  // For this mock, we'll just return success if a user exists.
  mockUsers = getMockUsersFromStorage();
  const user = mockUsers.find(u => u.uid === uid);
  if (user) {
      // A more complete mock might check otp against a stored/generated value
      console.log(`Mock MFA verification for UID: ${uid} with OTP: ${otp} (assuming valid for mock)`);
      return Promise.resolve({ success: true, user });
  }
  return Promise.resolve({ success: false, message: "Mock: User not found for MFA." });
};

export const _mockForgotPassword = async (email: string): Promise<void> => {
  mockUsers = getMockUsersFromStorage();
  const userExists = mockUsers.some(u => u.email === email);
  if (userExists) {
    console.log(`Mock: Password reset email sent to ${email}.`);
  } else {
    console.log(`Mock: User with email ${email} not found, but pretending to send email.`);
  }
  await new Promise(resolve => setTimeout(resolve, 700)); // Simulate network delay
  return Promise.resolve();
};

export const _mockChangeUserPassword = async (uid: string, currentPassword?: string, newPassword?: string): Promise<void> => {
  mockUsers = getMockUsersFromStorage();
  const userIndex = mockUsers.findIndex(u => u.uid === uid);
  if (userIndex === -1) return Promise.reject(new Error('Mock: User not found.'));
  if (mockUsers[userIndex].password && mockUsers[userIndex].password !== currentPassword) {
    return Promise.reject(new Error('Mock: Incorrect current password.'));
  }
  if (!newPassword) return Promise.reject(new Error('Mock: New password not provided.'));
  
  mockUsers[userIndex].password = newPassword;
  saveMockUsersToStorage(mockUsers);
  return Promise.resolve();
};

export const _mockLogoutUser = async (): Promise<void> => {
  console.log("Mock logout successful.");
  return Promise.resolve();
};

// --- User Profile & Preferences ---
export const _mockFetchUserProfile = async (uid: string): Promise<UserProfile | null> => {
  mockUsers = getMockUsersFromStorage();
  const user = mockUsers.find(u => u.uid === uid);
  return Promise.resolve(user ? { ...user } : null);
};

export const _mockUpdateUserProfile = async (uid: string, profileData: Partial<Omit<UserProfile, 'uid' | 'email' | 'role' | 'preferences'>>): Promise<UserProfile> => {
  mockUsers = getMockUsersFromStorage();
  const userIndex = mockUsers.findIndex(u => u.uid === uid);
  if (userIndex > -1) {
    mockUsers[userIndex] = { ...mockUsers[userIndex], ...profileData } as UserProfile;
    saveMockUsersToStorage(mockUsers);
    return Promise.resolve({ ...mockUsers[userIndex] });
  }
  return Promise.reject(new Error('Mock: User not found for profile update'));
};

export const _mockUpdateUserPreferences = async (uid: string, preferences: Partial<ThemeSettings>): Promise<UserProfile> => {
  mockUsers = getMockUsersFromStorage();
  const userIndex = mockUsers.findIndex(u => u.uid === uid);
  if (userIndex > -1) {
    const currentUser = mockUsers[userIndex];
    currentUser.preferences = { ...(currentUser.preferences || {}), ...preferences };
    saveMockUsersToStorage(mockUsers);
    return Promise.resolve({ ...currentUser });
  }
  return Promise.reject(new Error('Mock: User not found for preferences update'));
};

// --- User Management (Admin) ---
export const _mockFetchUsers = async (): Promise<UserProfile[]> => {
  mockUsers = getMockUsersFromStorage();
  return Promise.resolve([...mockUsers]);
};

export const _mockAddUser = async (userData: Omit<UserProfile, 'uid' | 'photoURL'> & { password?: string }): Promise<UserProfile> => {
  mockUsers = getMockUsersFromStorage();
  if (mockUsers.some(u => u.email === userData.email)) {
    return Promise.reject(new Error('Mock: Email already exists for new user.'));
  }
  const newUser: UserProfile = {
    uid: `mock-admin-added-${Date.now()}`,
    email: userData.email,
    displayName: userData.displayName,
    role: userData.role,
    photoURL: null,
    phoneNumber: userData.phoneNumber || null,
    password: userData.password,
    preferences: {},
  };
  mockUsers.unshift(newUser);
  saveMockUsersToStorage(mockUsers);
  return Promise.resolve(newUser);
};

export const _mockUpdateUser = async (uid: string, userData: Partial<Omit<UserProfile, 'uid' | 'email'>>): Promise<UserProfile> => {
  mockUsers = getMockUsersFromStorage();
  const userIndex = mockUsers.findIndex(u => u.uid === uid);
  if (userIndex > -1) {
    mockUsers[userIndex] = { ...mockUsers[userIndex], ...userData } as UserProfile;
    saveMockUsersToStorage(mockUsers);
    return Promise.resolve({ ...mockUsers[userIndex] });
  }
  return Promise.reject(new Error('Mock: User not found for update by admin'));
};

export const _mockDeleteUser = async (uid: string): Promise<void> => {
  mockUsers = getMockUsersFromStorage();
  const initialLength = mockUsers.length;
  mockUsers = mockUsers.filter(u => u.uid !== uid);
  if (mockUsers.length < initialLength) {
    saveMockUsersToStorage(mockUsers);
    return Promise.resolve();
  }
  return Promise.reject(new Error('Mock: User not found for deletion by admin'));
};

// Utility to reset mock users to initial state (e.g., for testing)
export const resetMockUserStorage = () => {
  mockUsers = [...initialDummyUsersForAuth];
  saveMockUsersToStorage(mockUsers);
  console.log('Mock user storage reset to initial state.');
};
