"use client";

import React, { useState } from "react";
import {
  Box,
  Typography,
  Button,
  TextField,
  InputAdornment,
  ToggleButtonGroup,
  ToggleButton,
  IconButton,
  Menu,
  MenuItem,
  Checkbox,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Snackbar,
  Alert,
  Divider,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import {
  Add,
  Search,
  FileDownload,
  ViewColumn,
} from "@mui/icons-material";
import { useRouter } from "next/navigation";
import { useInvoices } from "@/src/hooks/useInvoices";
import { Invoice } from "@/src/services/invoice.service";
import { InvoiceStatsCards } from "@/src/components/Invoice/InvoiceStatsCards";
import { InvoiceTable } from "@/src/components/Invoice/InvoiceTable";
import { InvoiceMobileCards } from "@/src/components/Invoice/InvoiceMobileCards";

const INVOICE_COLUMNS = [
  { id: "invoiceNo", label: "Invoice No" },
  { id: "invoiceDate", label: "Date" },
  { id: "customerName", label: "Customer" },
  { id: "totalItems", label: "Items" },
  { id: "subTotal", label: "Sub Total" },
  { id: "taxPercentage", label: "Tax %" },
  { id: "taxAmount", label: "Tax Amt" },
  { id: "invoiceAmount", label: "Total" },
  { id: "actions", label: "Actions" },
];

export default function InvoicesPage() {
  const router = useRouter();

  const {
    filteredInvoices,
    metrics,
    isLoading,
    isMetricsLoading,
    dateRange,
    trend,
    topItems,
    isTrendLoading,
    isTopItemsLoading,
    setDateRange,
    searchQuery,
    setSearchQuery,
    invoiceToDelete,
    setInvoiceToDelete,
    deleteMutation,
    handlePrint,
    snackbar,
    deleteDialogOpen,
    setDeleteDialogOpen,
    handleDeleteConfirm,
    setSnackbar,
    handleExport,
  } = useInvoices();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [visibleColumns, setVisibleColumns] = useState<Record<string, boolean>>(
    INVOICE_COLUMNS.reduce((acc, col) => ({ ...acc, [col.id]: true }), {})
  );

  const handleColumnMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleColumnMenuClose = () => {
    setAnchorEl(null);
  };

  const toggleColumn = (columnId: string) => {
    setVisibleColumns((prev) => ({
      ...prev,
      [columnId]: !prev[columnId],
    }));
  };

  const handleNewInvoice = () => {
    router.push("/invoices/new");
  };

  const handleEdit = (invoice: Invoice) => {
    router.push(`/invoices/${invoice.invoiceID}`);
  };

  const handleDeleteClick = (invoice: Invoice) => {
    setInvoiceToDelete(invoice);
    setDeleteDialogOpen(true);
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "calc(100vh - 64px)",
      }}
    >
      <Box
        sx={{
          px: { xs: 2, md: 4 },
          py: 1,
          bgcolor: "white",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        <Typography variant="h5" sx={{ fontWeight: 600, color: "#1f2937" }}>
          Invoices
        </Typography>

        <Box
          sx={{
            py: 1,
            bgcolor: "white",
            display: "flex",
            justifyContent: "flex-end",
          }}
        >
          <ToggleButtonGroup
            value={dateRange}
            exclusive
            onChange={(_, value) => value && setDateRange(value)}
            size="small"
            sx={{
              "& .MuiToggleButton-root": {
                textTransform: "none",
                px: 3,
                py: 0.7,
                borderRadius: "20px",
                border: "1px solid #e5e5e5",
                color: "#444",
                fontSize: "0.85rem",
                backgroundColor: "#f7f7f7",
                "&:hover": {
                  backgroundColor: "#efefef",
                },
              },

              "& .Mui-selected": {
                backgroundColor: "#000 !important",
                color: "#fff !important",
                border: "1px solid #000 !important",
              },

              "& .MuiToggleButtonGroup-grouped": {
                margin: "0 4px",
                border: "none",
              },
            }}
          >
            <ToggleButton value="today">Today</ToggleButton>
            <ToggleButton value="week">Week</ToggleButton>
            <ToggleButton value="month">Month</ToggleButton>
            <ToggleButton value="year">Year</ToggleButton>
            <ToggleButton value="custom">Custom</ToggleButton>
          </ToggleButtonGroup>
        </Box>
      </Box>

      <Divider />

      <Box sx={{ flex: 1, overflow: "auto", px: { xs: 2, md: 4 }, py: 3 }}>
        <InvoiceStatsCards
          tab={dateRange}
          count={metrics?.[0]?.invoiceCount}
          totalAmount={metrics?.[0]?.totalAmount}
          isLoading={isMetricsLoading}
          trend={trend}
          topItems={topItems}
          isTrendLoading={isTrendLoading}
          isTopItemsLoading={isTopItemsLoading}
        />

        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 3,
            gap: 2,
            flexWrap: "wrap",
          }}
        >
          <TextField
            placeholder="Search Invoice No, Customer..."
            size="small"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{
              width: { xs: "100%", md: "100%", lg: 400 },
              "& .MuiOutlinedInput-root": { bgcolor: "white" },
            }}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <Search sx={{ color: "#757575" }} />
                  </InputAdornment>
                ),
              },
            }}
          />

          <Box
            sx={{
              display: "flex",
              gap: 1,
              flexWrap: "wrap",
              width: { md: "100%", sm: "100%", xs: "100%", lg: "inherit" },
            }}
          >
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={handleNewInvoice}
              sx={{
                flex: 1,
                textWrap: "nowrap",
                textTransform: "none",
                bgcolor: "#525252",
                "&:hover": { bgcolor: "#424242" },
              }}
            >
              New Invoice
            </Button>
            <Button
              variant="outlined"
              startIcon={<FileDownload />}
              onClick={handleExport}
              sx={{
                flex: 1,
                textTransform: "none",
                backgroundColor: "#E5E7EB",
                borderColor: "#d0d0d0",
                color: "#424242",
                "&:hover": { bgcolor: "#fafafa" },
              }}
            >
              Export
            </Button>
            {!isMobile && (
              <IconButton
                onClick={handleColumnMenuOpen}
                sx={{
                  backgroundColor: "#E5E7EB",
                  borderRadius: 1,
                  "&:hover": { backgroundColor: "#d0d0d0" },
                }}
              >
                <ViewColumn />
              </IconButton>
            )}
          </Box>
        </Box>

        {isLoading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
            <CircularProgress />
          </Box>
        ) : isMobile ? (
          <InvoiceMobileCards
            invoices={filteredInvoices}
            onEdit={handleEdit}
            onDelete={handleDeleteClick}
            onPrint={handlePrint}
          />
        ) : (
          <InvoiceTable
            invoices={filteredInvoices}
            onEdit={handleEdit}
            onDelete={handleDeleteClick}
            onPrint={handlePrint}
            visibleColumns={visibleColumns}
          />
        )}
      </Box>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleColumnMenuClose}
      >
        {INVOICE_COLUMNS.map((col) => (
          <MenuItem key={col.id} onClick={() => toggleColumn(col.id)}>
            <Checkbox checked={visibleColumns[col.id]} />
            <Typography>{col.label}</Typography>
          </MenuItem>
        ))}
      </Menu>

      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            Delete Invoice
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete invoice{" "}
            <strong>{invoiceToDelete?.invoiceNo}</strong>? This action cannot be
            undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button color="inherit" onClick={() => setDeleteDialogOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            variant="contained"
            color="error"
            disabled={deleteMutation.isPending}
          >
            {deleteMutation.isPending ? "Deleting..." : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
}
