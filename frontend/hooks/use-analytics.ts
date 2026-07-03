"use client";

import { useQuery } from "@tanstack/react-query";
import { getAnalyticsSummary } from "@/services/api/analytics";

export function useAnalytics() {
  return useQuery({
    queryKey: ["analytics-summary"],
    queryFn: getAnalyticsSummary
  });
}
