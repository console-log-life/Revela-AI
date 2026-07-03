"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, BrainCircuit, Sparkles, Waves } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden pt-12 md:pt-20">
      <div className="container">
        <div className="grid gap-10 lg:grid-cols-[1.08fr_0.92fr] lg:items-center">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-sky-500/20 bg-sky-500/10 px-4 py-2 text-sm text-sky-300">
              <Sparkles className="h-4 w-4" />
              Adaptive interview intelligence for modern hiring teams
            </div>
            <div className="space-y-5">
              <h1 className="max-w-4xl text-balance text-5xl font-semibold tracking-tight md:text-7xl">
                Interview with memory. Evaluate with signal. Scale with policy-aware AI.
              </h1>
              <p className="max-w-2xl text-balance text-lg text-muted-foreground md:text-xl">
                Revela AI orchestrates interviewer agents, candidate memory, runtime analytics, and multi-model routing
                into a single adaptive hiring system.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-4">
              <Button asChild size="lg">
                <Link href="/dashboard">
                  Open workspace
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/interviews">Launch interview demo</Link>
              </Button>
            </div>
            <div className="flex flex-wrap gap-3">
              <Badge variant="success">Groq Routing</Badge>
              <Badge variant="info">Hindsight Memory</Badge>
              <Badge variant="warning">Policy Engine</Badge>
            </div>
          </div>
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Card className="noise-mask relative overflow-hidden rounded-[32px] border-white/10 bg-slate-950/75">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.22),transparent_25%),radial-gradient(circle_at_bottom_right,rgba(244,114,182,0.18),transparent_25%)]" />
              <CardContent className="relative p-6 md:p-8">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.24em] text-sky-300">Live orchestration</p>
                    <p className="mt-2 text-xl font-semibold">Interview workspace</p>
                  </div>
                  <div className="flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-sm text-emerald-300">
                    <Waves className="h-4 w-4" />
                    Healthy runtime
                  </div>
                </div>
                <div className="mt-6 grid gap-4">
                  <div className="grid gap-4 md:grid-cols-[1.1fr_0.9fr]">
                    <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-500/10 text-sky-300">
                            <BrainCircuit className="h-6 w-6" />
                          </div>
                          <div>
                            <p className="text-sm text-slate-400">Candidate memory</p>
                            <p className="font-medium">Session recall active</p>
                          </div>
                        </div>
                        <Badge variant="info">Context injected</Badge>
                      </div>
                      <div className="mt-5 space-y-3">
                        <div className="rounded-2xl bg-white/5 p-4 text-sm text-slate-300">
                          Prior weakness: distributed systems trade-offs
                        </div>
                        <div className="rounded-2xl bg-white/5 p-4 text-sm text-slate-300">
                          Strength detected: PostgreSQL tuning and incident communication
                        </div>
                      </div>
                    </div>
                    <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
                      <p className="text-sm text-slate-400">Routing rationale</p>
                      <div className="mt-4 space-y-3">
                        <div className="rounded-2xl bg-white/5 p-4">
                          <p className="text-sm text-slate-300">Complexity threshold exceeded</p>
                          <p className="mt-2 text-lg font-medium text-white">Escalate to 70B model</p>
                        </div>
                        <div className="rounded-2xl bg-white/5 p-4">
                          <p className="text-sm text-slate-300">Savings vs GPT-4o baseline</p>
                          <p className="mt-2 text-lg font-medium text-emerald-300">$4.55 retained</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-slate-400">Live interview</p>
                        <p className="mt-1 font-medium">
                          “Design the client-side architecture for a realtime adaptive interview console.”
                        </p>
                      </div>
                      <Badge variant="success">llama-3.3-70b-versatile</Badge>
                    </div>
                    <div className="mt-4 grid gap-3 md:grid-cols-3">
                      {[
                        { label: "Confidence", value: "0.82" },
                        { label: "Latency", value: "1086ms" },
                        { label: "Policy", value: "Performance First" }
                      ].map((item) => (
                        <div key={item.label} className="rounded-2xl bg-white/5 p-4">
                          <p className="text-sm text-slate-400">{item.label}</p>
                          <p className="mt-1 text-xl font-semibold text-white">{item.value}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
