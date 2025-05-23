'use client';
import type { UserProfile, AuthResponse, MfaSentResponse, LoginSuccessResponse, ThemeSettings, Role, Customer } from '@/types';
import apiClient from './apiClient';
import { projectConfig } from '@/config/project.config';
import {
    initialDummyUsersForAuth,
    DUMMY_USERS_STORAGE_KEY,
    CURRENT_DUMMY_USER_STORAGE_KEY,
    MFA_VERIFIED_STORAGE_KEY,
    previewAdminUserProfile,
} from '@/data/dummy-data';
import { rolesConfig } from '@/config/roles.config';

// In-memory store for dummy users, initialized from localStorage or defaults
let DUMMY_USERS_DB_INSTANCE: UserProfile[] = [];

const getMockUsersFromStorage = (): UserProfile[] => {
    if (typeof window === 'undefined') { // Handle SSR case or non-browser environment
        // Return a fresh copy for SSR to avoid cross-request contamination if this code ever ran server-side.
        // For client-side, this ensures initialDummyUsersForAuth is the base if nothing in localStorage.
        return [...initialDummyUsersForAuth];
    }
    const usersJson = localStorage.getItem(DUMMY_USERS_STORAGE_KEY);
    try {
        const parsedUsers = usersJson ? JSON.parse(usersJson) : [...initialDummyUsersForAuth];
        DUMMY_USERS_DB_INSTANCE = Array.isArray(parsedUsers) ? parsedUsers : [...initialDummyUsersForAuth];
    } catch (e) {
        console.error("Error parsing dummy users from localStorage:", e);
        DUMMY_USERS_DB_INSTANCE = [...initialDummyUsersForAuth];
    }
    // Ensure DB is not empty if initial data exists
    if (DUMMY_USERS_DB_INSTANCE.length === 0 && initialDummyUsersForAuth.length > 0) {
        DUMMY_USERS_DB_INSTANCE = [...initialDummyUsersForAuth];
        saveMockUsersToStorage(); // Save initial state if it was empty
    }
    return DUMMY_USERS_DB_INSTANCE;
};

const saveMockUsersToStorage = () => {
    if (typeof window !== 'undefined') {
        localStorage.setItem(DUMMY_USERS_STORAGE_KEY, JSON.stringify(DUMMY_USERS_DB_INSTANCE));
    }
};

// Initialize on load for client-side
if (typeof window !== 'undefined') {
    getMockUsersFromStorage(); // This will populate DUMMY_USERS_DB_INSTANCE
}

// --- Authentication ---
export const registerUser = async (details: { email: string, password?: string, displayName?: string, role?: Role }): Promise<MfaSentResponse> => {
    if (projectConfig.mockApiMode) {
        console.log("API (Mock): registerUser for", details.email);
        getMockUsersFromStorage(); // Ensure DB is fresh
        if (DUMMY_USERS_DB_INSTANCE.some(u => u.email === details.email)) {
            return Promise.reject(new Error('Mock: Email already exists'));
        }
        const newUser: UserProfile = {
            uid: `mock-user-${Date.now()}`,
            email: details.email,
            displayName: details.displayName || details.email.split('@')[0],
            role: details.role || rolesConfig.defaultRole,
            photoURL: null,
            phoneNumber: null,
            password: details.password,
            preferences: {},
        };
        DUMMY_USERS_DB_INSTANCE.push(newUser);
        saveMockUsersToStorage();
        return Promise.resolve({ codeSent: true, message: "Mock registration successful. MFA code will be shown." });
    } else {
        // Real API call
        console.log("API (Real): registerUser for", details.email);
        const response = await apiClient.post<MfaSentResponse>('/auth/register', details);
        return response.data;
    }
};

export const loginUser = async (email: string, password?: string): Promise<MfaSentResponse> => {
    if (projectConfig.mockApiMode) {
        console.log("API (Mock): loginUser for", email);
        getMockUsersFromStorage();
        const user = DUMMY_USERS_DB_INSTANCE.find(u => u.email === email && u.password === password);
        if (user) {
            return Promise.resolve({ codeSent: true, message: "Mock login successful. MFA code will be shown." });
        }
        return Promise.reject(new Error('Invalid mock credentials.'));
    } else {
        // Real API call
        console.log("API (Real): loginUser for", email);
        const response = await apiClient.post<MfaSentResponse>('/auth/login', { email, password });
        return response.data;
    }
};

