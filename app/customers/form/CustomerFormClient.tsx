
"use client";

import { useSearchParams, useRouter } from "next/navigation";
import React, { useEffect, useState, useCallback } from "react";
import type { z } from "zod";
import { CustomerAccordionForm } from "@/components/customers/customer-dialog";
import { customerFormSchema } from "@/lib/schemas/customer";
import * as Api from "@/services/api";
import type { Customer } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { AuthenticatedPageLayout } from "@/components/layout/authenticated-page-layout";

type CustomerFormValues = z.infer<typeof customerFormSchema>;

const defaultCustomerValues: CustomerFormValues = {
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
  visitDate: undefined, // Initialize as undefined for DatePicker
  advisor: undefined,
  visitLocation: "",
  visitFrequency: undefined,
  conversationPartner: "",
  comments: "",
  status: "in-progress",
};

const sanitizeCustomerData = (data: Partial<Customer>): CustomerFormValues => {
  const sanitized: Partial<CustomerFormValues> = { ...defaultCustomerValues, ...data };
  
  if (sanitized.legalForm === "") sanitized.legalForm = undefined;
  if (sanitized.advisor === "") sanitized.advisor = undefined;
  if (sanitized.visitFrequency === "") sanitized.visitFrequency = undefined;
  
  if (sanitized.staffFTE === null || sanitized.staffFTE === "" as any) sanitized.staffFTE = undefined;
  if (sanitized.annualTurnover === null || sanitized.annualTurnover === "" as any) sanitized.annualTurnover = undefined;
  if (sanitized.grossProfit === null || sanitized.grossProfit === "" as any) sanitized.grossProfit = undefined;
  if (sanitized.payrollYear === null || sanitized.payrollYear === "" as any) sanitized.payrollYear = undefined;

  // Convert visitDate string from API/DB to Date object for DatePicker
  if (typeof sanitized.visitDate === 'string' && sanitized.visitDate) {
    const parsedDate = new Date(sanitized.visitDate);
    // Check if parsedDate is a valid date
    if (!isNaN(parsedDate.getTime())) {
      sanitized.visitDate = parsedDate;
    } else {
      sanitized.visitDate = undefined; // Or null, depending on schema preference
    }
  } else if (!(sanitized.visitDate instanceof Date)) {
    sanitized.visitDate = undefined; // Ensure it's a Date object or undefined/null
  }
  
  return sanitized as CustomerFormValues;
};

export default function CustomerFormClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const mode = searchParams.get("mode") === "edit" ? "edit" : "create";
  const customerId = searchParams.get("id");

  const [customer, setCustomer] = useState<CustomerFormValues | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchCustomer = useCallback(async (id: string) => {
    setIsLoading(true);
    try {
      const data = await Api.getCustomerById(id);
      if (data) {
        setCustomer(sanitizeCustomerData(data));
      } else {
        toast({ title: "Error", message: "Customer not found.", variant: "destructive" });
        router.push("/customers");
      }
    } catch (error) {
      toast({ title: "Error", message: "Failed to fetch customer details.", variant: "destructive" });
      router.push("/customers");
    } finally {
      setIsLoading(false);
    }
  }, [router, toast]);

  useEffect(() => {
    if (mode === "edit" && customerId) {
      fetchCustomer(customerId);
    } else {
      setCustomer(defaultCustomerValues); 
      setIsLoading(false);
    }
  }, [mode, customerId, fetchCustomer]);

  const handleSubmit = useCallback(async (data: CustomerFormValues) => {
    setIsSubmitting(true);
    try {
      // Ensure numeric fields are numbers or null
      const dataToSubmit: any = { ...data };
      if (dataToSubmit.staffFTE === undefined) dataToSubmit.staffFTE = null;
      if (dataToSubmit.annualTurnover === undefined) dataToSubmit.annualTurnover = null;
      if (dataToSubmit.grossProfit === undefined) dataToSubmit.grossProfit = null;
      if (dataToSubmit.payrollYear === undefined) dataToSubmit.payrollYear = null;

      // Convert visitDate (Date object) to ISO string if API expects string
      if (dataToSubmit.visitDate instanceof Date) {
        dataToSubmit.visitDate = dataToSubmit.visitDate.toISOString();
      } else if (dataToSubmit.visitDate === null || dataToSubmit.visitDate === undefined) {
        dataToSubmit.visitDate = null; // Or handle as per API: "" or undefined
      }


      if (mode === "edit" && customerId) {
        await Api.updateCustomer(customerId, dataToSubmit as Partial<Customer>);
        toast({ title: "Success", message: "Customer updated successfully.", variant: "success" });
      } else {
        await Api.createCustomer(dataToSubmit as Omit<Customer, 'id' | 'lastModified'>);
        toast({ title: "Success", message: "Customer created successfully.", variant: "success" });
      }
      router.push("/customers");
    } catch (error: any) {
      toast({ title: "Error", message: error.message || "Failed to save customer.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  }, [mode, customerId, router, toast]);

  if (isLoading || customer === undefined) {
    return <div className="flex justify-center items-center p-8"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="w-full mx-auto rounded-md">
      <AuthenticatedPageLayout>
      <CustomerAccordionForm
        key={customerId || 'create-new-customer'}
        mode={mode}
        customer={customer}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
      />
      </AuthenticatedPageLayout>
    </div>
  );
}
