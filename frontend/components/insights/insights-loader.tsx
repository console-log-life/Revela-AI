"use client";

import { ErrorState } from "@/components/error-state";
import { InsightsWorkspaceView } from "@/components/insights/insights-workspace";
import { Skeleton } from "@/components/ui/skeleton";
import { useDashboard } from "@/hooks/use-dashboard";

export function InsightsLoader() {
  const query = useDashboard();

  if (query.isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-[360px]" />
        <Skeleton className="h-[280px]" />
      </div>
    );
  }

  if (query.isError || !query.data) {
    return (
      <ErrorState
        title="Failed to load AI insights"
        error={query.error}
        onRetry={() => query.refetch()}
      />
    );
  }

  return <InsightsWorkspaceView overview={query.data} />;
}
