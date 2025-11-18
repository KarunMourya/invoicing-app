import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Typography,
  Box,
  Tooltip,
  TableSortLabel,
} from "@mui/material";
import { Edit, Delete, Print } from "@mui/icons-material";
import { visuallyHidden } from "@mui/utils";
import { format } from "date-fns";
import { Invoice } from "@/src/services/invoice.service";
import { formatMoney } from "@/src/utils/formatMoney";
import { useAuthStore } from "@/src/store/auth.store";

type Order = "asc" | "desc";
type OrderBy = keyof Invoice;

interface InvoiceTableProps {
  invoices: Invoice[];
  onEdit: (invoice: Invoice) => void;
  onDelete: (invoice: Invoice) => void;
  onPrint: (invoice: Invoice) => void;
  visibleColumns: Record<string, boolean>;
}

export const InvoiceTable: React.FC<InvoiceTableProps> = ({
  invoices,
  onEdit,
  onDelete,
  onPrint,
  visibleColumns,
}) => {
  const { company } = useAuthStore();
  const [order, setOrder] = React.useState<Order>("desc");
  const [orderBy, setOrderBy] = React.useState<OrderBy>("invoiceDate");

  const handleRequestSort = (property: OrderBy) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const sortedInvoices = React.useMemo(() => {
    return [...invoices].sort((a, b) => {
      const aValue = a[orderBy] ?? "";
      const bValue = b[orderBy] ?? "";

      if (aValue < bValue) {
        return order === "asc" ? -1 : 1;
      }
      if (aValue > bValue) {
        return order === "asc" ? 1 : -1;
      }
      return 0;
    });
  }, [invoices, order, orderBy]);

  const columns = [
    { id: "invoiceNo", label: "Invoice No", sortable: true },
    { id: "invoiceDate", label: "Date", sortable: true },
    { id: "customerName", label: "Customer", sortable: true },
    { id: "totalItems", label: "Items", sortable: true },
    {
      id: "subTotal",
      label: "Sub Total",
      sortable: true,
      align: "right" as const,
    },
    {
      id: "taxPercentage",
      label: "Tax %",
      sortable: true,
      align: "right" as const,
    },
    {
      id: "taxAmount",
      label: "Tax Amt",
      sortable: true,
      align: "right" as const,
    },
    {
      id: "invoiceAmount",
      label: "Total",
      sortable: true,
      align: "right" as const,
    },
    { id: "actions", label: "Actions", sortable: false },
  ];

  if (invoices.length === 0) {
    return (
      <Paper
        elevation={0}
        sx={{
          border: "1px solid #e5e5e5",
          borderRadius: 2,
          p: 8,
          textAlign: "center",
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
    <TableContainer
      component={Paper}
      elevation={0}
      sx={{
        border: "1px solid #e5e5e5",
        borderRadius: 2,
        borderBottomRightRadius: 0,
        borderBottomLeftRadius: 0,
      }}
    >
      <Table>
        <TableHead>
          <TableRow sx={{ bgcolor: "#fafafa" }}>
            {columns.map((column) => {
              if (!visibleColumns[column.id]) return null;

              return (
                <TableCell
                  key={column.id}
                  align={column.align}
                  sortDirection={orderBy === column.id ? order : false}
                >
                  {column.sortable ? (
                    <TableSortLabel
                      active={orderBy === column.id}
                      direction={orderBy === column.id ? order : "asc"}
                      onClick={() => handleRequestSort(column.id as OrderBy)}
                    >
                      {column.label}
                      {orderBy === column.id && (
                        <Box component="span" sx={visuallyHidden}>
                          {order === "desc"
                            ? "sorted descending"
                            : "sorted ascending"}
                        </Box>
                      )}
                    </TableSortLabel>
                  ) : (
                    column.label
                  )}
                </TableCell>
              );
            })}
          </TableRow>
        </TableHead>

        <TableBody>
          {sortedInvoices.map((invoice) => (
            <TableRow
              key={invoice.primaryKeyID}
              hover
              sx={{ "&:last-child td": { border: 0 } }}
            >
              {visibleColumns.invoiceNo && (
                <TableCell sx={{ fontWeight: 600 }}>
                  {invoice.invoiceNo}
                </TableCell>
              )}
              {visibleColumns.invoiceDate && (
                <TableCell>
                  {format(new Date(invoice.invoiceDate), "dd-MMM-yyyy")}
                </TableCell>
              )}
              {visibleColumns.customerName && (
                <TableCell>{invoice.customerName}</TableCell>
              )}
              {visibleColumns.totalItems && (
                <TableCell align="center">{invoice.totalItems}</TableCell>
              )}
              {visibleColumns.subTotal && (
                <TableCell align="right" sx={{ fontWeight: 500 }}>
                  {formatMoney(invoice.subTotal, company?.currencySymbol)}
                </TableCell>
              )}
              {visibleColumns.taxPercentage && (
                <TableCell align="right">
                  {invoice.taxPercentage.toFixed(2)}%
                </TableCell>
              )}
              {visibleColumns.taxAmount && (
                <TableCell align="right">
                  {formatMoney(invoice.taxAmount, company?.currencySymbol)}
                </TableCell>
              )}
              {visibleColumns.invoiceAmount && (
                <TableCell
                  align="right"
                  sx={{
                    fontWeight: 700,
                    fontSize: "1rem",
                  }}
                >
                  {formatMoney(invoice.invoiceAmount, company?.currencySymbol)}
                </TableCell>
              )}
              {visibleColumns.actions && (
                <TableCell>
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
                      <IconButton
                        size="small"
                        onClick={() => onDelete(invoice)}
                      >
                        <Delete fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};
