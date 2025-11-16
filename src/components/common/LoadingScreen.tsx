import { Box, CircularProgress } from "@mui/material";

export function LoadingScreen() {
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
