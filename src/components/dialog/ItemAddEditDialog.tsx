"use client";

import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import {
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  CircularProgress,
  IconButton,
  Typography,
} from "@mui/material";
import { Close, Image as ImageIcon } from "@mui/icons-material";
import { useState, useEffect } from "react";
import Image from "next/image";
import { z } from "zod";
import {
  CreateItemPayload,
  UpdateItemPayload,
} from "../../services/item.service";

const itemSchema = z.object({
  itemName: z
    .string()
    .trim()
    .min(1, "Item name is required")
    .max(50, "Item name must be max 50 characters"),

  description: z
    .string()
    .trim()
    .max(500, "Description must be max 500 characters")
    .optional()
    .default(""),

  salesRate: z
    .string()
    .min(1, "Valid sale rate is required")
    .refine((val) => parseFloat(val) >= 0, {
      message: "Sale rate must be >= 0",
    }),

  discountPct: z.string().refine(
    (val) => {
      const num = parseFloat(val);
      return !isNaN(num) && num >= 0 && num <= 100;
    },
    { message: "Discount must be between 0 and 100" }
  ),
});

interface Item {
  itemID: number;
  itemName: string;
  description: string;
  salesRate: number;
  itemPicture?: string;
  discountPct: number;
  updatedOn?: string | null;
}

interface ItemAddEditDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: CreateItemPayload | UpdateItemPayload) => Promise<void>;
  item?: Item | null;
}

