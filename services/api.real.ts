
'use client';
import type { UserProfile, AuthResponse, MfaVerificationResponse, ThemeSettings } from '@/types';
import apiClient from './apiClient'; // Using the shared apiClient instance
import { initialMockUsersData, previewAdminUserProfile } from '@/data/dummy-data';

// --- Authentication ---
export const _realLoginUser = async (email: string, password?: string): Promise<AuthResponse> => {
  // Real API call: POST /auth/login
  // Expected backend response: { token: string, user: { uid: string, email: string, role: string, preferences?: ThemeSettings } }
  // The backend should set an HTTP-only cookie with the JWT.
  const response = await apiClient.post('/auth/login', { email, password });
  // The token is primarily handled by cookies, but can be returned for client-side awareness if needed.
  // The user object might be basic, with full profile fetched separately or included here.
  // return { token: response.data.token, user: response.data.user };
  return response.data; // Assuming response.data is AuthResponse compatible
};

export const _realRegisterUser = async (details: Omit<UserProfile, 'uid' | 'photoURL'> & { password?: string }): Promise<AuthResponse> => {
  // Real API call: POST /auth/register
  // Expected backend response: { token: string, user: { uid: string, email: string, role: string, preferences?: ThemeSettings } }
  // Backend sets HTTP-only cookie.
  const response = await apiClient.post('/auth/register', details);
  // return { token: response.data.token, user: response.data.user };
  return response.data;
};

export const _realVerifyMfa = async (uid: string, otp: string): Promise<MfaVerificationResponse> => {
  // Real API call: POST /auth/verify-mfa
  // Expected backend response: { success: boolean, user?: UserProfile (full or updated) }
  // May re-issue/confirm token or session.
  const response = await apiClient.post('/auth/verify-mfa', { userId: uid, token: otp }); // Assuming 'token' is OTP for backend
  // return { success: response.data.success, user: response.data.user };
  return response.data;
};

export const _realForgotPassword = async (email: string): Promise<void> => {
  // Real API call: POST /auth/forgot-password
  await apiClient.post('/auth/forgot-password', { email });
  // No specific response data expected, just 2xx status.
};

export const _realChangeUserPassword = async (uid: string, currentPassword?: string, newPassword?: string): Promise<void> => {
  // Real API call: POST /users/{uid}/change-password (or similar)
  // Requires authentication (JWT in cookie)
  await apiClient.post(`/users/${uid}/change-password`, { currentPassword, newPassword });
  // No specific response data expected.
};

export const _realLogoutUser = async (): Promise<void> => {
  // Real API call: POST /auth/logout (optional, if backend invalidates tokens)
  // This might not be strictly necessary if JWTs are stateless and short-lived,
  // and client-side simply clears the cookie/user state.
  try {
    await apiClient.post('/auth/logout');
  } catch (error) {
    console.warn("Logout API call failed (this might be expected if no backend logout endpoint):", error);
  }
  // Client-side will handle clearing local user state and cookies regardless.
};


// --- User Profile & Preferences ---
export const _realFetchUserProfile = async (uid: string): Promise<UserProfile | null> => {
  // Real API call: GET /users/{uid}/profile
  // Expected backend response: UserProfile object
  // For now, returning a mock user until the endpoint is ready.
  try {
    const response = await apiClient.get(`/users/${uid}/profile`);
    return response.data;
  } catch (error) {
    console.warn(`Real API: _realFetchUserProfile for ${uid} failed, returning mock data. Error:`, error);
    // Fallback to mock data if API call fails or not implemented
    const mockUser = initialMockUsersData.find(u => u.uid === uid) || (uid === previewAdminUserProfile.uid ? previewAdminUserProfile : null);
    if (mockUser) return Promise.resolve({ ...mockUser });
    return Promise.resolve(null);
  }
};

export const _realUpdateUserProfile = async (uid: string, profileData: Partial<Omit<UserProfile, 'uid' | 'email' | 'role' | 'preferences'>>): Promise<UserProfile> => {
  // Real API call: PUT /users/{uid}/profile
  // Expected backend response: Updated UserProfile object
  // For now, updating mock data and returning it.
  try {
    const response = await apiClient.put(`/users/${uid}/profile`, profileData);
    return response.data;
  } catch (error) {
     console.warn(`Real API: _realUpdateUserProfile for ${uid} failed, returning mock update. Error:`, error);
    const userIndex = initialMockUsersData.findIndex(u => u.uid === uid);
    if (userIndex > -1) {
      initialMockUsersData[userIndex] = { ...initialMockUsersData[userIndex], ...profileData } as UserProfile;
      return Promise.resolve({ ...initialMockUsersData[userIndex] });
    }
    return Promise.reject(new Error('User not found for profile update (mock fallback)'));
  }
};

