import { Box, Link, Typography } from "@mui/material";

export function AuthFooter({ showLinks = false }: { showLinks?: boolean }) {
  return (
    <Box
      sx={{
        borderTop: "1px solid #e5e5e5",
        py: 3,
        bgcolor: "white",
        textAlign: "center",
        px: 2,
      }}
    >
      <Typography
        variant="caption"
        sx={{
          color: "#737373",
          display: "block",
          mb: 1,
          fontSize: { xs: "0.65rem", sm: "0.75rem" },
        }}
      >
        © 2025 InvoiceApp. All rights reserved.
      </Typography>
      {showLinks && (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            gap: { xs: 1, sm: 2 },
            flexWrap: "wrap",
            alignItems: "center",
          }}
        >
          <Link
            component="button"
            variant="caption"
            sx={{
              color: "#737373",
              textDecoration: "none",
              fontSize: { xs: "0.65rem", sm: "0.75rem" },
              whiteSpace: "nowrap",
              "&:hover": { color: "#525252", textDecoration: "underline" },
            }}
          >
            Privacy Policy
          </Link>
          <Typography
            variant="caption"
            sx={{ color: "#d0d0d0", display: { xs: "none", sm: "block" } }}
          >
            •
          </Typography>
          <Link
            component="button"
            variant="caption"
            sx={{
              color: "#737373",
              textDecoration: "none",
              fontSize: { xs: "0.65rem", sm: "0.75rem" },
              whiteSpace: "nowrap",
              "&:hover": { color: "#525252", textDecoration: "underline" },
            }}
          >
            Terms of Service
          </Link>
          <Typography
            variant="caption"
            sx={{ color: "#d0d0d0", display: { xs: "none", sm: "block" } }}
          >
            •
          </Typography>
          <Link
            component="button"
            variant="caption"
            sx={{
              color: "#737373",
              textDecoration: "none",
              fontSize: { xs: "0.65rem", sm: "0.75rem" },
              whiteSpace: "nowrap",
              "&:hover": { color: "#525252", textDecoration: "underline" },
            }}
          >
            Support
          </Link>
        </Box>
      )}
    </Box>
  );
}
