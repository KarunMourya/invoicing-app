export const ITEMS_TABLE_CELLS = [
  { id: "picture", label: "Picture" },
  { id: "itemName", label: "Item Name" },
  { id: "description", label: "Description" },
  { id: "salesRate", label: "Sale Rate" },
  { id: "discountPct", label: "Discount %" },
  { id: "actions", label: "Actions" },
] as const;

export const INVOICE_TABLE_CELLS = [
  { id: "invoiceNo", label: "Invoice No" },
  { id: "invoiceDate", label: "Date" },
  { id: "customerName", label: "Customer" },
  { id: "totalItems", label: "Items" },
  { id: "subTotal", label: "Sub Total" },
  { id: "taxPercentage", label: "Tax %" },
  { id: "taxAmount", label: "Tax Amt" },
  { id: "invoiceAmount", label: "Total" },
  { id: "actions", label: "Actions" },
] as const;
