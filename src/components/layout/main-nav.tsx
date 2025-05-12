
'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/auth-provider';
import type { SidebarNavItem, Role } from '@/types';
import { cn } from '@/lib/utils';
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar, // from shadcn/ui Sidebar
} from '@/components/ui/sidebar'; // Using shadcn's sidebar
import { ChevronDown } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

interface MainNavProps {
  items: SidebarNavItem[];
}

export function MainNav({ items }: MainNavProps) {
  const pathname = usePathname();
  const { user } = useAuth();
  const { state: sidebarState } = useSidebar(); // Get sidebar state (expanded/collapsed)

  const [openSubmenus, setOpenSubmenus] = React.useState<Record<string, boolean>>({});

  const toggleSubmenu = (itemId: string) => {
    setOpenSubmenus(prev => ({ ...prev, [itemId]: !prev[itemId] }));
  };

  const userHasRole = (allowedRoles?: Role[]): boolean => {
    if (!allowedRoles || allowedRoles.length === 0) return true; // No roles specified, accessible to all
    if (!user || !user.role) return false; // No user or user role, not accessible
    return allowedRoles.includes(user.role);
  };

  const renderNavItem = (item: SidebarNavItem, isSubItem = false): React.ReactNode => {
    if (!userHasRole(item.roles)) {
      return null;
    }

    const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
    const Icon = item.icon;

    if (item.subItems && item.subItems.length > 0) {
      return (
        <SidebarMenuItem key={item.id}>
          <SidebarMenuButton
            onClick={() => toggleSubmenu(item.id)}
            isActive={isActive || item.subItems.some(sub => pathname.startsWith(sub.href))}
            className="justify-between"
            tooltip={sidebarState === 'collapsed' ? item.label : undefined}
          >
            <div className="flex items-center gap-2">
              <Icon />
              <span>{item.label}</span>
            </div>
            {item.disabled && <Badge variant="outline" className="ml-auto">Soon</Badge>}
            <ChevronDown
              className={cn(
                'h-4 w-4 transition-transform group-data-[collapsible=icon]:hidden',
                openSubmenus[item.id] ? 'rotate-180' : ''
              )}
            />
          </SidebarMenuButton>
          {openSubmenus[item.id] && !item.disabled && (
            <SidebarMenuSub>
              {item.subItems.map(subItem => (
                <SidebarMenuSubItem key={subItem.id}>
                  {renderNavItem(subItem, true)}
                </SidebarMenuSubItem>
              ))}
            </SidebarMenuSub>
          )}
        </SidebarMenuItem>
      );
    }

    const ButtonComponent = isSubItem ? SidebarMenuSubButton : SidebarMenuButton;
    const href = item.disabled ? '#' : item.href;

    return (
      <SidebarMenuItem key={item.id}>
        <Link href={href} passHref legacyBehavior>
          <ButtonComponent
            asChild={!isSubItem} // SidebarMenuButton uses slot, SubButton is an 'a' tag by default.
            // For SubButton, if we want it to be a Link, we might need to wrap it or ensure its props are passed correctly.
            // The provided shadcn sidebar does not make SubButton a link automatically.
            // We will use an 'a' tag for sub-buttons and a Button with Link for main items.
            className={cn(isSubItem && "pl-4")} // Indent sub-items if needed
            isActive={isActive}
            aria-disabled={item.disabled}
            disabled={item.disabled} // Added disabled prop
            tooltip={sidebarState === 'collapsed' ? item.label : undefined}
          >
            {isSubItem ? (
              // For SubButtons (which are 'a' tags), content goes directly inside
              <>
                <Icon />
                <span>{item.label}</span>
                {item.disabled && <Badge variant="outline" className="ml-auto">Soon</Badge>}
              </>
            ) : (
              // For MenuButtons (which are <button> or Slot), content needs to be structured
              <>
                <Icon />
                <span>{item.label}</span>
                {item.disabled && <Badge variant="outline" className="ml-auto">Soon</Badge>}
              </>
            )}
          </ButtonComponent>
        </Link>
      </SidebarMenuItem>
    );
  };

  return (
    <ScrollArea className="flex-grow">
      <SidebarMenu>
        {items.map(item => renderNavItem(item))}
      </SidebarMenu>
    </ScrollArea>
  );
}
