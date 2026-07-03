"use client";

import { ErrorState } from "@/components/error-state";
import { SettingsWorkspace } from "@/components/settings/settings-workspace";
import { Skeleton } from "@/components/ui/skeleton";
import { useSettings } from "@/hooks/use-settings";

export function SettingsLoader() {
  const query = useSettings();

  if (query.isLoading) {
    return <Skeleton className="h-[520px]" />;
  }

  if (query.isError || !query.data) {
    return (
      <ErrorState
        title="Failed to load settings"
        error={query.error}
        onRetry={() => query.refetch()}
      />
    );
  }

  return <SettingsWorkspace settings={query.data} />;
}
