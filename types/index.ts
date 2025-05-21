
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

export type FontSizeOption = {
  name: string;
  value: string; // e.g., "14px" or "0.9rem"
};

export type ScaleOption = {
  name: string;
  value: string; // e.g., "0.9" or "1.1"
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
  enableConfigAdvisor?: boolean;
  availableFontSizes: FontSizeOption[];
  defaultFontSizeName: string;
  availableScales: ScaleOption[];
  defaultScaleName: string;
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
  routePermissions: Record<string, Role[]>;
  defaultRole: Role;
};

export type UserProfile = {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  phoneNumber: string | null;
  role: Role;
  password?: string;
  receiveNotifications?: boolean;
  interfaceDensity?: 'compact' | 'comfortable' | 'spacious';
  // Theme preferences that could be stored per user in a real backend
  preferredThemeMode?: 'light' | 'dark' | 'system';
  preferredAccentColor?: string; // HSL or HEX
  preferredBorderRadius?: string; // CSS value
  preferredAppVersion?: string;
  preferredFontSize?: string; // CSS value
  preferredScale?: string; // CSS value (e.g. "1.0")
};

// For theme context
export type ThemeSettings = {
  theme: 'light' | 'dark' | 'system';
  accentColor: string;
  borderRadius: string;
  appVersion: string;
  appName: string;
  appIconPaths?: string[];
  fontSize: string; // e.g. "16px"
  appScale: string; // e.g. "1.0"
};
