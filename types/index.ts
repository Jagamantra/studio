
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
  appLogoUrl?: string | null; // URL or data URI for an image logo
  availableAccentColors: AccentColor[];
  defaultAccentColorName: string;
  availableBorderRadii: BorderRadiusOption[];
  defaultBorderRadiusName: string;
  availableAppVersions: AppVersion[];
  defaultAppVersionId: string;
  enableApplicationConfig: boolean; 
  availableFontSizes: FontSizeOption[];
  defaultFontSizeName: string;
  availableScales: ScaleOption[];
  defaultScaleName: string;
  mockApiMode: boolean;
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
  password?: string; // Only for mock/creation, not stored long-term as plain text
  receiveNotifications?: boolean;
  interfaceDensity?: 'compact' | 'comfortable' | 'spacious';
  // Theme preferences that could be stored per user in a real backend
  preferredThemeMode?: 'light' | 'dark' | 'system';
  preferredAccentColor?: string; // HSL or HEX
  preferredBorderRadius?: string; // CSS value
  preferredAppVersion?: string;
  preferredFontSize?: string; // CSS value
  preferredScale?: string; // CSS value (e.g. "1.0")
  preferredAppName?: string;
  preferredAppIconPaths?: string[];
  preferredAppLogoUrl?: string | null;
};

// For theme context
export type ThemeSettings = {
  theme: 'light' | 'dark' | 'system';
  accentColor: string;
  borderRadius: string;
  appVersion: string;
  appName: string;
  appIconPaths?: string[];
  appLogoUrl?: string | null;
  fontSize: string; // e.g. "16px"
  appScale: string; // e.g. "1.0"
};

export interface ThemeProviderState extends ThemeSettings {
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  setAccentColor: (accentValue: string) => void;
  setBorderRadius: (radiusValue: string) => void;
  setAppVersion: (versionId: string) => void;
  setAppName: (appName: string) => void;
  setAppIconPaths: (paths: string[] | undefined) => void;
  setAppLogoUrl: (url: string | null) => void;
  setFontSize: (fontSizeValue: string) => void;
  setAppScale: (scaleValue: string) => void;
  availableAccentColors: AccentColor[];
  availableBorderRadii: BorderRadiusOption[];
  availableFontSizes: FontSizeOption[];
  availableScales: ScaleOption[];
}
