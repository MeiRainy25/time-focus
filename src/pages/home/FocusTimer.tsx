import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { FocusType } from "@/types/focus";

const TIMER_SIZE = 280;
const STROKE_WIDTH = 14;
const RADIUS = (TIMER_SIZE - STROKE_WIDTH) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

const focusTypeLabel: Record<FocusType, string> = {
  code: "代码",
  study: "学习",
};

type FocusTimerProps = {
  durationSeconds: number;
  focusName: string;
  focusType: FocusType;
  onFinish?: (focusedSeconds: number) => void;
};

type TimerStatus = "idle" | "running" | "paused";

function formatTime(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60)
    .toString()
    .padStart(2, "0");
  const seconds = Math.floor(totalSeconds % 60)
    .toString()
    .padStart(2, "0");

  return `${minutes}:${seconds}`;
}

function getFocusedSeconds(totalSeconds: number, remainingMs: number) {
  const focusedMs = Math.max(0, totalSeconds * 1000 - remainingMs);

  return Math.min(totalSeconds, Math.floor(focusedMs / 1000));
}

export function FocusTimer({
  durationSeconds,
  focusName,
  focusType,
  onFinish,
}: FocusTimerProps) {
  const configuredDurationSeconds = Math.max(1, Math.round(durationSeconds));
  const configuredDurationMs = configuredDurationSeconds * 1000;
  const [status, setStatus] = useState<TimerStatus>("idle");
  const [sessionDurationSeconds, setSessionDurationSeconds] = useState(
    configuredDurationSeconds,
  );
  const [remainingSeconds, setRemainingSeconds] = useState(
    configuredDurationSeconds,
  );
  const animationFrameRef = useRef<number | null>(null);
  const endTimeRef = useRef<number | null>(null);
  const remainingMsRef = useRef(configuredDurationMs);
  const lastPaintedSecondRef = useRef(configuredDurationSeconds);

  const isRunning = status === "running";
  const displayedTotalSeconds =
    status === "idle" ? configuredDurationSeconds : sessionDurationSeconds;
  const displayedRemainingSeconds =
    status === "idle" ? configuredDurationSeconds : remainingSeconds;

  const progress = useMemo(() => {
    return 1 - displayedRemainingSeconds / displayedTotalSeconds;
  }, [displayedRemainingSeconds, displayedTotalSeconds]);

  const strokeDashoffset = CIRCUMFERENCE * (1 - progress);
  const currentFocusName = focusName.trim() || "未命名专注";

  const resetToConfiguredDuration = useCallback(() => {
    endTimeRef.current = null;
    remainingMsRef.current = configuredDurationMs;
    lastPaintedSecondRef.current = configuredDurationSeconds;
    setSessionDurationSeconds(configuredDurationSeconds);
    setRemainingSeconds(configuredDurationSeconds);
    setStatus("idle");
  }, [configuredDurationMs, configuredDurationSeconds]);

  useEffect(() => {
    if (!isRunning) {
      return;
    }

    endTimeRef.current = Date.now() + remainingMsRef.current;

    const tick = () => {
      if (endTimeRef.current === null) {
        return;
      }

      const nextRemainingMs = Math.max(0, endTimeRef.current - Date.now());
      const nextRemainingSeconds = Math.ceil(nextRemainingMs / 1000);

      remainingMsRef.current = nextRemainingMs;

      if (nextRemainingSeconds !== lastPaintedSecondRef.current) {
        lastPaintedSecondRef.current = nextRemainingSeconds;
        setRemainingSeconds(nextRemainingSeconds);
      }

      if (nextRemainingSeconds <= 0) {
        onFinish?.(sessionDurationSeconds);
        resetToConfiguredDuration();
        animationFrameRef.current = null;
        return;
      }

      animationFrameRef.current = requestAnimationFrame(tick);
    };

    animationFrameRef.current = requestAnimationFrame(tick);

    return () => {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    };
  }, [isRunning, onFinish, resetToConfiguredDuration, sessionDurationSeconds]);

  const handleStart = () => {
    if (status === "idle") {
      remainingMsRef.current = configuredDurationMs;
      lastPaintedSecondRef.current = configuredDurationSeconds;
      setSessionDurationSeconds(configuredDurationSeconds);
      setRemainingSeconds(configuredDurationSeconds);
    }

    setStatus("running");
  };

  const handlePause = () => {
    if (endTimeRef.current !== null) {
      const nextRemainingMs = Math.max(0, endTimeRef.current - Date.now());
      const nextRemainingSeconds = Math.ceil(nextRemainingMs / 1000);

      remainingMsRef.current = nextRemainingMs;
      lastPaintedSecondRef.current = nextRemainingSeconds;
      setRemainingSeconds(nextRemainingSeconds);
    }

    endTimeRef.current = null;
    setStatus("paused");
  };

  const handleReset = () => {
    resetToConfiguredDuration();
  };

  const handleFinish = () => {
    const latestRemainingMs =
      endTimeRef.current === null
        ? remainingMsRef.current
        : Math.max(0, endTimeRef.current - Date.now());
    const focusedSeconds = getFocusedSeconds(
      sessionDurationSeconds,
      latestRemainingMs,
    );

    onFinish?.(focusedSeconds);
    resetToConfiguredDuration();
  };

  return (
    <section className="flex flex-1 flex-col items-center justify-center gap-8 rounded-lg border border-border bg-card px-4 py-8 text-card-foreground shadow-sm">
      <div className="text-center">
        <p className="text-sm font-medium text-muted-foreground">
          {focusTypeLabel[focusType]} · {currentFocusName}
        </p>
        <h2 className="mt-1 text-xl font-semibold">保持当前节奏</h2>
      </div>

      <div className="relative grid place-items-center">
        <svg
          aria-hidden="true"
          className="-rotate-90"
          height={TIMER_SIZE}
          viewBox={`0 0 ${TIMER_SIZE} ${TIMER_SIZE}`}
          width={TIMER_SIZE}
        >
          <circle
            className="stroke-muted"
            cx={TIMER_SIZE / 2}
            cy={TIMER_SIZE / 2}
            fill="none"
            r={RADIUS}
            strokeWidth={STROKE_WIDTH}
          />
          <circle
            className="stroke-primary transition-[stroke-dashoffset] duration-300"
            cx={TIMER_SIZE / 2}
            cy={TIMER_SIZE / 2}
            fill="none"
            r={RADIUS}
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            strokeWidth={STROKE_WIDTH}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <time className="text-6xl font-semibold tabular-nums tracking-tight">
            {formatTime(displayedRemainingSeconds)}
          </time>
          <span className="mt-2 text-sm text-muted-foreground">
            {status === "running"
              ? "进行中"
              : status === "paused"
                ? "已暂停"
                : "待开始"}
          </span>
        </div>
      </div>

      <div className="grid w-full max-w-md grid-cols-2 gap-3 sm:grid-cols-4">
        <button
          className="h-11 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          disabled={isRunning}
          onClick={handleStart}
          type="button"
        >
          开始
        </button>
        <button
          className="h-11 rounded-md border border-border bg-background px-4 text-sm font-medium transition hover:bg-accent disabled:cursor-not-allowed disabled:opacity-50"
          disabled={!isRunning}
          onClick={handlePause}
          type="button"
        >
          暂停
        </button>
        <button
          className="h-11 rounded-md border border-border bg-background px-4 text-sm font-medium transition hover:bg-accent"
          onClick={handleReset}
          type="button"
        >
          重置
        </button>
        <button
          className="h-11 rounded-md border border-destructive bg-background px-4 text-sm font-medium text-destructive transition hover:bg-destructive hover:text-white"
          onClick={handleFinish}
          type="button"
        >
          结束
        </button>
      </div>
    </section>
  );
}
