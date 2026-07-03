"use client";

import Link from "next/link";
import { ArrowUpRight, BookOpenText, DownloadCloud } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/empty-state";
import type { CandidateProfile } from "@/types/domain";

export function ReportsView({ profiles }: { profiles: CandidateProfile[] }) {
  if (profiles.length === 0) {
    return (
      <EmptyState
        icon={<BookOpenText className="h-7 w-7" />}
        title="No reports yet"
        description="Candidate summaries will appear here once interview sessions and reflections have been recorded."
      />
    );
  }

  return (
    <div className="grid gap-6 xl:grid-cols-2">
      {profiles.map((profile) => (
        <Card key={profile.id} className="overflow-hidden">
          <CardHeader>
            <div className="flex items-start justify-between gap-4">
              <div>
                <CardTitle>{profile.name}</CardTitle>
                <CardDescription>{profile.role}</CardDescription>
              </div>
              <Badge variant={profile.metrics.readinessScore >= 70 ? "success" : profile.metrics.readinessScore >= 50 ? "warning" : "destructive"}>
                {profile.metrics.readinessScore >= 70 ? "Advance" : profile.metrics.readinessScore >= 50 ? "Follow-up" : "Hold"}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl bg-secondary/60 p-4">
                <p className="text-sm text-muted-foreground">Readiness</p>
                <p className="mt-2 text-2xl font-semibold">{profile.metrics.readinessScore}%</p>
              </div>
              <div className="rounded-2xl bg-secondary/60 p-4">
                <p className="text-sm text-muted-foreground">Avg score</p>
                <p className="mt-2 text-2xl font-semibold">{profile.metrics.averageScore.toFixed(1)}</p>
              </div>
              <div className="rounded-2xl bg-secondary/60 p-4">
                <p className="text-sm text-muted-foreground">Sessions</p>
                <p className="mt-2 text-2xl font-semibold">{profile.sessions.length}</p>
              </div>
            </div>
            <div className="rounded-3xl border border-border/60 bg-background/50 p-4">
              <p className="text-sm font-medium">Latest memory reflection</p>
              <p className="mt-2 text-sm leading-7 text-muted-foreground">
                {profile.context.lastReflection?.slice(0, 260) ?? "No reflection stored yet."}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {profile.context.strengths.slice(0, 3).map((item) => (
                <Badge key={item} variant="success">
                  {item}
                </Badge>
              ))}
              {profile.context.weakAreas.slice(0, 3).map((item) => (
                <Badge key={item} variant="destructive">
                  {item}
                </Badge>
              ))}
            </div>
            <div className="flex flex-wrap gap-3">
              <Button asChild>
                <Link href={`/candidates/${profile.id}`}>
                  Open profile
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline">
                <a
                  href={`data:text/plain;charset=utf-8,${encodeURIComponent(buildReport(profile))}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  <BookOpenText className="h-4 w-4" />
                  View dossier
                </a>
              </Button>
              <Button asChild variant="ghost">
                <a
                  href={`data:text/plain;charset=utf-8,${encodeURIComponent(buildReport(profile))}`}
                  download={`${profile.id}-summary.txt`}
                >
                  <DownloadCloud className="h-4 w-4" />
                  Export summary
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function buildReport(profile: CandidateProfile) {
  return [
    `Candidate: ${profile.name}`,
    `Role: ${profile.role}`,
    `Readiness: ${profile.metrics.readinessScore}%`,
    `Average Score: ${profile.metrics.averageScore.toFixed(1)}/10`,
    "",
    "Strengths:",
    ...(profile.context.strengths.length ? profile.context.strengths.map((item) => `- ${item}`) : ["- None recorded"]),
    "",
    "Weaknesses:",
    ...(profile.context.weakAreas.length ? profile.context.weakAreas.map((item) => `- ${item}`) : ["- None recorded"]),
    "",
    "Latest Reflection:",
    profile.context.lastReflection ?? "No reflection stored yet."
  ].join("\n");
}
