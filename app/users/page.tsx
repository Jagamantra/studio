
'use client';

import * as React from 'react';
import { useAuth } from '@/contexts/auth-context';
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
    // Set document title dynamically
    document.title = `User Management | ${appName}`;
  }, [appName]);

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

  React.useEffect(() => {
    if (authLoading) return; 

    if (user && user.role === 'admin') {
      setIsAuthorized(true);
      if (!hasFetchedInitialData && !tableLoading) {
        fetchAndSetUsers().then(() => setHasFetchedInitialData(true));
      }
    } else if (user) { 
      // Non-admin user, AuthProvider will handle redirection via useEffect
      // if user is not admin, they should be redirected by the AuthProvider's navigation logic
      // No explicit router.push here to avoid multiple redirects/toast messages.
      setIsAuthorized(false);
    } else { 
      // No user, AuthProvider will handle redirection
      setIsAuthorized(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, authLoading, fetchAndSetUsers, hasFetchedInitialData, tableLoading]);


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

  const currentUserId = user?.uid;

  const columns = React.useMemo(
    () => createUserTableColumns({ openEditUserModal, openDeleteDialog, currentUserUid: currentUserId }),
    [openEditUserModal, openDeleteDialog, currentUserId]
  );

  if (authLoading || (user && user.role !== 'admin' && !isAuthorized) || (!user && !authLoading)) {
     return (
      <AuthenticatedPageLayout>
        <div className="flex flex-1 items-center justify-center p-4"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
      </AuthenticatedPageLayout>
     );
  }
  
  // This check should be handled by AuthProvider's redirect logic.
  // If AuthProvider has done its job, a non-admin user should not even reach this page content.
  // The Loader2 above handles the brief period while AuthProvider is deciding.

  return (
    <AuthenticatedPageLayout>
      <div className="space-y-4 md:space-y-6 min-w-0">
        <PageTitleWithIcon title="User Management">
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

