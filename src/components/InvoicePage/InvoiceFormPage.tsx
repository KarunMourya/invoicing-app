"use client";

import React, { useState, useEffect } from "react";
import {
  Box,
  TextField,
  Button,
  IconButton,
  Typography,
  Select,
  MenuItem,
  FormControl,
  CircularProgress,
  Snackbar,
  Alert,
  FormHelperText,
} from "@mui/material";
import { Add, ContentCopy, Delete } from "@mui/icons-material";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { InvoiceLine, invoiceService } from "@/src/services/invoice.service";
import { itemService } from "@/src/services/item.service";
import axios from "axios";
import { z } from "zod";

const invoiceLineSchema = z.object({
  rowNo: z.number().min(1),
  itemID: z.number().min(1, "Item is required"),
  description: z.string().min(1, "Description is required"),
  quantity: z.number().min(0.01, "Quantity must be greater than 0"),
  rate: z.number().min(0.01, "Rate must be greater than 0"),
  discountPct: z.number().min(0).max(100, "Discount must be between 0 and 100"),
});

const invoiceSchema = z.object({
  invoiceNo: z.string().min(1, "Invoice number is required"),
  invoiceDate: z.string().min(1, "Invoice date is required"),
  customerName: z.string().min(1, "Customer name is required"),
  address: z.string().optional(),
  city: z.string().optional(),
  taxPercentage: z.number().min(0).max(100),
  notes: z.string().optional(),
  lines: z
    .array(invoiceLineSchema)
    .min(1, "At least one line item is required"),
});

interface InvoiceFormPageProps {
  invoiceID?: number;
}

