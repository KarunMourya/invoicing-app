import React from "react";
import {
  Box,
  Paper,
  Typography,
  IconButton,
  Divider,
  Tooltip,
} from "@mui/material";
import { Edit, Delete, Print } from "@mui/icons-material";
import { format } from "date-fns";
import { Invoice } from "@/src/services/invoice.service";
import { formatMoney } from "@/src/utils/formatMoney";
import { useAuthStore } from "@/src/store/auth.store";

interface Props {
  invoices: Invoice[];
  onEdit: (invoice: Invoice) => void;
  onDelete: (invoice: Invoice) => void;
  onPrint: (invoice: Invoice) => void;
}

export const InvoiceMobileCards: React.FC<Props> = ({
  invoices,
  onEdit,
  onDelete,
  onPrint,
}) => {
  const { company } = useAuthStore();

  if (invoices.length === 0) {
    return (
      <Paper
        elevation={0}
        sx={{
          border: "1px solid #e5e5e5",
          borderRadius: 2,
          p: 5,
          textAlign: "center",
          mt: 2,
        }}
      >
        <Typography variant="h6" color="text.secondary">
          No invoices found
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Create your first invoice to get started
        </Typography>
      </Paper>
    );
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2 }}>
      {invoices.map((invoice) => (
        <Paper
          key={invoice.primaryKeyID}
          elevation={0}
          sx={{
            border: "1px solid #e5e5e5",
            borderRadius: 2,
            p: 2,
          }}
        >
          {/* HEADER */}
          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              {invoice.invoiceNo}
            </Typography>

            <Box sx={{ display: "flex", gap: 0.5 }}>
              <Tooltip title="Edit">
                <IconButton size="small" onClick={() => onEdit(invoice)}>
                  <Edit fontSize="small" />
                </IconButton>
              </Tooltip>

              <Tooltip title="Print">
                <IconButton size="small" onClick={() => onPrint(invoice)}>
                  <Print fontSize="small" />
                </IconButton>
              </Tooltip>

              <Tooltip title="Delete">
                <IconButton size="small" onClick={() => onDelete(invoice)}>
                  <Delete fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>

          <Typography sx={{ fontSize: 13, color: "#6b7280", mb: 1 }}>
            {format(new Date(invoice.invoiceDate), "dd-MMM-yyyy")}
          </Typography>

          <Divider sx={{ my: 1 }} />

          <Box sx={{ display: "flex", flexDirection: "column", gap: 0.7 }}>
            <Field label="Customer" value={invoice.customerName} />
            <Field label="Items" value={invoice.totalItems} />

            <Field
              label="Sub Total"
              value={formatMoney(invoice.subTotal, company?.currencySymbol)}
            />

            <Field
              label="Tax"
              value={`${invoice.taxPercentage.toFixed(2)}% (${formatMoney(
                invoice.taxAmount,
                company?.currencySymbol
              )})`}
            />

            <Field
              label="Total Amount"
              value={formatMoney(
                invoice.invoiceAmount,
                company?.currencySymbol
              )}
              highlight
            />
          </Box>
        </Paper>
      ))}
    </Box>
  );
};

const Field = ({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string | number;
  highlight?: boolean;
}) => (
  <Box>
    <Typography sx={{ fontSize: 12, color: "#9ca3af" }}>{label}</Typography>
    <Typography
      sx={{
        fontSize: 14,
        fontWeight: highlight ? 700 : 500,
        color: highlight ? "#2563eb" : "#374151",
      }}
    >
      {value}
    </Typography>
  </Box>
);
