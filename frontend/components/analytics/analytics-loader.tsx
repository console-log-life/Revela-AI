"use client";

import { AnalyticsWorkbench } from "@/components/analytics/analytics-workbench";
import { ErrorState } from "@/components/error-state";
import { Skeleton } from "@/components/ui/skeleton";
import { useAnalytics } from "@/hooks/use-analytics";

export function AnalyticsLoader() {
  const query = useAnalytics();

  if (query.isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-32" />
          ))}
        </div>
        <Skeleton className="h-[360px]" />
        <Skeleton className="h-[420px]" />
      </div>
    );
  }

  if (query.isError || !query.data) {
    return (
      <ErrorState
        title="Failed to load analytics"
        error={query.error}
        onRetry={() => query.refetch()}
      />
    );
  }

  return <AnalyticsWorkbench analytics={query.data} />;
}
