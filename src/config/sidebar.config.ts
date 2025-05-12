import type { SidebarConfig } from '@/types';
import { LayoutDashboard, Users, UserCircle, Cog, ShieldQuestion, FileText, BarChart3 } from 'lucide-react';

export const sidebarConfig: SidebarConfig = {
  items: [
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
      id: 'profile',
      label: 'My Profile',
      href: '/profile',
      icon: UserCircle,
      roles: ['admin', 'user'],
    },
    {
      id: 'config-advisor',
      label: 'Config Advisor',
      href: '/config-advisor',
      icon: ShieldQuestion, // More relevant icon for advisor/analyzer
      roles: ['admin'],
    },
    // Example of a section with sub-items
    // {
    //   id: 'reports',
    //   label: 'Reports',
    //   icon: BarChart3,
    //   roles: ['admin'],
    //   subItems: [
    //     {
    //       id: 'sales-reports',
    //       label: 'Sales',
    //       href: '/reports/sales',
    //       icon: FileText,
    //       roles: ['admin'],
    //     },
    //     {
    //       id: 'user-activity-reports',
    //       label: 'User Activity',
    //       href: '/reports/user-activity',
    //       icon: FileText,
    //       roles: ['admin'],
    //     },
    //   ],
    // },
    // {
    //   id: 'settings',
    //   label: 'Settings',
    //   href: '/settings', // Placeholder parent, could be non-navigable or a settings overview
    //   icon: Cog,
    //   roles: ['admin'],
    //   // subItems: [
    //   //   { id: 'general-settings', label: 'General', href: '/settings/general', icon: Cog, roles: ['admin'] },
    //   //   { id: 'api-settings', label: 'API Keys', href: '/settings/api', icon: KeyRound, roles: ['admin'] },
    //   // ],
    // },
  ],
};
