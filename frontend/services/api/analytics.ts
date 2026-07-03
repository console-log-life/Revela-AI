import { apiGet } from "@/services/api/client";
import type { AnalyticsSummary } from "@/types/domain";

export function getAnalyticsSummary() {
  return apiGet<AnalyticsSummary>("/analytics");
}
