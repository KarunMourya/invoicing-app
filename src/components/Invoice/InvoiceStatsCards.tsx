import React from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Skeleton,
  capitalize,
} from "@mui/material";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

import { Receipt, AttachMoney } from "@mui/icons-material";
import { formatMoney } from "@/src/utils/formatMoney";
import { useAuthStore } from "@/src/store/auth.store";
import { InvoiceTrend, TopItem } from "@/src/services/invoice.service";

interface InvoiceStatsCardsProps {
  tab?: string;
  count?: number;
  totalAmount?: number;
  trend?: InvoiceTrend[];
  topItems?: TopItem[];
  isLoading?: boolean;
  isTrendLoading?: boolean;
  isTopItemsLoading?: boolean;
}

const COLORS = ["#2563eb", "#16a34a", "#f59e0b", "#dc2626", "#7c3aed"];

export const InvoiceStatsCards: React.FC<InvoiceStatsCardsProps> = ({
  count,
  tab,
  totalAmount,
  trend = [],
  topItems = [],
  isLoading,
  isTrendLoading,
  isTopItemsLoading,
}) => {
  const { company } = useAuthStore();

  const stats = [
    {
      title: "Number of Invoices",
      value: count || 0,
      subtitle: capitalize(tab || "") || "Today",
      icon: <Receipt sx={{ fontSize: 40, color: "#2563eb" }} />,
      format: (val: number) => val.toString(),
    },
    {
      title: "Total Invoice Amount",
      value: totalAmount || 0,
      subtitle: capitalize(tab || "") || "Today",
      icon: <AttachMoney sx={{ fontSize: 40, color: "#16a34a" }} />,
      format: (val: number) => formatMoney(val, company?.currencySymbol),
    },
  ];

  if (isLoading) {
    return (
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "repeat(2, 1fr)",
            lg: "repeat(4, 1fr)",
          },
          gap: 3,
          mb: 3,
        }}
      >
        {[1, 2, 3, 4].map((index) => (
          <Card key={index} elevation={0} sx={{ border: "1px solid #e5e5e5" }}>
            <CardContent>
              <Skeleton variant="text" width="60%" height={24} />
              <Skeleton variant="text" width="40%" height={40} sx={{ mt: 1 }} />
              <Skeleton variant="text" width="30%" height={20} sx={{ mt: 1 }} />
            </CardContent>
          </Card>
        ))}
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: {
          xs: "1fr",
          sm: "repeat(2, 1fr)",
          lg: "repeat(4, 1fr)",
        },
        gap: 3,
        mb: 3,
      }}
    >
      {stats.map((stat, index) => (
        <Card
          key={index}
          elevation={0}
          sx={{
            border: "1px solid #e5e5e5",
            borderRadius: 2,
            transition: "all 0.2s",
            "&:hover": {
              boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
              transform: "translateY(-2px)",
            },
          }}
        >
          <CardContent>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
              {stat.format(stat.value)}
            </Typography>
            <Typography variant="body2" sx={{ color: "#6b7280" }}>
              {stat.title}
            </Typography>

            <Typography variant="caption" sx={{ color: "#9ca3af" }}>
              {stat.subtitle}
            </Typography>
          </CardContent>
        </Card>
      ))}

      <Card elevation={0} sx={{ border: "1px solid #e5e5e5", borderRadius: 2 }}>
        <CardContent>
          <Typography sx={{ color: "#6b7280", mb: 1, fontWeight: 500 }}>
            Last 12 Months
          </Typography>

          {isTrendLoading ? (
            <Skeleton variant="rectangular" height={140} />
          ) : (
            <Box
              sx={{
                width: "100%",
                height: 200,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                paddingY: 1,
              }}
            >
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trend}>
                  <XAxis dataKey="monthStart" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="amountSum"
                    stroke="#2563eb"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          )}
        </CardContent>
      </Card>

      <Card elevation={0} sx={{ border: "1px solid #e5e5e5", borderRadius: 2 }}>
        <CardContent>
          <Typography sx={{ color: "#6b7280", mb: 1, fontWeight: 500 }}>
            Top 5 Items
          </Typography>

          {isTopItemsLoading ? (
            <Skeleton variant="rectangular" height={180} />
          ) : topItems && topItems.length > 0 ? (
            <Box
              sx={{
                width: "100%",
                height: 200,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                paddingY: 1,
              }}
            >
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={topItems.map((i) => ({
                      name: i.itemName,
                      value: i.amountSum,
                    }))}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={40}
                    outerRadius={70}
                    paddingAngle={4}
                  >
                    {topItems.map((_, index) => (
                      <Cell key={index} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </Box>
          ) : (
            <Typography sx={{ color: "#9ca3af", textAlign: "center", mt: 4 }}>
              No data available
            </Typography>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};
