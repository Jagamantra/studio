
'use client';

import * as React from 'react';
import { useAuth } from '@/contexts/auth-provider';
import { DataTable } from '@/components/ui/data-table';
import type { ColumnDef } from '@tanstack/react-table';
import type { UserProfile, Role } from '@/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Edit, Trash2, UserPlus, ShieldAlert, Loader2, AlertTriangle, UserCog } from 'lucide-react';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { rolesConfig } from '@/config/roles.config';


// Mock data for users - in a real app, this would come from Firebase/Firestore
const initialMockUsers: UserProfile[] = [
  { uid: '1', email: 'admin@example.com', displayName: 'Admin User', photoURL: 'https://picsum.photos/seed/user1/40/40', phoneNumber: '123-456-7890', role: 'admin' },
  { uid: '2', email: 'user1@example.com', displayName: 'Regular User One', photoURL: 'https://picsum.photos/seed/user2/40/40', phoneNumber: '987-654-3210', role: 'user' },
  { uid: '3', email: 'user2@example.com', displayName: 'Another User', photoURL: null, phoneNumber: null, role: 'user' },
];

const userFormSchema = z.object({
  displayName: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Invalid email address." }),
  role: z.enum(rolesConfig.roles as [Role, ...Role[]], { message: "Invalid role." }),
  phoneNumber: z.string().optional().nullable(),
  // password field might be needed for 'add user' if not using Firebase Auth to create users
});

type UserFormValues = z.infer<typeof userFormSchema>;

