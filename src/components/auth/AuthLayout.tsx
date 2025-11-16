"use client";

import { ReactNode } from "react";
import { Box, Typography } from "@mui/material";
import ReceiptIcon from "@mui/icons-material/Receipt";
import { AuthFooter } from "../common/Footer";

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  subtitle: string;
  showStickyButton?: boolean;
}

export function AuthLayout({
  children,
  title,
  subtitle,
  showStickyButton = false,
}: AuthLayoutProps) {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "#fafafa",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Box
        sx={{
          width: "100%",
          borderBottom: "1px solid #e5e5e5",
          bgcolor: "white",
          py: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <ReceiptIcon sx={{ color: "#262626", mr: 1 }} />
        <Typography
          variant="h6"
          sx={{
            fontWeight: 500,
            color: "#262626",
            fontSize: 20,
          }}
        >
          InvoiceApp
        </Typography>
      </Box>

      <Box
        sx={{
          flex: 1,
          display: "flex",
          justifyContent: "center",
          alignItems: showStickyButton ? "flex-start" : "center",
          py: { xs: 2, md: 6 },
          px: 2,
          pb: { xs: 2, md: 6 },
          mb: { xs: showStickyButton ? "140px" : 0, md: 0 },
        }}
      >
        <Box sx={{ width: "100%", maxWidth: showStickyButton ? 900 : 440 }}>
          <Box sx={{ textAlign: "center", mb: 4 }}>
            <Typography
              variant="h4"
              sx={{ fontWeight: 200, mb: 0.5, color: "#212121" }}
            >
              {title}
            </Typography>
            <Typography variant="body2" sx={{ color: "#757575" }}>
              {subtitle}
            </Typography>
          </Box>

          {children}
        </Box>
      </Box>

      <Box
        sx={{
          display: { xs: showStickyButton ? "none" : "block", md: "block" },
        }}
      >
        <AuthFooter showLinks/>
      </Box>
    </Box>
  );
}
