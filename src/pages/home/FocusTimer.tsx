import { useEffect, useMemo, useRef } from "react";
import { Clock3, Hourglass, Timer } from "lucide-react";
import { Input } from "@/component/ui/input";
import { useTimerStore, type TimerMode } from "@/store/timer-store";
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
  focusName: string;
  focusType: FocusType;
  onFinish?: (focusedSeconds: number) => void;
};

function formatTime(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60)
    .toString()
    .padStart(2, "0");
  const seconds = Math.floor(totalSeconds % 60)
    .toString()
    .padStart(2, "0");

  return `${minutes}:${seconds}`;
}

export function FocusTimer({
  focusName,
  focusType,
  onFinish,
}: FocusTimerProps) {
  const durationMinutes = useTimerStore((state) => state.durationMinutes);
  const elapsedMs = useTimerStore((state) => state.elapsedMs);
  const elapsedSeconds = useTimerStore((state) => state.elapsedSeconds);
  const mode = useTimerStore((state) => state.mode);
  const pause = useTimerStore((state) => state.pause);
  const reset = useTimerStore((state) => state.reset);
  const setDurationMinutes = useTimerStore(
    (state) => state.setDurationMinutes,
  );
  const setElapsed = useTimerStore((state) => state.setElapsed);
  const setMode = useTimerStore((state) => state.setMode);
  const start = useTimerStore((state) => state.start);
  const startedAt = useTimerStore((state) => state.startedAt);
  const status = useTimerStore((state) => state.status);
  const animationFrameRef = useRef<number | null>(null);
  const lastPaintedSecondRef = useRef(elapsedSeconds);

  const configuredDurationSeconds = durationMinutes * 60;
  const configuredDurationMs = configuredDurationSeconds * 1000;
  const isRunning = status === "running";
  const displayedSeconds =
    mode === "countdown"
      ? Math.max(0, configuredDurationSeconds - elapsedSeconds)
      : elapsedSeconds;

  const progress = useMemo(() => {
    if (mode === "countup") {
      return (elapsedSeconds % 60) / 60;
    }

    return Math.min(1, elapsedSeconds / configuredDurationSeconds);
  }, [configuredDurationSeconds, elapsedSeconds, mode]);

  const strokeDashoffset = CIRCUMFERENCE * (1 - progress);
  const currentFocusName = focusName.trim() || "未命名专注";

  useEffect(() => {
    if (!isRunning || startedAt === null) {
      return;
    }

    const tick = () => {
      const nextElapsedMs = Date.now() - startedAt;
      const cappedElapsedMs =
        mode === "countdown"
          ? Math.min(nextElapsedMs, configuredDurationMs)
          : nextElapsedMs;
      const nextElapsedSeconds = Math.floor(cappedElapsedMs / 1000);

      if (nextElapsedSeconds !== lastPaintedSecondRef.current) {
        lastPaintedSecondRef.current = nextElapsedSeconds;
        setElapsed(cappedElapsedMs);
      }

      if (mode === "countdown" && cappedElapsedMs >= configuredDurationMs) {
        onFinish?.(configuredDurationSeconds);
        reset();
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
  }, [
    configuredDurationMs,
    configuredDurationSeconds,
    isRunning,
    mode,
    onFinish,
    reset,
    setElapsed,
    startedAt,
  ]);

  const handleModeChange = (nextMode: TimerMode) => {
    setMode(nextMode);
    lastPaintedSecondRef.current = 0;
  };

  const handleFinish = () => {
    const latestElapsedMs =
      status === "running" && startedAt !== null
        ? Date.now() - startedAt
        : elapsedMs;
    const focusedSeconds = Math.floor(latestElapsedMs / 1000);

    onFinish?.(focusedSeconds);
    reset();
    lastPaintedSecondRef.current = 0;
  };

  return (
    <section className="flex flex-1 flex-col items-center justify-center gap-8 rounded-lg border border-border bg-card px-4 py-8 text-card-foreground shadow-sm">
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="flex rounded-md border border-border bg-background p-1">
          <button
            className={`flex items-center gap-2 rounded px-3 py-1.5 text-sm font-medium transition ${
              mode === "countup"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-accent"
            }`}
            disabled={isRunning}
            onClick={() => handleModeChange("countup")}
            type="button"
          >
            <Timer className="size-4" aria-hidden="true" />
            正向计时
          </button>
          <button
            className={`flex items-center gap-2 rounded px-3 py-1.5 text-sm font-medium transition ${
              mode === "countdown"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-accent"
            }`}
            disabled={isRunning}
            onClick={() => handleModeChange("countdown")}
            type="button"
          >
            <Hourglass className="size-4" aria-hidden="true" />
            倒计时
          </button>
        </div>

        {mode === "countdown" ? (
          <label className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock3 className="size-4" aria-hidden="true" />
            <span>专注时长</span>
            <Input
              className="w-24 text-base"
              disabled={isRunning}
              max={180}
              min={1}
              onChange={(event) => {
                setDurationMinutes(event.currentTarget.valueAsNumber);
                lastPaintedSecondRef.current = 0;
              }}
              type="number"
              value={durationMinutes}
            />
            <span>分钟</span>
          </label>
        ) : null}

        <div>
          <p className="text-sm font-medium text-muted-foreground">
            {focusTypeLabel[focusType]} · {currentFocusName}
          </p>
          <h2 className="mt-1 text-xl font-semibold">保持当前节奏</h2>
        </div>
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
            {formatTime(displayedSeconds)}
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
          onClick={start}
          type="button"
        >
          开始
        </button>
        <button
          className="h-11 rounded-md border border-border bg-background px-4 text-sm font-medium transition hover:bg-accent disabled:cursor-not-allowed disabled:opacity-50"
          disabled={!isRunning}
          onClick={pause}
          type="button"
        >
          暂停
        </button>
        <button
          className="h-11 rounded-md border border-border bg-background px-4 text-sm font-medium transition hover:bg-accent"
          onClick={() => {
            reset();
            lastPaintedSecondRef.current = 0;
          }}
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
