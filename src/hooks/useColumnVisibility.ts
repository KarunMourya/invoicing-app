import { useState } from "react";

export const useColumnVisibility = () => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [visibleColumns, setVisibleColumns] = useState<Record<string, boolean>>({
    picture: true,
    itemName: true,
    description: true,
    salesRate: true,
    discountPct: true,
    actions: true,
  });

  const toggleColumn = (key: string) => {
    setVisibleColumns((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const openMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const closeMenu = () => {
    setAnchorEl(null);
  };

  return {
    anchorEl,
    visibleColumns,
    toggleColumn,
    openMenu,
    closeMenu,
  };
};