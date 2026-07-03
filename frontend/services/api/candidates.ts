import { apiGet, apiPost, apiPut } from "@/services/api/client";
import type { Candidate, CandidateListResponse, CandidateProfileResponse } from "@/types/api";
import type { CandidateContext } from "@/types/domain";

export function getCandidates() {
  return apiGet<CandidateListResponse>("/candidates");
}

export function getCandidateProfile(candidateId: string) {
  return apiGet<CandidateProfileResponse>(`/candidates/${candidateId}`);
}

export function getCandidateMemory(candidateId: string) {
  return apiGet<CandidateContext>(`/candidates/${candidateId}/memory`);
}

export function createCandidate(payload: {
  name: string;
  email?: string;
  role?: string;
  experienceYears?: number;
  weakAreas?: string[];
  strengths?: string[];
}) {
  return apiPost<Candidate, typeof payload>(`/candidates`, payload);
}

export function updateCandidate(candidateId: string, payload: {
  name?: string;
  email?: string;
  role?: string;
  experienceYears?: number;
  weakAreas?: string[];
  strengths?: string[];
}) {
  return apiPut<Candidate, typeof payload>(`/candidates/${candidateId}`, payload);
}
