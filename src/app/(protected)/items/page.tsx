"use client";

import React from "react";
import {
  Box,
  Alert,
  Snackbar,
  Divider,
  useMediaQuery,
  CircularProgress,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useItemsLogic } from "@/src/hooks/useItemsLogic";
import { useColumnVisibility } from "@/src/hooks/useColumnVisibility";
import { usePagination } from "@/src/hooks/usePagination";
import ItemsHeader from "@/src/components/itemsPage/ItemsHeader";
import ItemsActions from "@/src/components/itemsPage/ItemsActions";
import ItemsColumnMenu from "@/src/components/itemsPage/ItemsColumnMenu";
import ItemsTable from "@/src/components/itemsPage/ItemsTable";
import ItemsPagination from "@/src/components/itemsPage/ItemsPagination";
import ItemsDeleteDialog from "@/src/components/dialog/ItemDeleteDialog";
import { ItemAddEditDialog } from "@/src/components/dialog/ItemAddEditDialog";
import ItemsMobileList from "@/src/components/itemsPage/ItemsMobileList";

export default function ItemsPage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const logic = useItemsLogic();
  const columnVisibility = useColumnVisibility();
  const pagination = usePagination(logic.filtered);

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "calc(100vh - 64px)",
      }}
    >
      <ItemsHeader />

      <Divider />

      <ItemsActions
        query={logic.query}
        setQuery={(q) => {
          logic.setQuery(q);
          pagination.setPage(0);
        }}
        onAdd={() => logic.openEditor(null)}
        onExport={logic.handleExport}
        onOpenColumnMenu={columnVisibility.openMenu}
        isMobile={isMobile}
      />

      <Divider sx={{ mb: 2 }} />

      <ItemsColumnMenu
        anchorEl={columnVisibility.anchorEl}
        open={Boolean(columnVisibility.anchorEl)}
        onClose={columnVisibility.closeMenu}
        visibleColumns={columnVisibility.visibleColumns}
        toggleColumn={columnVisibility.toggleColumn}
      />

      {logic.isLoading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
          <CircularProgress size={64} />
        </Box>
      ) : logic.error ? (
        <Box sx={{ py: 4 }}>
          <Alert severity="error">
            Failed to load items. Please try again.
          </Alert>
        </Box>
      ) : (
        <Box sx={{ flex: 1, overflow: "auto", px: { xs: 2, md: 4 }, pb: 8 }}>
          {isMobile ? (
            <ItemsMobileList
              rows={pagination.visibleRows}
              onEdit={logic.openEditor}
              onDelete={logic.openDeleteDialog}
            />
          ) : (
            <ItemsTable
              rows={pagination.visibleRows}
              columns={columnVisibility.visibleColumns}
              order={logic.order}
              orderBy={logic.orderBy}
              onRequestSort={logic.handleRequestSort}
              onEdit={logic.openEditor}
              onDelete={logic.openDeleteDialog}
            />
          )}
        </Box>
      )}

      <ItemsPagination
        count={logic.filtered.length}
        page={pagination.page}
        rowsPerPage={pagination.rowsPerPage}
        onPageChange={pagination.onChangePage}
        onRowsPerPageChange={pagination.onChangeRowsPerPage}
      />

      <ItemsDeleteDialog
        open={logic.deleteDialogOpen}
        item={logic.itemToDelete}
        onCancel={logic.closeDeleteDialog}
        onConfirm={logic.handleDeleteConfirm}
        loading={logic.deleteMutation.isPending}
      />

      <ItemAddEditDialog
        open={logic.editorOpen}
        item={logic.selectedItem}
        onClose={logic.closeEditor}
        onSave={logic.handleSave}
      />

      <Snackbar
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
        open={logic.snackbar.open}
        autoHideDuration={3000}
        onClose={logic.onSnackbarClose}
      >
        <Alert severity={logic.snackbar.severity}>
          {logic.snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
