"use client";

import { useRouter } from "next/navigation";
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
  // Company Details
  companyName: "",
  address: null,
  phoneNumber: null,
  email: null,
  website: null,
  kvkNumber: null,
  legalForm: null,
  mainActivity: null,
  sideActivities: null,
  dga: null,
  staffFTE: undefined,
  annualTurnover: undefined,
  grossProfit: undefined,
  payrollYear: undefined,
  description: null,

  // Visit Data
  visitDate: null,
  advisor: null,
  visitLocation: null,
  visitFrequency: null,
  conversationPartner: null,

  // Comments and Status
  comments: null,
  status: "in-progress",
};

const sanitizeCustomerData = (data: Partial<Customer>): CustomerFormValues => {
  const sanitized: Partial<CustomerFormValues> = {
    ...defaultCustomerValues,
    ...data,
  };

  if (sanitized.legalForm === "") sanitized.legalForm = undefined;
  if (sanitized.advisor === "") sanitized.advisor = undefined;
  if (sanitized.visitFrequency === "") sanitized.visitFrequency = undefined;
  // Handle numeric fields
  if (sanitized.staffFTE === "" || sanitized.staffFTE === undefined)
    sanitized.staffFTE = null;
  if (sanitized.annualTurnover === "" || sanitized.annualTurnover === undefined)
    sanitized.annualTurnover = null;
  if (sanitized.grossProfit === "" || sanitized.grossProfit === undefined)
    sanitized.grossProfit = null;
  if (sanitized.payrollYear === "" || sanitized.payrollYear === undefined)
    sanitized.payrollYear = null;

  // Convert numeric string values to numbers if they exist
  if (typeof sanitized.staffFTE === "string" && sanitized.staffFTE !== "")
    sanitized.staffFTE = parseInt(sanitized.staffFTE);
  if (
    typeof sanitized.annualTurnover === "string" &&
    sanitized.annualTurnover !== ""
  )
    sanitized.annualTurnover = parseFloat(sanitized.annualTurnover);
  if (typeof sanitized.grossProfit === "string" && sanitized.grossProfit !== "")
    sanitized.grossProfit = parseFloat(sanitized.grossProfit);
  if (typeof sanitized.payrollYear === "string" && sanitized.payrollYear !== "")
    sanitized.payrollYear = parseInt(sanitized.payrollYear);

  // Convert visitDate string from API/DB to Date object for DatePicker
  if (typeof sanitized.visitDate === "string" && sanitized.visitDate) {
    const parsedDate = new Date(sanitized.visitDate);
    if (!isNaN(parsedDate.getTime())) {
      sanitized.visitDate = parsedDate; // <-- Here you're converting string to Date for UI
    } else {
      sanitized.visitDate = null;
    }
  } else if (!(sanitized.visitDate instanceof Date)) {
    sanitized.visitDate = null;
  }

  return sanitized as CustomerFormValues;
};

interface CustomerFormClientProps {
  mode: "edit" | "create";
  customerId?: string;
  initialData?: Customer;
}

export function CustomerFormClient({
  mode,
  customerId,
  initialData,
}: CustomerFormClientProps) {
  const router = useRouter();
  const { toast } = useToast();

  // Initialize with initialData if provided
  const [customer, setCustomer] = useState<CustomerFormValues | undefined>(
    initialData ? sanitizeCustomerData(initialData) : undefined
  );
  const [isLoading, setIsLoading] = useState(!initialData);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateAndFetchCustomer = useCallback(
    async (id: string) => {
      if (!id || typeof id !== "string") {
        toast({
          title: "Error",
          message: "Invalid customer ID",
          variant: "destructive",
        });
        router.push("/customers");
        return;
      }

      setIsLoading(true);
      try {
        const data = await Api.getCustomerById(id);
        if (data) {
          setCustomer(sanitizeCustomerData(data));
        } else {
          toast({
            title: "Error",
            message: "Customer not found.",
            variant: "destructive",
          });
          router.push("/customers");
        }
      } catch (error) {
        toast({
          title: "Error",
          message: "Failed to fetch customer details.",
          variant: "destructive",
        });
        router.push("/customers");
      } finally {
        setIsLoading(false);
      }
    },
    [router]
  );

  useEffect(() => {
    if (mode === "edit" && customerId && !initialData) {
      validateAndFetchCustomer(customerId);
    } else if (!mode || mode === "create") {
      setCustomer(defaultCustomerValues);
      setIsLoading(false);
    }
  }, [mode, customerId, initialData, validateAndFetchCustomer]);

  const handleSubmit = useCallback(
    async (formData: CustomerFormValues) => {
      console.log("Submitting customer data:", formData);
      setIsSubmitting(true);

      try {
        // Initialize the submission data with required fields
        const baseData = {
          companyName: formData.companyName,
          status: formData.status,
          // Initialize all required string fields with empty strings if not provided
          address: formData.address || "",
          phoneNumber: formData.phoneNumber || "",
          email: formData.email || "",
          website: formData.website || "",
          kvkNumber: formData.kvkNumber || "",
          legalForm: formData.legalForm || "",
          mainActivity: formData.mainActivity || "",
          sideActivities: formData.sideActivities || "",
          dga: formData.dga || "",
          description: formData.description || "",
          advisor: formData.advisor || "",
          visitLocation: formData.visitLocation || "",
          visitFrequency: formData.visitFrequency || "",
          conversationPartner: formData.conversationPartner || "",
          comments: formData.comments || "",
        };

        // Handle numeric fields with proper defaults
        const numericData = {
          staffFTE: Number(formData.staffFTE) || 0,
          annualTurnover: Number(formData.annualTurnover) || 0,
          grossProfit: Number(formData.grossProfit) || 0,
          payrollYear: Number(formData.payrollYear) || new Date().getFullYear(),
        };

        // Handle date fields
        const visitDate = formData.visitDate
          ? new Date(formData.visitDate).toISOString()
          : new Date().toISOString();

        // Combine all data into the submission object
        const dataToSubmit = {
          ...baseData,
          ...numericData,
          visitDate,
        };

        console.log("Prepared data for submission:", dataToSubmit);

        // Submit to API
        if (mode === "edit" && customerId) {
          console.log("Updating customer:", customerId);
          const response = await Api.updateCustomer(customerId, dataToSubmit);
          console.log("Customer updated:", response);
          toast({
            title: "Success",
            message: "Customer updated successfully.",
            variant: "success",
          });
        } else {
          console.log("Creating new customer");
          const response = await Api.createCustomer(dataToSubmit);
          console.log("Customer created:", response);
          toast({
            title: "Success",
            message: "Customer created successfully.",
            variant: "success",
          });
        }

        router.push("/customers");
      } catch (error: any) {
        console.error("Error submitting customer:", error);
        toast({
          title: "Error",
          message:
            error?.response?.data?.message ||
            error.message ||
            "Failed to save customer. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsSubmitting(false);
      }
    },
    [mode, customerId, router, toast]
  );

  if (isLoading || customer === undefined) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="w-full mx-auto rounded-md">
      <AuthenticatedPageLayout>
        <CustomerAccordionForm
          formkey={customerId || "create-new-customer"}
          mode={mode}
          customer={customer}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
        />
      </AuthenticatedPageLayout>
    </div>
  );
}
