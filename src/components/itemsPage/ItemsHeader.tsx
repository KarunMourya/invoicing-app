import { Box, Typography } from "@mui/material";

export default function ItemsHeader() {
  return (
    <Box sx={{ backgroundColor: "white", px: { xs: 3, sm: 3, md: 4 }, py: 3 }}>
      <Typography variant="h5" sx={{ fontWeight: 400, color: "#262626" }}>
        Items
      </Typography>
      <Typography variant="body2" sx={{ color: "#757575" }}>
        Manage your product and service catalog.
      </Typography>
    </Box>
  );
}
