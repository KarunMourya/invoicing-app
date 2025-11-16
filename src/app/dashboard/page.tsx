"use client";

import {
  Box,
  Card,
  CardContent,
  Typography,
  Avatar,
  Chip,
} from "@mui/material";
import {
  TrendingUp,
  Receipt,
  Inventory,
  AttachMoney,
} from "@mui/icons-material";
import { useAuthStore } from "@/src/store/auth.store";
import { ProtectedRoute } from "@/src/components/protected/ProtectedRoute";
import { Layout } from "@/src/components/protected/Layout";

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
    <ProtectedRoute>
      <Layout>
        <Box>
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
            {stats.map((stat, i) => (
              <Box
                key={i}
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

          <Box sx={{ mt: 4 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              Quick Actions
            </Typography>

            <Box
              sx={{
                display: "flex",
                flexWrap: "wrap",
                gap: 3,
              }}
            >
              <Box
                sx={{
                  flex: {
                    xs: "1 1 100%",
                    sm: "1 1 calc(50% - 12px)",
                    md: "1 1 calc(25% - 12px)",
                  },
                  minWidth: 220,
                }}
              >
                <Card
                  elevation={0}
                  sx={{
                    border: "1px solid #e5e5e5",
                    borderRadius: 2,
                    cursor: "pointer",
                    transition: "all 0.2s",
                    "&:hover": {
                      borderColor: "#525252",
                      transform: "translateY(-2px)",
                      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                    },
                  }}
                >
                  <CardContent sx={{ textAlign: "center", py: 3 }}>
                    <Receipt sx={{ fontSize: 40, color: "#525252", mb: 1 }} />
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      Create Invoice
                    </Typography>
                  </CardContent>
                </Card>
              </Box>

              <Box
                sx={{
                  flex: {
                    xs: "1 1 100%",
                    sm: "1 1 calc(50% - 12px)",
                    md: "1 1 calc(25% - 12px)",
                  },
                  minWidth: 220,
                }}
              >
                <Card
                  elevation={0}
                  sx={{
                    border: "1px solid #e5e5e5",
                    borderRadius: 2,
                    cursor: "pointer",
                    transition: "all 0.2s",
                    "&:hover": {
                      borderColor: "#525252",
                      transform: "translateY(-2px)",
                      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                    },
                  }}
                >
                  <CardContent sx={{ textAlign: "center", py: 3 }}>
                    <Inventory sx={{ fontSize: 40, color: "#525252", mb: 1 }} />
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      Add New Item
                    </Typography>
                  </CardContent>
                </Card>
              </Box>
            </Box>
          </Box>
        </Box>
      </Layout>
    </ProtectedRoute>
  );
}
