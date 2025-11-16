import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  CircularProgress,
} from "@mui/material";
import { Item } from "@/src/services/item.service";

type Props = {
  open: boolean;
  item: Item | null;
  onCancel: () => void;
  onConfirm: () => void;
  loading?: boolean;
};

export default function ItemsDeleteDialog({
  open,
  item,
  onCancel,
  onConfirm,
  loading,
}: Props) {
  return (
    <Dialog open={open} onClose={onCancel}>
      <DialogTitle>Delete Item</DialogTitle>
      <DialogContent>
        Are you sure you want to delete {`"${item?.itemName}"`}?
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
