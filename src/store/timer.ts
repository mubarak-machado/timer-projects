import { create } from "zustand";

interface TimerState {
  activeSession: {
    projetoId: string;
    inicio: Date;
  } | null;
  startTimer: (projetoId: string) => void;
  stopTimer: () => { projetoId: string; inicio: Date; fim: Date } | null;
}

export const useTimerStore = create<TimerState>((set, get) => ({
  activeSession: null,
  startTimer: (projetoId) => {
    set({ activeSession: { projetoId, inicio: new Date() } });
  },
  stopTimer: () => {
    const { activeSession } = get();
    if (!activeSession) return null;
    const fim = new Date();
    const result = { ...activeSession, fim };
    set({ activeSession: null });
    return result;
  },
}));