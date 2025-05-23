
'use client';

import React, { useEffect } from 'react';
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
  FormDescription
} from '@/components/ui/form';
import {
  Accordion,
  AccordionItem,
  AccordionContent,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { customerFormSchema } from '@/lib/schemas/customer';
import type { z } from 'zod';
import { renderCustomerInput } from './render-input';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Loader2, Save, DraftingCompass, RotateCcw, XCircle } from 'lucide-react';

type CustomerFormValues = z.infer<typeof customerFormSchema>;

interface CustomerAccordionFormProps {
  onSubmit: (data: CustomerFormValues) => Promise<void>;
  customer: CustomerFormValues; // Expecting this to be pre-sanitized or a stable default
  mode?: 'create' | 'edit';
  isSubmitting: boolean;
}

const formSections = {
  companyDetails: [
    { name: 'companyName', label: 'Company Name / Legal Company Name *', type: 'text', required: true },
    { name: 'address', label: 'Address', type: 'textarea' },
    { name: 'phoneNumber', label: 'Phone Number', type: 'tel' },
    { name: 'email', label: 'E-mail Address', type: 'email' },
    { name: 'website', label: 'Website', type: 'url' },
    { name: 'kvkNumber', label: 'KvK Number', type: 'text' },
    { name: 'legalForm', label: 'Legal Form', type: 'select', options: ['BV', 'NV', 'Eenmanszaak', 'VOF', 'Stichting', 'Other'] },
    { name: 'mainActivity', label: 'Main activity / SBI code', type: 'text' },
    { name: 'sideActivities', label: 'Side Activities', type: 'textarea' },
    { name: 'dga', label: 'DGA (Director and Major Shareholder)', type: 'text' },
    { name: 'staffFTE', label: 'Staff (FTE employed)', type: 'number' },
    { name: 'annualTurnover', label: 'Annual turnover (€)', type: 'number' },
    { name: 'grossProfit', label: 'Gross profit excluding tax year (€)', type: 'number' },
    { name: 'payrollYear', label: 'Payroll year', type: 'number', placeholder: 'YYYY' },
    { name: 'description', label: 'Company Description / Explanation', type: 'textarea' },
  ],
  visitData: [
    { name: 'visitDate', label: 'Date of Visit', type: 'date' },
    { name: 'advisor', label: 'Advisor', type: 'select', options: ['Advisor A', 'Advisor B', 'Advisor C'] },
    { name: 'visitLocation', label: 'Location Visit', type: 'text' },
    { name: 'visitFrequency', label: 'Visit Frequency', type: 'select', options: ['Weekly', 'Monthly', 'Quarterly', 'Annually', 'Ad-hoc'] },
    { name: 'conversationPartner', label: 'Company Conversation Partner', type: 'text' },
  ],
  statusAndComments: [
    { name: 'status', label: 'Status *', type: 'select', options: ['in-progress', 'on-hold', 'completed'], required: true },
    { name: 'comments', label: 'Comments', type: 'textarea' },
  ],
};

const cleanDefaultsForCreate: CustomerFormValues = {
    companyName: "",
    address: "",
    phoneNumber: "",
    email: "",
    website: "",
    kvkNumber: "",
    legalForm: undefined,
    mainActivity: "",
    sideActivities: "",
    dga: "",
    staffFTE: undefined,
    annualTurnover: undefined,
    grossProfit: undefined,
    payrollYear: undefined,
    description: "",
    visitDate: "",
    advisor: undefined,
    visitLocation: "",
    visitFrequency: undefined,
    conversationPartner: "",
    comments: "",
    status: "in-progress",
};

const sanitizeLoadedDraft = (data: any): CustomerFormValues => {
  const sanitized = { ...cleanDefaultsForCreate, ...data };
  if (sanitized.legalForm === "") sanitized.legalForm = undefined;
  if (sanitized.advisor === "") sanitized.advisor = undefined;
  if (sanitized.visitFrequency === "") sanitized.visitFrequency = undefined;
  if (sanitized.staffFTE === null || sanitized.staffFTE === "" as any) sanitized.staffFTE = undefined;
  if (sanitized.annualTurnover === null || sanitized.annualTurnover === "" as any) sanitized.annualTurnover = undefined;
  if (sanitized.grossProfit === null || sanitized.grossProfit === "" as any) sanitized.grossProfit = undefined;
  if (sanitized.payrollYear === null || sanitized.payrollYear === "" as any) sanitized.payrollYear = undefined;
  return sanitized as CustomerFormValues;
};


