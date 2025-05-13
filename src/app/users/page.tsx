
'use client';

import * as React from 'react';
import { useAuth } from '@/contexts/auth-provider';
import { DataTable } from '@/components/ui/data-table';
import type { UserProfile } from '@/types';
import { Button } from '@/components/ui/button';
import { Loader2, UserPlus, ShieldAlert } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import * as api from '@/services/api';
import { UserFormDialog } from '@/components/users/user-form-dialog';
import { UserDeleteDialog } from '@/components/users/user-delete-dialog';
import { createUserTableColumns } from '@/components/users/user-table-columns';
import { AuthenticatedPageLayout } from '@/components/layout/authenticated-page-layout';

export default function UsersPage() {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [users, setUsers] = React.useState<UserProfile[]>([]);
  const [tableLoading, setTableLoading] = React.useState(false);

  const [isUserModalOpen, setIsUserModalOpen] = React.useState(false);
  const [editingUser, setEditingUser] = React.useState<UserProfile | null>(null);
  
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
  const [deletingUser, setDeletingUser] = React.useState<UserProfile | null>(null);

  const fetchAndSetUsers = React.useCallback(async () => {
    setTableLoading(true);
    try {
      const fetchedUsers = await api.fetchUsers();
      setUsers(fetchedUsers);
    } catch (error: any) {
      toast({ title: "Error fetching users", description: error.message || "Could not load user data.", variant: "destructive" });
      setUsers([]);
    } finally {
      setTableLoading(false);
    }
  }, [toast]);

  React.useEffect(() => {
    fetchAndSetUsers();
  }, [fetchAndSetUsers]);

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
    try {
      await api.deleteUser(deletingUser.uid);
      toast({ title: "User Deleted", description: `${deletingUser.displayName} has been removed.` });
      await fetchAndSetUsers();
    } catch (error: any) {
      toast({ title: "Error Deleting User", description: error.message || "Could not delete user.", variant: "destructive" });
    } finally {
      setTableLoading(false);
      setIsDeleteDialogOpen(false);
      setDeletingUser(null);
    }
  };

  const handleUserFormSubmit = async (values: Omit<UserProfile, 'uid' | 'photoURL' | 'password'> & { password?: string }) => {
    setTableLoading(true);
    try {
      if (editingUser) { 
        await api.updateUser(editingUser.uid, values);
        toast({ title: "User Updated", description: `${values.displayName} has been updated.` });
      } else { 
        await api.addUser(values);
        toast({ title: "User Added", description: `${values.displayName} has been created.` });
      }
      await fetchAndSetUsers();
    } catch (error: any) {
      toast({ title: editingUser ? "Error Updating User" : "Error Adding User", description: error.message || "Operation failed.", variant: "destructive" });
    } finally {
      setTableLoading(false);
      setIsUserModalOpen(false);
      setEditingUser(null);
    }
  };

  const columns = React.useMemo(
    () => createUserTableColumns({ openEditUserModal, openDeleteDialog, tableLoading, currentUserUid: user?.uid }),
    [tableLoading, user?.uid] 
  );
  
  const anyLoading = authLoading || tableLoading;

  if (authLoading && !users.length) {
     return (
      <AuthenticatedPageLayout>
        <div className="flex flex-1 items-center justify-center p-4"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
      </AuthenticatedPageLayout>
     );
  }
  
  const effectiveUserRole = user?.role; 
  if (effectiveUserRole !== 'admin') {
    return (
      <AuthenticatedPageLayout>
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
      </AuthenticatedPageLayout>
    );
  }

  return (
    <AuthenticatedPageLayout>
      <div className="space-y-4 md:space-y-6 min-w-0"> 
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">User Management</h1>
          <Button onClick={openAddUserModal} disabled={anyLoading} size="sm">
            {tableLoading && isUserModalOpen && !editingUser ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UserPlus className="mr-2 h-4 w-4" />} 
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
          isLoading={tableLoading}
        />
        
        <UserDeleteDialog
          isOpen={isDeleteDialogOpen}
          onOpenChange={setIsDeleteDialogOpen}
          deletingUser={deletingUser}
          onConfirmDelete={confirmDeleteUser}
          isLoading={tableLoading}
        />
      </div>
    </AuthenticatedPageLayout>
  );
}

