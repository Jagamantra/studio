import type { ProjectConfig } from '@/types';

export const projectConfig: ProjectConfig = {
  appName: 'Genesis Template',
  availableAccentColors: [
    { name: 'Teal', hslValue: '180 100% 25%', hexValue: '#008080' },
    { name: 'Blue', hslValue: '221.2 83.2% 53.3%', hexValue: '#2563EB' },
    { name: 'Rose', hslValue: '346.8 77.2% 49.8%', hexValue: '#E11D48' },
    { name: 'Green', hslValue: '142.1 70.6% 45.3%', hexValue: '#22C55E' },
    { name: 'Orange', hslValue: '24.6 95% 53.1%', hexValue: '#F97316' },
  ],
  defaultAccentColorName: 'Teal',
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
};

