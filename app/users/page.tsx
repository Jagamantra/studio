'use client';

import * as React from 'react';
import { useAuth } from '@/contexts/auth-provider';
import { DataTable } from '@/components/ui/data-table';
import type { UserProfile } from '@/types';
import { Button } from '@/components/ui/button';
import { Loader2, UserPlus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import * as api from '@/services/api';
import { UserFormDialog } from '@/components/users/user-form-dialog';
import { UserDeleteDialog } from '@/components/users/user-delete-dialog';
import { createUserTableColumns } from '@/components/users/user-table-columns';
import { AuthenticatedPageLayout } from '@/components/layout/authenticated-page-layout';

export default function UsersPage() {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = React.useState(false);

  const [users, setUsers] = React.useState<UserProfile[]>([]);
  const [tableLoading, setTableLoading] = React.useState(false);
  const [isUserModalOpen, setIsUserModalOpen] = React.useState(false);
  const [editingUser, setEditingUser] = React.useState<UserProfile | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
  const [deletingUser, setDeletingUser] = React.useState<UserProfile | null>(null);

  React.useEffect(() => {
    if (!authLoading) {
      if (user && user.role === 'admin') {
        setIsAuthorized(true);
        fetchAndSetUsers();
      } else if (user) { 
        toast({
          title: 'Access Denied',
          message: 'You do not have permission to view the User Management page.',
          variant: 'destructive',
        });
        router.replace('/dashboard');
      } else { 
        router.replace('/auth/login');
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, authLoading, router, toast]);


  const fetchAndSetUsers = React.useCallback(async () => {
    setTableLoading(true);
    try {
      const fetchedUsers = await api.fetchUsers();
      setUsers(fetchedUsers);
    } catch (error: any) {
      toast({ title: "Error fetching users", message: error.message || "Could not load user data.", variant: "destructive" });
      setUsers([]);
    } finally {
      setTableLoading(false);
    }
  }, [toast]);

  const openAddUserModal = React.useCallback(() => {
    setEditingUser(null);
    setIsUserModalOpen(true);
  }, []);

  const openEditUserModal = React.useCallback((userData: UserProfile) => {
    setEditingUser(userData);
    setIsUserModalOpen(true);
  }, []);

  const openDeleteDialog = React.useCallback((userData: UserProfile) => {
    setDeletingUser(userData);
    setIsDeleteDialogOpen(true);
  }, []);
  
  const confirmDeleteUser = React.useCallback(async () => {
    if (!deletingUser) return;
    setTableLoading(true);
    try {
      await api.deleteUser(deletingUser.uid);
      toast({ 
        title: "User Deleted", 
        message: `${deletingUser.displayName} has been removed.`,
        action: { label: "Undo", onClick: () => console.log("Undo delete (mock)")} 
      });
      await fetchAndSetUsers();
    } catch (error: any) {
      toast({ title: "Error Deleting User", message: error.message || "Could not delete user.", variant: "destructive" });
    } finally {
      setTableLoading(false);
      setIsDeleteDialogOpen(false);
      setDeletingUser(null);
    }
  }, [deletingUser, fetchAndSetUsers, toast]);

  const handleUserFormSubmit = React.useCallback(async (values: Omit<UserProfile, 'uid' | 'photoURL' | 'password'> & { password?: string }) => {
    setTableLoading(true);
    try {
      if (editingUser) { 
        await api.updateUser(editingUser.uid, values);
        toast({ title: "User Updated", message: `${values.displayName} has been updated.`, variant: "success" });
      } else { 
        await api.addUser(values);
        toast({ title: "User Added", message: `${values.displayName} has been created.`, variant: "success" });
      }
      await fetchAndSetUsers();
    } catch (error: any) {
      toast({ title: editingUser ? "Error Updating User" : "Error Adding User", message: error.message || "Operation failed.", variant: "destructive" });
    } finally {
      setTableLoading(false);
      setIsUserModalOpen(false);
      setEditingUser(null);
    }
  }, [editingUser, fetchAndSetUsers, toast]);

  const columns = React.useMemo(
    () => createUserTableColumns({ openEditUserModal, openDeleteDialog, tableLoading, currentUserUid: user?.uid }),
    [openEditUserModal, openDeleteDialog, tableLoading, user?.uid] 
  );
  
  const anyPageLoading = authLoading || tableLoading || !isAuthorized;

  if (authLoading || !isAuthorized) {
     return (
      <AuthenticatedPageLayout>
        <div className="flex flex-1 items-center justify-center p-4"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
      </AuthenticatedPageLayout>
     );
  }

  return (
    <AuthenticatedPageLayout>
      <div className="space-y-4 md:space-y-6 min-w-0"> 
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">User Management</h1>
          <Button onClick={openAddUserModal} disabled={anyPageLoading} size="sm">
            {tableLoading && isUserModalOpen && !editingUser ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UserPlus className="mr-2 h-4 w-4" />} 
            <span className="hidden sm:inline">Add User</span>
            <span className="sm:hidden">Add</span>
          </Button>
        </div>
        <DataTable columns={columns} data={users} searchColumnId="email" onAdd={openAddUserModal} isLoading={anyPageLoading}/>

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
