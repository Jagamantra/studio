
import type { LucideIcon } from 'lucide-react';

export type AccentColor = {
  name: string;
  hslValue: string; 
  hexValue: string; 
};

export type BorderRadiusOption = {
  name: string;
  value: string; 
};

export type AppVersion = {
  name: string;
  id: string;
};

export type FontSizeOption = {
  name: string;
  value: string; 
};

export type ScaleOption = {
  name: string;
  value: string; 
};

export type InterfaceDensityOption = {
  name: 'Compact' | 'Comfortable' | 'Spacious';
  value: 'compact' | 'comfortable' | 'spacious';
};

export type ProjectConfig = {
  appName: string;
  appIconPaths?: string[]; 
  appLogoUrl?: string | null; 
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
  availableInterfaceDensities: InterfaceDensityOption[];
  defaultInterfaceDensity: 'compact' | 'comfortable' | 'spacious';
  mockApiMode: boolean; // If true, use mock API and local storage
};

export type SidebarNavItem = {
  id: string;
  label: string;
  href: string;
  icon: LucideIcon;
  roles?: Role[]; 
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

// Represents the user's theme and application preferences
export type ThemeSettings = {
  theme?: 'light' | 'dark' | 'system';
  accentColor?: string; // HSL or HEX string
  borderRadius?: string; // CSS value
  appVersion?: string; // ID of the app version
  appName?: string;
  appIconPaths?: string[];
  appLogoUrl?: string | null;
  fontSize?: string; // CSS value e.g. "16px"
  appScale?: string; // CSS value e.g. "1.0"
  interfaceDensity?: 'compact' | 'comfortable' | 'spacious';
};


export type UserProfile = {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  phoneNumber: string | null;
  role: Role;
  password?: string; // Only for mock/creation, not expected from real API after auth
  receiveNotifications?: boolean; // Example of a non-theme preference
  preferences?: ThemeSettings; // User's personalized theme/app settings
};

// For ThemeProvider context state
export interface ThemeProviderState extends Required<Omit<ThemeSettings, 'appIconPaths' | 'appLogoUrl'>> {
  appIconPaths?: string[]; // appIconPaths can be undefined
  appLogoUrl?: string | null; // appLogoUrl can be null
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  setAccentColor: (accentValue: string) => void;
  setBorderRadius: (radiusValue: string) => void;
  setAppVersion: (versionId: string) => void;
  setAppName: (appName: string) => void;
  setAppIconPaths: (paths: string[] | undefined) => void;
  setAppLogoUrl: (url: string | null) => void;
  setFontSize: (fontSizeValue: string) => void;
  setAppScale: (scaleValue: string) => void;
  setInterfaceDensity: (density: 'compact' | 'comfortable' | 'spacious') => void;
  availableAccentColors: AccentColor[];
  availableBorderRadii: BorderRadiusOption[];
  availableFontSizes: FontSizeOption[];
  availableScales: ScaleOption[];
  availableInterfaceDensities: InterfaceDensityOption[];
}


// For API responses
export type AuthResponse = {
  token: string; // JWT
  user: { // Basic user info returned on login/register
    uid: string;
    email: string | null;
    role: Role;
    preferences?: ThemeSettings; // Initial preferences
  };
};

export type MfaVerificationResponse = {
  success: boolean;
  user?: UserProfile; // Full or updated user profile on successful MFA
  message?: string; // Error message if not successful
};
