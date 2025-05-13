'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
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
  useSidebar,
} from '@/components/ui/sidebar';
import { ChevronDown } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';

interface MainNavProps {
  items: SidebarNavItem[];
}

export function MainNav({ items }: MainNavProps) {
  const pathname = usePathname();
  const { user: authUser } = useAuth();
  const { state: sidebarState } = useSidebar(); 
  const { toast } = useToast();
  const router = useRouter();

  const [openSubmenus, setOpenSubmenus] = React.useState<Record<string, boolean>>({});

  const toggleSubmenu = (itemId: string) => {
    setOpenSubmenus(prev => ({ ...prev, [itemId]: !prev[itemId] }));
  };

  const userHasRole = (allowedRoles?: Role[]): boolean => {
    if (!allowedRoles || allowedRoles.length === 0) return true; 
    if (!authUser || !authUser.role) return false; 
    return allowedRoles.includes(authUser.role);
  };

  const handleLinkClick = (event: React.MouseEvent, navItem: SidebarNavItem) => {
    if (navItem.disabled) {
      event.preventDefault();
      return;
    }
    if (navItem.roles && authUser && !navItem.roles.includes(authUser.role)) {
      event.preventDefault();
      toast({
        title: 'Access Denied',
        message: `You do not have permission to access ${navItem.label}.`,
        variant: 'destructive',
      });
      router.push('/dashboard');
    }
  };


  const renderNavItem = (item: SidebarNavItem, isSubItem = false): React.ReactNode => {
    // Initial role check for visibility, actual click prevention is handled by handleLinkClick
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
        <Link 
          href={href} 
          passHref 
          legacyBehavior
          onClick={(e) => handleLinkClick(e, item)}
        >
          <ButtonComponent
            asChild={!isSubItem} 
            className={cn(isSubItem && "pl-4")} 
            isActive={isActive}
            aria-disabled={item.disabled}
            disabled={item.disabled}
            tooltip={sidebarState === 'collapsed' ? item.label : undefined}
          >
            {isSubItem ? (
              <>
                <Icon />
                <span>{item.label}</span>
                {item.disabled && <Badge variant="outline" className="ml-auto">Soon</Badge>}
              </>
            ) : (
              <span>
                <Icon />
                <span>{item.label}</span>
                {item.disabled && <Badge variant="outline" className="ml-auto">Soon</Badge>}
              </span>
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
