import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Accordion, AccordionItem, AccordionContent, AccordionTrigger } from "@/components/ui/accordion";
import { customerFormSchema } from "@/lib/schemas/customer"; // You'll need to extend this
import * as z from "zod";

// Simplified schema, expand based on your actual field requirements
const fullFormSchema = customerFormSchema.extend({
  address: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().optional(),
  website: z.string().optional(),
  kvk: z.string().optional(),
  legalForm: z.string().optional(),
  mainActivity: z.string().optional(),
  sideActivities: z.string().optional(),
  dga: z.string().optional(),
  staff: z.string().optional(),
  companySize: z.string().optional(),
  grossProfit: z.string().optional(),
  payroll: z.string().optional(),
  description: z.string().optional(),

  visitDate: z.string().optional(),
  advisor: z.string().optional(),
  location: z.string().optional(),
  frequency: z.string().optional(),
  partner: z.string().optional(),

  comments: z.string().optional(),
});

export function CustomerAccordionForm({ onSubmit }: { onSubmit: (data: z.infer<typeof fullFormSchema>) => void }) {
  const form = useForm<z.infer<typeof fullFormSchema>>({
    resolver: zodResolver(fullFormSchema),
    defaultValues: {}, // preload values if needed
  });

  const handleSubmit = async (data: z.infer<typeof fullFormSchema>) => {
    console.log(data);
    await onSubmit(data);
    form.reset();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <Accordion type="multiple" className="w-full space-y-4">
          {/* A. Company Details */}
          <AccordionItem value="companyDetails">
            <AccordionTrigger>Company Details</AccordionTrigger>
            <AccordionContent>
              {[
                { name: "customerName", label: "Company Name/Legal Company Name" },
                { name: "address", label: "Address" },
                { name: "phone", label: "Phone Number" },
                { name: "email", label: "E-mail Address" },
                { name: "website", label: "Website" },
                { name: "kvk", label: "KvK Number" },
                { name: "legalForm", label: "Legal Form" },
                { name: "mainActivity", label: "Main activity/SBI code" },
                { name: "sideActivities", label: "Side Activities" },
                { name: "dga", label: "DGA" },
                { name: "staff", label: "Staff (FTE employed)" },
                { name: "companySize", label: "Company size/Annual turnover" },
                { name: "grossProfit", label: "Gross profit excluding tax year" },
                { name: "payroll", label: "Payroll year" },
                { name: "description", label: "Company Description/Explanation" },
              ].map((field) => (
                <FormField
                  key={field.name}
                  control={form.control}
                  name={field.name as keyof z.infer<typeof fullFormSchema>}
                  render={({ field: f }) => (
                    <FormItem>
                      <FormLabel>{field.label}</FormLabel>
                      <FormControl>
                        <Input {...f} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ))}
            </AccordionContent>
          </AccordionItem>

          {/* B. Visit Data */}
          <AccordionItem value="visitData">
            <AccordionTrigger>Visit Data</AccordionTrigger>
            <AccordionContent>
              {[
                { name: "visitDate", label: "Date of Visit" },
                { name: "advisor", label: "Advisor" },
                { name: "location", label: "Location Visit" },
                { name: "frequency", label: "Visit Frequency" },
                { name: "partner", label: "Company Conversation Partner" },
              ].map((field) => (
                <FormField
                  key={field.name}
                  control={form.control}
                  name={field.name as keyof z.infer<typeof fullFormSchema>}
                  render={({ field: f }) => (
                    <FormItem>
                      <FormLabel>{field.label}</FormLabel>
                      <FormControl>
                        <Input {...f} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ))}
            </AccordionContent>
          </AccordionItem>

          {/* C. Comments */}
          <AccordionItem value="comments">
            <AccordionTrigger>Comments</AccordionTrigger>
            <AccordionContent>
              <FormField
                control={form.control}
                name="comments"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Comments</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Add your comments here" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        <Button type="submit">Submit</Button>
      </form>
    </Form>
  );
}
