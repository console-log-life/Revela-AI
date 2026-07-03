"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { AnalyticsSummary } from "@/types/domain";
import { formatCurrency, formatLatency } from "@/lib/utils";

export function AnalyticsWorkbench({ analytics }: { analytics: AnalyticsSummary }) {
  const costComparison = [
    {
      label: "Optimized",
      value: Number(analytics.totalCost.toFixed(4))
    },
    {
      label: "Baseline",
      value: Number((analytics.totalCost + analytics.totalSavings).toFixed(4))
    }
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total cost</CardDescription>
            <CardTitle>{formatCurrency(analytics.totalCost)}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total savings</CardDescription>
            <CardTitle>{formatCurrency(analytics.totalSavings)}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Average latency</CardDescription>
            <CardTitle>{formatLatency(analytics.avgLatency)}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Average confidence</CardDescription>
            <CardTitle>{Math.round(analytics.avgConfidence * 100)}%</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Card>
          <CardHeader>
            <CardTitle>Performance trends</CardTitle>
            <CardDescription>Scoring movement across candidate sessions.</CardDescription>
          </CardHeader>
          <CardContent className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={analytics.scoreTrend}>
                <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.15} />
                <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} domain={[0, 10]} />
                <Tooltip />
                <Line type="monotone" dataKey="value" stroke="#38bdf8" strokeWidth={3} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="benchmark" stroke="#f59e0b" strokeDasharray="6 6" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Cost comparison</CardTitle>
            <CardDescription>Adaptive routing versus baseline model spend.</CardDescription>
          </CardHeader>
          <CardContent className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={costComparison}>
                <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.15} />
                <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="value" radius={[12, 12, 0, 0]}>
                  <Cell fill="#38bdf8" />
                  <Cell fill="#f472b6" />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Routing heatmap</CardTitle>
            <CardDescription>Interaction density by day and hour block.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-6 gap-2">
              {analytics.performanceHeatmap.map((cell) => (
                <div
                  key={`${cell.day}-${cell.hour}`}
                  className="rounded-2xl border border-border/60 p-3 text-center"
                  style={{
                    backgroundColor: `rgba(56, 189, 248, ${0.08 + Math.min(cell.value, 6) * 0.12})`
                  }}
                >
                  <p className="text-xs text-muted-foreground">{cell.day}</p>
                  <p className="mt-1 text-sm font-medium">{cell.hour}:00</p>
                  <p className="mt-2 text-xs text-muted-foreground">{cell.value} hits</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Telemetry stream</CardTitle>
            <CardDescription>Recent call-level data from the orchestration layer.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {analytics.logs.slice(-10).reverse().map((log, index) => (
              <div key={`${log.sessionId}-${index}`} className="rounded-3xl border border-border/60 bg-background/50 p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="info">{log.model}</Badge>
                  <Badge variant={log.confidence < 0.5 ? "warning" : "success"}>{Math.round(log.confidence * 100)}% confidence</Badge>
                  <span className="text-xs text-muted-foreground">{new Date(log.timestamp).toLocaleString()}</span>
                </div>
                <p className="mt-3 text-sm text-muted-foreground">{log.rationale}</p>
                <div className="mt-3 grid gap-3 sm:grid-cols-3">
                  <div className="rounded-2xl bg-secondary/50 p-3">
                    <p className="text-xs text-muted-foreground">Latency</p>
                    <p className="mt-1 text-sm font-medium">{formatLatency(log.latencyMs)}</p>
                  </div>
                  <div className="rounded-2xl bg-secondary/50 p-3">
                    <p className="text-xs text-muted-foreground">Cost</p>
                    <p className="mt-1 text-sm font-medium">{formatCurrency(log.cost)}</p>
                  </div>
                  <div className="rounded-2xl bg-secondary/50 p-3">
                    <p className="text-xs text-muted-foreground">Tokens</p>
                    <p className="mt-1 text-sm font-medium">{log.tokens.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
