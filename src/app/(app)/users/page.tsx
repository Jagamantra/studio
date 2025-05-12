
'use client';

import * as React from 'react';
import { useAuth } from '@/contexts/auth-provider';
import { DataTable } from '@/components/ui/data-table';
import type { ColumnDef } from '@tanstack/react-table';
import type { UserProfile } from '@/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Edit, Trash2, UserPlus, ShieldAlert, Loader2, AlertTriangle } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';

// Mock data for users - in a real app, this would come from Firebase/Firestore
const mockUsers: UserProfile[] = [
  { uid: '1', email: 'admin@example.com', displayName: 'Admin User', photoURL: 'https://picsum.photos/seed/user1/40/40', phoneNumber: '123-456-7890', role: 'admin' },
  { uid: '2', email: 'user1@example.com', displayName: 'Regular User One', photoURL: 'https://picsum.photos/seed/user2/40/40', phoneNumber: '987-654-3210', role: 'user' },
  { uid: '3', email: 'user2@example.com', displayName: 'Another User', photoURL: null, phoneNumber: null, role: 'user' },
];


export default function UsersPage() {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [users, setUsers] = React.useState<UserProfile[]>(mockUsers); // Replace with actual data fetching
  const [isLoading, setIsLoading] = React.useState(false); // For data table operations

  const [isAddUserDialogOpen, setIsAddUserDialogOpen] = React.useState(false);
  const [isEditUserDialogOpen, setIsEditUserDialogOpen] = React.useState(false);
  const [editingUser, setEditingUser] = React.useState<UserProfile | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
  const [deletingUser, setDeletingUser] = React.useState<UserProfile | null>(null);

  // TODO: Implement actual data fetching and mutations with Firebase
  React.useEffect(() => {
    // Example: fetchUsers().then(setUsers).catch(err => console.error(err));
    // For now, using mockUsers
  }, []);

  const handleAddUser = () => {
    console.log("Add new user action");
    // Placeholder for new user form logic
    setEditingUser(null); // Clear any previous editing state
    setIsAddUserDialogOpen(true);
  };

  const handleEditUser = (userData: UserProfile) => {
    console.log("Edit user:", userData);
    setEditingUser(userData);
    setIsEditUserDialogOpen(true);
  };

  const handleDeleteUser = (userData: UserProfile) => {
    console.log("Delete user:", userData);
    setDeletingUser(userData);
    setIsDeleteDialogOpen(true);
  };
  
  const confirmDeleteUser = async () => {
    if (!deletingUser) return;
    setIsLoading(true);
    // TODO: Call Firebase function to delete user (auth and firestore)
    // Example: await deleteUserOnServer(deletingUser.uid);
    console.log("Confirmed delete user:", deletingUser.uid);
    setUsers(prev => prev.filter(u => u.uid !== deletingUser.uid)); // Optimistic update
    toast({ title: "User Deleted", description: `${deletingUser.displayName} has been removed.` });
    setIsLoading(false);
    setIsDeleteDialogOpen(false);
    setDeletingUser(null);
  };

  const columns: ColumnDef<UserProfile>[] = [
    { accessorKey: "displayName", header: "Name" },
    { accessorKey: "email", header: "Email" },
    { 
      accessorKey: "role", 
      header: "Role",
      cell: ({ row }) => <Badge variant={row.original.role === 'admin' ? 'default' : 'secondary'}>{row.original.role}</Badge>
    },
    { accessorKey: "phoneNumber", header: "Phone", cell: ({row}) => row.original.phoneNumber || "N/A" },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => handleEditUser(row.original)}>
              <Edit className="mr-2 h-4 w-4" /> Edit User
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => handleDeleteUser(row.original)} className="text-destructive focus:text-destructive focus:bg-destructive/10">
              <Trash2 className="mr-2 h-4 w-4" /> Delete User
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  if (authLoading) {
     return <div className="flex flex-1 items-center justify-center p-4"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  if (user?.role !== 'admin') {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-4 md:p-8 text-center">
        <ShieldAlert className="h-12 w-12 md:h-16 md:w-16 text-destructive mb-4" />
        <h1 className="text-xl md:text-2xl font-bold">Access Denied</h1>
        <p className="text-sm md:text-base text-muted-foreground mt-2">
          You do not have permission to view this page. Please contact an administrator if you believe this is an error.
        </p>
        <Button asChild className="mt-6">
          <Link href="/dashboard">Go to Dashboard</Link>
        </Button>
      </div>
    );
  }


  return (
    <div className="flex-1 space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">User Management</h1>
        <Button onClick={handleAddUser} disabled={isLoading} size="sm">
          <UserPlus className="mr-2 h-4 w-4" /> Add User
        </Button>
      </div>
      <DataTable columns={columns} data={users} searchColumnId="email" onAdd={handleAddUser} isLoading={isLoading}/>

      {/* Add/Edit User Dialog (Simplified) */}
      <Dialog open={isAddUserDialogOpen || isEditUserDialogOpen} onOpenChange={isEditUserDialogOpen ? setIsEditUserDialogOpen : setIsAddUserDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-lg md:text-xl">{editingUser ? 'Edit User' : 'Add New User'}</DialogTitle>
            <DialogDescription>
              {editingUser ? `Update details for ${editingUser.displayName}.` : 'Enter details for the new user.'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {/* Basic form example, use react-hook-form for real implementation */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right text-xs sm:text-sm">Name</Label>
              <Input id="name" defaultValue={editingUser?.displayName || ''} className="col-span-3 h-9" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right text-xs sm:text-sm">Email</Label>
              <Input id="email" type="email" defaultValue={editingUser?.email || ''} className="col-span-3 h-9" />
            </div>
             <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="role" className="text-right text-xs sm:text-sm">Role</Label>
              {/* Replace with Select component from shadcn/ui */}
              <select id="role" defaultValue={editingUser?.role || 'user'} className="col-span-3 h-9 p-2 border rounded-md text-xs sm:text-sm">
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" size="sm">Cancel</Button>
            </DialogClose>
            <Button onClick={() => { /* TODO: Implement save logic */ 
              toast({title: "Action Placeholder", description: "Save functionality not fully implemented."});
              isEditUserDialogOpen ? setIsEditUserDialogOpen(false) : setIsAddUserDialogOpen(false);
            }} size="sm">
              {editingUser ? 'Save Changes' : 'Create User'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-lg md:text-xl">Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription className="text-xs sm:text-sm">
              This action cannot be undone. This will permanently delete the user account 
              for <span className="font-semibold">{deletingUser?.displayName}</span> and remove their data from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading} size="sm">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteUser} className="bg-destructive text-destructive-foreground hover:bg-destructive/90" disabled={isLoading} size="sm">
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete User
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
