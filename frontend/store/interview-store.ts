"use client";

import { create } from "zustand";
import type { SessionStage, SessionWorkspace, WorkspaceMessage } from "@/types/domain";

type InterviewStore = {
  session: SessionWorkspace | null;
  voiceMode: boolean;
  setSession: (session: SessionWorkspace | null) => void;
  appendMessages: (messages: WorkspaceMessage[]) => void;
  setStage: (stage: SessionStage) => void;
  setVoiceMode: (voiceMode: boolean) => void;
  clearSession: () => void;
};

export const useInterviewStore = create<InterviewStore>((set) => ({
  session: null,
  voiceMode: false,
  setSession: (session) => set({ session }),
  appendMessages: (messages) =>
    set((state) =>
      state.session
        ? {
            session: {
              ...state.session,
              messages: [...state.session.messages, ...messages]
            }
          }
        : state
    ),
  setStage: (stage) =>
    set((state) =>
      state.session
        ? {
            session: {
              ...state.session,
              stage
            }
          }
        : state
    ),
  setVoiceMode: (voiceMode) => set({ voiceMode }),
  clearSession: () => set({ session: null, voiceMode: false })
}));
