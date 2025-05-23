// app/customers/form/page.tsx
import { Suspense } from "react";
import CustomerFormPage from "./CustomerFormClient"; // <- rename for clarity

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CustomerFormPage />
    </Suspense>
  );
}
