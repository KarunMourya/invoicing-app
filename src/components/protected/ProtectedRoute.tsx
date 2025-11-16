"use client";

import { CircularProgress, Box } from "@mui/material";
import { useProtectedPage } from "@/src/hooks/useProtectedPage";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { checking } = useProtectedPage();

  if (checking) {
    return (
      <Box
        sx={{
          height: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <CircularProgress size={48} />
      </Box>
    );
  }

  return <>{children}</>;
}
