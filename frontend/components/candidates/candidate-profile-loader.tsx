"use client";

import { CandidateProfileView } from "@/components/candidates/candidate-profile-view";
import { ErrorState } from "@/components/error-state";
import { Skeleton } from "@/components/ui/skeleton";
import { useCandidateProfile } from "@/hooks/use-candidates";

export function CandidateProfileLoader({ candidateId }: { candidateId: string }) {
  const query = useCandidateProfile(candidateId);

  if (query.isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-[320px]" />
        <div className="grid gap-6 xl:grid-cols-2">
          <Skeleton className="h-[340px]" />
          <Skeleton className="h-[340px]" />
        </div>
      </div>
    );
  }

  if (query.isError || !query.data) {
    return (
      <ErrorState
        title="Failed to load candidate profile"
        error={query.error}
        onRetry={() => query.refetch()}
      />
    );
  }

  return <CandidateProfileView profile={query.data} />;
}