export const verifyMfa = async (email: string, mfaCode: string): Promise<LoginSuccessResponse> => {
    if (projectConfig.mockApiMode) {
        console.log("API (Mock): verifyMfa for", email);
        getMockUsersFromStorage();
        const user = DUMMY_USERS_DB_INSTANCE.find(u => u.email === email);
        if (user && mfaCode.length === 6 && /^\d+$/.test(mfaCode)) { // Simple mock MFA check
            if (typeof window !== 'undefined') {
                localStorage.setItem(CURRENT_DUMMY_USER_STORAGE_KEY, JSON.stringify(user));
                localStorage.setItem(MFA_VERIFIED_STORAGE_KEY, 'true');
            }
            return Promise.resolve({
                accessToken: `mock-token-for-${user.uid}-${Date.now()}`,
                email: user.email!,
                role: user.role,
                expiresIn: 3600,
                uid: user.uid,
                preferences: user.preferences || {},
            });
        }
        return Promise.reject(new Error('Mock: Invalid MFA code or user not found.'));
    } else {
        // Real API call
        console.log("API (Real): verifyMfa for", email);
        const response = await apiClient.post<LoginSuccessResponse>('/auth/verify-mfa', { email, mfaCode });
        return response.data;
    }
};

export const logoutUser = async (): Promise<void> => {
    if (projectConfig.mockApiMode) {
        console.log("API (Mock): logoutUser");
        if (typeof window !== 'undefined') {
            localStorage.removeItem(CURRENT_DUMMY_USER_STORAGE_KEY);
            localStorage.removeItem(MFA_VERIFIED_STORAGE_KEY);
        }
        return Promise.resolve();
    } else {
        // Real API call
        console.log("API (Real): logoutUser");
        try {
            await apiClient.post('/auth/logout');
        } catch (error) {
            console.warn("Logout API call failed (this might be expected if no backend logout endpoint):", error);
        }
        // Client-side session clearing (cookies, state) is handled by AuthProvider
        return Promise.resolve();
    }
};

// --- User Profile & Preferences ---
// These functions currently use DUMMY_USERS_DB_INSTANCE for data storage/retrieval
// regardless of mockApiMode, as real endpoints for these are not yet implemented.
export const fetchUserProfile = async (uid: string, email?: string, role?: Role): Promise<UserProfile | null> => {
    console.log(`API (Dummy Data Source): fetchUserProfile for UID ${uid}`);
    getMockUsersFromStorage(); // Ensure DUMMY_USERS_DB_INSTANCE is up-to-date
    let user = DUMMY_USERS_DB_INSTANCE.find(u => u.uid === uid);

    if (!user && uid && email && role) {
        // If user not found by UID but we have details (e.g. from token after real auth, or during mock registration),
        // create a placeholder in the dummy DB.
        console.log(`API (Dummy Data Source): User ${uid} not found. Creating placeholder with email ${email} and role ${role}.`);
        user = {
            uid, email, role,
            displayName: email.split('@')[0], // Default display name
            photoURL: null,
            phoneNumber: null,
            preferences: {}, // Default empty preferences
            // Password field might be relevant if this creation happens during mock registration
            // For real auth, password is not stored client-side.
            password: projectConfig.mockApiMode ? 'mockGeneratedPassword' : undefined,
        };
        DUMMY_USERS_DB_INSTANCE.push(user);
        saveMockUsersToStorage();
    } else if (!user && uid === previewAdminUserProfile.uid) { // Special case for preview admin during development
        user = { ...previewAdminUserProfile };
        if (!DUMMY_USERS_DB_INSTANCE.find(u=> u.uid === previewAdminUserProfile.uid)) {
            DUMMY_USERS_DB_INSTANCE.push(user);
            saveMockUsersToStorage();
        }
    }
    return Promise.resolve(user ? { ...user } : null);
};

