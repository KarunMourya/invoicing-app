import { useState, useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  CreateItemPayload,
  Item,
  itemService,
  UpdateItemPayload,
} from "@/src/services/item.service";
import { filterAndSortItems } from "@/src/utils/itemsSortAndFilter";
import axios from "axios";

type Order = "asc" | "desc";

interface SnackbarState {
  open: boolean;
  message: string;
  severity: "success" | "error";
}

export const useItemsLogic = () => {
  const queryClient = useQueryClient();
  const [query, setQuery] = useState("");
  const [order, setOrder] = useState<Order>("asc");
  const [orderBy, setOrderBy] = useState<keyof Item>("itemName");
  const [editorOpen, setEditorOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<Item | null>(null);
  const [snackbar, setSnackbar] = useState<SnackbarState>({
    open: false,
    message: "",
    severity: "success",
  });

  const {
    data: items = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["items"],
    queryFn: itemService.getList,
  });

  const createMutation = useMutation({
    mutationFn: itemService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["items"] });
      setSnackbar({
        open: true,
        message: "Item created successfully!",
        severity: "success",
      });
      setEditorOpen(false);
    },
    onError: (error) => {
      setSnackbar({
        open: true,
        message: axios.isAxiosError(error)
          ? error?.response?.data || error.message
          : "Failed to create item",
        severity: "error",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: itemService.update,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["items"] });
      setSnackbar({
        open: true,
        message: "Item updated successfully!",
        severity: "success",
      });
      setEditorOpen(false);
    },
    onError: (error) => {
      setSnackbar({
        open: true,
        message: axios.isAxiosError(error)
          ? error?.response?.data || error.message
          : "Failed to update item",
        severity: "error",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: itemService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["items"] });
      setSnackbar({
        open: true,
        message: "Item deleted successfully!",
        severity: "success",
      });
      setDeleteDialogOpen(false);
    },
    onError: (error) => {
      setSnackbar({
        open: true,
        message: axios.isAxiosError(error)
          ? error?.response?.data || error.message
          : "Failed to delete item",
        severity: "error",
      });
    },
  });

  const filtered = useMemo(
    () => filterAndSortItems(items, query, order, orderBy),
    [items, query, order, orderBy]
  );

  const handleRequestSort = (property: keyof Item) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const openEditor = (item: Item | null) => {
    setSelectedItem(item);
    setEditorOpen(true);
  };

  const closeEditor = () => {
    setEditorOpen(false);
    setSelectedItem(null);
  };

  const openDeleteDialog = (item: Item) => {
    setItemToDelete(item);
    setDeleteDialogOpen(true);
  };

  const closeDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setItemToDelete(null);
  };

  const handleSave = async (
    data: CreateItemPayload | UpdateItemPayload
  ): Promise<void> => {
    if (selectedItem) {
      await updateMutation.mutateAsync(data as UpdateItemPayload);
    } else {
      await createMutation.mutateAsync(data as CreateItemPayload);
    }
  };

  const handleDeleteConfirm = () => {
    if (itemToDelete) {
      deleteMutation.mutate(itemToDelete.itemID);
    }
  };

  const handleExport = () => {
    const csv = [
      ["Item Name", "Description", "Sale Rate", "Discount %"],
      ...filtered.map((it) => [
        it.itemName,
        it.description,
        it.salesRate.toString(),
        it.discountPct.toString(),
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "items.csv";
    a.click();
  };

  const onSnackbarClose = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  return {
    query,
    setQuery,
    order,
    orderBy,
    editorOpen,
    selectedItem,
    deleteDialogOpen,
    itemToDelete,
    snackbar,
    items,
    filtered,
    isLoading,
    error,
    createMutation,
    updateMutation,
    deleteMutation,
    handleRequestSort,
    openEditor,
    closeEditor,
    openDeleteDialog,
    closeDeleteDialog,
    handleSave,
    handleDeleteConfirm,
    handleExport,
    onSnackbarClose,
  };
};
