// app/customers/form/page.tsx
import { Suspense } from "react";
import { CustomerFormClient } from "./CustomerFormClient";

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CustomerFormClient mode="create" />
    </Suspense>
  );
}
