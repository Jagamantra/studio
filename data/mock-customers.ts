import { CustomerStatus } from "@/types";

export const mockCustomers = [
  {
    id: "1",
    customerName: "Acme Corporation",
    contactName: "John Doe",
    advisorName: "Sarah Smith",
    lastModified: "2024-05-20T10:30:00Z",
    status: "in-progress" as CustomerStatus,
  },
  {
    id: "2",
    customerName: "TechStart Inc",
    contactName: "Jane Smith",
    advisorName: "Mike Johnson",
    lastModified: "2024-05-19T14:20:00Z",
    status: "on-hold" as CustomerStatus,
  },
  {
    id: "3",
    customerName: "Global Solutions Ltd",
    contactName: "Robert Brown",
    advisorName: "Emily Davis",
    lastModified: "2024-05-18T09:15:00Z",
    status: "completed" as CustomerStatus,
  },
];
