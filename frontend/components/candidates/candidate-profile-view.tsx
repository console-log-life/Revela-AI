"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { CandidateProfile } from "@/types/domain";

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function CandidateProfileView({ profile }: { profile: CandidateProfile }) {
  const timeline = profile.sessions.map((session, index) => ({
    label: `S${index + 1}`,
    score: Number(session.averageScore.toFixed(1))
  }));

  const strengths = profile.context.strengths.map((label) => ({
    label: label.slice(0, 24),
    value: 8 + Math.min(2, profile.metrics.averageScore / 2)
  }));

  const weaknesses = profile.context.weakAreas.map((label) => ({
    label: label.slice(0, 24),
    value: 4 + profile.context.sessionCount
  }));

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden">
        <CardContent className="grid gap-8 p-8 lg:grid-cols-[1fr_0.9fr]">
          <div>
            <div className="flex items-start gap-5">
              <Avatar className="h-20 w-20">
                <AvatarFallback>{initials(profile.name)}</AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-3xl font-semibold tracking-tight">{profile.name}</h2>
                <p className="mt-1 text-muted-foreground">{profile.role}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Badge variant="info">{profile.experienceYears} years experience</Badge>
                  <Badge variant={profile.status === "ready" ? "success" : profile.status === "at-risk" ? "destructive" : "default"}>
                    {profile.status}
                  </Badge>
                </div>
              </div>
            </div>
            <p className="mt-6 max-w-2xl text-sm leading-7 text-muted-foreground">{profile.context.summary}</p>
            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              <div className="rounded-3xl bg-secondary/60 p-4">
                <p className="text-sm text-muted-foreground">Health score</p>
                <p className="mt-2 text-3xl font-semibold">{profile.metrics.healthScore}%</p>
              </div>
              <div className="rounded-3xl bg-secondary/60 p-4">
                <p className="text-sm text-muted-foreground">Readiness</p>
                <p className="mt-2 text-3xl font-semibold">{profile.metrics.readinessScore}%</p>
              </div>
              <div className="rounded-3xl bg-secondary/60 p-4">
                <p className="text-sm text-muted-foreground">Avg score</p>
                <p className="mt-2 text-3xl font-semibold">{profile.metrics.averageScore.toFixed(1) || "0.0"}/10</p>
              </div>
            </div>
          </div>
          <div className="rounded-[28px] border border-border/60 bg-background/60 p-6">
            <p className="text-sm font-medium">Preparation roadmap</p>
            <div className="mt-4 space-y-3">
              {(profile.recommendations.length > 0 ? profile.recommendations : ["Review the latest reflection for targeted preparation guidance."]).map((item) => (
                <div key={item} className="rounded-2xl border border-border/60 bg-secondary/50 p-3 text-sm text-muted-foreground">
                  {item}
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <Card>
          <CardHeader>
            <CardTitle>Performance timeline</CardTitle>
            <CardDescription>Average score per completed interview session.</CardDescription>
          </CardHeader>
          <CardContent className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timeline}>
                <defs>
                  <linearGradient id="timelineGradient" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.5} />
                    <stop offset="95%" stopColor="#38bdf8" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.15} />
                <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                <YAxis domain={[0, 10]} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Area dataKey="score" stroke="#38bdf8" fill="url(#timelineGradient)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Session log</CardTitle>
            <CardDescription>Recent sessions, turn count, and reflection memory.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {profile.sessions.map((session, index) => (
              <div key={session.sessionId} className="rounded-3xl border border-border/60 bg-background/50 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-medium">Session {index + 1}</p>
                    <p className="text-sm text-muted-foreground">{new Date(session.startedAt).toLocaleString()}</p>
                  </div>
                  <Badge variant="info">{session.averageScore.toFixed(1)}/10</Badge>
                </div>
                <p className="mt-3 text-sm text-muted-foreground">{session.reflection?.slice(0, 160) ?? "No reflection saved."}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Strength profile</CardTitle>
            <CardDescription>Confirmed strengths consolidated from memory and high-score answers.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={strengths}>
                  <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.15} />
                  <XAxis dataKey="label" tick={{ fontSize: 12 }} angle={-10} textAnchor="end" height={60} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#22c55e" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap gap-2">
              {profile.context.strengths.map((item) => (
                <Badge key={item} variant="success">
                  {item}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Weakness profile</CardTitle>
            <CardDescription>Gaps that should influence follow-up sessions and hiring decisions.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weaknesses}>
                  <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.15} />
                  <XAxis dataKey="label" tick={{ fontSize: 12 }} angle={-10} textAnchor="end" height={60} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#f43f5e" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-3">
              {profile.context.weakAreas.map((item) => (
                <div key={item} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>{item}</span>
                    <span>{Math.min(100, 35 + profile.context.sessionCount * 12)}%</span>
                  </div>
                  <Progress value={Math.min(100, 35 + profile.context.sessionCount * 12)} className="bg-rose-500/10" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
