
'use client';

import Link from 'next/link';
import { LogOut, User, Settings, LogIn, ShieldQuestion, Briefcase, UserCog } from 'lucide-react'; // Added Briefcase for role
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/contexts/auth-context';
import { Skeleton } from '@/components/ui/skeleton';
import Image from 'next/image';
import { projectConfig } from '@/config/project.config';
import { Badge } from '@/components/ui/badge'; // Added Badge for role display

export function UserNav() {
  const { user, logout, loading } = useAuth();

  if (loading) {
    return <Skeleton className="h-8 w-8 rounded-full" />;
  }

  const getInitials = (name?: string | null) => {
    if (!name) return 'U';
    const names = name.split(' ');
    if (names.length === 1) return names[0][0].toUpperCase();
    return names[0][0].toUpperCase() + names[names.length - 1][0].toUpperCase();
  };

  if (user) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-8 w-8 rounded-full">
            <Avatar className="h-8 w-8">
              {user.role === 'admin' ? (
                <AvatarFallback>
                  <UserCog className="h-5 w-5" />
                </AvatarFallback>
              ) : (
                user.photoURL ? (
                <Image
                  src={user.photoURL}
                  alt={user.displayName || 'User avatar'}
                  width={32}
                  height={32}
                  className="rounded-full object-cover"
                  data-ai-hint="user avatar"
                  unoptimized={true} // Good for external URLs or data URIs
                />
              ) : 
                <AvatarFallback>{getInitials(user.displayName)}</AvatarFallback>
              )}
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none truncate">
                {user.displayName || 'User'}
              </p>
              <p className="text-xs leading-none text-muted-foreground truncate">
                {user.email || 'No email'}
              </p>
              <div className="flex items-center pt-1">
                <Briefcase className="mr-1.5 h-3 w-3 text-muted-foreground" />
                <Badge
                  variant={user.role === 'admin' ? 'default' : 'secondary'}
                  className="text-[10px] px-1.5 py-0 leading-snug"
                >
                  {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                </Badge>
              </div>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <Link href="/profile" passHref>
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
            </Link>
            {user.role === 'admin' && (
              <Link href="/users" passHref>
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>User Management</span>
                </DropdownMenuItem>
              </Link>
            )}
             {user.role === 'admin' && projectConfig.enableApplicationConfig && (
                <Link href="/config-advisor" passHref>
                    <DropdownMenuItem>
                        <ShieldQuestion className="mr-2 h-4 w-4" />
                        <span>Application Config</span>
                    </DropdownMenuItem>
                </Link>
            )}
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={logout}>
            <LogOut className="mr-2 h-4 w-4" />
            <span>Log out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  } else {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-8 w-8 rounded-full">
            <Avatar className="h-8 w-8">
              <AvatarFallback>
                <User className="h-5 w-5" />
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">
                Guest
              </p>
              <p className="text-xs leading-none text-muted-foreground">
                Not logged in
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <Link href="/auth/login" passHref>
            <DropdownMenuItem>
              <LogIn className="mr-2 h-4 w-4" />
              <span>Login</span>
            </DropdownMenuItem>
          </Link>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }
}
