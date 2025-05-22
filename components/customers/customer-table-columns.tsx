import { ColumnDef } from "@tanstack/react-table";
import { Customer, CustomerStatus } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreHorizontal } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface GetCustomerColumnsOptions {
  onEdit?: (customer: Customer) => void;
  onDelete?: (customerId: string) => void;
}

const StatusBadgeMap: Record<CustomerStatus, { label: string; variant: "default" | "secondary" | "destructive" }> = {
  "in-progress": { label: "In Progress", variant: "default" },
  "on-hold": { label: "On Hold", variant: "secondary" },
  "completed": { label: "Completed", variant: "destructive" },
};

export const getCustomerColumns = (options?: GetCustomerColumnsOptions): ColumnDef<Customer>[] => {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  const columns: ColumnDef<Customer>[] = [
    {
      accessorKey: "customerName",
      header: "Customer Name",
    },
    {
      accessorKey: "contactName",
      header: "Contact Name",
    },
    {
      accessorKey: "advisorName",
      header: "Advisor Name",
    },
    {
      accessorKey: "lastModified",
      header: "Last Modified",
      cell: ({ row }) => {
        const date = new Date(row.getValue("lastModified"));
        return date.toLocaleDateString();
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status: CustomerStatus = row.getValue("status");
        const { label, variant } = StatusBadgeMap[status];
        return <Badge variant={variant}>{label}</Badge>;
      },
    },
  ];

  // Add actions column if admin
  if (isAdmin) {
    columns.push({
      id: "actions",
      cell: ({ row }) => {
        const customer = row.original;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => navigator.clipboard.writeText(customer.id)}
              >
                Copy Customer ID
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => options?.onEdit?.(customer)}>
                Edit Customer
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => options?.onDelete?.(customer.id)}
                className="text-red-600"
              >
                Delete Customer
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                Continue with Assessment
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    });
  } else {
    // columns.push({
    //   id: "actions",
    //   cell: () => (
    //     <Button variant="outline" size="sm">
    //       Continue with Assessment
    //     </Button>
    //   ),
    // });
  }

  return columns;
};
