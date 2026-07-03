"use client";

import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { DashboardOverview } from "@/types/domain";

export function InsightsWorkspaceView({ overview }: { overview: DashboardOverview }) {
  return (
    <div className="space-y-6">
      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <Card>
          <CardHeader>
            <CardTitle>AI insights</CardTitle>
            <CardDescription>Strategic summaries distilled from analytics, memory, and routing telemetry.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {overview.analyticsSummary.insights.map((insight) => (
              <div key={insight.id} className="rounded-3xl border border-border/60 bg-background/50 p-5">
                <div className="flex items-center gap-2">
                  <Badge variant={insight.severity === "high" ? "destructive" : insight.severity === "medium" ? "warning" : "info"}>
                    {insight.severity}
                  </Badge>
                  <Badge variant="success">{insight.metric}</Badge>
                </div>
                <p className="mt-3 text-lg font-medium">{insight.title}</p>
                <p className="mt-2 text-sm leading-7 text-muted-foreground">{insight.summary}</p>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Recommended next actions</CardTitle>
            <CardDescription>High-signal follow-ups the team can act on right now.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {overview.analyticsSummary.insights.map((insight) => (
              <div key={insight.id} className="rounded-3xl border border-border/60 bg-background/50 p-5">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-secondary text-primary">
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <p className="text-sm leading-7 text-muted-foreground">{insight.summary}</p>
                </div>
              </div>
            ))}
            <Button asChild className="w-full">
              <Link href="/reports">
                Turn insights into reports
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Memory-driven candidate focus</CardTitle>
          <CardDescription>The profiles currently carrying the strongest session history and trajectory signal.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 xl:grid-cols-3">
          {overview.memoryHighlights.map((candidate) => (
            <div key={candidate.id} className="rounded-3xl border border-border/60 bg-background/50 p-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="font-medium">{candidate.name}</p>
                  <p className="text-sm text-muted-foreground">{candidate.role}</p>
                </div>
                <Badge variant="info">{candidate.context.sessionCount} sessions</Badge>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {candidate.context.weakAreas.slice(0, 2).map((item) => (
                  <Badge key={item} variant="destructive">
                    {item}
                  </Badge>
                ))}
                {candidate.context.strengths.slice(0, 2).map((item) => (
                  <Badge key={item} variant="success">
                    {item}
                  </Badge>
                ))}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
