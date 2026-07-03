"use client";

import * as React from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CandidateGrid } from "@/components/candidates/candidate-grid";
import { ErrorState } from "@/components/error-state";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { createCandidate } from "@/services/api/candidates";
import { useCandidates } from "@/hooks/use-candidates";

export function CandidatesLoader() {
  const query = useCandidates();
  const queryClient = useQueryClient();
  const [name, setName] = React.useState("");
  const [role, setRole] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [experienceYears, setExperienceYears] = React.useState("0");
  const [weakAreas, setWeakAreas] = React.useState("");
  const [strengths, setStrengths] = React.useState("");

  const createMutation = useMutation({
    mutationFn: () =>
      createCandidate({
        name,
        email,
        role: role || "Interview Candidate",
        experienceYears: Number(experienceYears) || 0,
        weakAreas: weakAreas
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
        strengths: strengths
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["candidates"] });
      setName("");
      setRole("");
      setEmail("");
      setExperienceYears("0");
      setWeakAreas("");
      setStrengths("");
    },
  });

  if (query.isLoading) {
    return (
      <div className="grid gap-5 lg:grid-cols-2 2xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <Skeleton key={index} className="h-[340px]" />
        ))}
      </div>
    );
  }

  if (query.isError || !query.data) {
    return (
      <ErrorState
        title="Failed to load candidates"
        error={query.error}
        onRetry={() => query.refetch()}
      />
    );
  }

  return (
    <div className="space-y-8">
      <div className="rounded-3xl border border-border/60 bg-background/50 p-6">
        <div className="mb-4 space-y-2">
          <h2 className="text-lg font-semibold">Create new candidate</h2>
          <p className="text-sm text-muted-foreground">Add a candidate profile that persists to the backend catalog and memory store.</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium">Name</label>
            <Input value={name} onChange={(event) => setName(event.target.value)} placeholder="Alex Rivera" />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium">Role</label>
            <Input value={role} onChange={(event) => setRole(event.target.value)} placeholder="Frontend Engineer" />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium">Email</label>
            <Input value={email} onChange={(event) => setEmail(event.target.value)} placeholder="alex@company.com" />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium">Experience Years</label>
            <Input
              type="number"
              value={experienceYears}
              onChange={(event) => setExperienceYears(event.target.value)}
              placeholder="0"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="mb-2 block text-sm font-medium">Strengths</label>
            <Input value={strengths} onChange={(event) => setStrengths(event.target.value)} placeholder="React, System Design" />
          </div>
          <div className="sm:col-span-2">
            <label className="mb-2 block text-sm font-medium">Weaknesses</label>
            <Input value={weakAreas} onChange={(event) => setWeakAreas(event.target.value)} placeholder="Debugging, Time management" />
          </div>
        </div>
        <div className="mt-4 flex items-center justify-end gap-3">
          <Button
            onClick={() => createMutation.mutate()}
            disabled={createMutation.isPending || !name.trim()}
          >
            {createMutation.isPending ? "Creating…" : "Create candidate"}
          </Button>
        </div>
      </div>
      <CandidateGrid items={query.data.items} />
    </div>
  );
}
