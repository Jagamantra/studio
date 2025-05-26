import * as z from "zod";

export const customerFormSchema = z.object({
  // Company Details
  companyName: z.string(),
  address: z.string().optional(),
  phoneNumber: z.string().optional(),
  email: z.string().email("Invalid email address").optional(),
  website: z.string().url("Invalid URL").optional(),
  kvkNumber: z.string().optional(),
  legalForm: z.string().optional(),
  mainActivity: z.string().optional(),
  sideActivities: z.string().optional(),
  dga: z.string().optional(),
  staffFTE: z.number().int().nonnegative().optional(),
  annualTurnover: z.number().nonnegative().optional(),
  grossProfit: z.number().nonnegative().optional(),
  payrollYear: z.number().int().optional(),
  description: z.string().optional(),

  // Visit Data
  visitDate: z.preprocess((val) => {
    if (val instanceof Date) return val.toISOString(); // convert Date → ISO string
    if (typeof val === "string") return val;           // keep string as is
    return undefined;                                  // undefined or null is okay for optional
  }, z.string().optional()),
  advisor: z.string().optional(),
  visitLocation: z.string().optional(),
  visitFrequency: z.string().optional(),
  conversationPartner: z.string().optional(),

  // Comments
  comments: z.string().optional(),

  // // System Metadata
  // updatedAt: z.string().optional(), // ISO string
  status: z.enum(["in-progress", "on-hold", "completed"]),
});
