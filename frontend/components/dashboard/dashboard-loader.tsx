"use client";

import { ErrorState } from "@/components/error-state";
import { DashboardOverviewView } from "@/components/dashboard/dashboard-overview";
import { Skeleton } from "@/components/ui/skeleton";
import { useDashboard } from "@/hooks/use-dashboard";

export function DashboardLoader() {
  const query = useDashboard();

  if (query.isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-36" />
          ))}
        </div>
        <div className="grid gap-6 xl:grid-cols-3">
          <Skeleton className="h-[340px] xl:col-span-2" />
          <Skeleton className="h-[340px]" />
        </div>
      </div>
    );
  }

  if (query.isError || !query.data) {
    return (
      <ErrorState
        title="Failed to load dashboard"
        error={query.error}
        onRetry={() => query.refetch()}
      />
    );
  }

  return <DashboardOverviewView data={query.data} />;
}
