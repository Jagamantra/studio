
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
  mockApiMode: boolean; 
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

export type ThemeSettings = {
  theme?: 'light' | 'dark' | 'system';
  accentColor?: string; 
  borderRadius?: string; 
  appVersion?: string; 
  appName?: string;
  appIconPaths?: string[];
  appLogoUrl?: string | null;
  fontSize?: string; 
  appScale?: string; 
  interfaceDensity?: 'compact' | 'comfortable' | 'spacious';
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
  preferences?: ThemeSettings; 
};

export interface ThemeProviderState extends Required<Omit<ThemeSettings, 'appIconPaths' | 'appLogoUrl'>> {
  appIconPaths?: string[]; 
  appLogoUrl?: string | null; 
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

// For API responses based on new documentation
export type MfaSentResponse = {
  codeSent: boolean;
  message: string;
};

export type LoginSuccessResponse = {
  accessToken: string; // JWT, likely handled by HttpOnly cookie
  email: string;
  role: string; // Should be Role type
  uid: string; // User ID from backend
  expiresIn: number;
  preferences?: ThemeSettings; // Optional initial preferences from backend
};

// Kept for backward compatibility if some parts still use the old AuthResponse structure for mock
export type AuthResponse = {
  token: string;
  user: {
    uid: string;
    email: string | null;
    role: Role;
    preferences?: ThemeSettings;
  };
};

// Kept for backward compatibility for mock MFA if needed
export type MfaVerificationResponse = {
  success: boolean;
  user?: UserProfile; 
  message?: string; 
};
