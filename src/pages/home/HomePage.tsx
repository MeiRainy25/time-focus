import { useCallback, useState } from "react";
import { addIndexedDbItem } from "@/lib/indexed-db";
import type { FocusRecord, FocusType } from "@/types/focus";
import { AppHeader } from "./AppHeader";
import { FocusForm } from "./FocusForm";
import { FocusTimer } from "./FocusTimer";
import { TodayFocusSummary } from "./TodayFocusSummary";

export function HomePage() {
  const [focusType, setFocusType] = useState<FocusType>("code");
  const [focusName, setFocusName] = useState("");
  const [durationMinutes, setDurationMinutes] = useState(25);
  const [summaryRefreshKey, setSummaryRefreshKey] = useState(0);

  const handleFinish = useCallback(
    (focusedSeconds: number) => {
      if (focusedSeconds <= 0) {
        return;
      }

      const record: FocusRecord = {
        createdAt: Date.now(),
        durationSeconds: focusedSeconds,
        id: crypto.randomUUID(),
        name: focusName.trim() || "未命名专注",
        type: focusType,
      };

      void addIndexedDbItem(record).then(() => {
        setSummaryRefreshKey((currentKey) => currentKey + 1);
      });
    },
    [focusName, focusType],
  );

  return (
    <>
      <AppHeader />
      <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-8 px-4 py-6 sm:px-6 lg:px-8">
        <FocusForm
          durationMinutes={durationMinutes}
          focusName={focusName}
          focusType={focusType}
          onDurationMinutesChange={setDurationMinutes}
          onFocusNameChange={setFocusName}
          onFocusTypeChange={setFocusType}
        />
        <FocusTimer
          durationSeconds={durationMinutes * 60}
          focusName={focusName}
          focusType={focusType}
          onFinish={handleFinish}
        />
        <TodayFocusSummary refreshKey={summaryRefreshKey} />
      </div>
    </>
  );
}
