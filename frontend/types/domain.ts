export type ThemeMode = "light" | "dark" | "system";
export type Difficulty = "Easy" | "Medium" | "Hard" | "N/A";
export type BudgetStatus = "normal" | "low" | "critical";
export type CircuitStatus = "OPEN" | "CLOSED";
export type SessionStage = "idle" | "active" | "reflecting" | "complete";
export type MemoryCategory =
  | "Interaction"
  | "Weakness"
  | "Strength"
  | "Reflection"
  | "Technical"
  | "General";

export interface Candidate {
  id: string;
  name: string;
  email: string;
  role: string;
  experienceYears: number;
  weakAreas: string[];
  strengths: string[];
  interviewCount: number;
  status: "new" | "returning" | "at-risk" | "ready";
  lastActiveAt?: string;
}

export interface MemoryEntry {
  timestamp: string;
  sessionId: string;
  category: MemoryCategory;
  keyFinding?: string;
  question?: string;
  response?: string;
  score?: number;
  fullReflection?: string;
  impactScore?: number;
}

export interface CandidateContext {
  history: MemoryEntry[];
  weakAreas: string[];
  strengths: string[];
  sessionCount: number;
  summary: string;
  lastReflection?: string;
}

export interface SessionAudit {
  traceId: string;
  rationale: string;
  latencyMs: number;
  savings: number;
  confidence: number;
  circuitStatus: CircuitStatus;
  policy: string;
  model: string;
  actualCost: number;
}

export interface InterviewQuestion {
  id: string;
  text: string;
  category: string;
  difficulty: Difficulty;
  modelUsed: string;
  audit: SessionAudit;
}

export interface RuntimeMetrics {
  model: string;
  audit: SessionAudit;
  totalCost: number;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export interface Evaluation {
  questionId: string;
  score: number;
  feedback: string;
  confidenceScore: number;
  latencyMs: number;
  category: string;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  runtimeMetrics: RuntimeMetrics;
}

export interface TraceItem {
  id: string;
  label: string;
  tone: "info" | "success" | "warning" | "critical";
  timestamp: string;
}

export interface WorkspaceMessage {
  id: string;
  role: "assistant" | "candidate" | "system";
  content: string;
  type: "question" | "answer" | "evaluation" | "reflection" | "status";
  timestamp: string;
  meta?: {
    score?: number;
    model?: string;
    difficulty?: Difficulty;
    category?: string;
  };
}

export interface SessionWorkspace {
  sessionId: string;
  candidate: Candidate;
  memory: CandidateContext;
  currentQuestion: InterviewQuestion;
  messages: WorkspaceMessage[];
  trace: TraceItem[];
  scoreSeries: number[];
  stage: SessionStage;
  latestEvaluation?: Evaluation;
}

export interface MetricPoint {
  label: string;
  value: number;
  benchmark?: number;
}

export interface BreakdownItem {
  label: string;
  value: number;
  tone?: "default" | "positive" | "negative" | "warning";
}

export interface HeatmapCell {
  day: string;
  hour: string;
  value: number;
}

export interface ActivityItem {
  id: string;
  title: string;
  description: string;
  tone: "neutral" | "positive" | "warning" | "critical";
  timestamp: string;
}

export interface InsightCard {
  id: string;
  title: string;
  summary: string;
  severity: "low" | "medium" | "high";
  metric: string;
}

export interface AnalyticsLog {
  timestamp: string;
  model: string;
  cost: number;
  latencyMs: number;
  tokens: number;
  sessionId: string;
  rationale: string;
  savings: number;
  confidence: number;
  policy?: string;
}

export interface AnalyticsSummary {
  totalCost: number;
  totalSavings: number;
  avgLatency: number;
  avgConfidence: number;
  totalTokens: number;
  sessionCount: number;
  budgetStatus: BudgetStatus;
  modelDistribution: BreakdownItem[];
  scoreTrend: MetricPoint[];
  strengths: BreakdownItem[];
  weaknesses: BreakdownItem[];
  performanceHeatmap: HeatmapCell[];
  activityFeed: ActivityItem[];
  insights: InsightCard[];
  logs: AnalyticsLog[];
}

export interface CandidateSession {
  sessionId: string;
  startedAt: string;
  turns: number;
  averageScore: number;
  lastQuestion?: string;
  reflection?: string;
}

export interface CandidateMetrics {
  healthScore: number;
  readinessScore: number;
  averageScore: number;
  improvementScore: number;
  interactions: number;
}

export interface CandidateProfile extends Candidate {
  context: CandidateContext;
  sessions: CandidateSession[];
  metrics: CandidateMetrics;
  recommendations: string[];
}

export interface ReportSummary {
  headline: string;
  status: "follow-up" | "advance" | "hold";
  averageScore: number;
  strengths: string[];
  weaknesses: string[];
  reflection: string;
}

export interface DashboardOverview {
  totalSessions: number;
  activeCandidates: number;
  aiActivity: number;
  averageScore: number;
  candidateStats: BreakdownItem[];
  interviewScoreTrends: MetricPoint[];
  strengthsAnalysis: BreakdownItem[];
  weaknessAnalysis: BreakdownItem[];
  modelUsage: BreakdownItem[];
  analyticsSummary: AnalyticsSummary;
  memoryHighlights: CandidateProfile[];
  activityFeed: ActivityItem[];
  policyStatus: {
    circuitStatus: CircuitStatus;
    budgetStatus: BudgetStatus;
    activePolicy: string;
  };
}

export interface SettingsSnapshot {
  profile: {
    name: string;
    email: string;
    role: string;
  };
  api: {
    groqConnected: boolean;
    hindsightConnected: boolean;
    apiBaseUrl: string;
  };
  model: {
    defaultTier: "efficiency" | "performance" | "free";
    confidenceThreshold: number;
    maxLatencyMs: number;
  };
  memory: {
    cloudSync: boolean;
    retainReflections: boolean;
    localStoragePath: string;
  };
  notifications: {
    emailDigest: boolean;
    budgetAlerts: boolean;
    candidateAlerts: boolean;
  };
}

export interface AuthResponse {
  success: boolean;
  message: string;
}