export function ItemAddEditDialog({
  open,
  onClose,
  onSave,
  item,
}: ItemAddEditDialogProps) {
  const [form, setForm] = useState({
    itemName: "",
    description: "",
    salesRate: "",
    discountPct: "0",
  });
  const [itemPicture, setItemPicture] = useState<File | null>(null);
  const [picturePreview, setPicturePreview] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (item) {
      setForm({
        itemName: item.itemName,
        description: item.description || "",
        salesRate: item.salesRate.toString(),
        discountPct: item.discountPct.toString(),
      });
      setPicturePreview(null);
      setItemPicture(null);
    } else {
      setForm({
        itemName: "",
        description: "",
        salesRate: "",
        discountPct: "0",
      });
      setPicturePreview(null);
      setItemPicture(null);
    }
    setErrors({});
  }, [item, open]);

  const validate = (): boolean => {
    try {
      itemSchema.parse(form);
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {};
        error.issues.forEach((err) => {
          if (err.path[0]) fieldErrors[err.path[0] as string] = err.message;
        });
        setErrors(fieldErrors);
      }
      return false;
    }
  };

  const handlePictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!["image/png", "image/jpeg", "image/jpg"].includes(file.type)) {
      setErrors((prev) => ({
        ...prev,
        itemPicture: "Invalid file type. Use PNG or JPG.",
      }));
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrors((prev) => ({
        ...prev,
        itemPicture: "Picture size must be less than 5MB.",
      }));
      return;
    }

    setItemPicture(file);
    setErrors((prev) => ({ ...prev, itemPicture: "" }));

    const reader = new FileReader();
    reader.onloadend = () => setPicturePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    if (!validate()) return;

    setLoading(true);
    try {
      const payload = {
        ...(item ? { itemID: item.itemID, updatedOn: item.updatedOn } : {}),
        itemName: form.itemName.trim(),
        description: form.description.trim(),
        salesRate: parseFloat(form.salesRate),
        discountPct: parseFloat(form.discountPct),
      };

      if (picturePreview) {
        payload.itemPicture = picturePreview;
      }
      await onSave(payload);
      onClose();
    } catch (error) {
      console.error("Save error:", error);
    } finally {
      setLoading(false);
    }
  };

  const descriptionLength = form.description.length;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          pb: 2,
        }}
      >
        <Typography variant="body1" sx={{ fontWeight: 400 }}>
          {item ? "Edit Item" : "New Item"}
        </Typography>
        <IconButton onClick={onClose} size="small">
          <Close />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers sx={{ pt: 3 }}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
          <Box>
            <Typography
              variant="body2"
              sx={{ mb: 1, fontWeight: 500, color: "#424242" }}
            >
              Item Picture
            </Typography>

            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Box
                sx={{
                  width: 80,
                  height: 80,
                  borderRadius: 1,
                  border: "1px dashed #cfcfcf",
                  bgcolor: "#f5f5f5",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  position: "relative",
                  flexShrink: 0,
                }}
              >
                {picturePreview ? (
                  <Image
                    src={picturePreview}
                    alt="Item preview"
                    fill
                    style={{ objectFit: "contain" }}
                  />
                ) : (
                  <ImageIcon sx={{ color: "#9e9e9e", fontSize: 32 }} />
                )}
              </Box>

              <Box sx={{ flex: 1 }}>
                <Button
                  component="label"
                  variant="outlined"
                  sx={{
                    textTransform: "none",
                    borderColor: "#d0d0d0",
                    color: "#424242",
                    width: "100%",
                    justifyContent: "flex-start",
                    "&:hover": {
                      borderColor: "#9e9e9e",
                    },
                  }}
                >
                  {itemPicture ? itemPicture.name : "No file chosen"}
                  <input
                    type="file"
                    hidden
                    accept="image/png,image/jpeg,image/jpg"
                    onChange={handlePictureChange}
                  />
                </Button>
                <Typography
                  variant="caption"
                  sx={{ color: "#757575", mt: 0.5, display: "block" }}
                >
                  PNG or JPG, max 5MB
                </Typography>
              </Box>
            </Box>

            {errors.itemPicture && (
              <Typography
                variant="caption"
                sx={{ color: "#d32f2f", mt: 0.5, display: "block" }}
              >
                {errors.itemPicture}
              </Typography>
            )}
          </Box>{" "}
          <Box>
            <Typography
              variant="body2"
              sx={{ mb: 1, fontWeight: 500, color: "#424242" }}
            >
              Item Name*
            </Typography>
            <TextField
              fullWidth
              placeholder="Enter item name"
              value={form.itemName}
              onChange={(e) => {
                setForm({ ...form, itemName: e.target.value });
                setErrors({ ...errors, itemName: "" });
              }}
              error={!!errors.itemName}
              helperText={errors.itemName}
              size="small"
              sx={{
                "& .MuiOutlinedInput-root": {
                  fontSize: "0.875rem",
                },
                "& .MuiFormHelperText-root": {
                  mx: 0,
                  mt: 0.5,
                },
              }}
            />
          </Box>
          <Box>
            <Typography
              variant="body2"
              sx={{ mb: 1, fontWeight: 500, color: "#424242" }}
            >
              Description
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={3}
              placeholder="Enter item description"
              value={form.description}
              onChange={(e) => {
                setForm({ ...form, description: e.target.value });
                setErrors({ ...errors, description: "" });
              }}
              error={!!errors.description}
              helperText={errors.description || `${descriptionLength}/500`}
              size="small"
              slotProps={{ htmlInput: { maxLength: 500 } }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  fontSize: "0.875rem",
                },
                "& .MuiFormHelperText-root": {
                  mx: 0,
                  mt: 0.5,
                  display: "flex",
                  justifyContent: errors.description
                    ? "flex-start"
                    : "flex-end",
                },
              }}
            />
          </Box>
          <Box sx={{ display: "flex", gap: 2 }}>
            <Box sx={{ flex: 1 }}>
              <Typography
                variant="body2"
                sx={{ mb: 1, fontWeight: 500, color: "#424242" }}
              >
                Sale Rate*
              </Typography>
              <TextField
                fullWidth
                type="number"
                placeholder="0.00"
                value={form.salesRate}
                onChange={(e) => {
                  setForm({ ...form, salesRate: e.target.value });
                  setErrors({ ...errors, salesRate: "" });
                }}
                error={!!errors.salesRate}
                helperText={errors.salesRate}
                size="small"
                slotProps={{ htmlInput: { min: 0, step: 0.01 } }}
                sx={{
                  ".MuiInputBase-input": {
                    textAlign: "end",
                  },
                  "& .MuiOutlinedInput-root": {
                    fontSize: "0.875rem",
                  },
                  "& .MuiFormHelperText-root": {
                    mx: 0,
                    mt: 0.5,
                  },
                }}
              />
            </Box>

            <Box sx={{ flex: 1 }}>
              <Typography
                variant="body2"
                sx={{ mb: 1, fontWeight: 500, color: "#424242" }}
              >
                Discount %
              </Typography>
              <TextField
                fullWidth
                type="number"
                placeholder="0 %"
                value={form.discountPct}
                onChange={(e) => {
                  setForm({ ...form, discountPct: e.target.value });
                  setErrors({ ...errors, discountPct: "" });
                }}
                error={!!errors.discountPct}
                helperText={errors.discountPct}
                size="small"
                slotProps={{ htmlInput: { min: 0, max: 100, step: 0.01 } }}
                sx={{
                  ".MuiInputBase-input": {
                    textAlign: "end",
                  },
                  "& .MuiOutlinedInput-root": {
                    fontSize: "0.875rem",
                  },
                  "& .MuiFormHelperText-root": {
                    mx: 0,
                    mt: 0.5,
                  },
                }}
              />
            </Box>
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2, justifyContent: "flex-end", gap: 1 }}>
        <Button
          onClick={onClose}
          disabled={loading}
          sx={{
            textTransform: "none",
            color: "#424242",
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          variant="contained"
          disabled={loading}
          sx={{
            textTransform: "none",
            bgcolor: "#525252",
            "&:hover": { bgcolor: "#424242" },
            minWidth: 80,
          }}
        >
          {loading ? (
            <CircularProgress size={20} sx={{ color: "white" }} />
          ) : (
            "Save"
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
