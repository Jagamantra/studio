
'use client';
import type { UserProfile, AuthResponse, MfaVerificationResponse, ThemeSettings, LoginSuccessResponse, MfaSentResponse } from '@/types';
import apiClient from './apiClient'; 
import { initialDummyUsersForAuth, previewAdminUserProfile } from '@/data/dummy-data'; // For placeholder data

// Placeholder for user data that would normally come from a /users/me or similar endpoint
let DUMMY_USERS_DB = [...initialDummyUsersForAuth];
if (typeof window !== 'undefined') {
    const storedUsers = localStorage.getItem('genesis_dummy_users_placeholder_for_api_ts');
    if (storedUsers) {
        DUMMY_USERS_DB = JSON.parse(storedUsers);
    } else {
        localStorage.setItem('genesis_dummy_users_placeholder_for_api_ts', JSON.stringify(DUMMY_USERS_DB));
    }
}
const saveDummyUsers = () => {
    if (typeof window !== 'undefined') {
        localStorage.setItem('genesis_dummy_users_placeholder_for_api_ts', JSON.stringify(DUMMY_USERS_DB));
    }
};


// --- Authentication ---
export const registerUser = async (details: { email: string, password?: string }): Promise<MfaSentResponse> => {
  // Real API call: POST /auth/register
  // Request body: { email, password }
  // Expected backend response: { codeSent: true, message: "Registration successful. MFA code sent to user@example.com" }
  console.log("Attempting real API registration for:", details.email);
  const response = await apiClient.post<MfaSentResponse>('/auth/register', details);
  return response.data;
};

export const loginUser = async (email: string, password?: string): Promise<MfaSentResponse> => {
  // Real API call: POST /auth/login
  // Request body: { email, password }
  // Expected backend response: { codeSent: true, message: "MFA code sent to user@example.com" }
  console.log("Attempting real API login for:", email);
  const response = await apiClient.post<MfaSentResponse>('/auth/login', { email, password });
  return response.data;
};

export const verifyMfa = async (email: string, mfaCode: string): Promise<LoginSuccessResponse> => {
  // Real API call: POST /auth/verify-mfa
  // Request body: { email, mfaCode }
  // Expected backend response: { accessToken: "jwt_token", email: "user@example.com", role: "user", expiresIn: 3600, uid: "user-id-from-backend" }
  // The backend should set an HTTP-only cookie with the JWT.
  console.log("Attempting real API MFA verification for:", email);
  const response = await apiClient.post<LoginSuccessResponse>('/auth/verify-mfa', { email, mfaCode });
  // The accessToken is in the response, but we primarily rely on the HttpOnly cookie set by the backend for session management.
  // The user details (email, role, uid) from the response are used to populate the client-side user state.
  return response.data; 
};

export const forgotPassword = async (email: string): Promise<void> => {
  // Real API call: POST /auth/forgot-password (if endpoint exists)
  // For now, this will be a no-op or log a message if no real endpoint.
  console.warn("Real API: forgotPassword called. Assuming backend handles this. No specific client action after POST if successful.");
  // Example: await apiClient.post('/auth/forgot-password', { email });
  await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
  return Promise.resolve();
};

export const changeUserPassword = async (uid: string, currentPassword?: string, newPassword?: string): Promise<void> => {
  // Real API call: POST /users/change-password (or similar, using uid implicitly from token)
  // Request body: { currentPassword, newPassword }
  console.warn("Real API: changeUserPassword called. Assuming backend handles this.");
  // Example: await apiClient.post(`/users/password`, { currentPassword, newPassword });
  // This uses dummy data for now if your backend endpoint is not ready.
  const user = DUMMY_USERS_DB.find(u => u.uid === uid);
  if (user && user.password === currentPassword) {
      user.password = newPassword;
      saveDummyUsers();
      return Promise.resolve();
  }
  return Promise.reject(new Error("Password change failed (using dummy data logic)."));
};

export const logoutUser = async (): Promise<void> => {
  // Real API call: POST /auth/logout (if backend supports session invalidation)
  try {
    await apiClient.post('/auth/logout');
    console.log("Real API: Logout successful on backend.");
  } catch (error) {
    console.warn("Real API: Logout API call failed or not implemented, proceeding with client-side clear.", error);
  }
  // Client-side will also clear its state and cookies.
};


