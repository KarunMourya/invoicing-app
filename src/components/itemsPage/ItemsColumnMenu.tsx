import React from "react";
import { Menu, MenuItem, Checkbox, Typography } from "@mui/material";
import { ITEMS_TABLE_CELLS } from "@/src/constants/items.constant";

interface ItemsColumnMenuProps {
  anchorEl: null | HTMLElement;
  open: boolean;
  onClose: () => void;
  visibleColumns: Record<string, boolean>;
  toggleColumn: (key: string) => void;
}

const ItemsColumnMenu: React.FC<ItemsColumnMenuProps> = ({
  anchorEl,
  open,
  onClose,
  visibleColumns,
  toggleColumn,
}) => {
  return (
    <Menu anchorEl={anchorEl} open={open} onClose={onClose}>
      {ITEMS_TABLE_CELLS.map((column) => (
        <MenuItem key={column.id} onClick={() => toggleColumn(column.id)}>
          <Checkbox checked={visibleColumns[column.id]} />
          <Typography>{column.label}</Typography>
        </MenuItem>
      ))}
    </Menu>
  );
};

export default ItemsColumnMenu;