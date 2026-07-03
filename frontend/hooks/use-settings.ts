"use client";

import { useQuery } from "@tanstack/react-query";
import { getSettingsSnapshot } from "@/services/api/settings";

export function useSettings() {
  return useQuery({
    queryKey: ["settings"],
    queryFn: getSettingsSnapshot
  });
}
