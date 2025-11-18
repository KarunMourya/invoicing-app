"use client";

import InvoiceFormPage from "@/src/components/Invoice/InvoiceFormPage";
import { use } from "react";

export default function EditInvoicePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  return <InvoiceFormPage invoiceID={parseInt(id)} />;
}