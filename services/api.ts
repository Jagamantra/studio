
'use client';
import type { UserProfile, LoginSuccessResponse, MfaSentResponse, ThemeSettings } from '@/types';
import apiClient from './apiClient'; 
import { initialDummyUsersForAuth, previewAdminUserProfile } from '@/data/dummy-data'; 

// In-memory store for dummy users, initialized from localStorage or defaults
let DUMMY_USERS_DB: UserProfile[] = [];

if (typeof window !== 'undefined') {
    const storedUsers = localStorage.getItem('genesis_dummy_users_db_for_api_ts');
    if (storedUsers) {
        try {
            DUMMY_USERS_DB = JSON.parse(storedUsers);
        } catch (e) {
            console.error("Error parsing dummy users from localStorage:", e);
            DUMMY_USERS_DB = [...initialDummyUsersForAuth]; // Fallback to initial
        }
    } else {
        DUMMY_USERS_DB = [...initialDummyUsersForAuth];
    }
    // Ensure the storage is updated if it was just initialized
    localStorage.setItem('genesis_dummy_users_db_for_api_ts', JSON.stringify(DUMMY_USERS_DB));
}

const saveDummyUsers = () => {
    if (typeof window !== 'undefined') {
        localStorage.setItem('genesis_dummy_users_db_for_api_ts', JSON.stringify(DUMMY_USERS_DB));
    }
};


// --- Authentication (Real API Calls) ---
export const registerUser = async (details: { email: string, password?: string, displayName?: string }): Promise<MfaSentResponse> => {
  console.log("API: Attempting real API registration for:", details.email);
  const response = await apiClient.post<MfaSentResponse>('/auth/register', details);
  return response.data;
};

export const loginUser = async (email: string, password?: string): Promise<MfaSentResponse> => {
  console.log("API: Attempting real API login for:", email);
  const response = await apiClient.post<MfaSentResponse>('/auth/login', { email, password });
  return response.data;
};

export const verifyMfa = async (email: string, mfaCode: string): Promise<LoginSuccessResponse> => {
  console.log("API: Attempting real API MFA verification for:", email);
  const response = await apiClient.post<LoginSuccessResponse>('/auth/verify-mfa', { email, mfaCode });
  return response.data; 
};

export const logoutUser = async (): Promise<void> => {
  try {
    await apiClient.post('/auth/logout');
    console.log("API: Logout successful on backend.");
  } catch (error) {
    console.warn("API: Logout API call failed or not implemented, proceeding with client-side clear.", error);
  }
};

// --- User Profile & Preferences (Dummy Data for now post-auth) ---
export const fetchUserProfile = async (uid: string, email?: string, role?: UserProfile['role']): Promise<UserProfile | null> => {
  console.log(`API (Dummy): fetchUserProfile for UID ${uid}`);
  let user = DUMMY_USERS_DB.find(u => u.uid === uid);

  if (!user && uid && email && role) {
    // If user not found by UID but we have details (e.g. from token after real auth), create a placeholder
    console.log(`API (Dummy): User ${uid} not found. Creating placeholder with email ${email} and role ${role}.`);
    user = {
      uid,
      email,
      role,
      displayName: email, // Default display name
      photoURL: null,
      phoneNumber: null,
      preferences: {}, // Default empty preferences
      password: 'someDefaultPasswordIfNotSetByAuth', // Placeholder, real password handled by auth
    };
    DUMMY_USERS_DB.push(user);
    saveDummyUsers();
  } else if (!user && uid === previewAdminUserProfile.uid) { // Special case for preview admin
    user = { ...previewAdminUserProfile };
    // Optionally add/update previewAdminUserProfile in DUMMY_USERS_DB if not present
    const existingPreviewAdmin = DUMMY_USERS_DB.find(u => u.uid === previewAdminUserProfile.uid);
    if (!existingPreviewAdmin) {
        DUMMY_USERS_DB.push(user);
        saveDummyUsers();
    }
  }
  
  return Promise.resolve(user ? { ...user } : null);
};

