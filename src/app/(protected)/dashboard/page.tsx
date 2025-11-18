"use client";

import { Box, Typography } from "@mui/material";
import { useAuthStore } from "@/src/store/auth.store";

export default function DashboardPage() {
  const { user } = useAuthStore();

  return (
    <Box margin={3}>
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h4"
          sx={{ fontWeight: 600, color: "#262626", mb: 1 }}
        >
          Welcome back, {user?.firstName}! 👋
        </Typography>

      </Box>
    </Box>
  );
}
