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
  appIconPaths: string[]; // Changed to non-optional
  appLogoUrl?: string | null; 
  faviconUrl?: string | null; // Optional for backward compatibility
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
  mockCustomerApi: boolean; // Use mock API for customers endpoint during development
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
  appIconPaths: string[]; // Changed to non-optional, mirrors ProjectConfig
  appLogoUrl?: string | null;
  faviconUrl?: string | null; // Optional for backward compatibility
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
  preferences?: Partial<ThemeSettings>; // Preferences can be partial
};

export interface ThemeProviderState extends Required<Omit<ThemeSettings, 'appLogoUrl' | 'appIconPaths' | 'faviconUrl'>> {
  appIconPaths: string[]; // Non-optional
  appLogoUrl?: string | null; 
  faviconUrl?: string | null; // Optional for backward compatibility
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  setAccentColor: (accentValue: string) => void;
  setBorderRadius: (radiusValue: string) => void;
  setAppVersion: (versionId: string) => void;
  setAppName: (appName: string) => void;
  setAppIconPaths: (paths: string[] | undefined) => void; // Allow undefined for clearing
  setAppLogoUrl: (url: string | null) => void;
  setFaviconUrl: (url: string | null) => void; // Allow null for clearing
  setFontSize: (fontSizeValue: string) => void;
  setAppScale: (scaleValue: string) => void;
  setInterfaceDensity: (density: 'compact' | 'comfortable' | 'spacious') => void;
  availableAccentColors: AccentColor[];
  availableBorderRadii: BorderRadiusOption[];
  availableFontSizes: FontSizeOption[];
  availableScales: ScaleOption[];
  availableInterfaceDensities: InterfaceDensityOption[];
}

// API response types for real API
export type MfaSentResponse = {
  codeSent: boolean;
  message: string;
};

export type LoginSuccessResponse = {
  accessToken: string;
  email: string;
  role: Role;
  expiresIn: number; // Assuming this is in seconds
  // uid will be derived from token's 'sub' claim
  // preferences will be fetched separately or included if backend supports
};

export type CustomerStatus = 'in-progress' | 'on-hold' | 'completed';

export interface Customer {
  id: string;

  // Company Details
  companyName: string;
  address: string;
  phoneNumber: string;
  email: string;
  website: string;
  kvkNumber: string;
  legalForm: string;
  mainActivity: string;
  sideActivities: string;
  dga: string;
  staffFTE: number;
  annualTurnover: number;
  grossProfit: number;
  payrollYear: number;
  description: string;

  // Visit Data
  visitDate: string; // ISO format
  advisor: string;
  visitLocation: string;
  visitFrequency: string;
  conversationPartner: string;

  // Comments
  updatedAt: string; // ISO format
  comments: string;
  status: CustomerStatus;
}


export interface AuthResponse {
  token: string;
  user: {
    uid: string;
    email: string;
    role: string;
    preferences: Record<string, any>;
  };
}

// export interface MfaSentResponse {
//   uid: string;
//   message?: string;
// }

// export interface LoginSuccessResponse {
//   uid: string;
//   email: string;
//   role: string;
//   preferences: Record<string, any>;
// }