export const updateUserProfile = async (uid: string, profileData: Partial<Omit<UserProfile, 'uid' | 'email' | 'role' | 'preferences' | 'password'>>): Promise<UserProfile> => {
  console.log(`API (Dummy): updateUserProfile for UID ${uid}`);
  const userIndex = DUMMY_USERS_DB.findIndex(u => u.uid === uid);
  if (userIndex > -1) {
    DUMMY_USERS_DB[userIndex] = { ...DUMMY_USERS_DB[userIndex], ...profileData };
    saveDummyUsers();
    return Promise.resolve({ ...DUMMY_USERS_DB[userIndex] });
  }
  console.warn(`API (Dummy): User not found for profile update (UID: ${uid}). No update performed.`);
  return Promise.reject(new Error('User not found for profile update (dummy data).'));
};

export const updateUserPreferences = async (uid: string, preferences: Partial<ThemeSettings>): Promise<UserProfile> => {
  console.log(`API (Dummy): updateUserPreferences for UID ${uid}`);
  let userIndex = DUMMY_USERS_DB.findIndex(u => u.uid === uid);

  if (userIndex === -1) {
    // If user not found, attempt to find by email if it's the preview admin (special case during dev)
    // Or, more generally, if a UID from a real token doesn't exist in dummy DB, create a placeholder
    // This part is tricky if the UID is completely new and we don't have email/role context here.
    // For now, we'll log a warning. The robust creation should happen in fetchUserProfile.
    console.warn(`API (Dummy): User with UID ${uid} not found when trying to update preferences. Attempting to ensure user exists or create placeholder.`);
    // Try to fetch/create based on current user context if possible, but this function doesn't have it.
    // This indicates a potential sync issue or that `fetchUserProfile` didn't create the placeholder.
    // For now, let's try to create a basic shell if not found, assuming `uid` is valid.
    const placeholderUser: UserProfile = {
        uid,
        email: `${uid}@placeholder.com`, // Dummy email
        role: 'user', // Default role
        displayName: `User ${uid}`,
        photoURL: null,
        phoneNumber: null,
        preferences: {},
    };
    DUMMY_USERS_DB.push(placeholderUser);
    saveDummyUsers();
    userIndex = DUMMY_USERS_DB.length -1; // Point to the newly added user
  }

  const currentUser = DUMMY_USERS_DB[userIndex];
  currentUser.preferences = { ...(currentUser.preferences || {}), ...preferences };
  saveDummyUsers();
  return Promise.resolve({ ...currentUser });
};


// --- User Management (Admin - Dummy Data) ---
export const fetchUsers = async (): Promise<UserProfile[]> => {
  console.log("API (Dummy): fetchUsers");
  return Promise.resolve([...DUMMY_USERS_DB]);
};

export const addUser = async (userData: Omit<UserProfile, 'uid' | 'photoURL' | 'preferences'> & { password?: string }): Promise<UserProfile> => {
  console.log("API (Dummy): addUser");
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
  console.log(`API (Dummy): updateUser for UID ${uid}`);
  const userIndex = DUMMY_USERS_DB.findIndex(u => u.uid === uid);
  if (userIndex > -1) {
    DUMMY_USERS_DB[userIndex] = { ...DUMMY_USERS_DB[userIndex], ...userData };
    saveDummyUsers();
    return Promise.resolve({ ...DUMMY_USERS_DB[userIndex] });
  }
  return Promise.reject(new Error('User not found for update (dummy data).'));
};

export const deleteUser = async (uid: string): Promise<void> => {
  console.log(`API (Dummy): deleteUser for UID ${uid}`);
  const initialLength = DUMMY_USERS_DB.length;
  DUMMY_USERS_DB = DUMMY_USERS_DB.filter(u => u.uid !== uid);
  if (DUMMY_USERS_DB.length < initialLength) {
    saveDummyUsers();
    return Promise.resolve();
  }
  return Promise.reject(new Error('User not found for deletion (dummy data).'));
};

// --- Other API functions (Dummy Data) ---
export const forgotPassword = async (email: string): Promise<void> => {
  console.log(`API (Dummy): Mock forgot password for ${email}.`);
  await new Promise(resolve => setTimeout(resolve, 500));
  return Promise.resolve();
};

export const changeUserPassword = async (uid: string, currentPassword?: string, newPassword?: string): Promise<void> => {
  console.log(`API (Dummy): Mock change password for UID ${uid}.`);
  const user = DUMMY_USERS_DB.find(u => u.uid === uid);
  if (user && user.password === currentPassword) {
      user.password = newPassword;
      saveDummyUsers();
      return Promise.resolve();
  }
  return Promise.reject(new Error("Password change failed (dummy data logic)."));
};


export { apiClient };
