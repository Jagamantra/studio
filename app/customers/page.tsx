'use client';

import { useEffect, useState } from "react";
import { useRouter } from 'next/navigation';
import { Customer } from "@/types";
import { useAuth } from "@/contexts/auth-context";
import { DataTable } from "@/components/ui/data-table";
import { getCustomerColumns } from "@/components/customers/customer-table-columns";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import * as Api from "@/services/api";
import { PageTitleWithIcon } from "@/components/layout/page-title-with-icon";
import { AuthenticatedPageLayout } from "@/components/layout/authenticated-page-layout";

export default function CustomersPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const isAdmin = user?.role === "admin";
  const router = useRouter();

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);

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
      router.push(`/customers/form?mode=edit&id=${customer.id}`);
    },
    onDelete: handleDeleteCustomer,
    isAdmin: isAdmin,
  });

  const handleOpenCreateDialog = () => {
    router.push('/customers/form?mode=create');
  };

  return (
    <AuthenticatedPageLayout>
      <div className="flex items-center justify-end space-y-2">
        {/* <PageTitleWithIcon title="Customers" /> */}
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
    </AuthenticatedPageLayout>
  );
}
