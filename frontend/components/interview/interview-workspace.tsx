"use client";

import * as React from "react";
import { Mic, MicOff, Send, Sparkles, Waves } from "lucide-react";
import { toast } from "sonner";
import { useCandidates, useCandidateMemory } from "@/hooks/use-candidates";
import { useUiStore } from "@/store/ui-store";
import {
  startInterviewSession,
  submitInterviewResponse,
  endInterviewSession
} from "@/services/api/interviews";
import { ErrorState } from "@/components/error-state";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/empty-state";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { formatLatency, formatRelativeTime } from "@/lib/utils";
import type { StartSessionResponse } from "@/types/api";
import type {
  Candidate,
  Evaluation,
  InterviewQuestion,
  TraceItem,
  WorkspaceMessage
} from "@/types/domain";

function candidateInitials(candidate?: Candidate) {
  const name = candidate?.name?.trim();
  if (!name) return "AI";

  return name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function InterviewWorkspaceView() {
  const { data, isLoading, isError, error, refetch } = useCandidates();

  const candidates = data?.items ?? [];
  const [selectedId, setSelectedId] = React.useState<string>("");
  const selectedCandidate = React.useMemo(
    () => candidates.find((candidate) => candidate.id === selectedId) ?? candidates[0],
    [candidates, selectedId]
  );

  const [session, setSession] = React.useState<StartSessionResponse | null>(null);
  const [messages, setMessages] = React.useState<WorkspaceMessage[]>([]);
  const [currentQuestion, setCurrentQuestion] = React.useState<InterviewQuestion | null>(null);
  const [answer, setAnswer] = React.useState("");
  const [latestEvaluation, setLatestEvaluation] = React.useState<Evaluation | null>(null);
  const [trace, setTrace] = React.useState<TraceItem[]>([]);
  const [isStarting, setIsStarting] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isEnding, setIsEnding] = React.useState(false);
  const [voiceMode] = React.useState(false);
  const [isListening] = React.useState(false);

  const previewMemory = useCandidateMemory(selectedCandidate?.id ?? "");

  React.useEffect(() => {
    if (!selectedId && candidates[0]) {
      setSelectedId(candidates[0].id);
    }
  }, [candidates, selectedId]);

  const externallySelected = useUiStore((s) => s.selectedCandidateId);
  React.useEffect(() => {
    if (externallySelected && externallySelected !== selectedId) {
      setSelectedId(externallySelected);
    }
  }, [externallySelected, selectedId]);

  const handleStart = async () => {
    if (!selectedCandidate) return;

    setIsStarting(true);
    try {
      const response = await startInterviewSession({
        candidateId: selectedCandidate.id,
        candidateName: selectedCandidate.name,
        role: selectedCandidate.role
      });

      setSession(response);
      setMessages(response.messages ?? []);
      setCurrentQuestion(response.currentQuestion);
      setLatestEvaluation(response.latestEvaluation ?? null);
      setTrace(response.trace ?? []);
      toast.success("Interview session started");
    } catch {
      toast.error("Could not start interview session. Check the backend and try again.");
    } finally {
      setIsStarting(false);
    }
  };

  const handleSubmit = async () => {
    if (!session || !answer.trim()) return;

    const outgoingAnswer = answer.trim();
    const candidateMessage: WorkspaceMessage = {
      id: crypto.randomUUID(),
      role: "candidate",
      type: "answer",
      content: outgoingAnswer,
      timestamp: new Date().toISOString()
    };

    setMessages((prev) => [...prev, candidateMessage]);
    setAnswer("");
    setIsSubmitting(true);

    try {
      const response = await submitInterviewResponse(session.sessionId, {
        candidateId: session.candidate.id,
        answer: outgoingAnswer
      });

      const aiMessage: WorkspaceMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        type: "question",
        content: response.nextQuestion.text,
        timestamp: new Date().toISOString(),
        meta: {
          model: response.nextQuestion.modelUsed,
          difficulty: response.nextQuestion.difficulty
        }
      };

      setMessages((prev) => [...prev, aiMessage]);
      setCurrentQuestion(response.nextQuestion);
      setLatestEvaluation(response.evaluation);
      setTrace(response.trace ?? []);
      setSession((prev) =>
        prev
          ? {
              ...prev,
              currentQuestion: response.nextQuestion,
              latestEvaluation: response.evaluation,
              memory: response.memoryPreview,
              trace: response.trace ?? [],
              messages: [...(prev.messages ?? []), candidateMessage, aiMessage]
            }
          : prev
      );

      toast.success("Answer submitted and next question received.");
    } catch {
      setAnswer(outgoingAnswer);
      toast.error("Failed to submit answer. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEnd = async () => {
    if (!session) return;

    setIsEnding(true);
    try {
      await endInterviewSession(session.sessionId);
      setSession(null);
      setMessages([]);
      setCurrentQuestion(null);
      setLatestEvaluation(null);
      setTrace([]);
      toast.success("Interview session ended.");
    } catch {
      toast.error("Failed to end session. Please try again.");
    } finally {
      setIsEnding(false);
    }
  };

  if (isError) {
    return (
      <ErrorState
        title="Failed to load candidates"
        error={error}
        onRetry={() => refetch()}
      />
    );
  }

  if (!isLoading && candidates.length === 0) {
    return (
      <EmptyState
        icon={<Sparkles className="h-7 w-7" />}
        title="No candidates available"
        description="The backend returned an empty candidate list. Check your API and session state."
      />
    );
  }

  const activeMemory = session?.memory ?? previewMemory.data;
  const lastEvaluation = latestEvaluation ?? session?.latestEvaluation ?? null;
  const liveTrace = trace.length > 0 ? trace : session?.trace ?? [];

  return (
    <div className="grid gap-6 xl:grid-cols-[0.78fr_1.28fr_0.94fr] items-start">
      <Card className="h-fit">
        <CardHeader>
          <CardTitle>Candidate setup</CardTitle>
          <CardDescription>
            Select a candidate and inspect prior memory before starting.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium">Candidate</label>
            <Select
              value={selectedCandidate?.id ?? ""}
              onChange={setSelectedId}
              options={candidates.map((candidate) => ({
                value: candidate.id,
                label: `${candidate.name} - ${candidate.role}`
              }))}
            />
          </div>

          {selectedCandidate ? (
            <div className="rounded-3xl border border-border/60 bg-background/60 p-5">
              <div className="flex items-start gap-4">
                <Avatar className="h-14 w-14">
                  <AvatarFallback>{candidateInitials(selectedCandidate)}</AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="text-lg font-medium">{selectedCandidate.name}</p>
                  <p className="text-sm text-muted-foreground">{selectedCandidate.role}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Badge variant="info">{selectedCandidate.experienceYears} years</Badge>
                    <Badge
                      variant={
                        selectedCandidate.status === "ready"
                          ? "success"
                          : selectedCandidate.status === "at-risk"
                            ? "destructive"
                            : "default"
                      }
                    >
                      {selectedCandidate.status}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          ) : null}

          <div className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-sm font-medium">Previous context</h3>
              <Badge variant="info">{activeMemory?.sessionCount ?? 0} sessions</Badge>
            </div>

            <p className="text-sm text-muted-foreground">
              {activeMemory?.summary ?? "No memory loaded."}
            </p>

            <div className="space-y-2">
              <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
                Weaknesses
              </p>
              <div className="flex flex-wrap gap-2">
                {activeMemory?.weakAreas?.length ? (
                  activeMemory.weakAreas.map((item) => (
                    <Badge key={item} variant="destructive">
                      {item}
                    </Badge>
                  ))
                ) : (
                  <Badge>No weaknesses recorded</Badge>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
                Strengths
              </p>
              <div className="flex flex-wrap gap-2">
                {activeMemory?.strengths?.length ? (
                  activeMemory.strengths.map((item) => (
                    <Badge key={item} variant="success">
                      {item}
                    </Badge>
                  ))
                ) : (
                  <Badge>No strengths recorded</Badge>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="min-h-[760px] overflow-hidden">
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <CardTitle>Live interview workspace</CardTitle>
              <CardDescription>
                Candidate answers, AI questions, and adaptive routing appear here in real time.
              </CardDescription>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {session ? (
                <>
                  <Badge variant="info">{session.currentQuestion.modelUsed}</Badge>
                  <Badge
                    variant={
                      session.currentQuestion.difficulty === "Hard" ? "warning" : "success"
                    }
                  >
                    {session.currentQuestion.difficulty}
                  </Badge>
                </>
              ) : null}
            </div>
          </div>
        </CardHeader>

        <CardContent className="flex min-h-0 h-[680px] flex-col gap-4">
          {!session ? (
            <div className="shrink-0">
              <Button
                size="lg"
                className="w-full"
                onClick={handleStart}
                disabled={isStarting || isLoading || !selectedCandidate}
              >
                {isStarting ? "Starting session..." : "Start Interview Session"}
              </Button>
            </div>
          ) : null}

          {session ? (
            <>
              <div className="shrink-0 rounded-3xl border border-border/60 bg-background/40 p-4">
                <p className="text-sm font-medium">AI Interviewer</p>
                {currentQuestion ? (
                  <div className="mt-4 rounded-3xl border border-border/60 bg-background p-4">
                    <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
                      Question
                    </p>
                    <p className="mt-2 text-base font-semibold leading-7">
                      {currentQuestion.text}
                    </p>
                  </div>
                ) : (
                  <p className="mt-4 text-sm text-muted-foreground">
                    Waiting for the first adaptive question from the backend.
                  </p>
                )}
              </div>

              <ScrollArea className="min-h-0 flex-1 rounded-3xl border border-border/60 bg-background/40 p-4">
                <div className="space-y-4 pr-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.role === "candidate" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[92%] rounded-3xl px-4 py-3 text-sm leading-7 sm:max-w-[85%] ${
                          message.role === "candidate"
                            ? "bg-primary text-primary-foreground"
                            : message.role === "system"
                              ? "border border-amber-500/20 bg-amber-500/10 text-amber-100 dark:text-amber-200"
                              : "border border-border/60 bg-card/80"
                        }`}
                      >
                        <p className="whitespace-pre-wrap break-words">{message.content}</p>

                        {message.meta?.model ? (
                          <div className="mt-2 flex flex-wrap gap-2">
                            <Badge variant="info">{message.meta.model}</Badge>
                            {message.meta.difficulty ? (
                              <Badge>{message.meta.difficulty}</Badge>
                            ) : null}
                          </div>
                        ) : null}
                      </div>
                    </div>
                  ))}

                  {isSubmitting ? (
                    <div className="flex items-center gap-3 rounded-3xl border border-border/60 bg-card/70 px-4 py-3">
                      <Waves className="h-4 w-4 animate-pulse text-sky-400" />
                      <p className="text-sm text-muted-foreground">
                        AI evaluator is processing the response and preparing the next probe...
                      </p>
                    </div>
                  ) : null}
                </div>
              </ScrollArea>

              <div className="shrink-0 space-y-3">
                <Textarea
                  placeholder="Type the candidate answer here..."
                  value={answer}
                  onChange={(event) => setAnswer(event.target.value)}
                  className="min-h-[140px] resize-none"
                />

                <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    {voiceMode ? (
                      <Mic className="h-4 w-4 text-sky-400" />
                    ) : (
                      <MicOff className="h-4 w-4" />
                    )}
                    {voiceMode
                      ? isListening
                        ? "Listening for voice input"
                        : "Voice UI enabled"
                      : "Text mode"}
                  </div>

                  <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                    <Button
                      variant="outline"
                      onClick={handleEnd}
                      disabled={isEnding}
                      className="w-full sm:w-auto"
                    >
                      {isEnding ? "Ending session..." : "End session"}
                    </Button>

                    <Button
                      onClick={handleSubmit}
                      disabled={isSubmitting || !answer.trim()}
                      className="w-full sm:w-auto"
                    >
                      <Send className="h-4 w-4" />
                      Submit answer
                    </Button>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex min-h-0 flex-1 flex-col justify-center rounded-3xl border border-border/60 bg-background/50 p-8 text-sm text-muted-foreground">
              <p className="text-lg font-semibold text-foreground">AI Interview</p>
              <p className="mt-4">
                Select a candidate and click{" "}
                <span className="font-medium">Start interview session</span> to begin the adaptive
                AI conversation.
              </p>
              <div className="mt-6 rounded-3xl border border-border/60 bg-background p-4">
                <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
                  Question
                </p>
                <p className="mt-2 text-sm text-foreground">
                  No question yet. The first AI prompt appears after session start.
                </p>
              </div>
              <div className="mt-6 rounded-3xl border border-border/60 bg-background p-4">
                <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
                  Chat history
                </p>
                <p className="mt-2 text-sm text-foreground">
                  The chat will display candidate answers and AI follow-up questions in real time.
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>AI evaluation</CardTitle>
          <CardDescription>
            Confidence, strengths, weaknesses, and recommendations update after every answer.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {lastEvaluation ? (
            <>
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
                <div className="rounded-3xl border border-border/60 bg-background/50 p-4">
                  <p className="text-sm text-muted-foreground">Confidence</p>
                  <p className="mt-2 text-3xl font-semibold">
                    {Math.round(lastEvaluation.confidenceScore * 100)}%
                  </p>
                  <Progress value={lastEvaluation.confidenceScore * 100} className="mt-3" />
                </div>

                <div className="rounded-3xl border border-border/60 bg-background/50 p-4">
                  <p className="text-sm text-muted-foreground">Score</p>
                  <p className="mt-2 text-3xl font-semibold">{lastEvaluation.score}/10</p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {formatLatency(lastEvaluation.latencyMs)}
                  </p>
                </div>
              </div>

              <div className="rounded-3xl border border-border/60 bg-background/50 p-4">
                <p className="text-sm font-medium">Feedback</p>
                <p className="mt-2 text-sm leading-7 text-muted-foreground">
                  {lastEvaluation.feedback}
                </p>
              </div>

              <div className="space-y-3">
                <div>
                  <p className="mb-2 text-sm font-medium">Strengths</p>
                  <div className="flex flex-wrap gap-2">
                    {lastEvaluation.strengths.length > 0 ? (
                      lastEvaluation.strengths.map((item) => (
                        <Badge key={item} variant="success">
                          {item}
                        </Badge>
                      ))
                    ) : (
                      <Badge>No strengths captured</Badge>
                    )}
                  </div>
                </div>

                <div>
                  <p className="mb-2 text-sm font-medium">Weaknesses</p>
                  <div className="flex flex-wrap gap-2">
                    {lastEvaluation.weaknesses.length > 0 ? (
                      lastEvaluation.weaknesses.map((item) => (
                        <Badge key={item} variant="destructive">
                          {item}
                        </Badge>
                      ))
                    ) : (
                      <Badge>No weaknesses captured</Badge>
                    )}
                  </div>
                </div>

                <div>
                  <p className="mb-2 text-sm font-medium">Recommendations</p>
                  <div className="space-y-2">
                    {lastEvaluation.recommendations.map((item) => (
                      <div
                        key={item}
                        className="rounded-2xl border border-border/60 bg-background/50 p-3 text-sm text-muted-foreground"
                      >
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="rounded-3xl border border-border/60 bg-background/50 p-6 text-sm text-muted-foreground">
              <p className="text-base font-semibold">
                Evaluation will appear after the candidate answers.
              </p>
              <p className="mt-3">
                Submit a response to see confidence, strengths, weaknesses, and recommendations
                from the backend AI model.
              </p>
            </div>
          )}

          <div className="space-y-3 rounded-3xl border border-border/60 bg-background/50 p-4">
            <p className="text-sm font-medium">Live trace</p>
            <div className="space-y-3">
              {liveTrace.slice(-5).reverse().map((item) => (
                <div key={item.id} className="rounded-2xl bg-secondary/50 p-3">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm">{item.label}</p>
                    <Badge
                      variant={
                        item.tone === "critical"
                          ? "destructive"
                          : item.tone === "warning"
                            ? "warning"
                            : item.tone === "success"
                              ? "success"
                              : "info"
                      }
                    >
                      {item.tone}
                    </Badge>
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">
                    {formatRelativeTime(item.timestamp)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}