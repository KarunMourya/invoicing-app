import { Box, Button, CircularProgress } from "@mui/material";
import { ReactNode } from "react";

interface StickyButtonProps {
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
  children: ReactNode;
}

export function StickyButton({
  onClick,
  disabled = false,
  loading = false,
  children,
}: StickyButtonProps) {
  return (
    <Box
      sx={{
        display: { xs: "block", md: "none" },
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        bgcolor: "white",
        borderTop: "1px solid #e5e5e5",
        p: 2,
        zIndex: 1000,
      }}
    >
      <Button
        onClick={onClick}
        disabled={disabled || loading}
        fullWidth
        sx={{
          bgcolor: "#525252",
          color: "white",
          height: 48,
          textTransform: "none",
          borderRadius: 1,
          fontSize: "16px",
          fontWeight: 500,
          "&:hover": {
            bgcolor: "#424242",
          },
          "&:disabled": {
            bgcolor: "#e0e0e0",
            color: "#9e9e9e",
          },
        }}
      >
        {loading ? (
          <CircularProgress size={20} sx={{ color: "#9e9e9e" }} />
        ) : (
          children
        )}
      </Button>
    </Box>
  );
}
