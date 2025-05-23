'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form';
import {
  Accordion,
  AccordionItem,
  AccordionContent,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { customerFormSchema } from '@/lib/schemas/customer';
import * as z from 'zod';
import { renderInput } from './render-input';
import { useToast } from '@/hooks/use-toast';

// Extended schema
const fullFormSchema = customerFormSchema.extend({
  address: z.string().optional(),
  phoneNumber: z.string().optional(),
  email: z.string().optional(),
  website: z.string().optional(),
  kvkNumber: z.string().optional(),
  legalForm: z.string().optional(),
  mainActivity: z.string().optional(),
  sideActivities: z.string().optional(),
  dga: z.string().optional(),
  staffFTE: z.number().optional(),
  annualTurnover: z.number().optional(),
  grossProfit: z.number().optional(),
  payrollYear: z.number().optional(),
  description: z.string().optional(),
  visitDate: z.string().optional(),
  advisor: z.string().optional(),
  visitLocation: z.string().optional(),
  visitFrequency: z.string().optional(),
  conversationPartner: z.string().optional(),
  comments: z.string().optional(),
});

export function CustomerAccordionForm({
  onSubmit,
  customer,
  mode,
}: {
  onSubmit: (data: z.infer<typeof fullFormSchema>) => void;
  customer?: z.infer<typeof fullFormSchema>;
  mode?: 'create' | 'edit';
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [formKey, setFormKey] = React.useState('initial');

  const form = useForm<z.infer<typeof fullFormSchema>>({
    resolver: zodResolver(fullFormSchema),
    defaultValues: {
      companyName: '',
      address: '',
      phoneNumber: '',
      email: '',
      website: '',
      kvkNumber: '',
      legalForm: '',
      mainActivity: '',
      sideActivities: '',
      dga: '',
      staffFTE: undefined,
      annualTurnover: undefined,
      grossProfit: undefined,
      payrollYear: undefined,
      description: '',
      visitDate: '',
      advisor: '',
      visitLocation: '',
      visitFrequency: '',
      conversationPartner: '',
      comments: '',
    },
  });

  const draftKey =
    mode === 'edit' && customer?.companyName
      ? `customerDraft_${customer.companyName}`
      : 'customerDraft_addNew';

  React.useEffect(() => {
    const draft = localStorage.getItem(draftKey);
    if (draft) {
      try {
        const draftData = JSON.parse(draft);
        form.reset(draftData);
        setFormKey(`draft-${draftKey}`);
      } catch (e) {
        console.error('Failed to parse draft data', e);
        if (customer) {
          form.reset(customer);
          setFormKey(`customer-${customer.companyName}`);
        }
      }
    } else if (customer) {
      form.reset(customer);
      setFormKey(`customer-${customer.companyName}`);
    }
  }, [draftKey, customer, form]);

  const handleSaveDraft = () => {
    const data = form.getValues();
    localStorage.setItem(draftKey, JSON.stringify(data));
    toast({
      title: 'Draft Saved',
      message: 'Your draft has been saved successfully.',
      variant: 'success',
    });
    router.push('/customers');
  };

  const handleCancel = () => {
    router.push('/customers');
  };

  const handleSubmit = async (data: z.infer<typeof fullFormSchema>) => {
    await onSubmit(data);
    localStorage.removeItem(draftKey);
    router.push('/customers');
  };

  if (!formKey) return <div>Loading form…</div>;

  return (
    <div className="w-[900px] mx-auto p-4 rounded-md shadow-md">
      <Form {...form} key={formKey}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          <Accordion type="multiple" className="w-full space-y-4" defaultValue={['companyDetails']}>
            <AccordionItem value="companyDetails">
              <AccordionTrigger>Company Details</AccordionTrigger>
              <AccordionContent>
                {[
                  { name: 'companyName', label: 'Company Name/Legal Company Name' },
                  { name: 'address', label: 'Address' },
                  { name: 'phoneNumber', label: 'Phone Number' },
                  { name: 'email', label: 'E-mail Address' },
                  { name: 'website', label: 'Website' },
                  { name: 'kvkNumber', label: 'KvK Number' },
                  { name: 'legalForm', label: 'Legal Form' },
                  { name: 'mainActivity', label: 'Main activity/SBI code' },
                  { name: 'sideActivities', label: 'Side Activities' },
                  { name: 'dga', label: 'DGA' },
                  { name: 'staffFTE', label: 'Staff (FTE employed)' },
                  { name: 'annualTurnover', label: 'Annual turnover' },
                  { name: 'grossProfit', label: 'Gross profit excluding tax year' },
                  { name: 'payrollYear', label: 'Payroll year' },
                  { name: 'description', label: 'Company Description/Explanation' },
                ].map((field) => (
                  <FormField
                    key={field.name}
                    control={form.control}
                    name={field.name as keyof z.infer<typeof fullFormSchema>}
                    render={({ field: f }) => (
                      <FormItem>
                        <FormLabel>{field.label}</FormLabel>
                        <FormControl>{renderInput(field.name, f)}</FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ))}
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="visitData">
              <AccordionTrigger>Visit Data</AccordionTrigger>
              <AccordionContent>
                {[
                  { name: 'visitDate', label: 'Date of Visit' },
                  { name: 'advisor', label: 'Advisor' },
                  { name: 'visitLocation', label: 'Location Visit' },
                  { name: 'visitFrequency', label: 'Visit Frequency' },
                  { name: 'conversationPartner', label: 'Company Conversation Partner' },
                ].map((field) => (
                  <FormField
                    key={field.name}
                    control={form.control}
                    name={field.name as keyof z.infer<typeof fullFormSchema>}
                    render={({ field: f }) => (
                      <FormItem>
                        <FormLabel>{field.label}</FormLabel>
                        <FormControl>{renderInput(field.name, f)}</FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ))}
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="comments">
              <AccordionTrigger>Comments</AccordionTrigger>
              <AccordionContent>
                <FormField
                  control={form.control}
                  name="comments"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Comments</FormLabel>
                      <FormControl>{renderInput('comments', field)}</FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          <div className="flex gap-4 pt-4 justify-end">
            <Button type="submit">Submit</Button>
            <Button type="button" variant="secondary" onClick={handleSaveDraft}>
              Save as Draft
            </Button>
            <Button type="button" variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
