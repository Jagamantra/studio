
'use client';

import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Loader2 } from 'lucide-react';
import { rolesConfig } from '@/config/roles.config';
import type { UserProfile, Role } from '@/types';

const userFormSchemaBase = z.object({
  displayName: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Invalid email address." }),
  role: z.enum(rolesConfig.roles as [Role, ...Role[]], { message: "Invalid role." }),
  phoneNumber: z.string().optional().nullable(),
});

// Define a type for form values including optional password
type UserFormValues = z.infer<typeof userFormSchemaBase> & { password?: string };

interface UserFormDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  editingUser: UserProfile | null;
  onSubmit: (values: UserFormValues) => Promise<void>;
  isLoading: boolean;
}

// Export the corrected version
export function UserFormDialog({ isOpen, onOpenChange, editingUser, onSubmit, isLoading }: UserFormDialogProps) {
  const formId = React.useId(); // Create a unique ID for the form

  const userFormSchema = userFormSchemaBase.extend({
    password: editingUser ? z.string().optional() : z.string().min(8, { message: "Password must be at least 8 characters for new users." })
  });
  
  const form = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      displayName: '',
      email: '',
      role: 'user',
      phoneNumber: '',
      password: '',
    },
  });

  React.useEffect(() => {
    if (isOpen) { // Reset form only when dialog opens
      if (editingUser) {
        form.reset({
          displayName: editingUser.displayName || '',
          email: editingUser.email || '',
          role: editingUser.role,
          phoneNumber: editingUser.phoneNumber || '',
          password: '', 
        });
      } else {
        form.reset({
          displayName: '',
          email: '',
          role: 'user',
          phoneNumber: '',
          password: '',
        });
      }
    }
  }, [editingUser, form, isOpen]);


  // The onSubmit for the form tag will be form.handleSubmit(onSubmit)
  // The onSubmit passed to the component is the actual submission logic
  const internalFormSubmit = (values: UserFormValues) => {
    onSubmit(values);
  };


  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg flex flex-col max-h-[85vh]"> {/* DialogContent is flex col with max height */}
        <DialogHeader>
          <DialogTitle className="text-lg md:text-xl">{editingUser ? 'Edit User' : 'Add New User'}</DialogTitle>
          <DialogDescription>
            {editingUser ? `Update details for ${editingUser.displayName}.` : 'Enter details for the new user.'}
          </DialogDescription>
        </DialogHeader>
        
        {/* Scrollable area for the form */}
        <div className="flex-grow overflow-y-auto py-4 pr-3"> {/* pr-3 for scrollbar space */}
          <Form {...form}>
            <form 
              id={formId} // Assign the unique ID here
              onSubmit={form.handleSubmit(internalFormSubmit)} 
              className="space-y-0" // Remove space-y-0 if grid handles all spacing
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-5"> {/* Grid for form fields, increased gap-y */}
                <FormField
                  control={form.control}
                  name="displayName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl><Input placeholder="John Doe" {...field} disabled={isLoading} /></FormControl>
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
                      <FormControl><Input type="email" placeholder="name@example.com" {...field} disabled={!!editingUser || isLoading} /></FormControl>
                      {editingUser && <FormDescription className="text-xs">Email cannot be changed.</FormDescription>}
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
                      <Select onValueChange={field.onChange} value={field.value} disabled={isLoading}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a role" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {rolesConfig.roles.filter(role => role !== 'guest').map(role => ( 
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
                      <FormControl><Input type="tel" placeholder="+1 123 456 7890" {...field} value={field.value || ''} disabled={isLoading} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {!editingUser && (
                  <div className="sm:col-span-2">
                    <FormField
                      control={form.control}
                      name="password" 
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password</FormLabel>
                          <FormControl><Input type="password" placeholder="••••••••" {...field} disabled={isLoading} /></FormControl>
                          <FormDescription className="text-xs">Required for new users. Min 8 characters.</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}
              </div>
            </form>
          </Form>
        </div>
        
        <DialogFooter className="pt-4 border-t mt-auto"> {/* Footer styling for bottom placement */}
          <DialogClose asChild>
            <Button type="button" variant="outline" size="sm" disabled={isLoading}>Cancel</Button>
          </DialogClose>
          <Button 
            type="submit" 
            form={formId} // Link button to the form
            size="sm" 
            disabled={isLoading || (!form.formState.isDirty && !!editingUser)} // Disable if not dirty when editing
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {editingUser ? 'Save Changes' : 'Create User'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
