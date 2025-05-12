'use client';

import * as React from 'react';
import { useAuth } from '@/contexts/auth-provider';
import { DataTable } from '@/components/ui/data-table';
import type { UserProfile } from '@/types';
import { Button } from '@/components/ui/button';
import { Loader2, UserPlus, ShieldAlert } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { initialMockUsersData } from '@/data/dummy-data';
import { UserFormDialog } from '@/components/users/user-form-dialog';
import { UserDeleteDialog } from '@/components/users/user-delete-dialog';
import { createUserTableColumns } from '@/components/users/user-table-columns';

export default function UsersPage() {
  const { user, loading: authLoading, isConfigured } = useAuth();
  const { toast } = useToast();
  const [users, setUsers] = React.useState<UserProfile[]>([]);
  const [tableLoading, setTableLoading] = React.useState(false);

  const [isUserModalOpen, setIsUserModalOpen] = React.useState(false);
  const [editingUser, setEditingUser] = React.useState<UserProfile | null>(null);
  
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
  const [deletingUser, setDeletingUser] = React.useState<UserProfile | null>(null);

  React.useEffect(() => {
    setTableLoading(true);
    setTimeout(() => {
      if (typeof window !== 'undefined' && !isConfigured) {
        const storedUsers = localStorage.getItem('genesis_dummy_users');
        setUsers(storedUsers ? JSON.parse(storedUsers) : initialMockUsersData);
      } else {
         setUsers(initialMockUsersData);
      }
      setTableLoading(false);
    }, 300);
  }, [isConfigured]);

  const openAddUserModal = () => {
    setEditingUser(null);
    setIsUserModalOpen(true);
  };

  const openEditUserModal = (userData: UserProfile) => {
    setEditingUser(userData);
    setIsUserModalOpen(true);
  };

  const openDeleteDialog = (userData: UserProfile) => {
    setDeletingUser(userData);
    setIsDeleteDialogOpen(true);
  };
  
  const confirmDeleteUser = async () => {
    if (!deletingUser) return;
    setTableLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const updatedUsers = users.filter(u => u.uid !== deletingUser.uid);
    setUsers(updatedUsers);
    if (typeof window !== 'undefined' && !isConfigured) {
      localStorage.setItem('genesis_dummy_users', JSON.stringify(updatedUsers));
    }

    toast({ title: "User Deleted", description: `${deletingUser.displayName} has been removed.` });
    setTableLoading(false);
    setIsDeleteDialogOpen(false);
    setDeletingUser(null);
  };

  const handleUserFormSubmit = async (values: Omit<UserProfile, 'uid' | 'photoURL' | 'password'> & { password?: string }) => {
    setTableLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));

    let updatedUsersList: UserProfile[];

    if (editingUser) { 
      updatedUsersList = users.map(u => 
        u.uid === editingUser.uid ? { ...editingUser, ...values, password: u.password } : u 
      );
      toast({ title: "User Updated", description: `${values.displayName} has been updated.` });
    } else { 
      const newUser: UserProfile = {
        uid: `mock-${Date.now()}`, 
        ...values,
        photoURL: null, 
      };
      updatedUsersList = [newUser, ...users];
      toast({ title: "User Added", description: `${values.displayName} has been created.` });
    }
    setUsers(updatedUsersList);
    if (typeof window !== 'undefined' && !isConfigured) {
      localStorage.setItem('genesis_dummy_users', JSON.stringify(updatedUsersList));
    }
    setTableLoading(false);
    setIsUserModalOpen(false);
    setEditingUser(null);
  };

  const columns = React.useMemo(
    () => createUserTableColumns({ openEditUserModal, openDeleteDialog, tableLoading, currentUserUid: user?.uid, isConfigured }),
    [tableLoading, user?.uid, isConfigured] 
  );
  
  const anyLoading = authLoading || tableLoading;

  if (authLoading) {
     return <div className="flex flex-1 items-center justify-center p-4"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }
  
  const effectiveUserRole = user?.role;

  if (effectiveUserRole !== 'admin') {
    return (
      <div className="flex flex-col flex-1 items-center justify-center p-4 md:p-8 text-center">
        <ShieldAlert className="h-12 w-12 md:h-16 md:w-16 text-destructive mb-4" />
        <h1 className="text-xl md:text-2xl font-bold">Access Denied</h1>
        <p className="text-sm md:text-base text-muted-foreground mt-2">
          You do not have permission to view this page. This feature is for administrators only.
        </p>
        <Button asChild className="mt-6">
          <Link href="/dashboard">Go to Dashboard</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6"> {/* Removed flex-1 */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">User Management</h1>
        <Button onClick={openAddUserModal} disabled={anyLoading} size="sm">
          {anyLoading && isUserModalOpen && !editingUser ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UserPlus className="mr-2 h-4 w-4" />} 
          <span className="hidden sm:inline">Add User</span>
          <span className="sm:hidden">Add</span>
        </Button>
      </div>
      <DataTable columns={columns} data={users} searchColumnId="email" onAdd={openAddUserModal} isLoading={anyLoading}/>

      <UserFormDialog
        isOpen={isUserModalOpen}
        onOpenChange={setIsUserModalOpen}
        editingUser={editingUser}
        onSubmit={handleUserFormSubmit}
        isLoading={anyLoading}
      />
      
      <UserDeleteDialog
        isOpen={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        deletingUser={deletingUser}
        onConfirmDelete={confirmDeleteUser}
        isLoading={anyLoading}
      />
    </div>
  );
}
