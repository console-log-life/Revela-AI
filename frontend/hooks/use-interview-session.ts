"use client";

import * as React from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  endInterviewSession,
  startInterviewSession,
  submitInterviewResponse,
  getInterviewSession
} from "@/services/api/interviews";
import { useInterviewStore } from "@/store/interview-store";
import type { StartSessionRequest, SubmitResponseRequest } from "@/types/api";
import type { Difficulty, WorkspaceMessage } from "@/types/domain";

function candidateMessage(answer: string): WorkspaceMessage {
  return {
    id: crypto.randomUUID(),
    role: "candidate",
    type: "answer",
    content: answer,
    timestamp: new Date().toISOString()
  };
}

function evaluatorMessage(score: number, feedback: string): WorkspaceMessage {
  return {
    id: crypto.randomUUID(),
    role: "system",
    type: "evaluation",
    content: feedback,
    timestamp: new Date().toISOString(),
    meta: { score }
  };
}

function assistantMessage(question: string, model: string, difficulty: Difficulty): WorkspaceMessage {
  return {
    id: crypto.randomUUID(),
    role: "assistant",
    type: "question",
    content: question,
    timestamp: new Date().toISOString(),
    meta: {
      model,
      difficulty
    }
  };
}

export function useInterviewSession() {
  const queryClient = useQueryClient();
  const SESSION_STORAGE_KEY = "revela-interview-session";
  const {
    session,
    setSession,
    appendMessages,
    setStage,
    setVoiceMode,
    voiceMode,
    clearSession
  } = useInterviewStore();

  React.useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    try {
      const stored = window.localStorage.getItem(SESSION_STORAGE_KEY);
      if (!stored) {
        return;
      }

      const parsed = JSON.parse(stored);
      if (parsed && !session) {
        setSession(parsed);
        if (parsed.sessionId) {
          getInterviewSession(parsed.sessionId)
            .then((data) => {
              setSession({
                sessionId: data.sessionId,
                candidate: data.candidate,
                memory: data.memory,
                currentQuestion: data.currentQuestion,
                scoreSeries: data.scoreSeries ?? [],
                trace: data.trace,
                stage: "active",
                latestEvaluation: data.latestEvaluation,
                messages: data.messages ?? [
                  assistantMessage(
                    data.currentQuestion.text,
                    data.currentQuestion.modelUsed,
                    data.currentQuestion.difficulty
                  )
                ]
              });
            })
            .catch(() => {
              window.localStorage.removeItem(SESSION_STORAGE_KEY);
            });
        }
      }
    } catch {
      window.localStorage.removeItem(SESSION_STORAGE_KEY);
    }
  }, [session, setSession]);

  React.useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    if (session) {
      window.localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
    } else {
      window.localStorage.removeItem(SESSION_STORAGE_KEY);
    }
  }, [session]);

  const startMutation = useMutation({
    mutationFn: (payload: StartSessionRequest) => startInterviewSession(payload),
    onSuccess: (data) => {
      setSession({
        sessionId: data.sessionId,
        candidate: data.candidate,
        memory: data.memory,
        currentQuestion: data.currentQuestion,
        scoreSeries: data.scoreSeries ?? [],
        trace: data.trace,
        stage: "active",
        latestEvaluation: data.latestEvaluation,
        messages:
          data.messages ?? [
            assistantMessage(
              data.currentQuestion.text,
              data.currentQuestion.modelUsed,
              data.currentQuestion.difficulty
            )
          ]
      });
      queryClient.invalidateQueries({ queryKey: ["dashboard-overview"] });
      queryClient.invalidateQueries({ queryKey: ["candidates"] });
      toast.success("Interview session started");
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Failed to start interview session");
    }
  });

  const submitMutation = useMutation({
    mutationFn: ({ sessionId, payload }: { sessionId: string; payload: SubmitResponseRequest }) =>
      submitInterviewResponse(sessionId, payload),
    onSuccess: (data) => {
      const currentSession = useInterviewStore.getState().session;
      if (!currentSession) return;
      setSession({
        ...currentSession,
        currentQuestion: data.nextQuestion,
        memory: data.memoryPreview,
        scoreSeries: data.scoreSeries,
        trace: [...currentSession.trace, ...data.trace],
        latestEvaluation: data.evaluation,
        messages: [
          ...currentSession.messages,
          evaluatorMessage(data.evaluation.score, data.evaluation.feedback),
          assistantMessage(
            data.nextQuestion.text,
            data.nextQuestion.modelUsed,
            data.nextQuestion.difficulty
          )
        ]
      });
      queryClient.invalidateQueries({ queryKey: ["dashboard-overview"] });
      queryClient.invalidateQueries({ queryKey: ["analytics-summary"] });
      queryClient.invalidateQueries({ queryKey: ["candidate-memory", currentSession.candidate.id] });
      toast.success(`Response evaluated: ${data.evaluation.score}/10`);
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Failed to submit interview response");
    }
  });

  const endMutation = useMutation({
    mutationFn: (sessionId: string) => endInterviewSession(sessionId),
    onMutate: () => setStage("reflecting"),
    onSuccess: (data) => {
      const currentSession = useInterviewStore.getState().session;
      if (!currentSession) return;
      setSession({
        ...currentSession,
        stage: "complete",
        memory: data.updatedContext,
        messages: [
          ...currentSession.messages,
          {
            id: crypto.randomUUID(),
            role: "system",
            type: "reflection",
            content: data.summary.headline,
            timestamp: new Date().toISOString()
          }
        ]
      });
      queryClient.invalidateQueries({ queryKey: ["dashboard-overview"] });
      queryClient.invalidateQueries({ queryKey: ["analytics-summary"] });
      queryClient.invalidateQueries({ queryKey: ["candidates"] });
      toast.success("Session reflection saved");
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Failed to end interview session");
    }
  });

  return {
    session,
    voiceMode,
    setVoiceMode,
    setStage,
    clearSession,
    startMutation,
    submitMutation,
    endMutation,
    appendCandidateAnswer: (answer: string) => appendMessages([candidateMessage(answer)])
  };
}
