import { create } from "zustand";

export type TimerMode = "countdown" | "countup";
export type TimerStatus = "idle" | "running" | "paused";

type TimerStore = {
  durationMinutes: number;
  elapsedMs: number;
  elapsedSeconds: number;
  mode: TimerMode;
  startedAt: number | null;
  status: TimerStatus;
  pause: () => void;
  reset: () => void;
  setDurationMinutes: (durationMinutes: number) => void;
  setElapsed: (elapsedMs: number) => void;
  setMode: (mode: TimerMode) => void;
  start: () => void;
};

const initialTimerState = {
  durationMinutes: 25,
  elapsedMs: 0,
  elapsedSeconds: 0,
  mode: "countup" as const,
  startedAt: null,
  status: "idle" as const,
};

function clampDurationMinutes(value: number) {
  if (!Number.isFinite(value)) {
    return 1;
  }

  return Math.min(180, Math.max(1, Math.round(value)));
}

export const useTimerStore = create<TimerStore>((set, get) => ({
  ...initialTimerState,
  pause: () => {
    const state = get();

    if (state.status !== "running" || state.startedAt === null) {
      return;
    }

    const elapsedMs = Date.now() - state.startedAt;
    const durationMs = state.durationMinutes * 60 * 1000;
    const cappedElapsedMs =
      state.mode === "countdown"
        ? Math.min(elapsedMs, durationMs)
        : elapsedMs;

    set({
      elapsedMs: cappedElapsedMs,
      elapsedSeconds: Math.floor(cappedElapsedMs / 1000),
      startedAt: null,
      status: "paused",
    });
  },
  reset: () => {
    set({
      elapsedMs: 0,
      elapsedSeconds: 0,
      startedAt: null,
      status: "idle",
    });
  },
  setDurationMinutes: (durationMinutes) => {
    set({
      durationMinutes: clampDurationMinutes(durationMinutes),
      elapsedMs: 0,
      elapsedSeconds: 0,
      startedAt: null,
      status: "idle",
    });
  },
  setElapsed: (elapsedMs) => {
    set({
      elapsedMs,
      elapsedSeconds: Math.floor(elapsedMs / 1000),
    });
  },
  setMode: (mode) => {
    if (mode === get().mode) {
      return;
    }

    set({
      elapsedMs: 0,
      elapsedSeconds: 0,
      mode,
      startedAt: null,
      status: "idle",
    });
  },
  start: () => {
    const state = get();

    if (state.status === "running") {
      return;
    }

    set({
      startedAt: Date.now() - state.elapsedMs,
      status: "running",
    });
  },
}));
