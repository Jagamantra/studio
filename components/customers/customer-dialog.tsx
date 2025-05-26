"use client";

import React, { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import {
  Accordion,
  AccordionItem,
  AccordionContent,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { customerFormSchema } from "@/lib/schemas/customer";
import type { z } from "zod";
import { renderCustomerInput } from "./render-input";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import {
  Loader2,
  Save,
  DraftingCompass,
  RotateCcw,
  XCircle,
} from "lucide-react";

type CustomerFormValues = z.infer<typeof customerFormSchema>;

interface CustomerAccordionFormProps {
  formkey: string;
  onSubmit: (data: CustomerFormValues) => Promise<void>;
  customer: CustomerFormValues;
  mode?: "create" | "edit";
  isSubmitting: boolean;
}

const formSections = {
  companyDetails: [
    { name: "companyName", label: "Company Name / Legal Company Name *", type: "text", required: true },
    { name: "address", label: "Address", type: "textarea" },
    { name: "phoneNumber", label: "Phone Number", type: "tel" },
    { name: "email", label: "E-mail Address", type: "email" },
    { name: "website", label: "Website", type: "url" },
    { name: "kvkNumber", label: "KvK Number", type: "text" },
    {
      name: "legalForm",
      label: "Legal Form",
      type: "select",
      options: ["BV", "NV", "Eenmanszaak", "VOF", "Stichting", "Other"],
    },
    { name: "mainActivity", label: "Main activity / SBI code", type: "text" },
    { name: "sideActivities", label: "Side Activities", type: "textarea" },
    { name: "dga", label: "DGA (Director and Major Shareholder)", type: "text" },
    { name: "staffFTE", label: "Staff (FTE employed)", type: "number" },
    { name: "annualTurnover", label: "Annual turnover (€)", type: "number" },
    { name: "grossProfit", label: "Gross profit excluding tax year (€)", type: "number" },
    { name: "payrollYear", label: "Payroll year", type: "number", placeholder: "YYYY" },
    { name: "description", label: "Company Description / Explanation", type: "textarea" },
  ],
  visitData: [
    { name: "visitDate", label: "Date of Visit", type: "date" },
    {
      name: "advisor",
      label: "Advisor",
      type: "select",
      options: ["Advisor A", "Advisor B", "Advisor C"],
    },
    { name: "visitLocation", label: "Location Visit", type: "text" },
    {
      name: "visitFrequency",
      label: "Visit Frequency",
      type: "select",
      options: ["Weekly", "Monthly", "Quarterly", "Annually", "Ad-hoc"],
    },
    { name: "conversationPartner", label: "Company Conversation Partner", type: "text" },
  ],
  statusAndComments: [
    {
      name: "status",
      label: "Status *",
      type: "select",
      options: ["in-progress", "on-hold", "completed"],
      required: true,
    },
    { name: "comments", label: "Comments", type: "textarea" },
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
  formkey,
  onSubmit,
  customer,
  mode = "create",
  isSubmitting,
}: CustomerAccordionFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [activeSection, setActiveSection] = useState("companyDetails");

  const initialCustomerRef = useRef<CustomerFormValues>(customer);

  const form = useForm<CustomerFormValues>({
    resolver: zodResolver(customerFormSchema),
    defaultValues: initialCustomerRef.current,
    mode: "onSubmit",
  });

  const draftKey = formkey;

  useEffect(() => {
    if (mode === "edit") {
      form.reset(customer);
      initialCustomerRef.current = customer;
    }
  }, [customer, mode, form]);

  useEffect(() => {
    if (
      mode === "create" &&
      JSON.stringify(customer) === JSON.stringify(cleanDefaultsForCreate)
    ) {
      const draft = localStorage.getItem(draftKey);
      if (draft) {
        try {
          const parsed = JSON.parse(draft);
          form.reset(parsed);
          toast({
            title: "Draft Loaded",
            message: "A previous draft has been loaded.",
            variant: "info",
          });
        } catch (e) {
          console.error("Error loading draft:", e);
        }
      }
    }
  }, [draftKey, customer, form, mode, toast]);

  const handleSaveDraft = () => {
    localStorage.setItem(draftKey, JSON.stringify(form.getValues()));
    toast({
      title: "Draft Saved",
      message: "Your draft has been saved locally.",
      variant: "success",
    });
  };

  const handleResetForm = () => {
    const resetTo =
      mode === "edit" ? initialCustomerRef.current : cleanDefaultsForCreate;
    form.reset(resetTo);
    toast({
      title: "Form Reset",
      message: "Form reset to initial values.",
      variant: "info",
    });
  };

  const handleCancel = () => {
    if (form.formState.isDirty) {
      if (
        confirm("You have unsaved changes. Are you sure you want to cancel?")
      ) {
        if (mode === "create") localStorage.removeItem(draftKey);
        router.push("/customers");
      }
    } else {
      router.push("/customers");
    }
  };

  const handleFormSubmit = async (data: CustomerFormValues) => {
    try {
      if (!data.companyName || !data.status) {
        toast({
          title: "Validation Error",
          message: "Required fields missing.",
          variant: "destructive",
        });
        return;
      }

      await onSubmit(data);
      if (mode === "create") localStorage.removeItem(draftKey);
    } catch (error: any) {
      toast({
        title: "Error",
        message: error?.message || "An unexpected error occurred.",
        variant: "destructive",
      });
    }
  };

  const handleSectionChange = (nextSection: string) => {
    const currentFields = formSections[activeSection]?.map((f) => f.name);
    const dirtyFields = Object.keys(form.formState.dirtyFields || {});
    const isCurrentSectionDirty = currentFields?.some((f) =>
      dirtyFields.includes(f)
    );

    // if (isCurrentSectionDirty) {
    //   toast({
    //     title: "Unsaved Changes",
    //     message: `Please save or reset your changes in "${activeSection}" before moving on.`,
    //     variant: "destructive",
    //   });
    //   return;
    // }

    setActiveSection(nextSection);
  };

  return (
    <Card className="w-full">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleFormSubmit)}>
          <CardContent className="p-4 sm:p-6">
            <Accordion
              type="single"
              collapsible
              value={activeSection}
              onValueChange={handleSectionChange}
              className="w-full space-y-4"
            >
              {Object.entries(formSections).map(([sectionKey, fields]) => (
                <AccordionItem value={sectionKey} key={sectionKey}>
                  <AccordionTrigger className="text-base sm:text-lg font-semibold">
                    {sectionKey
                      .replace(/([A-Z])/g, " $1")
                      .replace(/^./, (str) => str.toUpperCase())}
                  </AccordionTrigger>
                  <AccordionContent className="pt-2">
                    <div className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 md:gap-x-6 md:gap-y-5 px-2">
                      {fields.map((fieldConfig) => (
                        <FormField
                          key={fieldConfig.name}
                          control={form.control}
                          name={fieldConfig.name as keyof CustomerFormValues}
                          render={({ field }) => (
                            <FormItem
                              className={
                                fieldConfig.type === "textarea"
                                  ? "sm:col-span-2 md:col-span-3 lg:col-span-4 xl:col-span-5"
                                  : ""
                              }
                            >
                              <FormLabel>{fieldConfig.label}</FormLabel>
                              <FormControl>
                                {renderCustomerInput(
                                  fieldConfig,
                                  field,
                                  isSubmitting
                                )}
                              </FormControl>
                              {fieldConfig.name === "payrollYear" && (
                                <FormDescription className="text-xs">
                                  Enter the full year (e.g., 2023).
                                </FormDescription>
                              )}
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
              <XCircle className="mr-2 h-4 w-4" /> Cancel
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={handleResetForm}
              disabled={isSubmitting || !form.formState.isDirty}
              size="sm"
            >
              <RotateCcw className="mr-2 h-4 w-4" /> Reset Form
            </Button>
            {mode === "create" && (
              <Button
                type="button"
                variant="secondary"
                onClick={handleSaveDraft}
                disabled={isSubmitting || !form.formState.isDirty}
                size="sm"
              >
                <DraftingCompass className="mr-2 h-4 w-4" /> Save Draft
              </Button>
            )}
            <Button
              type="submit"
              disabled={
                isSubmitting || (!form.formState.isDirty && mode === "edit")
              }
              size="sm"
            >
              {isSubmitting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              {mode === "create" ? "Create Customer" : "Save Changes"}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
