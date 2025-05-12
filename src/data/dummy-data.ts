
import type { UserProfile } from '@/types';

// For Auth Provider (Dummy Users)
export const DUMMY_USERS_STORAGE_KEY = 'genesis_dummy_users';
export const CURRENT_DUMMY_USER_STORAGE_KEY = 'genesis_current_dummy_user';

export const initialDummyUsersForAuth: UserProfile[] = [
  { uid: 'dummy-admin-001', email: 'admin@dummy.com', displayName: 'Dummy Admin', role: 'admin', photoURL: null, phoneNumber: null, password: 'password123' },
  { uid: 'dummy-user-002', email: 'user@dummy.com', displayName: 'Dummy User', role: 'user', photoURL: null, phoneNumber: null, password: 'password123' },
];

export const previewAdminUserProfile: UserProfile = {
    uid: 'preview-admin-default-000',
    email: 'preview@admin.genesis',
    displayName: 'Preview Admin',
    role: 'admin',
    photoURL: null,
    phoneNumber: null,
};


// For Dashboard Page
export const dummyUserForDashboardView: UserProfile = {
  uid: 'dummy-dashboard-viewer-001',
  email: 'viewer@example.com',
  displayName: 'Demo User (Admin View)',
  photoURL: 'https://picsum.photos/seed/demoviewer/40/40',
  phoneNumber: null,
  role: 'admin',
};

export const betaDashboardChartData = [
  { month: "Jan", newUsers: 186, churnedUsers: 80 },
  { month: "Feb", newUsers: 305, churnedUsers: 120 },
  { month: "Mar", newUsers: 237, churnedUsers: 90 },
  { month: "Apr", newUsers: 273, churnedUsers: 110 },
  { month: "May", newUsers: 209, churnedUsers: 70 },
  { month: "Jun", newUsers: 254, churnedUsers: 100 },
];

// For Users Page
export const initialMockUsersData: UserProfile[] = [
  { uid: '1', email: 'admin@example.com', displayName: 'Admin User', photoURL: 'https://picsum.photos/seed/user1/40/40', phoneNumber: '123-456-7890', role: 'admin', password: 'password123' },
  { uid: '2', email: 'user1@example.com', displayName: 'Regular User One', photoURL: 'https://picsum.photos/seed/user2/40/40', phoneNumber: '987-654-3210', role: 'user', password: 'password123' },
  { uid: '3', email: 'user2@example.com', displayName: 'Another User', photoURL: null, phoneNumber: null, role: 'user', password: 'password123' },
];

// For Config Advisor Page
export const placeholderSidebarConfigData = `
// sidebar.config.ts
// Example: import { Home, Settings } from 'lucide-react';
export const sidebarConfig = {
  items: [
    { id: 'dashboard', label: 'Home', href: '/dashboard', /*icon: Home,*/ roles: ['admin', 'user'] },
    // Example: Add a new item for admins
    // { id: 'admin-tools', label: 'Admin Tools', href: '/admin/tools', /*icon: Settings,*/ roles: ['admin'] },
  ],
};
`.trim();

export const placeholderRolesConfigData = `
// roles.config.ts
export const rolesConfig = {
  roles: ['admin', 'user', 'editor', 'guest'], // Example: Added 'editor'
  routePermissions: {
    '/dashboard': ['admin', 'user', 'editor'],
    '/admin': ['admin'], // Example: New rule for an /admin section
    // '/posts/edit': ['admin', 'editor'], // Example for content editing
  },
  defaultRole: 'user',
};
`.trim();
