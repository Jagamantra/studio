
'use client';

import type React from "react";
import type { ColumnDef } from "@tanstack/react-table";
import type { Customer, CustomerStatus } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Edit, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";

interface GetCustomerColumnsOptions {
  onEdit?: (customer: Customer) => void;
  onDelete?: (customerId: string) => void;
  isAdmin: boolean;
}

const StatusBadgeMap: Record<
  CustomerStatus,
  { label: string; variant: "default" | "secondary" | "destructive" | "outline" }
> = {
  "in-progress": { label: "In Progress", variant: "default" },
  "on-hold": { label: "On Hold", variant: "secondary" },
  "completed": { label: "Completed", variant: "outline" }, // Changed to outline for better contrast with destructive
};

export const getCustomerColumns = ({
  onEdit,
  onDelete,
  isAdmin,
}: GetCustomerColumnsOptions): ColumnDef<Customer>[] => {
  const columns: ColumnDef<Customer>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "companyName",
      header: "Company Name",
      cell: ({ row }) => <div className="font-medium">{row.getValue("companyName")}</div>,
    },
    {
      accessorKey: "email",
      header: "Email",
    },
    {
      accessorKey: "phoneNumber",
      header: "Phone",
    },
    {
      accessorKey: "advisor",
      header: "Advisor",
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status") as CustomerStatus;
        const statusInfo = StatusBadgeMap[status] || { label: status, variant: "outline" };
        return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>;
      },
    },
    {
      accessorKey: "lastModified",
      header: "Last Modified",
      cell: ({ row }) => {
        const date = new Date(row.getValue("lastModified") as string);
        return date.toLocaleDateString();
      },
    },
  ];

  if (isAdmin) {
    columns.push({
      id: "actions",
      header: () => <div className="text-right">Actions</div>,
      cell: ({ row }) => {
        const customer = row.original;
        return (
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
                <DropdownMenuItem onClick={() => onEdit?.(customer)}>
                  <Edit className="mr-2 h-4 w-4" /> Edit
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onDelete?.(customer.id)}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="mr-2 h-4 w-4" /> Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
    });
  }

  return columns;
};
