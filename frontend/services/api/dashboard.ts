import { apiGet } from "@/services/api/client";
import type { DashboardOverview } from "@/types/domain";

export function getDashboardOverview() {
  return apiGet<DashboardOverview>("/overview");
}