export const updateUserProfile = async (uid: string, profileData: Partial<Omit<UserProfile, 'uid' | 'email' | 'role' | 'preferences' | 'password'>>): Promise<UserProfile> => {
    console.log(`API (Dummy Data Source): updateUserProfile for UID ${uid}`);
    getMockUsersFromStorage();
    const userIndex = DUMMY_USERS_DB_INSTANCE.findIndex(u => u.uid === uid);
    if (userIndex > -1) {
        DUMMY_USERS_DB_INSTANCE[userIndex] = { ...DUMMY_USERS_DB_INSTANCE[userIndex], ...profileData };
        saveMockUsersToStorage();
        return Promise.resolve({ ...DUMMY_USERS_DB_INSTANCE[userIndex] });
    }
    console.warn(`API (Dummy Data Source - Profile Update): User not found for UID: ${uid}. No update performed.`);
    return Promise.reject(new Error('User not found for profile update (using dummy data store).'));
};

export const updateUserPreferences = async (uid: string, preferences: Partial<ThemeSettings>): Promise<UserProfile> => {
    console.log(`API (Dummy Data Source): updateUserPreferences for UID ${uid}`);
    getMockUsersFromStorage();
    let userIndex = DUMMY_USERS_DB_INSTANCE.findIndex(u => u.uid === uid);

    if (userIndex === -1) {
        // This should ideally not happen if fetchUserProfile correctly creates placeholders.
        console.warn(`API (Dummy Data Source - Preferences Update): User with UID ${uid} not found. Profile might not have been initialized in dummy store.`);
        return Promise.reject(new Error(`User with UID ${uid} not found in dummy store. Cannot update preferences.`));
    }

    const currentUser = DUMMY_USERS_DB_INSTANCE[userIndex];
    currentUser.preferences = { ...(currentUser.preferences || {}), ...preferences };
    saveMockUsersToStorage();
    return Promise.resolve({ ...currentUser });
};


// --- User Management (Admin) ---
// These functions use DUMMY_USERS_DB_INSTANCE for data.
export const fetchUsers = async (): Promise<UserProfile[]> => {
    console.log("API (Dummy Data Source): fetchUsers");
    getMockUsersFromStorage();
    return Promise.resolve([...DUMMY_USERS_DB_INSTANCE]);
};

export const addUser = async (userData: Omit<UserProfile, 'uid' | 'photoURL' | 'preferences'> & { password?: string }): Promise<UserProfile> => {
    console.log("API (Dummy Data Source): addUser", userData.email);
    getMockUsersFromStorage();
    if (DUMMY_USERS_DB_INSTANCE.some(u => u.email === userData.email)) {
        return Promise.reject(new Error('Dummy DB: Email already exists for new user.'));
    }
    const newUser: UserProfile = {
        uid: `dummy-admin-added-${Date.now()}`,
        email: userData.email,
        displayName: userData.displayName,
        role: userData.role,
        photoURL: null,
        password: userData.password, // Store password for mock login capability
        preferences: {},
        phoneNumber: userData.phoneNumber || null,
    };
    DUMMY_USERS_DB_INSTANCE.unshift(newUser); // Add to the start for easy visibility in mock scenarios
    saveMockUsersToStorage();
    return Promise.resolve(newUser);
};

export const updateUser = async (uid: string, userData: Partial<Omit<UserProfile, 'uid' | 'email' | 'password'>>): Promise<UserProfile> => {
    console.log(`API (Dummy Data Source): updateUser for UID ${uid}`);
    getMockUsersFromStorage();
    const userIndex = DUMMY_USERS_DB_INSTANCE.findIndex(u => u.uid === uid);
    if (userIndex > -1) {
        DUMMY_USERS_DB_INSTANCE[userIndex] = { ...DUMMY_USERS_DB_INSTANCE[userIndex], ...userData };
        saveMockUsersToStorage();
        return Promise.resolve({ ...DUMMY_USERS_DB_INSTANCE[userIndex] });
    }
    return Promise.reject(new Error('Dummy DB: User not found for update by admin.'));
};

export const deleteUser = async (uid: string): Promise<void> => {
    console.log(`API (Dummy Data Source): deleteUser for UID ${uid}`);
    getMockUsersFromStorage();
    const initialLength = DUMMY_USERS_DB_INSTANCE.length;
    DUMMY_USERS_DB_INSTANCE = DUMMY_USERS_DB_INSTANCE.filter(u => u.uid !== uid);
    if (DUMMY_USERS_DB_INSTANCE.length < initialLength) {
        saveMockUsersToStorage();
        return Promise.resolve();
    }
    return Promise.reject(new Error('Dummy DB: User not found for deletion by admin.'));
};

