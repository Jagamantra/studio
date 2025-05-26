
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
  key: string;
  onSubmit: (data: CustomerFormValues) => Promise<void>;
  customer: CustomerFormValues;
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
    visitDate: undefined,
    advisor: undefined,
    visitLocation: "",
    visitFrequency: undefined,
    conversationPartner: "",
    comments: "",
    status: "in-progress",
};

export function CustomerAccordionForm({
  key,
  onSubmit,
  customer,
  mode,
  isSubmitting,
}: CustomerAccordionFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  
  const [activeSection, setActiveSection] = React.useState<string | undefined>("companyDetails");

  const form = useForm<CustomerFormValues>({
    resolver: zodResolver(customerFormSchema),
    defaultValues: customer,
  });
  
  useEffect(() => {
    form.reset(customer);
  }, [customer, form]);

  const draftKey = key;

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
    if (mode === 'create' && customer && JSON.stringify(customer) === JSON.stringify(cleanDefaultsForCreate)) {
      const draft = localStorage.getItem(draftKey);
      if (draft) {
        try {
          const draftData = JSON.parse(draft);
          form.reset(draftData);
          toast({ title: 'Draft Loaded', message: 'A previous draft has been loaded.', variant: 'info' });
        } catch (e) {
          console.error('Failed to parse draft data', e);
        }
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draftKey, form, mode, customer]);


  const handleFormSubmit = async (data: CustomerFormValues) => {
    await onSubmit(data);
    if (mode === 'create') { 
        localStorage.removeItem('customerDraft_addNew');
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
      const valuesToReset = mode === 'edit' ? customer : cleanDefaultsForCreate;
      form.reset(valuesToReset);
      toast({ title: 'Form Reset', message: 'Form fields have been reset to their original values.', variant: 'info' });
  };

  return (
    <Card className="w-full">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleFormSubmit)}>
          <CardContent className="p-4 sm:p-6">
            <Accordion type="single"  collapsible value={activeSection}  onValueChange={setActiveSection} className="w-full space-y-4">
              {Object.entries(formSections).map(([sectionKey, fields]) => (
                <AccordionItem value={sectionKey} key={sectionKey}>
                  <AccordionTrigger className="text-base sm:text-lg font-semibold">
                    {sectionKey.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                  </AccordionTrigger>
                  <AccordionContent className="pt-2">
                    <div className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 md:gap-x-6 md:gap-y-5 px-2">
                      {fields.map((fieldConfig) => (
                        <FormField
                          key={fieldConfig.name}
                          control={form.control}
                          name={fieldConfig.name as keyof CustomerFormValues}
                          render={({ field }) => (
                            <FormItem className={
                              fieldConfig.type === 'textarea' ? 
                              'sm:col-span-2 md:col-span-3 lg:col-span-4 xl:col-span-5' : ''
                            }>
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
          <CardFooter className="border-t px-4 py-3 sm:px-6 sm:py-4 flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-2 md:gap-x-6 md:gap-y-5">
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
            <Button type="submit" disabled={isSubmitting || (!form.formState.isDirty && mode === 'edit')} size="sm">
              {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              {mode === 'create' ? 'Create Customer' : 'Save Changes'}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
