import { useCallback, useState } from "react";
import { addIndexedDbItem } from "@/lib/indexed-db";
import { useFocusStore } from "@/store/focus-store";
import type { FocusRecord } from "@/types/focus";
import { AppHeader } from "./AppHeader";
import { FocusForm } from "./FocusForm";
import { FocusTimer } from "./FocusTimer";
import { TodayFocusSummary } from "./TodayFocusSummary";

export function HomePage() {
  const focusName = useFocusStore((state) => state.focusName);
  const focusType = useFocusStore((state) => state.focusType);
  const setFocusName = useFocusStore((state) => state.setFocusName);
  const setFocusType = useFocusStore((state) => state.setFocusType);
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
          focusName={focusName}
          focusType={focusType}
          onFocusNameChange={setFocusName}
          onFocusTypeChange={setFocusType}
        />
        <FocusTimer
          focusName={focusName}
          focusType={focusType}
          onFinish={handleFinish}
        />
        <TodayFocusSummary refreshKey={summaryRefreshKey} />
      </div>
    </>
  );
}
