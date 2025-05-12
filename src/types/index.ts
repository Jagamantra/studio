
import type { LucideIcon } from 'lucide-react';

export type AccentColor = {
  name: string;
  hslValue: string; // e.g., "180 100% 25%" (without hsl() wrapper) for CSS
  hexValue: string; // e.g., "#008080" for color input
};

export type BorderRadiusOption = {
  name: string;
  value: string; // e.g., "0.5rem"
};

export type AppVersion = {
  name: string;
  id: string;
};

export type ProjectConfig = {
  appName: string;
  appIconPaths?: string[]; // SVG path data for the application icon
  availableAccentColors: AccentColor[];
  defaultAccentColorName: string;
  availableBorderRadii: BorderRadiusOption[];
  defaultBorderRadiusName: string;
  availableAppVersions: AppVersion[];
  defaultAppVersionId: string;
};

export type SidebarNavItem = {
  id: string;
  label: string;
  href: string;
  icon: LucideIcon;
  roles?: Role[]; // Roles that can see this item
  subItems?: SidebarNavItem[];
  disabled?: boolean;
};

export type SidebarConfig = {
  items: SidebarNavItem[];
};

export type Role = 'admin' | 'user' | 'guest';

export type RolesConfig = {
  roles: Role[];
  // Defines which roles can access which base paths. More granular control can be added.
  routePermissions: Record<string, Role[]>; // e.g. { "/users": ["admin"] }
  defaultRole: Role; // Default role for new users
};

export type UserProfile = {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  phoneNumber: string | null;
  role: Role;
  password?: string; // For dummy authentication system
  // Advanced settings example
  receiveNotifications?: boolean;
  interfaceDensity?: 'compact' | 'comfortable' | 'spacious';
};

// For theme context
export type ThemeSettings = {
  theme: 'light' | 'dark' | 'system';
  accentColor: string; // HSL value string (e.g., "180 100% 25%") or HEX string (e.g., "#008080")
  borderRadius: string; // CSS rem/px value
  appVersion: string; // ID of the app version
  appName: string; 
  appIconPaths?: string[]; // SVG path data for dynamic icon
};

// This type is defined in config-advisor/page.tsx but used in its child components.
// If it were to be used more broadly, it could stay here.
// For now, child components import it from the page.
// export type ProjectConfigFormValues = z.infer<typeof projectConfigFormSchema>;