export default function UsersPage() {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [users, setUsers] = React.useState<UserProfile[]>(initialMockUsers);
  const [tableLoading, setTableLoading] = React.useState(false); // For data table operations like delete

  const [isUserModalOpen, setIsUserModalOpen] = React.useState(false);
  const [editingUser, setEditingUser] = React.useState<UserProfile | null>(null);
  
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
  const [deletingUser, setDeletingUser] = React.useState<UserProfile | null>(null);

  const form = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      displayName: '',
      email: '',
      role: 'user',
      phoneNumber: '',
    },
  });

  React.useEffect(() => {
    if (editingUser) {
      form.reset({
        displayName: editingUser.displayName || '',
        email: editingUser.email || '',
        role: editingUser.role,
        phoneNumber: editingUser.phoneNumber || '',
      });
    } else {
      form.reset({
        displayName: '',
        email: '',
        role: 'user',
        phoneNumber: '',
      });
    }
  }, [editingUser, form, isUserModalOpen]);


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
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    setUsers(prev => prev.filter(u => u.uid !== deletingUser.uid));
    toast({ title: "User Deleted", description: `${deletingUser.displayName} has been removed.` });
    setTableLoading(false);
    setIsDeleteDialogOpen(false);
    setDeletingUser(null);
  };

  const handleUserFormSubmit = async (values: UserFormValues) => {
    setTableLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));

    if (editingUser) { // Editing existing user
      setUsers(prevUsers => prevUsers.map(u => 
        u.uid === editingUser.uid ? { ...editingUser, ...values } : u
      ));
      toast({ title: "User Updated", description: `${values.displayName} has been updated.` });
    } else { // Adding new user
      const newUser: UserProfile = {
        uid: `mock-${Date.now()}`, // Simple unique ID for mock
        ...values,
        photoURL: null, // New users won't have a photoURL by default
      };
      setUsers(prevUsers => [newUser, ...prevUsers]);
      toast({ title: "User Added", description: `${values.displayName} has been created.` });
    }
    setTableLoading(false);
    setIsUserModalOpen(false);
    setEditingUser(null);
  };


  const columns: ColumnDef<UserProfile>[] = [
    { 
      accessorKey: "displayName", 
      header: "Name",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          {row.original.photoURL ? (
            <img src={row.original.photoURL} alt={row.original.displayName || 'avatar'} className="h-8 w-8 rounded-full object-cover" data-ai-hint="user avatar" />
          ) : (
            <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground text-xs">
              {row.original.displayName?.charAt(0).toUpperCase() || <UserCog className="h-4 w-4"/>}
            </div>
          )}
          <span className="truncate max-w-[150px] sm:max-w-xs">{row.original.displayName || "N/A"}</span>
        </div>
      )
    },
    { accessorKey: "email", header: "Email", cell: ({row}) => <span className="truncate block max-w-[150px] sm:max-w-xs">{row.original.email}</span> },
    { 
      accessorKey: "role", 
      header: "Role",
      cell: ({ row }) => <Badge variant={row.original.role === 'admin' ? 'default' : 'secondary'} className="capitalize">{row.original.role}</Badge>
    },
    { accessorKey: "phoneNumber", header: "Phone", cell: ({row}) => row.original.phoneNumber || "N/A" },
    {
      id: "actions",
      header: () => <div className="text-right">Actions</div>,
      cell: ({ row }) => (
        <div className="text-right">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => openEditUserModal(row.original)}>
                <Edit className="mr-2 h-4 w-4" /> Edit User
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => openDeleteDialog(row.original)} className="text-destructive focus:text-destructive focus:bg-destructive/10">
                <Trash2 className="mr-2 h-4 w-4" /> Delete User
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
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
          You do not have permission to view this page. This feature is for administrators only.
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
        <Button onClick={openAddUserModal} disabled={tableLoading} size="sm">
          <UserPlus className="mr-2 h-4 w-4" /> Add User
        </Button>
      </div>
      <DataTable columns={columns} data={users} searchColumnId="email" onAdd={openAddUserModal} isLoading={tableLoading}/>

      {/* Add/Edit User Dialog */}
      <Dialog open={isUserModalOpen} onOpenChange={setIsUserModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg md:text-xl">{editingUser ? 'Edit User' : 'Add New User'}</DialogTitle>
            <DialogDescription>
              {editingUser ? `Update details for ${editingUser.displayName}.` : 'Enter details for the new user.'}
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleUserFormSubmit)} className="space-y-4 py-2">
              <FormField
                control={form.control}
                name="displayName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl><Input placeholder="John Doe" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl><Input type="email" placeholder="name@example.com" {...field} disabled={!!editingUser} /></FormControl>
                    {editingUser && <FormDescription className="text-xs">Email cannot be changed for existing users (mock limitation).</FormDescription>}
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a role" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {rolesConfig.roles.filter(role => role !== 'guest').map(role => ( // Exclude guest for user assignment
                          <SelectItem key={role} value={role} className="capitalize">
                            {role}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="phoneNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number (Optional)</FormLabel>
                    <FormControl><Input type="tel" placeholder="+1 123 456 7890" {...field} value={field.value || ''} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* Add password field for new users if needed, e.g., if not using Firebase Auth creation directly */}
              {!editingUser && (
                <FormField
                  control={form.control}
                  name="password" // Assuming you add 'password' to UserFormValues and schema for new users
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl><Input type="password" placeholder="••••••••" {...field} /></FormControl>
                      <FormDescription className="text-xs">Required for new users. Min 8 characters (mock limitation).</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              <DialogFooter className="pt-4">
                <DialogClose asChild>
                  <Button type="button" variant="outline" size="sm" disabled={tableLoading}>Cancel</Button>
                </DialogClose>
                <Button type="submit" size="sm" disabled={tableLoading}>
                  {tableLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {editingUser ? 'Save Changes' : 'Create User'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-lg md:text-xl">Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription className="text-xs sm:text-sm">
              This action cannot be undone. This will permanently delete the user account 
              for <span className="font-semibold">{deletingUser?.displayName}</span> and remove their data from our servers (mock deletion).
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={tableLoading} size="sm">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteUser} className="bg-destructive text-destructive-foreground hover:bg-destructive/90" disabled={tableLoading} size="sm">
              {tableLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete User
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

