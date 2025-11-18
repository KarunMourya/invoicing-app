import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  CircularProgress,
  Box,
  Typography,
} from "@mui/material";

type Props = {
  open: boolean;
  invoiceNo?: string | null;
  onCancel: () => void;
  onConfirm: () => void;
  loading?: boolean;
};

export default function InvoiceDeleteDialog({
  open,
  invoiceNo,
  onCancel,
  onConfirm,
  loading,
}: Props) {
  return (
    <Dialog open={open} onClose={onCancel}>
      <DialogTitle>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          Delete Invoice
        </Box>
      </DialogTitle>
      <DialogContent>
        <Typography>
          Are you sure you want to delete invoice <strong>{invoiceNo}</strong>?
          This action cannot be undone.
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button
          sx={{
            backgroundColor: "white",
            borderRadius: 2,
            color: "black",
            border: "1px solid #e5E7eb",
          }}
          onClick={onCancel}
        >
          Cancel
        </Button>
        <Button
          sx={{
            backgroundColor: "red",
            borderRadius: 2,
            color: "white",
            border: "1px solid",
            minWidth: 80,
          }}
          onClick={onConfirm}
          disabled={loading}
        >
          {loading ? (
            <CircularProgress size={20} sx={{ color: "white" }} />
          ) : (
            "Delete"
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
