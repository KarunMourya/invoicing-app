"use client";

import { Box, Typography, Paper, CircularProgress } from "@mui/material";
import { useAuthStore } from "@/src/store/auth.store";
import { useDashboardMetrics } from "@/src/hooks/useDashboardMetrics";

import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const COLORS = [
  "#2563eb",
  "#16a34a",
  "#f59e0b",
  "#dc2626",
  "#7c3aed",
  "#63497D",
  "#f5ee0b",
  "#dc26a6",
  "#7b3aed",
  "#634f7d",
];

export default function DashboardPage() {
  const { getUserInfo } = useAuthStore();
  const user = getUserInfo()
  const { metrics, trend, topItems, loading, error } = useDashboardMetrics();

  if (loading)
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 12 }}>
        <CircularProgress size={60} />
      </Box>
    );

  if (error)
    return (
      <Box sx={{ textAlign: "center", mt: 12 }}>
        <Typography color="error" fontSize={18}>
          Failed to load dashboard data.
        </Typography>
      </Box>
    );

  return (
    <Box p={3}>
      <Typography variant="h4" sx={{ fontWeight: 600, mb: 3, color: "black" }}>
        Welcome back, {user?.firstName}! 👋
      </Typography>

      <Box
        sx={{
          display: "flex",
          gap: 3,
          flexDirection: { xs: "column", md: "row" },
          mb: 3,
        }}
      >
        <Paper
          sx={{
            flex: 1,
            p: 2,
            minHeight: 370,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Typography sx={{ mb: 2, fontWeight: 600 }}>
            Invoice Amount Trend (Last 12 Months)
          </Typography>

          <Box sx={{ width: "100%", height: { xs: 240, sm: 260, md: 300 } }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="monthStart" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="amountSum"
                  stroke="#2563eb"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </Box>
        </Paper>

        <Paper
          sx={{
            flex: 1,
            p: 2,
            minHeight: 370,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Typography sx={{ mb: 2, fontWeight: 600 }}>
            Monthly Invoice Count
          </Typography>

          <Box sx={{ width: "100%", height: { xs: 240, sm: 260, md: 300 } }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="monthStart" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar
                  dataKey="invoiceCount"
                  fill="#f59e0b"
                  radius={[6, 6, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </Box>
        </Paper>
      </Box>

      <Box
        sx={{
          display: "flex",
          gap: 3,
          flexDirection: { xs: "column", md: "row" },
        }}
      >
        <Paper
          sx={{
            flex: 1,
            p: 2,
            minHeight: 370,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Typography sx={{ mb: 2, fontWeight: 600 }}>
            Top 10 Selling Items
          </Typography>

          <Box sx={{ width: "100%", height: { xs: 240, sm: 260, md: 300 } }}>
            {topItems.length === 0 ? (
              <Box
                sx={{
                  height: "100%",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  color: "#888",
                }}
              >
                No data available
              </Box>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={topItems.map((item) => ({
                      name: item.itemName,
                      value: item.amountSum,
                    }))}
                    outerRadius={100}
                    cx="50%"
                    cy="50%"
                    label
                  >
                    {topItems.map((_, index) => (
                      <Cell key={index} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </Box>
        </Paper>

        <Paper
          sx={{
            flex: 1,
            p: 2,
            minHeight: 370,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          <Typography sx={{ mb: 2, fontWeight: 600 }}>
            Total Invoice Metrics
          </Typography>

          <Typography variant="h5" fontWeight={700} sx={{ mt: 2 }}>
            Total Invoices: {metrics[0]?.invoiceCount ?? 0}
          </Typography>

          <Typography variant="h5" fontWeight={700} sx={{ mt: 3 }}>
            Total Revenue: ₹{metrics[0]?.totalAmount?.toLocaleString() ?? 0}
          </Typography>
        </Paper>
      </Box>
    </Box>
  );
}
