"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { CustomerAccordionForm } from "@/components/customers/customer-dialog";
import { customerFormSchema } from "@/lib/schemas/customer";
import * as Api from "@/services/api";
import type { z } from "zod";
import { CustomerStatus } from "@/types";

export default function CustomerFormPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const mode = searchParams.get("mode") === "edit" ? "edit" : "create";
  const id = searchParams.get("id");

  const defaultCustomer: z.infer<typeof customerFormSchema> = {
    companyName: "",
    address: "",
    phoneNumber: "",
    email: "",
    website: "",
    kvkNumber: "",
    legalForm: "",
    mainActivity: "",
    sideActivities: "",
    dga: "",
    staffFTE: 0,
    annualTurnover: 0,
    grossProfit: 0,
    payrollYear: 0,
    description: "",
    visitDate: "",
    advisor: "",
    visitLocation: "",
    visitFrequency: "",
    conversationPartner: "",
    comments: "",
    status: "in-progress",
    lastModified: new Date().toISOString(),
  };

  const [customer, setCustomer] =
    useState<z.infer<typeof customerFormSchema>>(defaultCustomer);

  useEffect(() => {
    if (mode === "edit" && id) {
      Api.getCustomerById(id).then((data) => {
        setCustomer({ ...defaultCustomer, ...data });
      });
    }
  }, [mode, id]);

  const handleSubmit = async (data: z.infer<typeof customerFormSchema>) => {
    // Normalize defaults here if needed
    const completeData = {
      ...data,
      address: data.address ?? "",
      phoneNumber: data.phoneNumber ?? "",
      email: data.email ?? "",
      website: data.website ?? "",
      kvkNumber: data.kvkNumber ?? "",
      legalForm: data.legalForm ?? "",
      mainActivity: data.mainActivity ?? "",
      sideActivities: data.sideActivities ?? "",
      dga: data.dga ?? "",
      staffFTE: data.staffFTE ?? 0,
      annualTurnover: data.annualTurnover ?? 0,
      grossProfit: data.grossProfit ?? 0,
      payrollYear: data.payrollYear ?? 0,
      description: data.description ?? "",
      visitDate: data.visitDate ?? "",
      advisor: data.advisor ?? "",
      visitLocation: data.visitLocation ?? "",
      visitFrequency: data.visitFrequency ?? "",
      conversationPartner: data.conversationPartner ?? "",
      comments: data.comments ?? "",
      status: "in-progress" as CustomerStatus,
      lastModified: new Date().toISOString(),
    };

    if (mode === "edit" && id) {
      await Api.updateCustomer(id, completeData);
    } else {
      await Api.createCustomer(completeData);
    }

    router.push("/customers");
  };

  return (
    <div className="max-w-3xl mx-auto p-4 rounded-md shadow-md">
    <h1 className="text-3xl font-bold mb-6 text-center">Customer</h1>
    <CustomerAccordionForm
      mode={mode}
      customer={customer}
      onSubmit={handleSubmit}
    />
    </div>
  );
}
