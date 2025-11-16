import React from "react";
import { Box, IconButton, Button, TablePagination } from "@mui/material";

interface ItemsPaginationProps {
  count: number;
  page: number;
  rowsPerPage: number;
  onPageChange: (event: unknown, newPage: number) => void;
  onRowsPerPageChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const ItemsPagination: React.FC<ItemsPaginationProps> = ({
  count,
  page,
  rowsPerPage,
  onPageChange,
  onRowsPerPageChange,
}) => {
  return (
    <Box
      sx={{
        position: "fixed",
        bottom: 0,
        left: { md: "260px" },
        right: 0,
        bgcolor: "white",
        borderTop: "1px solid #e5e5e5",
        px: { xs: 2, md: 4 },
        zIndex: 1000,
        width: {
          sm: "100%",
          xs: "100%",
          md: "auto",
        },
      }}
    >
      <TablePagination
        component="div"
        count={count}
        page={page}
        onPageChange={onPageChange}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={onRowsPerPageChange}
        rowsPerPageOptions={[5, 10, 25, 50]}
        labelRowsPerPage="Rows per page"
        labelDisplayedRows={() => ""}
        sx={{
          ".MuiTablePagination-toolbar": {
            display: "flex",
            alignItems: "center",
            width: "100%",
            px: 2,
          },
          ".MuiSelect-select": {
            borderRadius: 1,
            border: "2px solid #E5E7EB",
          },
          ".MuiTablePagination-spacer": { display: "none" },
          ".MuiTablePagination-selectLabel": { display: "block" },
          ".MuiTablePagination-displayedRows": { display: "none" },
        }}
        ActionsComponent={({ page, count, rowsPerPage, onPageChange }) => {
          const totalPages = Math.ceil(count / rowsPerPage);
          return (
            <Box
              sx={{
                display: "flex",
                gap: 1,
                alignItems: "center",
                flex: 1,
                justifyContent: "flex-end",
              }}
            >
              <IconButton
                size="small"
                disabled={page === 0}
                onClick={(event) => onPageChange(event, page - 1)}
                sx={{
                  width: 28,
                  height: 28,
                  border: "1px solid #E5E7EB",
                }}
              >
                {"<"}
              </IconButton>

              {[...Array(totalPages)].map((_, index) => (
                <Button
                  key={index}
                  onClick={(event) => onPageChange(event, index)}
                  sx={{
                    width: 28,
                    height: 28,
                    minWidth: 28,
                    px: 0,
                    fontSize: 14,
                    borderRadius: 1,
                    bgcolor: index === page ? "#525252" : "transparent",
                    color: index === page ? "#fff" : "#424242",
                    "&:hover": {
                      bgcolor: index === page ? "#424242" : "#F5F5F5",
                    },
                  }}
                >
                  {index + 1}
                </Button>
              ))}

              <IconButton
                size="small"
                disabled={page >= totalPages - 1}
                onClick={(event) => onPageChange(event, page + 1)}
                sx={{
                  width: 28,
                  height: 28,
                  border: "1px solid #E5E7EB",
                }}
              >
                {">"}
              </IconButton>
            </Box>
          );
        }}
      />
    </Box>
  );
};

export default ItemsPagination;
