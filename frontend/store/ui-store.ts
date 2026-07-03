"use client";

import { create } from "zustand";

type UiStore = {
  mobileNavOpen: boolean;
  commandMenuOpen: boolean;
  selectedCandidateId?: string | null;
  setMobileNavOpen: (value: boolean) => void;
  setCommandMenuOpen: (value: boolean) => void;
  setSelectedCandidateId: (id?: string | null) => void;
};

export const useUiStore = create<UiStore>((set) => ({
  mobileNavOpen: false,
  commandMenuOpen: false,
  selectedCandidateId: null,
  setMobileNavOpen: (value) => set({ mobileNavOpen: value }),
  setCommandMenuOpen: (value) => set({ commandMenuOpen: value })
  ,
  setSelectedCandidateId: (id) => set({ selectedCandidateId: id ?? null })
}));
