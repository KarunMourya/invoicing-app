import React from "react";
import {
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableSortLabel,
  Paper,
  TableContainer,
  Tooltip,
  Typography,
  IconButton,
  Box,
} from "@mui/material";
import Edit from "@mui/icons-material/Edit";
import Delete from "@mui/icons-material/Delete";
import ImageIcon from "@mui/icons-material/Image";
import ArrowDropUp from "@mui/icons-material/ArrowDropUp";
import ArrowDropDown from "@mui/icons-material/ArrowDropDown";
import { Item } from "@/src/services/item.service";
import Image from "next/image";

type Order = "asc" | "desc";

type Props = {
  rows: Item[];
  columns: Record<string, boolean>;
  order: Order;
  orderBy: keyof Item;
  onRequestSort: (p: keyof Item) => void;
  onEdit: (item: Item) => void;
  onDelete: (item: Item) => void;
};

export default function ItemsTable({
  rows,
  columns: visibleColumns,
  order,
  orderBy,
  onRequestSort,
  onEdit,
  onDelete,
}: Props) {
  return (
    <TableContainer
      component={Paper}
      sx={{ border: "1px solid #e5e5e5", borderRadius: 2 }}
    >
      <Table>
        <TableHead>
          <TableRow sx={{ bgcolor: "#fafafa" }}>
            {visibleColumns.picture && (
              <TableCell width={70}>Picture</TableCell>
            )}

            {visibleColumns.itemName && (
              <TableCell>
                <TableSortLabel
                  active={orderBy === "itemName"}
                  direction={order}
                  onClick={() => onRequestSort("itemName")}
                  IconComponent={order === "asc" ? ArrowDropUp : ArrowDropDown}
                >
                  Item Name
                </TableSortLabel>
              </TableCell>
            )}

            {visibleColumns.description && <TableCell>Description</TableCell>}

            {visibleColumns.salesRate && (
              <TableCell align="right">
                <TableSortLabel
                  active={orderBy === "salesRate"}
                  direction={order}
                  onClick={() => onRequestSort("salesRate")}
                  IconComponent={order === "asc" ? ArrowDropUp : ArrowDropDown}
                >
                  Sale Rate
                </TableSortLabel>
              </TableCell>
            )}

            {visibleColumns.discountPct && (
              <TableCell align="right">
                <TableSortLabel
                  active={orderBy === "discountPct"}
                  direction={order}
                  onClick={() => onRequestSort("discountPct")}
                  IconComponent={order === "asc" ? ArrowDropUp : ArrowDropDown}
                >
                  Discount %
                </TableSortLabel>
              </TableCell>
            )}

            {visibleColumns.actions && (
              <TableCell width={120}>Actions</TableCell>
            )}
          </TableRow>
        </TableHead>

        <TableBody>
          {rows.map((item) => (
            <TableRow hover key={item.itemID}>
              {visibleColumns.picture && (
                <TableCell>
                  <Box
                    sx={{
                      width: 50,
                      height: 50,
                      borderRadius: 1,
                      bgcolor: "#f5f5f5",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      position: "relative", 
                      border: "1px solid #e0e0e0",
                    }}
                  >
                    {item.itemPicture ? (
                      <Image src={item.itemPicture} alt={item.itemName} fill />
                    ) : (
                      <ImageIcon sx={{ color: "#9e9e9e" }} />
                    )}
                  </Box>
                </TableCell>
              )}

              {visibleColumns.itemName && (
                <TableCell sx={{ fontWeight: 600 }}>{item.itemName}</TableCell>
              )}

              {visibleColumns.description && (
                <TableCell>
                  <Tooltip title={item.description || ""}>
                    <Typography noWrap sx={{ maxWidth: 360 }}>
                      {item.description || "-"}
                    </Typography>
                  </Tooltip>
                </TableCell>
              )}

              {visibleColumns.salesRate && (
                <TableCell align="right" sx={{ fontWeight: 600 }}>
                  {item.salesRate}
                </TableCell>
              )}

              {visibleColumns.discountPct && (
                <TableCell align="right">
                  {item.discountPct.toFixed(2)}%
                </TableCell>
              )}

              {visibleColumns.actions && (
                <TableCell>
                  <Box sx={{ display: "flex", gap: 1 }}>
                    <IconButton size="small" onClick={() => onEdit(item)}>
                      <Edit fontSize="small" />
                    </IconButton>
                    <IconButton size="small" onClick={() => onDelete(item)}>
                      <Delete fontSize="small" />
                    </IconButton>
                  </Box>
                </TableCell>
              )}
            </TableRow>
          ))}

          {rows.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} sx={{ py: 6, textAlign: "center" }}>
                No items found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
