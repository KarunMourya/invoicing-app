import { useState, useMemo } from "react";

export const usePagination = <T,>(data: T[]) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const visibleRows = useMemo(
    () => data.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
    [data, page, rowsPerPage]
  );

  const handleChangePage = (_: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(e.target.value, 10));
    setPage(0);
  };

  return {
    page,
    rowsPerPage,
    visibleRows,
    setPage,
    onChangePage: handleChangePage,
    onChangeRowsPerPage: handleChangeRowsPerPage,
  };
};