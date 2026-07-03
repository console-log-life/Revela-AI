import { apiGet, apiPost } from "@/services/api/client";
import type {
  EndSessionResponse,
  StartSessionRequest,
  StartSessionResponse,
  SubmitResponseRequest,
  SubmitResponseResponse
} from "@/types/api";

export function startInterviewSession(payload: StartSessionRequest) {
  return apiPost<StartSessionResponse, StartSessionRequest>("/sessions/start", payload);
}

export function submitInterviewResponse(
  sessionId: string,
  payload: SubmitResponseRequest
) {
  return apiPost<SubmitResponseResponse, SubmitResponseRequest>(`/sessions/${sessionId}/message`, payload);
}

export function endInterviewSession(sessionId: string) {
  return apiPost<EndSessionResponse, Record<string, never>>(`/sessions/${sessionId}/end`, {});
}

export function getInterviewSession(sessionId: string) {
  return apiGet<StartSessionResponse>(`/sessions/${sessionId}`);
}
