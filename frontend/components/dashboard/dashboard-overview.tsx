"use client";

import { useUiStore } from "@/store/ui-store";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import { Activity, BrainCircuit, DollarSign, Gauge, Sparkles, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { StatCard } from "@/components/stat-card";
import { formatCurrency, formatLatency, formatRelativeTime } from "@/lib/utils";
import type { DashboardOverview } from "@/types/domain";

const pieColors = ["#38bdf8", "#0ea5e9", "#22c55e", "#f59e0b", "#f472b6"];

export function DashboardOverviewView({ data }: { data: DashboardOverview }) {
  return (
    <div className="space-y-8">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total sessions"
          value={data.totalSessions.toString()}
          icon={<Activity className="h-6 w-6" />}
          delta={`${data.analyticsSummary.logs.length} tracked interactions`}
          tone="positive"
        />
        <StatCard
          title="Active candidates"
          value={data.activeCandidates.toString()}
          icon={<Users className="h-6 w-6" />}
          delta={`${data.candidateStats.find((item) => item.label === "Returning")?.value ?? 0} returning`}
        />
        <StatCard
          title="AI activity"
          value={data.aiActivity.toString()}
          icon={<BrainCircuit className="h-6 w-6" />}
          delta={data.policyStatus.activePolicy}
        />
        <StatCard
          title="Total savings"
          value={formatCurrency(data.analyticsSummary.totalSavings)}
          icon={<DollarSign className="h-6 w-6" />}
          delta={data.policyStatus.budgetStatus.toUpperCase()}
          tone={data.policyStatus.budgetStatus === "critical" ? "negative" : "positive"}
        />
      </div>

      <div className="rounded-3xl border border-white/10 bg-gradient-to-r from-cyan-500/10 via-sky-500/10 to-purple-500/10 p-8">

        <div className="flex items-center justify-between">

        <div>

        <h2 className="text-3xl font-bold">
        AI Hiring Intelligence Dashboard
        </h2>

        <p className="mt-2 text-muted-foreground">
        Track interviews, monitor AI performance, and discover candidate insights.
        </p>

        </div>

        <div className="hidden lg:block">

        <Sparkles className="h-16 w-16 text-cyan-400"/>

        </div>

        </div>

        </div>

      <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
        <Card>
          <CardHeader>
            <CardTitle>Interview score trends</CardTitle>
            <CardDescription>How candidate scoring is moving across sessions and cohorts.</CardDescription>
          </CardHeader>
          <CardContent className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.interviewScoreTrends}>
                <defs>
                  <linearGradient id="scoreGradient" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.5} />
                    <stop offset="95%" stopColor="#38bdf8" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.15} />
                <XAxis dataKey="label" tick={{ fill: "currentColor", fontSize: 12 }} />
                <YAxis tick={{ fill: "currentColor", fontSize: 12 }} domain={[0, 10]} />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#38bdf8"
                  fillOpacity={1}
                  fill="url(#scoreGradient)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Model usage</CardTitle>
            <CardDescription>Runtime routing split by active model tier.</CardDescription>
          </CardHeader>
          <CardContent className="flex h-[320px] items-center gap-4">
            <div className="h-full flex-1">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={data.modelUsage} dataKey="value" nameKey="label" innerRadius={66} outerRadius={96} paddingAngle={3}>
                    {data.modelUsage.map((entry, index) => (
                      <Cell key={entry.label} fill={pieColors[index % pieColors.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-3">
              {data.modelUsage.map((item, index) => (
                <div key={item.label} className="flex items-center gap-3 text-sm">
                  <span
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: pieColors[index % pieColors.length] }}
                  />
                  <div>
                    <p className="font-medium">{item.label}</p>
                    <p className="text-muted-foreground">{item.value} routed calls</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Strength analysis</CardTitle>
            <CardDescription>Most repeated strengths across candidate memory.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {data.strengthsAnalysis.length > 0 ? (
              data.strengthsAnalysis.map((item) => (
                <div key={item.label} className="space-y-2">
                  <div className="flex items-center justify-between gap-3 text-sm">
                    <span className="line-clamp-1">{item.label}</span>
                    <Badge variant="success">{item.value}</Badge>
                  </div>
                  <Progress value={item.value * 12} />
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No strengths recorded yet.</p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Weakness analysis</CardTitle>
            <CardDescription>Candidate gaps surfacing most often in reflections.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {data.weaknessAnalysis.length > 0 ? (
              data.weaknessAnalysis.map((item) => (
                <div key={item.label} className="space-y-2">
                  <div className="flex items-center justify-between gap-3 text-sm">
                    <span className="line-clamp-1">{item.label}</span>
                    <Badge variant="destructive">{item.value}</Badge>
                  </div>
                  <Progress value={item.value * 12} className="bg-rose-500/10" />
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No weaknesses recorded yet.</p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Runtime health</CardTitle>
            <CardDescription>Policy status, latency, confidence, and budget pressure.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="flex items-center gap-2">
              <Badge variant={data.policyStatus.circuitStatus === "OPEN" ? "destructive" : "success"}>
                Circuit {data.policyStatus.circuitStatus}
              </Badge>
              <Badge variant={data.policyStatus.budgetStatus === "critical" ? "destructive" : data.policyStatus.budgetStatus === "low" ? "warning" : "info"}>
                Budget {data.policyStatus.budgetStatus}
              </Badge>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl bg-secondary/60 p-4">
                <p className="text-sm text-muted-foreground">Avg latency</p>
                <p className="mt-2 text-2xl font-semibold">{formatLatency(data.analyticsSummary.avgLatency)}</p>
              </div>
              <div className="rounded-2xl bg-secondary/60 p-4">
                <p className="text-sm text-muted-foreground">Avg confidence</p>
                <p className="mt-2 text-2xl font-semibold">{Math.round(data.analyticsSummary.avgConfidence * 100)}%</p>
              </div>
              <div className="rounded-2xl bg-secondary/60 p-4">
                <p className="text-sm text-muted-foreground">Token usage</p>
                <p className="mt-2 text-2xl font-semibold">{data.analyticsSummary.totalTokens.toLocaleString()}</p>
              </div>
              <div className="rounded-2xl bg-secondary/60 p-4">
                <p className="text-sm text-muted-foreground">Active policy</p>
                <p className="mt-2 text-lg font-semibold">{data.policyStatus.activePolicy}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Candidate profiles in focus</CardTitle>
            <CardDescription>The strongest memory signals currently influencing the interviewer.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {data.memoryHighlights.map((candidate) => (
              <button
                  key={candidate.id}
                  type="button"
                  onClick={() => useUiStore.getState().setSelectedCandidateId(candidate.id)}
                  className="block text-left w-full rounded-3xl border border-border/60 bg-background/50 p-4 transition hover:bg-secondary/70"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-lg font-medium">{candidate.name}</p>
                      <p className="text-sm text-muted-foreground">{candidate.role}</p>
                    </div>
                    <Badge variant={candidate.status === "ready" ? "success" : candidate.status === "at-risk" ? "destructive" : "info"}>
                      {candidate.status}
                    </Badge>
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
                </button>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Live activity feed</CardTitle>
            <CardDescription>Recent orchestration, routing, and session telemetry.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {data.activityFeed.map((item) => (
              <div key={item.id} className="flex gap-4 rounded-3xl border border-border/60 bg-background/50 p-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-secondary text-primary">
                  <Gauge className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium">{item.title}</p>
                    <Badge variant={item.tone === "warning" ? "warning" : item.tone === "critical" ? "destructive" : item.tone === "positive" ? "success" : "info"}>
                      {item.tone}
                    </Badge>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{item.description}</p>
                  <p className="mt-2 text-xs text-muted-foreground">{formatRelativeTime(item.timestamp)}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}