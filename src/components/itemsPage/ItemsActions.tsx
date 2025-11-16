import React from "react";
import {
  Box,
  TextField,
  Button,
  IconButton,
  InputAdornment,
} from "@mui/material";
import { Add, FileDownload, ViewColumn, Search } from "@mui/icons-material";

interface ItemsActionsProps {
  query: string;
  setQuery: (query: string) => void;
  onAdd: () => void;
  onExport: () => void;
  onOpenColumnMenu: (event: React.MouseEvent<HTMLElement>) => void;
  isMobile: boolean;
}

const ItemsActions: React.FC<ItemsActionsProps> = ({
  query,
  setQuery,
  onAdd,
  onExport,
  onOpenColumnMenu,
  isMobile,
}) => {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        flexWrap: "wrap",
        backgroundColor: "white",
        px: { xs: 2, md: 4 },
        py: 2,
        gap: 2,
      }}
    >
      <TextField
        placeholder="Search items..."
        size="small"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <Search sx={{ color: "#757575" }} />
              </InputAdornment>
            ),
          },
        }}
        sx={{
          width: { xs: "100%", sm:'100%', md: '100%', lg:400 },
          "& .MuiOutlinedInput-root": { bgcolor: "white" },
        }}
      />

      <Box
        sx={{
          display: "flex",
          gap: 1,
          flexWrap: "wrap",
          width: {
            sm: "100%",
            xs: "100%",
            md: "initial",
          },
        }}
      >
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={onAdd}
          sx={{
            flex: { xs: 1, sm: 1, md: "auto" },
            textTransform: "none",
            bgcolor: "#525252",
            "&:hover": { bgcolor: "#424242" },
          }}
        >
          Add New Item
        </Button>
        <Button
          variant="outlined"
          startIcon={<FileDownload />}
          onClick={onExport}
          sx={{
            flex: { xs: 1, sm: 1, md: "auto" },
            textTransform: "none",
            backgroundColor: "#E5E7EB",
            borderColor: "#d0d0d0",
            color: "#424242",
            "&:hover": { bgcolor: "#fafafa" },
          }}
        >
          Export
        </Button>
        {!isMobile && (
          <IconButton
            onClick={onOpenColumnMenu}
            sx={{
              backgroundColor: "#E5E7EB",
              borderRadius: 1,
              "&:hover": { backgroundColor: "#d0d0d0" },
            }}
          >
            <ViewColumn />
          </IconButton>
        )}
      </Box>
    </Box>
  );
};

export default ItemsActions;
