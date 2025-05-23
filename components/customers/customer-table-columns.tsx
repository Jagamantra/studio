// components/customers/customer-table-columns.tsx
import React from "react";
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

const StatusBadgeMap: Record<
  CustomerStatus,
  { label: string; variant: "default" | "secondary" | "destructive" }
> = {
  "in-progress": { label: "In Progress", variant: "default" },
  "on-hold": { label: "On Hold", variant: "secondary" },
  "completed": { label: "Completed", variant: "destructive" },
};

export const getCustomerColumns = (
  options?: GetCustomerColumnsOptions
): ColumnDef<Customer>[] => {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  const columns: ColumnDef<Customer>[] = [
    {
      id: "companyName",
      header: "Company Name",
      accessorFn: (row) => row.companyName,
    },
    {
      id: "address",
      header: "Address",
      accessorFn: (row) => row.address,
    },
    {
      id: "phoneNumber",
      header: "Phone Number",
      accessorFn: (row) => row.phoneNumber,
    },
    {
      id: "email",
      header: "Email",
      accessorFn: (row) => row.email,
    },
    // {
    //   id: "website",
    //   header: "Website",
    //   accessorFn: (row) => row.website,
    // },
    // {
    //   id: "kvkNumber",
    //   header: "KVK Number",
    //   accessorFn: (row) => row.kvkNumber,
    // },
    // {
    //   id: "legalForm",
    //   header: "Legal Form",
    //   accessorFn: (row) => row.legalForm,
    // },
    // {
    //   id: "mainActivity",
    //   header: "Main Activity",
    //   accessorFn: (row) => row.mainActivity,
    // },
    // {
    //   id: "sideActivities",
    //   header: "Side Activities",
    //   accessorFn: (row) => row.sideActivities,
    // },
    // {
    //   id: "dga",
    //   header: "DGA",
    //   accessorFn: (row) => row.dga,
    // },
    // {
    //   id: "staffFTE",
    //   header: "Staff (FTE)",
    //   accessorFn: (row) => row.staffFTE,
    // },
    // {
    //   id: "annualTurnover",
    //   header: "Annual Turnover",
    //   accessorFn: (row) => row.annualTurnover,
    // },
    // {
    //   id: "grossProfit",
    //   header: "Gross Profit",
    //   accessorFn: (row) => row.grossProfit,
    // },
    // {
    //   id: "payrollYear",
    //   header: "Payroll Year",
    //   accessorFn: (row) => row.payrollYear,
    // },
    // {
    //   id: "description",
    //   header: "Description",
    //   accessorFn: (row) => row.description,
    // },
    // {
    //   id: "visitDate",
    //   header: "Visit Date",
    //   accessorFn: (row) => row.visitDate,
    //   cell: ({ getValue }) => {
    //     const date = new Date(getValue() as string);
    //     return date.toLocaleDateString();
    //   },
    // },
    {
      id: "advisor",
      header: "Advisor",
      accessorFn: (row) => row.advisor,
    },
    // {
    //   id: "visitLocation",
    //   header: "Visit Location",
    //   accessorFn: (row) => row.visitLocation,
    // },
    // {
    //   id: "visitFrequency",
    //   header: "Visit Frequency",
    //   accessorFn: (row) => row.visitFrequency,
    // },
    // {
    //   id: "conversationPartner",
    //   header: "Conversation Partner",
    //   accessorFn: (row) => row.conversationPartner,
    // },
    {
      id: "comments",
      header: "Comments",
      accessorFn: (row) => row.comments,
    },
    // {
    //   id: "lastModified",
    //   header: "Last Modified",
    //   accessorFn: (row) => row.lastModified,
    //   cell: ({ getValue }) => {
    //     const date = new Date(getValue() as string);
    //     return date.toLocaleDateString();
    //   },
    // },
    {
      id: "status",
      header: "Status",
      accessorFn: (row) => row.status,
      cell: ({ getValue }) => {
        const status = getValue() as CustomerStatus;
        const { label, variant } = StatusBadgeMap[status];
        return <Badge variant={variant}>{label}</Badge>;
      },
    },
  ];

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
              <DropdownMenuItem>Continue with Assessment</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    });
  } else {
    columns.push({
      id: "actions",
      cell: () => (
        <Button variant="outline" size="sm">
          Continue with Assessment
        </Button>
      ),
    });
  }

  return columns;
};