export default function InvoiceFormPage({ invoiceID }: InvoiceFormPageProps) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    invoiceNo: "",
    invoiceDate: new Date().toISOString().split("T")[0],
    customerName: "",
    address: "",
    city: "",
    taxPercentage: 0,
    notes: "",
    updatedOn: null as string | null,
  });

  const [lines, setLines] = useState<InvoiceLine[]>([
    {
      rowNo: 1,
      itemID: 0,
      description: "",
      quantity: 0,
      rate: 0,
      discountPct: 0,
    },
  ]);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [lineErrors, setLineErrors] = useState<
    Record<number, Record<string, string>>
  >({});

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error",
  });

  const { data: items = [], isLoading: isItemsLoading } = useQuery({
    queryKey: ["items"],
    queryFn: itemService.getList,
  });

  const {
    data: invoiceDetail,
    isLoading: isInvoiceLoading,
    isError: isInvoiceError,
  } = useQuery({
    queryKey: ["invoice", invoiceID],
    queryFn: () => invoiceService.getById(invoiceID!),
    enabled: !!invoiceID,
  });

  useEffect(() => {
    const setInvoiceDetails = () => {
    if (invoiceDetail) {
      setFormData({
        invoiceNo: invoiceDetail.invoiceNo.toString(),
        invoiceDate: invoiceDetail.invoiceDate,
        customerName: invoiceDetail.customerName,
        address: invoiceDetail.address || "",
        city: invoiceDetail.city || "",
        taxPercentage: invoiceDetail.taxPercentage,
        notes: invoiceDetail.notes || "",
        updatedOn: invoiceDetail.updatedOn,
      });

      if (invoiceDetail.lines && invoiceDetail.lines.length > 0) {
        setLines(
          invoiceDetail.lines.map((line: InvoiceLine, index: number) => ({
            ...line,
            rowNo: index + 1,
          }))
        );
      }
    }
    };
    setInvoiceDetails();
  }, [invoiceDetail]);

  const createMutation = useMutation({
    mutationFn: invoiceService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      queryClient.invalidateQueries({ queryKey: ["invoices-metrics"] });
      setSnackbar({
        open: true,
        message: "Invoice created successfully!",
        severity: "success",
      });
      setTimeout(() => router.push("/invoices"), 1000);
    },
    onError: (error) => {
      setSnackbar({
        open: true,
        message: axios.isAxiosError(error)
          ? error?.response?.data?.message || "Failed to create invoice"
          : "Failed to create invoice",
        severity: "error",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: invoiceService.update,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      queryClient.invalidateQueries({ queryKey: ["invoices-metrics"] });
      queryClient.invalidateQueries({ queryKey: ["invoice", invoiceID] });
      setSnackbar({
        open: true,
        message: "Invoice updated successfully!",
        severity: "success",
      });
      setTimeout(() => router.push("/invoices"), 1000);
    },
    onError: (error) => {
      setSnackbar({
        open: true,
        message: axios.isAxiosError(error)
          ? error?.response?.data?.message || "Failed to update invoice"
          : "Failed to update invoice",
        severity: "error",
      });
    },
  });

  const handleAddRow = () => {
    setLines([
      ...lines,
      {
        rowNo: lines.length + 1,
        itemID: 0,
        description: "",
        quantity: 0,
        rate: 0,
        discountPct: 0,
      },
    ]);
  };

  const handleCopyRow = (index: number) => {
    const newLine = { ...lines[index], rowNo: lines.length + 1 };
    setLines([...lines, newLine]);
  };

  const handleDeleteRow = (index: number) => {
    if (lines.length === 1) return;
    const newLines = lines.filter((_, i) => i !== index);
    newLines.forEach((line, i) => (line.rowNo = i + 1));
    setLines(newLines);

    const newLineErrors = { ...lineErrors };
    delete newLineErrors[index];
    setLineErrors(newLineErrors);
  };

  const handleLineChange = (
    index: number,
    field: keyof InvoiceLine,
    value: any
  ) => {
    const newLines = [...lines];
    newLines[index] = { ...newLines[index], [field]: value };
    setLines(newLines);

    if (lineErrors[index]?.[field]) {
      const newLineErrors = { ...lineErrors };
      delete newLineErrors[index][field];
      setLineErrors(newLineErrors);
    }
  };

  const handleItemSelect = (index: number, itemID: number) => {
    const selectedItem = items.find((item) => item.itemID === itemID);
    if (selectedItem) {
      const newLines = [...lines];
      newLines[index] = {
        ...newLines[index],
        itemID: itemID,
        description: selectedItem.itemName,
        rate: selectedItem.salesRate || 0,
        discountPct: selectedItem.discountPct || 0,
      };
      setLines(newLines);

      if (lineErrors[index]) {
        const newLineErrors = { ...lineErrors };
        delete newLineErrors[index].itemID;
        delete newLineErrors[index].description;
        delete newLineErrors[index].rate;
        setLineErrors(newLineErrors);
      }
    }
  };

  const calculateTotals = () => {
    return invoiceService.calculateTotals(lines, formData.taxPercentage);
  };

  const validateForm = (): boolean => {
    try {
      invoiceSchema.parse({
        ...formData,
        lines: lines.map((line, index) => ({ ...line, rowNo: index + 1 })),
      });

      setErrors({});
      setLineErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        const newLineErrors: Record<number, Record<string, string>> = {};

        error.issues.forEach((err) => {
          if (err.path[0] === "lines" && typeof err.path[1] === "number") {
            const lineIndex = err.path[1];
            const field = err.path[2] as string;

            if (!newLineErrors[lineIndex]) {
              newLineErrors[lineIndex] = {};
            }
            newLineErrors[lineIndex][field] = err.message;
          } else {
            newErrors[err.path[0] as string] = err.message;
          }
        });

        setErrors(newErrors);
        setLineErrors(newLineErrors);

        setSnackbar({
          open: true,
          message: "Please fix the validation errors",
          severity: "error",
        });

        return false;
      }
      return false;
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    const payload = {
      ...formData,
      lines: lines.map((line, index) => ({ ...line, rowNo: index + 1 })),
    };

    if (invoiceID) {
      updateMutation.mutate({
        ...payload,
        invoiceID,
        updatedOn: formData.updatedOn,
      });
    } else {
      createMutation.mutate(payload);
    }
  };

  const totals = calculateTotals();
  const isSaving = createMutation.isPending || updateMutation.isPending;

  if (isInvoiceLoading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (isInvoiceError && invoiceID) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
          flexDirection: "column",
          gap: 2,
        }}
      >
        <Typography variant="h6" color="error">
          Failed to load invoice
        </Typography>
        <Button variant="contained" onClick={() => router.push("/invoices")}>
          Back to Invoices
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f3f4f6" }}>
      <Box
        sx={{
          px: { xs: 2, md: 4 },
          py: 2,
          backgroundColor: "white",
          borderBottom: "1px solid #e5e7eb",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          position: "sticky",
          top: 0,
          zIndex: 20,
        }}
      >
        <Typography variant="h5" sx={{ fontWeight: 600, color: "black" }}>
          {invoiceID ? "Edit Invoice" : "New Invoice"}
        </Typography>

        <Box sx={{ display: "flex", gap: 2 }}>
          <Button
            onClick={() => router.push("/invoices")}
            sx={{ color: "black" }}
            color="inherit"
            disabled={isSaving}
          >
            Cancel
          </Button>

          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={isSaving}
            sx={{
              backgroundColor: "#525252",
              "&:hover": { backgroundColor: "#424242" },
            }}
          >
            {isSaving ? (
              <CircularProgress size={24} color="inherit" />
            ) : invoiceID ? (
              "Update"
            ) : (
              "Save"
            )}
          </Button>
        </Box>
      </Box>

      <Box sx={{ p: { xs: 2, md: 4 } }}>
        <Box
          sx={{
            backgroundColor: "white",
            p: { xs: 2.5, md: 3 },
            borderRadius: 2,
            boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
            mb: 3,
            border: "1px solid #e5e7eb",
          }}
        >
          <Typography
            variant="h6"
            sx={{ mb: 2, color: "black", fontWeight: 600 }}
          >
            Invoice Details
          </Typography>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "repeat(2, 1fr)" },
              gap: 2.5,
              mb: 2,
            }}
          >
            <TextField
              label="Invoice No"
              value={formData.invoiceNo}
              onChange={(e) => {
                setFormData({ ...formData, invoiceNo: e.target.value });
                if (errors.invoiceNo) {
                  const newErrors = { ...errors };
                  delete newErrors.invoiceNo;
                  setErrors(newErrors);
                }
              }}
              size="small"
              required
              error={!!errors.invoiceNo}
              helperText={errors.invoiceNo || "Auto-next available number"}
            />

            <TextField
              label="Invoice Date"
              type="date"
              value={formData.invoiceDate}
              onChange={(e) => {
                setFormData({ ...formData, invoiceDate: e.target.value });
                if (errors.invoiceDate) {
                  const newErrors = { ...errors };
                  delete newErrors.invoiceDate;
                  setErrors(newErrors);
                }
              }}
              size="small"
              required
              error={!!errors.invoiceDate}
              helperText={errors.invoiceDate}
              slotProps={{ inputLabel: { shrink: true } }}
            />

            <TextField
              label="Customer Name"
              value={formData.customerName}
              onChange={(e) => {
                setFormData({ ...formData, customerName: e.target.value });
                if (errors.customerName) {
                  const newErrors = { ...errors };
                  delete newErrors.customerName;
                  setErrors(newErrors);
                }
              }}
              size="small"
              required
              error={!!errors.customerName}
              helperText={errors.customerName}
            />

            <TextField
              label="City"
              value={formData.city}
              onChange={(e) =>
                setFormData({ ...formData, city: e.target.value })
              }
              size="small"
            />

            <TextField
              label="Address"
              value={formData.address}
              onChange={(e) =>
                setFormData({ ...formData, address: e.target.value })
              }
              size="small"
              sx={{ gridColumn: { md: "1 / -1" } }}
            />

            <TextField
              label="Notes"
              value={formData.notes}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
              size="small"
              multiline
              rows={2}
              sx={{ gridColumn: { md: "1 / -1" } }}
            />
          </Box>
        </Box>

        <Box
          sx={{
            backgroundColor: "white",
            p: { xs: 2.5, md: 3 },
            borderRadius: 2,
            boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
            mb: 3,
            border: "1px solid #e5e7eb",
          }}
        >
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 2,
            }}
          >
            <Typography variant="h6" sx={{ color: "black", fontWeight: 600 }}>
              Line Items
            </Typography>

            <Button
              size="small"
              startIcon={<Add sx={{ color: "black" }} />}
              onClick={handleAddRow}
              variant="outlined"
              sx={{ color: "black", borderColor: "black" }}
            >
              Add Row
            </Button>
          </Box>

          <Box sx={{ overflowX: "auto", mb: 3 }}>
            <Box sx={{ minWidth: 900 }}>
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns:
                    "60px 180px 1fr 110px 110px 110px 120px 70px",
                  gap: 1,
                  py: 1.5,
                  px: 1,
                  borderRadius: 1,
                  backgroundColor: "#f9fafb",
                  fontWeight: 600,
                  color: "#4b5563",
                  fontSize: "0.85rem",
                  border: "1px solid #e5e7eb",
                }}
              >
                <Box>S.No</Box>
                <Box>Item *</Box>
                <Box>Description</Box>
                <Box>Qty *</Box>
                <Box>Rate *</Box>
                <Box>Disc %</Box>
                <Box sx={{ textAlign: "right" }}>Amount</Box>
                <Box></Box>
              </Box>

              {lines.map((line, index) => {
                const amount = invoiceService.calculateLineAmount(
                  line.quantity,
                  line.rate,
                  line.discountPct
                );

                return (
                  <Box key={index}>
                    <Box
                      sx={{
                        display: "grid",
                        gridTemplateColumns:
                          "60px 180px 1fr 110px 110px 110px 120px 70px",
                        gap: 1,
                        p: 1,
                        borderRadius: 1,
                        border: `1px solid ${
                          lineErrors[index] ? "#d32f2f" : "#e5e7eb"
                        }`,
                        mb: 1,
                        background: "white",
                      }}
                    >
                      <Box sx={{ pt: 1 }}>{line.rowNo}</Box>

                      <FormControl
                        size="small"
                        fullWidth
                        error={!!lineErrors[index]?.itemID}
                      >
                        <Select
                          value={line.itemID || ""}
                          onChange={(e) =>
                            handleItemSelect(index, Number(e.target.value))
                          }
                          displayEmpty
                          disabled={isItemsLoading}
                        >
                          <MenuItem value="" disabled>
                            {isItemsLoading ? "Loading..." : "Select Item..."}
                          </MenuItem>
                          {items.map((item) => (
                            <MenuItem key={item.itemID} value={item.itemID}>
                              {item.itemName}
                            </MenuItem>
                          ))}
                        </Select>
                        {lineErrors[index]?.itemID && (
                          <FormHelperText>
                            {lineErrors[index].itemID}
                          </FormHelperText>
                        )}
                      </FormControl>

                      <TextField
                        size="small"
                        value={line.description}
                        onChange={(e) =>
                          handleLineChange(index, "description", e.target.value)
                        }
                        placeholder="Description"
                        error={!!lineErrors[index]?.description}
                      />

                      <TextField
                        size="small"
                        type="number"
                        value={line.quantity || ""}
                        onChange={(e) =>
                          handleLineChange(
                            index,
                            "quantity",
                            parseFloat(e.target.value) || 0
                          )
                        }
                        slotProps={{ htmlInput: { step: "0.01", min: 0 } }}
                        placeholder="0.00"
                        error={!!lineErrors[index]?.quantity}
                      />

                      <TextField
                        size="small"
                        type="number"
                        value={line.rate || ""}
                        onChange={(e) =>
                          handleLineChange(
                            index,
                            "rate",
                            parseFloat(e.target.value) || 0
                          )
                        }
                        slotProps={{ htmlInput: { step: "0.01", min: 0 } }}
                        placeholder="0.00"
                        error={!!lineErrors[index]?.rate}
                      />

                      <TextField
                        size="small"
                        type="number"
                        value={line.discountPct || ""}
                        onChange={(e) =>
                          handleLineChange(
                            index,
                            "discountPct",
                            parseFloat(e.target.value) || 0
                          )
                        }
                        slotProps={{
                          htmlInput: { step: "0.01", min: 0, max: 100 },
                        }}
                        placeholder="0.00"
                        error={!!lineErrors[index]?.discountPct}
                      />

                      <Box
                        sx={{
                          pt: 1.2,
                          textAlign: "right",
                          fontWeight: 500,
                          color: "black",
                          fontSize: "0.9rem",
                        }}
                      >
                        ${amount.toFixed(2)}
                      </Box>

                      <Box sx={{ display: "flex", gap: 0.5 }}>
                        <IconButton
                          size="small"
                          onClick={() => handleCopyRow(index)}
                        >
                          <ContentCopy fontSize="small" />
                        </IconButton>

                        <IconButton
                          size="small"
                          onClick={() => handleDeleteRow(index)}
                          disabled={lines.length === 1}
                          color="error"
                        >
                          <Delete fontSize="small" />
                        </IconButton>
                      </Box>
                    </Box>

                    {lineErrors[index] &&
                      Object.keys(lineErrors[index]).length > 0 && (
                        <Box sx={{ pl: 2, mb: 1 }}>
                          {Object.entries(lineErrors[index]).map(
                            ([field, error]) => (
                              <Typography
                                key={field}
                                variant="caption"
                                color="error"
                                sx={{ display: "block" }}
                              >
                                • {error}
                              </Typography>
                            )
                          )}
                        </Box>
                      )}
                  </Box>
                );
              })}
            </Box>
          </Box>
        </Box>

        <Box
          sx={{
            backgroundColor: "white",
            p: { xs: 2.5, md: 3 },
            borderRadius: 2,
            color: "black",
            boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
            border: "1px solid #e5e7eb",
          }}
        >
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
            Invoice Totals
          </Typography>
          <Box sx={{ width: { xs: "100%", md: 340 }, ml: "auto" }}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                width: "100%",
                py: 1,
                fontSize: "0.95rem",
              }}
            >
              <Typography>Sub Total</Typography>
              <Typography>${totals.subtotal.toFixed(2)}</Typography>
            </Box>


            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                py: 1,
                fontSize: "0.95rem",
                width: "100%",
              }}
            >
              <Typography>Tax</Typography>

              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <TextField
                  size="small"
                  type="number"
                  value={formData.taxPercentage || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      taxPercentage: parseFloat(e.target.value) || 0,
                    })
                  }
                  sx={{ width: 70 }}
                  slotProps={{ htmlInput: { step: "0.01", min: 0 } }}
                />
                <Typography>%</Typography>

                <Typography sx={{ minWidth: 80, textAlign: "right" }}>
                  ${totals.taxAmount.toFixed(2)}
                </Typography>
              </Box>
            </Box>

            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                width: "100%",
                pt: 2,
                borderTop: "2px solid #000",
                fontWeight: 700,
                fontSize: "1.1rem",
              }}
            >
              <Typography>Invoice Amount</Typography>
              <Typography>${totals.total.toFixed(2)}</Typography>
            </Box>
          </Box>
        </Box>
      </Box>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
