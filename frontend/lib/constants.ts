import type { ActivityItem, BreakdownItem, InsightCard } from "@/types/domain";
import {
  BrainCircuit,
  LayoutDashboard,
  MessageSquareDashed,
  Radar,
  Settings2,
  Sparkles,
  UserSquare2,
  BookMarked
} from "lucide-react";

export const appName = "Revela AI";
export const appDescription =
  "Adaptive interview intelligence with persistent memory, evaluation scoring, analytics, and policy-aware model orchestration.";

export const platformNav = [
  { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { title: "Interview Sessions", href: "/interviews", icon: MessageSquareDashed },
  { title: "Candidate Profiles", href: "/candidates", icon: UserSquare2 },
  { title: "Memory", href: "/memory", icon: BrainCircuit },
  { title: "Analytics", href: "/analytics", icon: Radar },
  { title: "AI Insights", href: "/insights", icon: Sparkles },
  { title: "Reports", href: "/reports", icon: BookMarked },
  { title: "Settings", href: "/settings", icon: Settings2 }
] as const;

export const marketingFeatures = [
  {
    title: "Adaptive AI Interviewer",
    description:
      "Questions escalate based on candidate performance, prior memory, and routing confidence instead of rigid scripts."
  },
  {
    title: "Persistent Candidate Memory",
    description:
      "Hindsight-style retain, recall, and reflect loops preserve strengths, weaknesses, and longitudinal progress."
  },
  {
    title: "Runtime Cost Intelligence",
    description:
      "Policy-aware model selection balances latency, confidence, budget, and graceful failover across every interaction."
  },
  {
    title: "Decision-Ready Analytics",
    description:
      "Turn interview traces into score trends, model usage, risk signals, and recruiter-ready reports."
  }
];

export const workflowSteps = [
  "Recall prior candidate dossier",
  "Score routing complexity with the gatekeeper",
  "Generate the next technical question",
  "Evaluate candidate response with calibrated scoring",
  "Persist interaction, strengths, and weaknesses",
  "Reflect at session end to update trajectory"
];

export const testimonials = [
  {
    name: "Marina Cole",
    title: "Talent Ops Lead, Northstar",
    quote:
      "Revela AI finally gave us interview consistency without making strong candidates feel trapped in a script."
  },
  {
    name: "Dev Malik",
    title: "VP Engineering, Arcgrid",
    quote:
      "The memory layer is the difference. Second-round interviews felt contextual, not repetitive, and the analytics were board-ready."
  },
  {
    name: "Lena Brooks",
    title: "Founding Recruiter, Recurve",
    quote:
      "We cut model spend and increased signal quality at the same time. That almost never happens."
  }
];

export const faqs = [
  {
    question: "Does Revela AI replace human interviewers?",
    answer:
      "No. It creates structured, adaptive technical signal so recruiters and hiring managers can make better final decisions."
  },
  {
    question: "How does memory influence new sessions?",
    answer:
      "The interviewer recalls prior weaknesses and strengths, then implicitly probes for progress without repeating the same questions."
  },
  {
    question: "What happens during provider instability?",
    answer:
      "The policy layer can drop into safe-mode and failover tiers while preserving the active candidate session."
  },
  {
    question: "Can we connect a custom backend later?",
    answer:
      "Yes. The frontend is built around a typed API layer with a configurable base URL for real FastAPI routes."
  }
];

export const defaultInsights: InsightCard[] = [
  {
    id: "memory-probe",
    title: "Memory is steering question strategy",
    summary:
      "Returning candidates with prior weaknesses are receiving more system design and architecture probes in follow-up rounds.",
    severity: "medium",
    metric: "Memory Recall"
  },
  {
    id: "cost-routing",
    title: "Efficiency routing is preserving budget",
    summary:
      "Lower-complexity prompts are being handled by the efficiency tier while high-signal questions still escalate when needed.",
    severity: "low",
    metric: "Cost Guard"
  },
  {
    id: "weakness-density",
    title: "Weakness density rose in the latest cohort",
    summary:
      "Concurrency and system design showed up more frequently than expected across the past 7 candidate interactions.",
    severity: "high",
    metric: "Candidate Risk"
  }
];

export const defaultActivity: ActivityItem[] = [
  {
    id: "act-1",
    title: "Cascade policy remained healthy",
    description: "No circuit trips across the last simulated interview batch.",
    tone: "positive",
    timestamp: new Date().toISOString()
  },
  {
    id: "act-2",
    title: "Memory reflection completed",
    description: "A new session reflection was written to local persistent memory.",
    tone: "neutral",
    timestamp: new Date().toISOString()
  }
];

export const defaultModelUsage: BreakdownItem[] = [
  { label: "llama-3.1-8b-instant", value: 64, tone: "positive" },
  { label: "llama-3.3-70b-versatile", value: 24, tone: "default" },
  { label: "gemma2-9b-it", value: 12, tone: "warning" }
];
