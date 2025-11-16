"use client";

import { Box, Card, CardContent, Typography, Chip } from "@mui/material";
import {
  TrendingUp,
  Receipt,
  Inventory,
  AttachMoney,
} from "@mui/icons-material";
import { useAuthStore } from "@/src/store/auth.store";

export default function DashboardPage() {
  const { user, company } = useAuthStore();

  const stats = [
    {
      title: "Total Revenue",
      value: `${company?.currencySymbol || "$"}125,847.50`,
      change: "+12.5%",
      icon: <AttachMoney />,
      color: "#10b981",
      bgColor: "#f0fdf4",
    },
    {
      title: "Total Invoices",
      value: "247",
      change: "+8.2%",
      icon: <Receipt />,
      color: "#3b82f6",
      bgColor: "#eff6ff",
    },
    {
      title: "Total Items",
      value: "48",
      change: "+3.1%",
      icon: <Inventory />,
      color: "#8b5cf6",
      bgColor: "#f5f3ff",
    },
    {
      title: "Growth",
      value: "23.5%",
      change: "+2.4%",
      icon: <TrendingUp />,
      color: "#f59e0b",
      bgColor: "#fffbeb",
    },
  ];

  return (
    <Box margin={3}>
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h4"
          sx={{ fontWeight: 600, color: "#262626", mb: 1 }}
        >
          Welcome back, {user?.firstName}! 👋
        </Typography>
        <Typography variant="body1" sx={{ color: "#757575" }}>
          {"Here's what's happening with your business today."}
        </Typography>
      </Box>

      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          gap: 3,
          mb: 4,
        }}
      >
        {stats.map((stat, index) => (
          <Box
            key={index}
            sx={{
              flex: {
                xs: "1 1 100%",
                sm: "1 1 calc(50% - 12px)",
                md: "1 1 calc(25% - 18px)",
              },
              minWidth: 250,
            }}
          >
            <Card
              elevation={0}
              sx={{
                border: "1px solid #e5e5e5",
                borderRadius: 2,
                height: "100%",
              }}
            >
              <CardContent>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    mb: 2,
                  }}
                >
                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      borderRadius: 2,
                      bgcolor: stat.bgColor,
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      color: stat.color,
                    }}
                  >
                    {stat.icon}
                  </Box>

                  <Chip
                    label={stat.change}
                    size="small"
                    sx={{
                      bgcolor: "#f0fdf4",
                      color: "#10b981",
                      fontWeight: 600,
                      fontSize: "0.75rem",
                    }}
                  />
                </Box>

                <Typography
                  variant="h4"
                  sx={{ fontWeight: 700, color: "#262626", mb: 0.5 }}
                >
                  {stat.value}
                </Typography>
                <Typography variant="body2" sx={{ color: "#757575" }}>
                  {stat.title}
                </Typography>
              </CardContent>
            </Card>
          </Box>
        ))}
      </Box>

      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          gap: 3,
        }}
      ></Box>
    </Box>
  );
}
