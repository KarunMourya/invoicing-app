import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  invoiceService,
  InvoiceFilters,
  Invoice,
} from "@/src/services/invoice.service";
import {
  format,
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
} from "date-fns";
import { generateInvoicePDF } from "../utils/invoicePDF";
import { useAuthStore } from "../store/auth.store";
import axios from "axios";

type DateRange = "today" | "week" | "month" | "year" | "custom";

export const useInvoicesLogic = () => {
  const queryClient = useQueryClient();
  const [dateRange, setDateRange] = useState<DateRange>("month");
  const [customDateRange, setCustomDateRange] = useState({ from: "", to: "" });
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedInvoiceID, setSelectedInvoiceID] = useState<number>();
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error",
  });
  const [invoiceToDelete, setInvoiceToDelete] = useState<Invoice | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const { getCompanyInfo } = useAuthStore();

  const dateFilters = useMemo((): InvoiceFilters => {
    const today = new Date();
    let from: string | undefined;
    let to: string | undefined;

    switch (dateRange) {
      case "today":
        from = format(startOfDay(today), "yyyy-MM-dd");
        to = format(endOfDay(today), "yyyy-MM-dd");
        break;
      case "week":
        from = format(startOfWeek(today), "yyyy-MM-dd");
        to = format(endOfWeek(today), "yyyy-MM-dd");
        break;
      case "month":
        from = format(startOfMonth(today), "yyyy-MM-dd");
        to = format(endOfMonth(today), "yyyy-MM-dd");
        break;
      case "year":
        from = format(startOfYear(today), "yyyy-MM-dd");
        to = format(endOfYear(today), "yyyy-MM-dd");
        break;
      case "custom":
        from = customDateRange.from;
        to = customDateRange.to;
        break;
    }

    return { from, to };
  }, [dateRange, customDateRange]);

  const {
    data: invoices = [],
    isLoading,
    refetch: refetchList,
  } = useQuery({
    queryKey: ["invoices", dateFilters],
    queryFn: () => invoiceService.getList(dateFilters),
  });

  const {
    data: invoiceDetail,
    refetch: fetchInvoiceDetail,
    isFetching: isDetailLoading,
  } = useQuery({
    queryKey: ["invoice-detail", selectedInvoiceID],
    queryFn: () => invoiceService.getById(selectedInvoiceID!),
    enabled: !!selectedInvoiceID,
  });

  const {
    data: metrics,
    isLoading: isMetricsLoading,
    refetch: refetchMetrics,
  } = useQuery({
    queryKey: ["invoices-metrics", dateFilters],
    queryFn: () => invoiceService.getMetrics(dateFilters),
  });

  const today = new Date();
  const {
    data: trend,
    isLoading: isTrendLoading,
    refetch: refetchTrend,
  } = useQuery({
    queryKey: ["invoices-trend", format(startOfDay(today), "yyyy-MM-dd")],
    queryFn: () =>
      invoiceService.getTrend12m(
        format(startOfDay(today), "yyyy-MM-dd").toString()
      ),
    staleTime: 5 * 60 * 1000,
  });

  const {
    data: topItems,
    isLoading: isTopItemsLoading,
    refetch: refetchTopItems,
  } = useQuery({
    queryKey: ["invoices-topitems", 5, dateFilters],
    queryFn: () => invoiceService.getTopItems(5, dateFilters),
  });

  const deleteMutation = useMutation({
    mutationFn: invoiceService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices", dateFilters] });
      queryClient.invalidateQueries({
        queryKey: ["invoices-metrics", dateFilters],
      });
    },
  });

  const handleDeleteConfirm = async () => {
    if (!invoiceToDelete) return;

    try {
      await deleteMutation.mutateAsync(invoiceToDelete.invoiceID);
      setSnackbar({
        open: true,
        message: "Invoice deleted successfully!",
        severity: "success",
      });
      setDeleteDialogOpen(false);
      setInvoiceToDelete(null);
    } catch (error) {
      setSnackbar({
        open: true,
        message: axios.isAxiosError(error)
          ? error?.response?.data || error.message
          : "Failed to delete invoice",
        severity: "error",
      });
    }
  };

  const filteredInvoices = useMemo(() => {
    if (!searchQuery.trim()) return invoices;

    const query = searchQuery.toLowerCase();
    return invoices.filter(
      (invoice) =>
        invoice.invoiceNo.toLowerCase().includes(query) ||
        invoice.customerName.toLowerCase().includes(query) ||
        invoice.invoiceAmount.toString().includes(query)
    );
  }, [invoices, searchQuery]);

  const refreshAll = () => {
    refetchList();
    refetchMetrics();
    refetchTrend();
    refetchTopItems();
  };

  const refreshList = () => {
    refetchList();
    refetchMetrics();
  };

  const handleExport = () => {
    const csv = [
      [
        "Invoice No",
        "Date",
        "Customer",
        "Items",
        "Sub Total",
        "Tax %",
        "Tax Amount",
        "Total",
      ],
      ...filteredInvoices.map((inv) => [
        inv.invoiceNo,
        inv.invoiceDate,
        inv.customerName,
        inv.totalItems.toString(),
        inv.subTotal.toString(),
        inv.taxPercentage.toString(),
        inv.taxAmount.toString(),
        inv.invoiceAmount.toString(),
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `invoices_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
  };

  const handlePrint = async (invoice: Invoice) => {
    try {
      const company = getCompanyInfo();

      setSelectedInvoiceID(invoice.invoiceID);

      const { data: full } = await fetchInvoiceDetail();

      if (!full) return;

      const invoiceData = {
        invoiceNo: full.invoiceNo,
        invoiceDate: full.invoiceDate,
        customerName: full.customerName,
        customerAddress: full.address || "",
        city: full.city || "",
        notes: full.notes || "",
        items: full.lines.map((line) => ({
          itemName: line.itemID.toString(),
          description: line.description,
          quantity: line.quantity,
          rate: line.rate,
          discountPct: line.discountPct,
          amount: invoiceService.calculateLineAmount(
            line.quantity,
            line.rate,
            line.discountPct
          ),
        })),
        subtotal: full.subTotal,
        taxPercent: full.taxPercentage,
        taxAmount: full.taxAmount,
        total: full.invoiceAmount,
      };

      const companyInfo = {
        name: company?.companyName || "",
      };

      generateInvoicePDF(invoiceData, companyInfo);
    } catch (error) {
      console.error("Error generating PDF:", error);
      setSnackbar({
        open: true,
        message: "Failed to generate PDF",
        severity: "error",
      });
    }
  };

  return {
    invoices,
    metrics,
    trend,
    invoiceDetail,
    topItems,
    fetchInvoiceDetail,
    isLoading,
    isMetricsLoading,
    isTrendLoading,
    deleteDialogOpen,
    setDeleteDialogOpen,
    isTopItemsLoading,
    dateRange,
    customDateRange,
    searchQuery,
    setDateRange,
    setCustomDateRange,
    setSearchQuery,
    isDetailLoading,
    setSelectedInvoiceID,
    invoiceToDelete,
    setInvoiceToDelete,
    filteredInvoices,
    deleteMutation,
    refreshAll,
    snackbar,
    handleDeleteConfirm,
    handlePrint,
    setSnackbar,
    handleExport,
    refreshList,
  };
};
