import { Box, Button, CircularProgress } from "@mui/material";
import { ReactNode } from "react";

interface SubmitButtonProps {
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
  children: ReactNode;
  fullWidth?: boolean;
  endAligned?: boolean;
}

export function SubmitButton({
  onClick,
  disabled = false,
  loading = false,
  children,
  fullWidth = false,
  endAligned = false,
}: SubmitButtonProps) {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: endAligned ? "flex-end" : "center",
        width: "100%",
      }}
    >
      <Button
        onClick={onClick}
        disabled={disabled || loading}
        fullWidth={fullWidth}
        sx={{
          bgcolor: "#525252",
          color: "white",
          width: fullWidth ? "100%" : { xs: "100%", sm: 120 },
          height: { xs: 48, sm: 42 },
          textTransform: "none",
          fontWeight: 500,
          borderRadius: 1,
          fontSize: "16px",
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
