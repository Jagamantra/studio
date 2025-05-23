import * as z from "zod";

export const customerFormSchema = z.object({
  customerName: z.string().min(2, "Customer name must be at least 2 characters"),
  contactName: z.string().min(2, "Contact name must be at least 2 characters"),
  advisorName: z.string().min(2, "Advisor name must be at least 2 characters"),
  status: z.enum(["in-progress", "on-hold", "completed"]),
});