// --- Customer Management ---
export const getCustomers = async (): Promise<Customer[]> => {
  try {
    if (projectConfig.mockApiMode) {
      // Use mock data
      const { mockCustomers } = await import('@/data/mock-customers');
      return mockCustomers;
    } else {
      const response = await apiClient.get('/customers');
      return response.data;
    }
  } catch (error) {
    console.error('Error fetching customers:', error);
    throw error;
  }
};

export const getCustomerById = async (id: string): Promise<Customer> => {
  try {
    if (projectConfig.mockApiMode) {
      const { mockCustomers } = await import('@/data/mock-customers');
      const customer = mockCustomers.find(c => c.id === id);
      if (!customer) throw new Error('Customer not found');
      return customer;
    } else {
      const response = await apiClient.get(`/customers/${id}`);
      return response.data;
    }
  } catch (error) {
    console.error('Error fetching customer:', error);
    throw error;
  }
};

export const createCustomer = async (customer: Omit<Customer, 'id'>): Promise<Customer> => {
  try {
    if (projectConfig.mockApiMode) {
      const { mockCustomers } = await import('@/data/mock-customers');
      const newCustomer = {
        ...customer,
        id: Math.random().toString(36).slice(2),
      };
      mockCustomers.push(newCustomer);
      return newCustomer;
    } else {
      const response = await apiClient.post('/customers', customer);
      return response.data;
    }
  } catch (error) {
    console.error('Error creating customer:', error);
    throw error;
  }
};

export const updateCustomer = async (id: string, customer: Partial<Customer>): Promise<Customer> => {
  try {
    if (projectConfig.mockApiMode) {
      const { mockCustomers } = await import('@/data/mock-customers');
      const index = mockCustomers.findIndex(c => c.id === id);
      if (index === -1) throw new Error('Customer not found');
      mockCustomers[index] = { ...mockCustomers[index], ...customer };
      return mockCustomers[index];
    } else {
      const response = await apiClient.patch(`/customers/${id}`, customer);
      return response.data;
    }
  } catch (error) {
    console.error('Error updating customer:', error);
    throw error;
  }
};

export const deleteCustomer = async (id: string): Promise<void> => {
  try {
    if (projectConfig.mockApiMode) {
      const { mockCustomers } = await import('@/data/mock-customers');
      const index = mockCustomers.findIndex(c => c.id === id);
      if (index === -1) throw new Error('Customer not found');
      mockCustomers.splice(index, 1);
    } else {
      await apiClient.delete(`/customers/${id}`);
    }
  } catch (error) {
    console.error('Error deleting customer:', error);
    throw error;
  }
};

// --- Other API functions ---
export const forgotPassword = async (email: string): Promise<void> => {
    if (projectConfig.mockApiMode) {
        getMockUsersFromStorage();
        const userExists = DUMMY_USERS_DB_INSTANCE.some(u => u.email === email);
        console.log(`API (Mock): forgotPassword for ${email}. User exists: ${userExists}`);
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 500));
        return Promise.resolve();
    } else {
        // Real API call
        console.log(`API (Real): forgotPassword for ${email}`);
        await apiClient.post('/auth/forgot-password', { email });
        return Promise.resolve();
    }
};

export const changeUserPassword = async (uid: string, currentPassword?: string, newPassword?: string): Promise<void> => {
     if (projectConfig.mockApiMode) {
        console.log(`API (Mock): changeUserPassword for UID ${uid}`);
        getMockUsersFromStorage();
        const user = DUMMY_USERS_DB_INSTANCE.find(u => u.uid === uid);
        if (user && user.password === currentPassword && newPassword) {
            user.password = newPassword;
            saveMockUsersToStorage();
            return Promise.resolve();
        }
        return Promise.reject(new Error("Mock password change failed (user not found, current password mismatch, or new password missing)."));
    } else {
        // Real API call
        // The backend should handle validating the currentPassword if necessary.
        console.log(`API (Real): changeUserPassword for UID ${uid}`);
        await apiClient.post(`/users/${uid}/change-password`, { currentPassword, newPassword });
        return Promise.resolve();
    }
};

// apiClient is not typically exported if all interactions go through this service layer.
// However, if direct apiClient access is needed elsewhere (e.g., very specific one-off calls), it can be.
// For this project's structure, it's better to keep it internal to services/api.ts.
// export { apiClient };