export const _realUpdateUserPreferences = async (uid: string, preferences: Partial<ThemeSettings>): Promise<UserProfile> => {
  // Real API call: PUT /users/{uid}/preferences
  // Expected backend response: Updated UserProfile object (with new preferences)
  // For now, updating mock data and returning it.
  try {
    const response = await apiClient.put(`/users/${uid}/preferences`, preferences);
    return response.data;
  } catch (error) {
    console.warn(`Real API: _realUpdateUserPreferences for ${uid} failed, returning mock update. Error:`, error);
    const userIndex = initialMockUsersData.findIndex(u => u.uid === uid);
    if (userIndex > -1) {
      const currentUser = initialMockUsersData[userIndex];
      currentUser.preferences = { ...(currentUser.preferences || {}), ...preferences };
      return Promise.resolve({ ...currentUser });
    }
    return Promise.reject(new Error('User not found for preferences update (mock fallback)'));
  }
};


// --- User Management (Admin) ---
export const _realFetchUsers = async (): Promise<UserProfile[]> => {
  // Real API call: GET /users (admin only)
  // Expected backend response: Array of UserProfile objects
  // For now, returning mock data until the endpoint is ready.
  try {
    const response = await apiClient.get('/users');
    return response.data;
  } catch (error) {
    console.warn("Real API: _realFetchUsers failed, returning mock data. Error:", error);
    return Promise.resolve([...initialMockUsersData]);
  }
};

export const _realAddUser = async (userData: Omit<UserProfile, 'uid' | 'photoURL'> & { password?: string }): Promise<UserProfile> => {
  // Real API call: POST /users (admin only)
  // Expected backend response: Newly created UserProfile object
  // For now, adding to mock data and returning it.
   try {
    const response = await apiClient.post('/users', userData);
    return response.data;
  } catch (error) {
    console.warn("Real API: _realAddUser failed, adding to mock data. Error:", error);
    const newUser: UserProfile = {
      uid: `real-api-mock-${Date.now()}`, // Temporary UID for mock
      ...userData,
      photoURL: null, // Default photoURL
      preferences: {}, // Default preferences
    };
    initialMockUsersData.unshift(newUser); // Add to the start of the array for visibility
    return Promise.resolve(newUser);
  }
};

export const _realUpdateUser = async (uid: string, userData: Partial<Omit<UserProfile, 'uid' | 'email'>>): Promise<UserProfile> => {
  // Real API call: PUT /users/{uid} (admin only)
  // Expected backend response: Updated UserProfile object
  // For now, updating mock data and returning it.
  try {
    const response = await apiClient.put(`/users/${uid}`, userData);
    return response.data;
  } catch (error) {
    console.warn(`Real API: _realUpdateUser for ${uid} failed, returning mock update. Error:`, error);
    const userIndex = initialMockUsersData.findIndex(u => u.uid === uid);
    if (userIndex > -1) {
      initialMockUsersData[userIndex] = { ...initialMockUsersData[userIndex], ...userData } as UserProfile;
      return Promise.resolve({ ...initialMockUsersData[userIndex] });
    }
    return Promise.reject(new Error('User not found for update (mock fallback)'));
  }
};

export const _realDeleteUser = async (uid: string): Promise<void> => {
  // Real API call: DELETE /users/{uid} (admin only)
  // For now, removing from mock data.
  try {
    await apiClient.delete(`/users/${uid}`);
  } catch (error) {
    console.warn(`Real API: _realDeleteUser for ${uid} failed, attempting mock deletion. Error:`, error);
    const initialLength = initialMockUsersData.length;
    // Filter out the user to delete
    const updatedMockUsers = initialMockUsersData.filter(u => u.uid !== uid);
    if (updatedMockUsers.length < initialLength) {
      // This modification of initialMockUsersData is tricky due to module scope.
      // A better mock would involve a stateful class or service.
      // For now, this demonstrates intent but might not persist across calls as expected if module is re-cached.
      // A proper mock service would manage its own state.
      console.log(`Mock deleting user ${uid}. Current real data source (initialMockUsersData) may not reflect this globally if not managed statefully.`);
      return Promise.resolve();
    }
    return Promise.reject(new Error('User not found for deletion (mock fallback)'));
  }
};
