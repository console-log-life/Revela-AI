"use client";

import { useQuery } from "@tanstack/react-query";
import { getDashboardOverview } from "@/services/api/dashboard";

export function useDashboard() {
  return useQuery({
    queryKey: ["dashboard-overview"],
    queryFn: getDashboardOverview
  });
}
