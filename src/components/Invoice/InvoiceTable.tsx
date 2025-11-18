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
  TablePagination,
} from "@mui/material";
import { Edit, Delete, Print } from "@mui/icons-material";
import { visuallyHidden } from "@mui/utils";
import { format } from "date-fns";
import { Invoice } from "@/src/services/invoice.service";
import { formatMoney } from "@/src/utils/formatMoney";
import { useAuthStore } from "@/src/store/auth.store";
import { usePagination } from "@/src/hooks/usePagination";

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
  const pagination = usePagination(invoices);

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
    <Box>
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
                    {formatMoney(
                      invoice.invoiceAmount,
                      company?.currencySymbol
                    )}
                  </TableCell>
                )}
                {visibleColumns.actions && (
                  <TableCell>
                    <Box sx={{ display: "flex", gap: 0.5 }}>
                      <Tooltip title="Edit">
                        <IconButton
                          size="small"
                          onClick={() => onEdit(invoice)}
                        >
                          <Edit fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Print">
                        <IconButton
                          size="small"
                          onClick={() => onPrint(invoice)}
                        >
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
      <Box
        sx={{
          bgcolor: "white",
          border: "1px solid #e5e5e5",
          borderBottomRightRadius: 2,
          borderBottomLeftRadius: 2,
          px: { xs: 2, md: 4 },
          width: {
            sm: "100%",
            xs: "100%",
            md: "auto",
          },
        }}
      >
        <TablePagination
          component="div"
          count={invoices.length}
          page={pagination.page}
          onPageChange={pagination.onChangePage}
          rowsPerPage={pagination.rowsPerPage}
          onRowsPerPageChange={pagination.onChangeRowsPerPage}
          rowsPerPageOptions={[5, 10, 25, 50]}
          labelRowsPerPage="Rows per page"
          labelDisplayedRows={() => ""}
          sx={{
            ".MuiTablePagination-toolbar": {
              display: "flex",
              alignItems: "center",
              width: "100%",
              px: 2,
            },
            ".MuiSelect-select": {
              borderRadius: 1,
              border: "2px solid #E5E7EB",
            },
            ".MuiTablePagination-spacer": { display: "none" },
            ".MuiTablePagination-selectLabel": { display: "block" },
            ".MuiTablePagination-displayedRows": { display: "none" },
          }}
          ActionsComponent={({ page, count, rowsPerPage, onPageChange }) => {
            const totalPages = Math.ceil(count / rowsPerPage);
            return (
              <Box
                sx={{
                  display: "flex",
                  gap: 1,
                  alignItems: "center",
                  flex: 1,
                  justifyContent: "flex-end",
                }}
              >
                <Typography>
                  {totalPages} - {totalPages * rowsPerPage} of {count}
                </Typography>
                <IconButton
                  size="small"
                  disabled={page === 0}
                  onClick={(event) => onPageChange(event, page - 1)}
                  sx={{
                    width: 28,
                    height: 28,
                  }}
                >
                  {"<"}
                </IconButton>

                <IconButton
                  size="small"
                  disabled={page >= totalPages - 1}
                  onClick={(event) => onPageChange(event, page + 1)}
                  sx={{
                    width: 28,
                    height: 28,
                  }}
                >
                  {">"}
                </IconButton>
              </Box>
            );
          }}
        />
      </Box>
    </Box>
  );
};
