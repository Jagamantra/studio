
'use client';

import type { ColumnDef } from '@tanstack/react-table';
import type { UserProfile } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Edit, Trash2, UserCog } from 'lucide-react';
import Image from 'next/image';

interface CreateUserTableColumnsProps {
  openEditUserModal: (userData: UserProfile) => void;
  openDeleteDialog: (userData: UserProfile) => void;
  currentUserUid?: string | null;
}

export function createUserTableColumns({
  openEditUserModal,
  openDeleteDialog,
  currentUserUid,
}: CreateUserTableColumnsProps): ColumnDef<UserProfile>[] {

  return [
    {
      accessorKey: "displayName",
      header: "Name",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          {row.original.photoURL ? (
             <Image 
                src={row.original.photoURL} 
                alt={row.original.displayName || 'avatar'} 
                width={32} 
                height={32} 
                className="h-8 w-8 rounded-full object-cover" 
                data-ai-hint="user avatar"
                unoptimized={true} // if photoURL can be external
              />
          ) : (
            <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground text-xs">
              {row.original.displayName?.charAt(0).toUpperCase() || <UserCog className="h-4 w-4"/>}
            </div>
          )}
          <span className="truncate max-w-[100px] xs:max-w-[120px] sm:max-w-xs">{row.original.displayName || "N/A"}</span>
        </div>
      )
    },
    { accessorKey: "email", header: "Email", cell: ({row}) => <span className="truncate block max-w-[120px] xs:max-w-[150px] sm:max-w-xs">{row.original.email}</span> },
    {
      accessorKey: "role",
      header: "Role",
      cell: ({ row }) => <Badge variant={row.original.role === 'admin' ? 'default' : 'secondary'} className="capitalize">{row.original.role}</Badge>
    },
    { accessorKey: "phoneNumber", header: "Phone", cell: ({row}) => <span className="truncate block max-w-[100px] sm:max-w-xs">{row.original.phoneNumber || "N/A"}</span> },
    {
      id: "actions",
      header: () => <div className="text-right">Actions</div>,
      cell: ({ row, table }) => {
        const isLoading = (table.options.meta as any)?.isLoading || false;

        return (
          <div className="text-right">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0" disabled={isLoading}>
                  <span className="sr-only">Open menu</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => openEditUserModal(row.original)} disabled={isLoading}>
                  <Edit className="mr-2 h-4 w-4" /> Edit User
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => openDeleteDialog(row.original)}
                  className="text-destructive focus:text-destructive focus:bg-destructive/10"
                  disabled={isLoading || (currentUserUid === row.original.uid)}
                >
                  <Trash2 className="mr-2 h-4 w-4" /> Delete User
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
    },
  ];
}
