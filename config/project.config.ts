
import type { ProjectConfig } from '@/types';

export const projectConfig: ProjectConfig = {
  appName: 'Risk Profiler',
  appIconPaths: [
    "M12 2L2 7l10 5 10-5-10-5z",
    "M2 17l10 5 10-5",
    "M2 12l10 5 10-5"
  ],
  appLogoUrl: "/defaultapplogo.png", // Set to null to use default favicon
  faviconUrl: "/defaultfavicon.png", // Optional, will use appLogoUrl if not set
  availableAccentColors: [
    { name: 'Teal', hslValue: '180 100% 25%', hexValue: '#008080' },
    { name: 'Blue', hslValue: '221.2 83.2% 53.3%', hexValue: '#2563EB' },
    { name: 'Rose', hslValue: '346.8 77.2% 49.8%', hexValue: '#E11D48' },
    { name: 'Green', hslValue: '142.1 70.6% 45.3%', hexValue: '#22C55E' },
    { name: 'Orange', hslValue: '24.6 95% 53.1%', hexValue: '#F97316' },
  ],
  defaultAccentColorName: 'Orange',
  availableBorderRadii: [
    { name: 'None', value: '0rem' },
    { name: 'Small', value: '0.3rem' },
    { name: 'Medium', value: '0.5rem' },
    { name: 'Large', value: '0.75rem' },
  ],
  defaultBorderRadiusName: 'Medium',
  availableAppVersions: [
    { name: 'Version 1.0', id: 'v1.0.0' },
    { name: 'Beta Preview', id: 'v0.9.0-beta' },
    { name: 'Dev Build', id: 'dev' },
  ],
  defaultAppVersionId: 'v1.0.0',
  enableApplicationConfig: true,

  availableFontSizes: [
    { name: 'Small', value: '14px' },
    { name: 'Default', value: '16px' },
    { name: 'Large', value: '18px' },
  ],
  defaultFontSizeName: 'Default',

  availableScales: [
    { name: 'Compact (90%)', value: '0.9' },
    { name: 'Default (100%)', value: '1.0' },
    { name: 'Large (110%)', value: '1.1' },
  ],
  defaultScaleName: 'Default (100%)',

  availableInterfaceDensities: [
    { name: 'Compact', value: 'compact' },
    { name: 'Comfortable', value: 'comfortable' },
    { name: 'Spacious', value: 'spacious' },
  ],  defaultInterfaceDensity: 'comfortable',

  // API configuration
  mockCustomerApi: false, // Use mock API for customers endpoint during development
  mockApiMode: false,    // Use real API for other endpoints
};