export function CustomerAccordionForm({
  onSubmit,
  customer, // Expecting this `customer` prop to be pre-sanitized or the stable default
  mode,
  isSubmitting,
}: CustomerAccordionFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  
  const form = useForm<CustomerFormValues>({
    resolver: zodResolver(customerFormSchema),
    defaultValues: customer, // Directly use the pre-sanitized/default customer prop
  });
  
  useEffect(() => {
    // The `customer` prop is now expected to be stable and correctly initialized by CustomerFormClient.
    // form.reset is called when the `customer` prop reference changes (e.g., new customer loaded for edit).
    // The key on CustomerAccordionForm in CustomerFormClient also helps ensure re-mount for major changes.
    form.reset(customer);
  }, [customer, form]); // form is stable, so only customer matters here.

  const draftKey = customer?.id && mode === 'edit' ? `customerDraft_${customer.id}` : 'customerDraft_addNew';

  const handleSaveDraft = () => {
    const data = form.getValues();
    localStorage.setItem(draftKey, JSON.stringify(data));
    toast({
      title: 'Draft Saved',
      message: 'Your draft has been saved locally.',
      variant: 'success',
    });
  };
  
  useEffect(() => {
    // Only load draft in create mode and if the `customer` prop is still the initial default.
    if (mode === 'create' && customer && JSON.stringify(customer) === JSON.stringify(cleanDefaultsForCreate)) {
      const draft = localStorage.getItem(draftKey);
      if (draft) {
        try {
          const draftData = sanitizeLoadedDraft(JSON.parse(draft));
          form.reset(draftData);
          toast({ title: 'Draft Loaded', message: 'A previous draft has been loaded.', variant: 'info' });
        } catch (e) {
          console.error('Failed to parse draft data', e);
        }
      }
    }
  // The dependencies here are critical. `customer` is specifically included to ensure this runs
  // only when `customer` is the initial default. If `customer` gets updated by `fetchCustomer` in parent,
  // this effect should ideally not re-run and try to load draft over fetched data.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draftKey, form, mode, customer]);


  const handleFormSubmit = async (data: CustomerFormValues) => {
    await onSubmit(data);
    // Clear draft only for new customer creation after successful submission
    if (mode === 'create') { 
        localStorage.removeItem('customerDraft_addNew'); // Use the specific key for new drafts
    }
  };

  const handleCancel = () => {
    if (form.formState.isDirty) {
        if (confirm("You have unsaved changes. Are you sure you want to cancel? Your changes will be lost.")) {
             if (mode === 'create') localStorage.removeItem('customerDraft_addNew');
             router.push('/customers');
        }
    } else {
        router.push('/customers');
    }
  };
  
  const handleResetForm = () => {
      // If editing, reset to the initial 'customer' prop values (which are pre-sanitized)
      // If creating, reset to 'cleanDefaultsForCreate'
      const valuesToReset = mode === 'edit' ? customer : cleanDefaultsForCreate;
      form.reset(valuesToReset);
      toast({ title: 'Form Reset', message: 'Form fields have been reset to their original values.', variant: 'info' });
  };

  return (
    <Card className="w-full">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleFormSubmit)}>
          <CardContent className="p-4 sm:p-6">
            <Accordion type="multiple" className="w-full space-y-4" defaultValue={[]}>
              {Object.entries(formSections).map(([sectionKey, fields]) => (
                <AccordionItem value={sectionKey} key={sectionKey}>
                  <AccordionTrigger className="text-base sm:text-lg font-semibold">
                    {sectionKey.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                  </AccordionTrigger>
                  <AccordionContent className="pt-2">
                    <div className="grid grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-2 md:gap-x-6 md:gap-y-4">
                      {fields.map((fieldConfig) => (
                        <FormField
                          key={fieldConfig.name}
                          control={form.control}
                          name={fieldConfig.name as keyof CustomerFormValues}
                          render={({ field }) => (
                            <FormItem className={fieldConfig.type === 'textarea' ? 'sm:col-span-2' : ''}>
                              <FormLabel>{fieldConfig.label}</FormLabel>
                              <FormControl>
                                {renderCustomerInput(fieldConfig, field, isSubmitting)}
                              </FormControl>
                              {fieldConfig.name === 'payrollYear' && <FormDescription className="text-xs">Enter the full year (e.g., 2023).</FormDescription>}
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
          <CardFooter className="border-t px-4 py-3 sm:px-6 sm:py-4 flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-2">
            <Button type="button" variant="outline" onClick={handleCancel} disabled={isSubmitting} size="sm">
               <XCircle className="mr-2 h-4 w-4"/> Cancel
            </Button>
            <Button type="button" variant="ghost" onClick={handleResetForm} disabled={isSubmitting || !form.formState.isDirty} size="sm">
               <RotateCcw className="mr-2 h-4 w-4"/> Reset Form
            </Button>
            {mode === 'create' && (
                <Button type="button" variant="secondary" onClick={handleSaveDraft} disabled={isSubmitting || !form.formState.isDirty} size="sm">
                    <DraftingCompass className="mr-2 h-4 w-4"/> Save Draft
                </Button>
            )}
            <Button type="submit" disabled={isSubmitting || !form.formState.isDirty && mode === 'edit'} size="sm">
              {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              {mode === 'create' ? 'Create Customer' : 'Save Changes'}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
