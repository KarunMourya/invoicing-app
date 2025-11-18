"use client";

import { useQuery } from "@tanstack/react-query";
import { invoiceService } from "@/src/services/invoice.service";

const todayISO = new Date().toISOString().split("T")[0];

export const useDashboardMetrics = () => {
  const metricsQuery = useQuery({
    queryKey: ["invoice-metrics"],
    queryFn: () => invoiceService.getMetrics(),
  });

  const trendQuery = useQuery({
    queryKey: ["invoice-trend"],
    queryFn: () => invoiceService.getTrend12m(todayISO),
  });

  const topItemsQuery = useQuery({
    queryKey: ["invoice-top-items",10],
    queryFn: () => invoiceService.getTopItems(10),
  });

  return {
    metrics: metricsQuery.data ?? [],
    trend: trendQuery.data ?? [],
    topItems: topItemsQuery.data ?? [],

    loading:
      metricsQuery.isLoading || trendQuery.isLoading || topItemsQuery.isLoading,

    error:
      metricsQuery.error || trendQuery.error || topItemsQuery.error,
  };
};
