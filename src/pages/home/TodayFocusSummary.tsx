import { useEffect, useMemo, useState } from "react";
import dayjs from "dayjs";
import { getAllIndexedDbItems } from "@/lib/indexed-db";
import type { FocusRecord } from "@/types/focus";

type TodayFocusSummaryProps = {
  refreshKey: number;
};

function formatDuration(totalSeconds: number) {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours} 小时 ${minutes} 分钟`;
  }

  if (minutes > 0) {
    return `${minutes} 分 ${seconds} 秒`;
  }

  return `${seconds} 秒`;
}

export function TodayFocusSummary({ refreshKey }: TodayFocusSummaryProps) {
  const [records, setRecords] = useState<FocusRecord[]>([]);

  useEffect(() => {
    let ignore = false;

    async function loadRecords() {
      const indexedDbRecords = await getAllIndexedDbItems<FocusRecord>();

      if (!ignore) {
        setRecords(indexedDbRecords);
      }
    }

    void loadRecords();

    return () => {
      ignore = true;
    };
  }, [refreshKey]);

  const todayTotalSeconds = useMemo(() => {
    const today = dayjs();

    return records.reduce((totalSeconds, record) => {
      if (!dayjs(record.createdAt).isSame(today, "day")) {
        return totalSeconds;
      }

      return totalSeconds + record.durationSeconds;
    }, 0);
  }, [records]);

  return (
    <section className="rounded-lg border border-border bg-card p-4 text-card-foreground shadow-sm">
      <p className="text-sm font-medium text-muted-foreground">今日专注</p>
      <div className="mt-2 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <h2 className="text-2xl font-semibold tracking-tight">
          {formatDuration(todayTotalSeconds)}
        </h2>
        <span className="text-sm text-muted-foreground">
          {todayTotalSeconds > 0 ? "继续保持当前节奏" : "完成一次专注后开始累计"}
        </span>
      </div>
    </section>
  );
}
