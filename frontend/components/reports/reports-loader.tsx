"use client";

import { useQueries } from "@tanstack/react-query";
import { ErrorState } from "@/components/error-state";
import { ReportsView } from "@/components/reports/reports-view";
import { Skeleton } from "@/components/ui/skeleton";
import { useCandidates } from "@/hooks/use-candidates";
import { getCandidateProfile } from "@/services/api/candidates";

export function ReportsLoader() {
  const candidateQuery = useCandidates();
  const candidates = candidateQuery.data?.items ?? [];
  const profileQueries = useQueries({
    queries: candidates.map((candidate) => ({
      queryKey: ["candidate-profile", candidate.id],
      queryFn: () => getCandidateProfile(candidate.id),
      enabled: candidates.length > 0
    }))
  });

  if (candidateQuery.isLoading || profileQueries.some((query) => query.isLoading)) {
    return (
      <div className="grid gap-6 xl:grid-cols-2">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-[360px]" />
        ))}
      </div>
    );
  }

  const reportError =
    candidateQuery.error ?? profileQueries.find((query) => query.isError)?.error;

  if (candidateQuery.isError || profileQueries.some((query) => query.isError)) {
    return (
      <ErrorState
        title="Failed to load reports"
        error={reportError}
        onRetry={() => {
          candidateQuery.refetch();
          profileQueries.forEach((query) => query.refetch());
        }}
      />
    );
  }

  return <ReportsView profiles={profileQueries.flatMap((query) => (query.data ? [query.data] : []))} />;
}
