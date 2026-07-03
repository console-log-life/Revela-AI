import type {
  AuthResponse,
  Candidate,
  CandidateContext,
  CandidateProfile,
  DashboardOverview,
  Evaluation,
  InterviewQuestion,
  ReportSummary,
  SettingsSnapshot,
  TraceItem,
  WorkspaceMessage
} from "@/types/domain";

export interface StartSessionRequest {
  candidateId: string;
  candidateName: string;
  role: string;
}

export interface StartSessionResponse {
  sessionId: string;
  candidate: Candidate;
  memory: CandidateContext;
  currentQuestion: InterviewQuestion;
  trace: TraceItem[];
  messages?: WorkspaceMessage[];
  scoreSeries?: number[];
  latestEvaluation?: Evaluation;
}

export interface SubmitResponseRequest {
  candidateId: string;
  answer: string;
}

export interface SubmitResponseResponse {
  evaluation: Evaluation;
  nextQuestion: InterviewQuestion;
  trace: TraceItem[];
  scoreSeries: number[];
  memoryPreview: CandidateContext;
}

export interface EndSessionResponse {
  reflection: string;
  summary: ReportSummary;
  updatedContext: CandidateContext;
}

export interface AnalyticsResponse extends DashboardOverview {}

export interface SettingsResponse extends SettingsSnapshot {}

export interface AuthRequest {
  email: string;
  password?: string;
  name?: string;
}

export interface AuthApiResponse extends AuthResponse {}

export interface CandidateListResponse {
  items: Candidate[];
}

export interface CandidateProfileResponse extends CandidateProfile {}
