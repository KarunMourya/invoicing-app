"use client";

import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  TextField,
  Paper,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  MenuItem,
  CircularProgress,
  Divider,
} from "@mui/material";
import { Add, Delete, ContentCopy } from "@mui/icons-material";
import { useRouter, useParams } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  invoiceService,
  InvoiceLine,
  CreateInvoicePayload,
  UpdateInvoicePayload,
} from "@/src/services/invoice.service";
import { itemService } from "@/src/services/item.service";
import { formatMoney } from "@/src/utils/formatMoney";
import { useAuthStore } from "@/src/store/auth.store";

export default function InvoiceEditorPage() {
  const router = useRouter();
  const params = useParams();
  const queryClient = useQueryClient();
  const { company } = useAuthStore();
  const invoiceID = params?.id ? Number(params.id) : null;
  const isEditMode = invoiceID !== null && invoiceID !== 0;

  const [form, setForm] = useState({
    invoiceNo: "",
    invoiceDate: new Date().toISOString().split("T")[0],
    customerName: "",
    address: "",
    city: "",
    taxPercentage: "0",
    notes: "",
  });

  const [lines, setLines] = useState<InvoiceLine[]>([
    {
      rowNo: 1,
      itemID: 0,
      description: "",
      quantity: 1,
      rate: 0,
      discountPct: 0,
    },
  ]);

  const [updatedOn, setUpdatedOn] = useState<string | null>(null);

  const { data: items = [] } = useQuery({
    queryKey: ["items"],
    queryFn: itemService.getList,
  });

  const { data: invoiceDetail, isLoading: isLoadingInvoice } = useQuery({
    queryKey: ["invoice", invoiceID],
    queryFn: () => invoiceService.getById(invoiceID!),
    enabled: isEditMode,
  });

  useEffect(() => {
    const invoiceDetailLoad = () => {
      if (invoiceDetail) {
        setForm({
          invoiceNo: invoiceDetail.invoiceNo,
          invoiceDate: invoiceDetail.invoiceDate.split("T")[0],
          customerName: invoiceDetail.customerName,
          address: invoiceDetail.address || "",
          city: invoiceDetail.city || "",
          taxPercentage: invoiceDetail.taxPercentage.toString(),
          notes: invoiceDetail.notes || "",
        });
        setLines(invoiceDetail.lines || []);
        setUpdatedOn(invoiceDetail.updatedOn);
      }
    };
    invoiceDetailLoad();
  }, [invoiceDetail]);

  const totals = React.useMemo(() => {
    const subtotal = lines.reduce((sum, line) => {
      if (!line.itemID) return sum;
      return (
        sum +
        invoiceService.calculateLineAmount(
          line.quantity,
          line.rate,
          line.discountPct
        )
      );
    }, 0);

    const taxAmount = (subtotal * parseFloat(form.taxPercentage || "0")) / 100;
    const total = subtotal + taxAmount;

    return { subtotal, taxAmount, total };
  }, [lines, form.taxPercentage]);

  const createMutation = useMutation({
    mutationFn: invoiceService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      router.push("/invoices");
    },
  });

  const updateMutation = useMutation({
    mutationFn: invoiceService.update,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      router.push("/invoices");
    },
  });

  const handleAddRow = () => {
    setLines([
      ...lines,
      {
        rowNo: lines.length + 1,
        itemID: 0,
        description: "",
        quantity: 1,
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
    const newLines = lines.filter((_, lineIndex) => lineIndex !== index);
    newLines.forEach((line, lineIndex) => {
      line.rowNo = lineIndex + 1;
    });
    setLines(newLines);
  };

  const handleItemChange = (index: number, itemID: number) => {
    const item = items.find((item) => item.itemID === itemID);
    if (item) {
      const newLines = [...lines];
      newLines[index] = {
        ...newLines[index],
        itemID: item.itemID,
        description: item.description,
        rate: item.salesRate,
        discountPct: item.discountPct,
      };
      setLines(newLines);
    }
  };

  const handleLineChange = (
    index: number,
    field: keyof InvoiceLine,
    value: any
  ) => {
    const newLines = [...lines];
    newLines[index] = { ...newLines[index], [field]: value };
    setLines(newLines);
  };

  const handleSave = async () => {
    if (!form.invoiceNo.trim()) {
      alert("Invoice number is required");
      return;
    }
    if (!form.customerName.trim()) {
      alert("Customer name is required");
      return;
    }
    if (lines.filter((l) => l.itemID > 0).length === 0) {
      alert("At least one line item is required");
      return;
    }

    const validLines = lines.filter((l) => l.itemID > 0);

    if (isEditMode) {
      const payload: UpdateInvoicePayload = {
        invoiceID: invoiceID!,
        invoiceNo: form.invoiceNo,
        invoiceDate: form.invoiceDate,
        customerName: form.customerName,
        address: form.address,
        city: form.city,
        taxPercentage: parseFloat(form.taxPercentage),
        notes: form.notes,
        lines: validLines,
        updatedOn,
      };
      await updateMutation.mutateAsync(payload);
    } else {
      const payload: CreateInvoicePayload = {
        invoiceNo: form.invoiceNo,
        invoiceDate: form.invoiceDate,
        customerName: form.customerName,
        address: form.address,
        city: form.city,
        taxPercentage: parseFloat(form.taxPercentage),
        notes: form.notes,
        lines: validLines,
      };
      await createMutation.mutateAsync(payload);
    }
  };

  const isLoading =
    createMutation.isPending ||
    updateMutation.isPending ||
    (isEditMode && isLoadingInvoice);

  return (
    <Box sx={{ height: "100vh", display: "flex", flexDirection: "column" }}>
      <Box
        sx={{
          px: { xs: 2, md: 4 },
          py: 2,
          bgcolor: "white",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          {isEditMode ? "Edit Invoice" : "New Invoice"}
        </Typography>
        <Box sx={{ display: "flex", gap: 1 }}>
          <Button
            onClick={() => router.push("/invoices")}
            disabled={isLoading}
            sx={{ textTransform: "none", color: "#424242" }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={isLoading}
            sx={{
              textTransform: "none",
              bgcolor: "#525252",
              "&:hover": { bgcolor: "#424242" },
            }}
          >
            {isLoading ? <CircularProgress size={20} /> : "Save"}
          </Button>
        </Box>
      </Box>

      <Divider />

      <Box sx={{ flex: 1, overflow: "auto", px: { xs: 2, md: 4 }, py: 3 }}>
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
            Invoice Details
          </Typography>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "repeat(2, 1fr)" },
              gap: 2,
            }}
          >
            <TextField
              label="Invoice No"
              size="small"
              required
              value={form.invoiceNo}
              onChange={(e) => setForm({ ...form, invoiceNo: e.target.value })}
              helperText="Auto next available number"
            />
            <TextField
              label="Invoice Date"
              type="date"
              size="small"
              required
              value={form.invoiceDate}
              onChange={(e) =>
                setForm({ ...form, invoiceDate: e.target.value })
              }
              slotProps={{ inputLabel: { shrink: true } }}
            />
            <TextField
              label="Customer Name"
              size="small"
              required
              value={form.customerName}
              onChange={(e) =>
                setForm({ ...form, customerName: e.target.value })
              }
              inputProps={{ maxLength: 50 }}
            />
            <TextField
              label="City"
              size="small"
              value={form.city}
              onChange={(e) => setForm({ ...form, city: e.target.value })}
            />
            <TextField
              label="Address"
              size="small"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              sx={{ gridColumn: { md: "span 2" } }}
            />
            <TextField
              label="Notes"
              size="small"
              multiline
              rows={2}
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              sx={{ gridColumn: { md: "span 2" } }}
            />
          </Box>
        </Paper>

        <Paper sx={{ p: 3, mb: 3 }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 2,
            }}
          >
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              Line Items
            </Typography>
            <Box sx={{ display: "flex", gap: 1 }}>
              <Button
                startIcon={<Add />}
                onClick={handleAddRow}
                size="small"
                sx={{ textTransform: "none" }}
              >
                Add Row
              </Button>
            </Box>
          </Box>

          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell width={40}>#</TableCell>
                  <TableCell width={200}>Item *</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell width={80}>Qty *</TableCell>
                  <TableCell width={100}>Rate *</TableCell>
                  <TableCell width={80}>Disc %</TableCell>
                  <TableCell width={120} align="right">
                    Amount
                  </TableCell>
                  <TableCell width={100}></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {lines.map((line, index) => (
                  <TableRow key={index}>
                    <TableCell>{line.rowNo}</TableCell>
                    <TableCell>
                      <TextField
                        select
                        size="small"
                        fullWidth
                        value={line.itemID || ""}
                        onChange={(e) =>
                          handleItemChange(index, Number(e.target.value))
                        }
                      >
                        <MenuItem value="">
                          <em>Select Item...</em>
                        </MenuItem>
                        {items.map((item) => (
                          <MenuItem key={item.itemID} value={item.itemID}>
                            {item.itemName}
                          </MenuItem>
                        ))}
                      </TextField>
                    </TableCell>
                    <TableCell>
                      <TextField
                        size="small"
                        fullWidth
                        value={line.description}
                        onChange={(e) =>
                          handleLineChange(index, "description", e.target.value)
                        }
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        type="number"
                        size="small"
                        fullWidth
                        value={line.quantity}
                        onChange={(e) =>
                          handleLineChange(
                            index,
                            "quantity",
                            parseFloat(e.target.value) || 0
                          )
                        }
                        inputProps={{ min: 0, step: 0.01 }}
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        type="number"
                        size="small"
                        fullWidth
                        value={line.rate}
                        onChange={(e) =>
                          handleLineChange(
                            index,
                            "rate",
                            parseFloat(e.target.value) || 0
                          )
                        }
                        inputProps={{ min: 0, step: 0.01 }}
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        type="number"
                        size="small"
                        fullWidth
                        value={line.discountPct}
                        onChange={(e) =>
                          handleLineChange(
                            index,
                            "discountPct",
                            parseFloat(e.target.value) || 0
                          )
                        }
                        inputProps={{ min: 0, max: 100, step: 0.01 }}
                      />
                    </TableCell>
                    <TableCell align="right">
                      {formatMoney(
                        invoiceService.calculateLineAmount(
                          line.quantity,
                          line.rate,
                          line.discountPct
                        ),
                        company?.currencySymbol
                      )}
                    </TableCell>
                    <TableCell>
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
                        >
                          <Delete fontSize="small" />
                        </IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <Box sx={{ mt: 2, display: "flex", justifyContent: "flex-end" }}>
            <Typography variant="body2" sx={{ mr: 2 }}>
              Subtotal:
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 600, width: 120 }}>
              {formatMoney(totals.subtotal, company?.currencySymbol)}
            </Typography>
          </Box>
        </Paper>

        <Paper sx={{ p: 3 }}>
          <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
            Invoice Totals
          </Typography>

          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
              <Typography>Sub Total</Typography>
              <Typography sx={{ fontWeight: 600 }}>
                {formatMoney(totals.subtotal, company?.currencySymbol)}
              </Typography>
            </Box>

            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Typography>Tax</Typography>
              <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
                <TextField
                  type="number"
                  size="small"
                  value={form.taxPercentage}
                  onChange={(e) =>
                    setForm({ ...form, taxPercentage: e.target.value })
                  }
                  inputProps={{ min: 0, max: 100, step: 0.01 }}
                  sx={{ width: 100 }}
                  slotProps={{
                    input: {
                      endAdornment: <Typography>%</Typography>,
                    },
                  }}
                />
                <Typography
                  sx={{ fontWeight: 600, width: 120, textAlign: "right" }}
                >
                  {formatMoney(totals.taxAmount, company?.currencySymbol)}
                </Typography>
              </Box>
            </Box>

            <Divider />

            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
              <Typography variant="h6">Invoice Amount</Typography>
              <Typography variant="h6" sx={{ color: "#2563eb" }}>
                {formatMoney(totals.total, company?.currencySymbol)}
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Box>
  );
}
