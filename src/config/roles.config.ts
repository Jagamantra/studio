
import type { RolesConfig } from '@/types';

export const rolesConfig: RolesConfig = {
  roles: ['admin', 'user', 'guest'],
  // Route permissions: Maps a base pathname to an array of roles that can access it.
  // Middleware will check against these. More specific sub-routes inherit from parent if not specified.
  // 'guest' role is typically for unauthenticated users, relevant for /auth/login, /auth/register.
  routePermissions: {
    '/dashboard': ['admin', 'user'],
    '/users': ['admin'],
    '/profile': ['admin', 'user'],
    '/config-advisor': ['admin'],
    // Auth pages: accessible to 'guest'. Authenticated users trying to access them should be redirected.
    '/auth/login': ['guest'],
    '/auth/register': ['guest'],
    '/auth/mfa': ['guest'], // MFA might be accessible post-login attempt but before full session
  },
  defaultRole: 'user', // Default role assigned to new users upon registration.
};
