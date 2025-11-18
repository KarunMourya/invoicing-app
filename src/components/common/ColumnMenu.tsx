import React from "react";
import { Menu, MenuItem, Checkbox, Typography } from "@mui/material";

interface ItemsColumnMenuProps {
  anchorEl: null | HTMLElement;
  open: boolean;
  columns: readonly {
    readonly id: string;
    readonly label: string;
  }[];
  onClose: () => void;
  visibleColumns: Record<string, boolean>;
  toggleColumn: (key: string) => void;
}

const ItemsColumnMenu: React.FC<ItemsColumnMenuProps> = ({
  anchorEl,
  open,
  columns,
  onClose,
  visibleColumns,
  toggleColumn,
}) => {
  return (
    <Menu anchorEl={anchorEl} open={open} onClose={onClose}>
      {columns.map((column) => (
        <MenuItem key={column.id} onClick={() => toggleColumn(column.id)}>
          <Checkbox checked={visibleColumns[column.id]} />
          <Typography>{column.label}</Typography>
        </MenuItem>
      ))}
    </Menu>
  );
};

export default ItemsColumnMenu;