// --- User Profile & Preferences ---
// IMPORTANT: These functions currently use DUMMY DATA. Replace with real API calls.
export const fetchUserProfile = async (uid: string): Promise<UserProfile | null> => {
  console.warn(`API: fetchUserProfile for UID ${uid} is using DUMMY DATA.`);
  // In a real app, this would be:
  // const response = await apiClient.get(`/users/${uid}/profile`);
  // return response.data;
  // For now, using dummy data:
  const user = DUMMY_USERS_DB.find(u => u.uid === uid);
  if (user) return Promise.resolve({ ...user });

  // Fallback for previewAdminUserProfile if specific UID matches, useful for dev
  if (uid === previewAdminUserProfile.uid) return Promise.resolve({ ...previewAdminUserProfile });
  
  return Promise.resolve(null);
};

export const updateUserProfile = async (uid: string, profileData: Partial<Omit<UserProfile, 'uid' | 'email' | 'role' | 'preferences' | 'password'>>): Promise<UserProfile> => {
  console.warn(`API: updateUserProfile for UID ${uid} is using DUMMY DATA.`);
  // In a real app, this would be:
  // const response = await apiClient.put(`/users/${uid}/profile`, profileData);
  // return response.data;
  // For now, using dummy data:
  const userIndex = DUMMY_USERS_DB.findIndex(u => u.uid === uid);
  if (userIndex > -1) {
    DUMMY_USERS_DB[userIndex] = { ...DUMMY_USERS_DB[userIndex], ...profileData };
    saveDummyUsers();
    return Promise.resolve({ ...DUMMY_USERS_DB[userIndex] });
  }
  return Promise.reject(new Error('User not found for profile update (dummy data).'));
};

export const updateUserPreferences = async (uid: string, preferences: Partial<ThemeSettings>): Promise<UserProfile> => {
  console.warn(`API: updateUserPreferences for UID ${uid} is using DUMMY DATA.`);
  // In a real app, this would be:
  // const response = await apiClient.put(`/users/${uid}/preferences`, preferences);
  // return response.data;
  // For now, using dummy data:
  const userIndex = DUMMY_USERS_DB.findIndex(u => u.uid === uid);
  if (userIndex > -1) {
    const currentUser = DUMMY_USERS_DB[userIndex];
    currentUser.preferences = { ...(currentUser.preferences || {}), ...preferences };
    saveDummyUsers();
    return Promise.resolve({ ...currentUser });
  }
  return Promise.reject(new Error('User not found for preferences update (dummy data).'));
};


// --- User Management (Admin) ---
// IMPORTANT: These functions currently use DUMMY DATA. Replace with real API calls.
export const fetchUsers = async (): Promise<UserProfile[]> => {
  console.warn("API: fetchUsers is using DUMMY DATA.");
  // In a real app: await apiClient.get('/users');
  return Promise.resolve([...DUMMY_USERS_DB]);
};

export const addUser = async (userData: Omit<UserProfile, 'uid' | 'photoURL' | 'preferences'> & { password?: string }): Promise<UserProfile> => {
  console.warn("API: addUser is using DUMMY DATA.");
  // In a real app: await apiClient.post('/users', userData);
  const newUser: UserProfile = {
    uid: `dummy-admin-added-${Date.now()}`,
    ...userData,
    photoURL: null,
    preferences: {},
  };
  DUMMY_USERS_DB.unshift(newUser);
  saveDummyUsers();
  return Promise.resolve(newUser);
};

export const updateUser = async (uid: string, userData: Partial<Omit<UserProfile, 'uid' | 'email' | 'password'>>): Promise<UserProfile> => {
  console.warn(`API: updateUser for UID ${uid} is using DUMMY DATA.`);
  // In a real app: await apiClient.put(`/users/${uid}`, userData);
  const userIndex = DUMMY_USERS_DB.findIndex(u => u.uid === uid);
  if (userIndex > -1) {
    DUMMY_USERS_DB[userIndex] = { ...DUMMY_USERS_DB[userIndex], ...userData };
    saveDummyUsers();
    return Promise.resolve({ ...DUMMY_USERS_DB[userIndex] });
  }
  return Promise.reject(new Error('User not found for update (dummy data).'));
};

export const deleteUser = async (uid: string): Promise<void> => {
  console.warn(`API: deleteUser for UID ${uid} is using DUMMY DATA.`);
  // In a real app: await apiClient.delete(`/users/${uid}`);
  const initialLength = DUMMY_USERS_DB.length;
  DUMMY_USERS_DB = DUMMY_USERS_DB.filter(u => u.uid !== uid);
  if (DUMMY_USERS_DB.length < initialLength) {
    saveDummyUsers();
    return Promise.resolve();
  }
  return Promise.reject(new Error('User not found for deletion (dummy data).'));
};

export { apiClient };
