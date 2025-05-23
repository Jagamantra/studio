import type { SidebarConfig, SidebarNavItem } from '@/types';
import { LayoutDashboard, Users, UserCircle, Cog, ShieldQuestion, FileText, BarChart3, BookPlus } from 'lucide-react';
import { projectConfig } from './project.config';
import { BookUser } from 'lucide-react';

const sidebarItems: SidebarNavItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
    roles: ['admin', 'user'],
  },
  {
    id: 'users',
    label: 'User Management',
    href: '/users',
    icon: Users,
    roles: ['admin'],
  },
  {
    id: 'customer-management',
    label: 'Customer Management',
    href: '/customers',
    icon: BookUser,
    roles: ['admin', 'user'],
  },
  {
    id: 'customer-Addition',
    label: 'Add Customer',
    href: '/customers/form?mode=create',
    icon: BookPlus,
    roles: ['admin'],
  },
  {
    id: 'profile',
    label: 'My Profile',
    href: '/profile',
    icon: UserCircle,
    roles: ['admin', 'user'],
  },
];

// if (projectConfig.enableApplicationConfig) { // Updated to use enableApplicationConfig
//   sidebarItems.push({
//     id: 'application-config', // Changed ID for consistency
//     label: 'Application Config', // Changed label
//     href: '/config-advisor', // Route remains the same unless page itself is renamed
//     icon: ShieldQuestion,
//     roles: ['admin'],
//   });
// }

// Example of a section with sub-items
// sidebarItems.push(
//   {
//     id: 'reports',
//     label: 'Reports',
//     icon: BarChart3,
//     roles: ['admin'],
//     subItems: [
//       {
//         id: 'sales-reports',
//         label: 'Sales',
//         href: '/reports/sales',
//         icon: FileText,
//         roles: ['admin'],
//       },
//       {
//         id: 'user-activity-reports',
//         label: 'User Activity',
//         href: '/reports/user-activity',
//         icon: FileText,
//         roles: ['admin'],
//       },
//     ],
//   },
//   {
//     id: 'settings',
//     label: 'Settings',
//     href: '/settings', 
//     icon: Cog,
//     roles: ['admin'],
//   }
// );

export const sidebarConfig: SidebarConfig = {
  items: sidebarItems,
};

