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
import type { Metadata } from 'next';
import { projectConfig } from '@/config/project.config';
import { PageTitleWithIcon } from '@/components/layout/page-title-with-icon';
import { useTheme } from '@/contexts/theme-provider';


export default function UsersPage() {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const { appName } = useTheme();

  const [isAuthorized, setIsAuthorized] = React.useState(false);
  const [users, setUsers] = React.useState<UserProfile[]>([]);
  const [tableLoading, setTableLoading] = React.useState(false);
  const [isUserModalOpen, setIsUserModalOpen] = React.useState(false);
  const [editingUser, setEditingUser] = React.useState<UserProfile | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
  const [deletingUser, setDeletingUser] = React.useState<UserProfile | null>(null);
  const [hasFetchedInitialData, setHasFetchedInitialData] = React.useState(false);

  React.useEffect(() => {
    document.title = `User Management | ${appName}`;
  }, [appName]);

  const fetchAndSetUsers = React.useCallback(async () => {
    setTableLoading(true);
    try {
      const fetchedUsers = await api.fetchUsers();
      setUsers(fetchedUsers);
    } catch (error: any) {
      toast({ title: "Error fetching users", message: error.message || "Could not load user data.", variant: "destructive" });
      setUsers([]); // Clear users on error
    } finally {
      setTableLoading(false);
    }
  }, [toast]);

  React.useEffect(() => {
    if (authLoading) return; // Wait for auth to resolve

    if (user && user.role === 'admin') {
      setIsAuthorized(true);
      if (!hasFetchedInitialData && !tableLoading) {
        fetchAndSetUsers().then(() => setHasFetchedInitialData(true));
      }
    } else if (user) { // User exists but not admin
      setIsAuthorized(false);
      // AuthProvider handles redirection and toast message
    } else { // No user
      setIsAuthorized(false);
      // AuthProvider handles redirection
    }
  }, [user, authLoading, fetchAndSetUsers, hasFetchedInitialData, tableLoading, router]);


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
      await fetchAndSetUsers(); // Refresh data
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
      await fetchAndSetUsers(); // Refresh data
    } catch (error: any) {
      toast({ title: editingUser ? "Error Updating User" : "Error Adding User", message: error.message || "Operation failed.", variant: "destructive" });
    } finally {
      setTableLoading(false);
      setIsUserModalOpen(false);
      setEditingUser(null);
    }
  }, [editingUser, fetchAndSetUsers, toast]);

  const currentUserId = user?.uid;

  const columns = React.useMemo(
    () => createUserTableColumns({ openEditUserModal, openDeleteDialog, currentUserUid: currentUserId }),
    [openEditUserModal, openDeleteDialog, currentUserId]
  );

  // Show loader if auth is loading or if user is not admin (while AuthProvider handles redirect)
  if (authLoading || (user && user.role !== 'admin' && !isAuthorized) || (!user && !authLoading)) {
     return (
      <AuthenticatedPageLayout>
        <div className="flex flex-1 items-center justify-center p-4"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
      </AuthenticatedPageLayout>
     );
  }
  
  // If auth is resolved, user exists, but role is not admin, and isAuthorized is false (redundant check, but safe)
  if (!authLoading && user && user.role !== 'admin') {
    // This case should ideally be handled by AuthProvider redirection before this component renders significantly.
    // If it does render, show a loader while redirecting.
    return (
      <AuthenticatedPageLayout>
        <div className="flex flex-1 items-center justify-center p-4"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
      </AuthenticatedPageLayout>
    );
  }


  return (
    <AuthenticatedPageLayout>
      <div className="space-y-4 md:space-y-6 min-w-0">
        <PageTitleWithIcon title="User Management">
          <Button onClick={openAddUserModal} disabled={tableLoading || !isAuthorized} size="sm">
            {tableLoading && isUserModalOpen && !editingUser ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UserPlus className="mr-2 h-4 w-4" />}
            <span className="hidden sm:inline">Add User</span>
            <span className="sm:hidden">Add</span>
          </Button>
        </PageTitleWithIcon>
        
        <DataTable columns={columns} data={users} searchColumnId="email" onAdd={openAddUserModal} isLoading={tableLoading}/>

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
