"use client";

import * as React from "react";
import { DatabaseZap, History, ShieldAlert, Star } from "lucide-react";
import { useCandidateMemory, useCandidates } from "@/hooks/use-candidates";
import { ErrorState } from "@/components/error-state";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/empty-state";
import { Select } from "@/components/ui/select";

export function MemoryWorkspaceView() {
  const { data, isError, error, refetch } = useCandidates();
  const candidates = data?.items ?? [];
  const [candidateId, setCandidateId] = React.useState("");

  React.useEffect(() => {
    if (!candidateId && candidates[0]) {
      setCandidateId(candidates[0].id);
    }
  }, [candidateId, candidates]);

  const memory = useCandidateMemory(candidateId);

  if (isError) {
    return (
      <ErrorState
        title="Failed to load memory"
        error={error}
        onRetry={() => refetch()}
      />
    );
  }

  if (candidates.length === 0) {
    return (
      <EmptyState
        icon={<DatabaseZap className="h-7 w-7" />}
        title="No memory records yet"
        description="Finish at least one interview session to start building persistent candidate memory."
      />
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Memory explorer</CardTitle>
          <CardDescription>Inspect retained interactions, reflections, strengths, and weaknesses per candidate.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-5 md:grid-cols-[0.7fr_1.3fr]">
          <div className="space-y-2">
            <label className="text-sm font-medium">Candidate</label>
            <Select
              value={candidateId}
              onChange={setCandidateId}
              options={candidates.map((candidate) => ({
                value: candidate.id,
                label: candidate.name
              }))}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-3xl bg-secondary/60 p-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <History className="h-4 w-4" />
                Entries
              </div>
              <p className="mt-2 text-3xl font-semibold">{memory.data?.history.length ?? 0}</p>
            </div>
            <div className="rounded-3xl bg-secondary/60 p-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <ShieldAlert className="h-4 w-4" />
                Weaknesses
              </div>
              <p className="mt-2 text-3xl font-semibold">{memory.data?.weakAreas.length ?? 0}</p>
            </div>
            <div className="rounded-3xl bg-secondary/60 p-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Star className="h-4 w-4" />
                Strengths
              </div>
              <p className="mt-2 text-3xl font-semibold">{memory.data?.strengths.length ?? 0}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Summary signals</CardTitle>
            <CardDescription>Quick view of what the interviewer will recall next session.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div>
              <p className="mb-2 text-sm font-medium">Weak areas</p>
              <div className="flex flex-wrap gap-2">
                {memory.data?.weakAreas.length ? (
                  memory.data.weakAreas.map((item) => (
                    <Badge key={item} variant="destructive">
                      {item}
                    </Badge>
                  ))
                ) : (
                  <Badge>No weaknesses stored</Badge>
                )}
              </div>
            </div>
            <div>
              <p className="mb-2 text-sm font-medium">Strengths</p>
              <div className="flex flex-wrap gap-2">
                {memory.data?.strengths.length ? (
                  memory.data.strengths.map((item) => (
                    <Badge key={item} variant="success">
                      {item}
                    </Badge>
                  ))
                ) : (
                  <Badge>No strengths stored</Badge>
                )}
              </div>
            </div>
            <div className="rounded-3xl border border-border/60 bg-background/50 p-4">
              <p className="text-sm font-medium">Last reflection</p>
              <p className="mt-2 text-sm leading-7 text-muted-foreground">
                {memory.data?.lastReflection ?? "No reflection written yet."}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Memory timeline</CardTitle>
            <CardDescription>Chronological retained entries and interaction artifacts.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {memory.data?.history.length ? (
              [...memory.data.history].reverse().map((entry, index) => (
                <div key={`${entry.sessionId}-${index}`} className="rounded-3xl border border-border/60 bg-background/50 p-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant={entry.category === "Strength" ? "success" : entry.category === "Weakness" ? "destructive" : entry.category === "Reflection" ? "warning" : "info"}>
                      {entry.category}
                    </Badge>
                    <span className="text-xs text-muted-foreground">{new Date(entry.timestamp).toLocaleString()}</span>
                  </div>
                  <p className="mt-3 text-sm leading-7 text-muted-foreground">
                    {entry.keyFinding ?? entry.question ?? entry.response ?? "Interaction record"}
                  </p>
                </div>
              ))
            ) : (
              <EmptyState
                icon={<History className="h-7 w-7" />}
                title="No timeline yet"
                description="This candidate has not accumulated memory entries yet."
              />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
