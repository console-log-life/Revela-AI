"use client";

import Link from "next/link";
import { BrainCircuit, ChevronRight, ShieldAlert, Trophy } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { EmptyState } from "@/components/empty-state";
import type { Candidate } from "@/types/domain";

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function CandidateGrid({ items }: { items: Candidate[] }) {
  if (items.length === 0) {
    return (
      <EmptyState
        icon={<BrainCircuit className="h-7 w-7" />}
        title="No candidates yet"
        description="Start an interview session to populate candidate profiles, memory, and trajectory insights."
      />
    );
  }

  return (
    <div className="grid gap-5 lg:grid-cols-2 2xl:grid-cols-3">
      {items.map((candidate) => (
        <Link key={candidate.id} href={`/candidates/${candidate.id}`}>
          <Card className="h-full transition hover:-translate-y-0.5 hover:border-sky-500/30">
            <CardHeader className="flex flex-row items-start justify-between gap-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-14 w-14">
                  <AvatarFallback>{initials(candidate.name)}</AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle>{candidate.name}</CardTitle>
                  <p className="mt-1 text-sm text-muted-foreground">{candidate.role}</p>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="flex flex-wrap gap-2">
                <Badge variant={candidate.status === "ready" ? "success" : candidate.status === "at-risk" ? "destructive" : "default"}>
                  {candidate.status}
                </Badge>
                <Badge variant="info">{candidate.interviewCount} sessions</Badge>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl bg-secondary/60 p-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Trophy className="h-4 w-4" />
                    Strengths
                  </div>
                  <p className="mt-2 text-2xl font-semibold">{candidate.strengths.length}</p>
                </div>
                <div className="rounded-2xl bg-secondary/60 p-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <ShieldAlert className="h-4 w-4" />
                    Weaknesses
                  </div>
                  <p className="mt-2 text-2xl font-semibold">{candidate.weakAreas.length}</p>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span>Readiness</span>
                  <span>{Math.max(30, 60 + candidate.strengths.length * 8 - candidate.weakAreas.length * 6)}%</span>
                </div>
                <Progress value={Math.max(30, 60 + candidate.strengths.length * 8 - candidate.weakAreas.length * 6)} />
              </div>
              <div className="space-y-2">
                <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Top memory signals</p>
                <div className="flex flex-wrap gap-2">
                  {candidate.weakAreas.slice(0, 2).map((item) => (
                    <Badge key={item} variant="destructive">
                      {item}
                    </Badge>
                  ))}
                  {candidate.strengths.slice(0, 2).map((item) => (
                    <Badge key={item} variant="success">
                      {item}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}
