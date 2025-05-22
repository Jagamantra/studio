'use client';

import { useEffect, useState } from "react";
import { Customer } from "@/types";
import { useAuth } from "@/contexts/auth-context";
import { DataTable } from "@/components/ui/data-table";
import { getCustomerColumns } from "@/components/customers/customer-table-columns";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { CustomerDialog } from "@/components/customers/customer-dialog";
import { useToast } from "@/hooks/use-toast";
import * as Api from "@/services/api";
import { PageTitleWithIcon } from "@/components/layout/page-title-with-icon";
import { AuthenticatedPageLayout } from "@/components/layout/authenticated-page-layout";
import { customerFormSchema } from "@/lib/schemas/customer";
import type { z } from "zod";

export default function CustomersPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const isAdmin = user?.role === "admin";
  
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | undefined>();
  const [dialogMode, setDialogMode] = useState<"create" | "edit">("create");

  // Fetch customers
  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const data = await Api.getCustomers();
        setCustomers(data);
      } catch (error) {
        console.error("Error fetching customers:", error);
        toast({
          message: "Failed to fetch customers",
          type: "error",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchCustomers();
  }, [toast]);

  const handleCreateCustomer = async (data: z.infer<typeof customerFormSchema>) => {
    try {
      const newCustomer = await Api.createCustomer({
        ...data,
        lastModified: new Date().toISOString(),
      });
      setCustomers(prev => [newCustomer, ...prev]);
      toast({
        message: "Customer created successfully",
        type: "success",
      });
    } catch (error) {
      console.error("Error creating customer:", error);
      toast({
        message: "Failed to create customer",
        type: "error",
      });
    }
  };

  const handleEditCustomer = async (data: z.infer<typeof customerFormSchema>) => {
    if (!selectedCustomer) return;
    try {
      const updatedCustomer = await Api.updateCustomer(selectedCustomer.id, {
        ...data,
        lastModified: new Date().toISOString(),
      });
      setCustomers(prev =>
        prev.map(c => (c.id === selectedCustomer.id ? updatedCustomer : c))
      );
      toast({
        message: "Customer updated successfully",
        type: "success",
      });
    } catch (error) {
      console.error("Error updating customer:", error);
      toast({
        message: "Failed to update customer",
        type: "error",
      });
    }
  };

  const handleDeleteCustomer = async (id: string) => {
    try {
      await Api.deleteCustomer(id);
      setCustomers(prev => prev.filter(c => c.id !== id));
      toast({
        message: "Customer deleted successfully",
        type: "success",
      });
    } catch (error) {
      console.error("Error deleting customer:", error);
      toast({
        message: "Failed to delete customer",
        type: "error",
      });
    }
  };

  const columns = getCustomerColumns({
    onEdit: (customer: Customer) => {
      setSelectedCustomer(customer);
      setDialogMode("edit");
      setDialogOpen(true);
    },
    onDelete: handleDeleteCustomer,
  });

  const handleOpenCreateDialog = () => {
    setSelectedCustomer(undefined);
    setDialogMode("create");
    setDialogOpen(true);
  };

  return (
    <AuthenticatedPageLayout>      <div className="flex items-center justify-between space-y-2">        <PageTitleWithIcon title="Customers" icon="users" />
        {isAdmin && (
          <Button onClick={handleOpenCreateDialog}>
            <Plus className="mr-2 h-4 w-4" /> Add Customer
          </Button>
        )}
      </div>
      <div className="space-y-4">
        <DataTable
          columns={columns}
          data={customers}
          isLoading={loading}
        />
      </div>
      <CustomerDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={dialogMode === "create" ? handleCreateCustomer : handleEditCustomer}
        customer={selectedCustomer}
        mode={dialogMode}
      />
    </AuthenticatedPageLayout>
  );
}
