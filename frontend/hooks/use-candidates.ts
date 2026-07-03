"use client";

import { useQuery } from "@tanstack/react-query";
import {
  getCandidateMemory,
  getCandidateProfile,
  getCandidates
} from "@/services/api/candidates";

export function useCandidates() {
  return useQuery({
    queryKey: ["candidates"],
    queryFn: getCandidates
  });
}

export function useCandidateProfile(candidateId: string) {
  return useQuery({
    queryKey: ["candidate-profile", candidateId],
    queryFn: () => getCandidateProfile(candidateId),
    enabled: Boolean(candidateId)
  });
}

export function useCandidateMemory(candidateId: string) {
  return useQuery({
    queryKey: ["candidate-memory", candidateId],
    queryFn: () => getCandidateMemory(candidateId),
    enabled: Boolean(candidateId)
  });
}
