import { apiGet, apiPut } from "@/services/api/client";
import type { SettingsSnapshot } from "@/types/domain";

export function getSettingsSnapshot() {
  return apiGet<SettingsSnapshot>("/settings");
}

export function updateSettingsSnapshot(payload: SettingsSnapshot) {
  return apiPut<SettingsSnapshot, SettingsSnapshot>("/settings", payload);
}
