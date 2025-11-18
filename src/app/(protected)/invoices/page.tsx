"use client";

import React, { useState } from "react";
import {
  Box,
  Typography,
  ToggleButtonGroup,
  ToggleButton,
  CircularProgress,
  Snackbar,
  Alert,
  Divider,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { useRouter } from "next/navigation";
import { useInvoicesLogic } from "@/src/hooks/useInvoicesLogic";
import { Invoice } from "@/src/services/invoice.service";
import { InvoiceStatsCards } from "@/src/components/InvoicePage/InvoiceStatsCards";
import { InvoiceTable } from "@/src/components/InvoicePage/InvoiceTable";
import { InvoiceMobileLists } from "@/src/components/InvoicePage/InvoiceMobileLists";
import InvoiceDeleteDialog from "@/src/components/dialog/InvoiceDeleteDialog";
import { usePagination } from "@/src/hooks/usePagination";
import Actions from "@/src/components/common/Actions";
import { INVOICE_TABLE_CELLS } from "@/src/constants/items.constant";
import ColumnMenu from "@/src/components/common/ColumnMenu";
import Pagination from "@/src/components/common/Pagination";

export default function InvoicesPage() {
  const router = useRouter();

  const invoiceLogic = useInvoicesLogic();
  const pagination = usePagination(invoiceLogic.invoices);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [visibleColumns, setVisibleColumns] = useState<Record<string, boolean>>(
    INVOICE_TABLE_CELLS.reduce(
      (acc, column) => ({ ...acc, [column.id]: true }),
      {}
    )
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
    invoiceLogic.setInvoiceToDelete(invoice);
    invoiceLogic.setDeleteDialogOpen(true);
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
            value={invoiceLogic.dateRange}
            exclusive
            onChange={(_, value) => value && invoiceLogic.setDateRange(value)}
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
          tab={invoiceLogic.dateRange}
          count={invoiceLogic.metrics?.[0]?.invoiceCount}
          totalAmount={invoiceLogic.metrics?.[0]?.totalAmount}
          isLoading={invoiceLogic.isMetricsLoading}
          trend={invoiceLogic.trend}
          topItems={invoiceLogic.topItems}
          isTrendLoading={invoiceLogic.isTrendLoading}
          isTopItemsLoading={invoiceLogic.isTopItemsLoading}
        />

        <Actions
          query={invoiceLogic.searchQuery}
          setQuery={(q) => {
            invoiceLogic.setSearchQuery(q);
            pagination.setPage(0);
          }}
          onAdd={handleNewInvoice}
          onExport={invoiceLogic.handleExport}
          onOpenColumnMenu={handleColumnMenuOpen}
          isMobile={isMobile}
        />

        {invoiceLogic.isLoading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
            <CircularProgress />
          </Box>
        ) : isMobile ? (
          <InvoiceMobileLists
            invoices={invoiceLogic.filteredInvoices}
            onEdit={handleEdit}
            onDelete={handleDeleteClick}
            onPrint={invoiceLogic.handlePrint}
          />
        ) : (
          <Box sx={{ my: 4 }}>
            <InvoiceTable
              invoices={invoiceLogic.filteredInvoices}
              onEdit={handleEdit}
              onDelete={handleDeleteClick}
              onPrint={invoiceLogic.handlePrint}
              visibleColumns={visibleColumns}
            />
            <Pagination
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
              variant="outside-pagination"
              count={invoiceLogic.filteredInvoices.length}
              page={pagination.page}
              rowsPerPage={pagination.rowsPerPage}
              onPageChange={pagination.onChangePage}
              onRowsPerPageChange={pagination.onChangeRowsPerPage}
            />
          </Box>
        )}
      </Box>

      <ColumnMenu
        columns={INVOICE_TABLE_CELLS}
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleColumnMenuClose}
        visibleColumns={visibleColumns}
        toggleColumn={(id) => toggleColumn(id)}
      />

      <InvoiceDeleteDialog
        open={invoiceLogic.deleteDialogOpen}
        invoiceNo={invoiceLogic.invoiceToDelete?.invoiceNo}
        onCancel={() => {
          invoiceLogic.setDeleteDialogOpen(false);
          invoiceLogic.setInvoiceToDelete(null);
        }}
        onConfirm={invoiceLogic.handleDeleteConfirm}
        loading={invoiceLogic.deleteMutation.isPending}
      />

      <Snackbar
        open={invoiceLogic.snackbar.open}
        autoHideDuration={3000}
        onClose={() =>
          invoiceLogic.setSnackbar({ ...invoiceLogic.snackbar, open: false })
        }
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert severity={invoiceLogic.snackbar.severity}>
          {invoiceLogic.snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
