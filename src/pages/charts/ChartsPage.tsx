import { lazy, Suspense, useEffect, useMemo, useState } from "react";
import dayjs from "dayjs";
import { getAllIndexedDbItems } from "@/lib/indexed-db";
import type { FocusRecord } from "@/types/focus";

const DailyFocusLineChart = lazy(() =>
  import("./DailyFocusLineChart").then((module) => ({
    default: module.DailyFocusLineChart,
  })),
);
const FocusDurationBarChart = lazy(() =>
  import("./FocusDurationBarChart").then((module) => ({
    default: module.FocusDurationBarChart,
  })),
);
const FocusHeatmapChart = lazy(() =>
  import("./FocusHeatmapChart").then((module) => ({
    default: module.FocusHeatmapChart,
  })),
);

function sortRecords(records: FocusRecord[]) {
  return records.toSorted((first, second) => second.createdAt - first.createdAt);
}

export function ChartsPage() {
  const [records, setRecords] = useState<FocusRecord[]>([]);

  useEffect(() => {
    let ignore = false;

    async function loadRecords() {
      const indexedDbRecords = await getAllIndexedDbItems<FocusRecord>();

      if (!ignore) {
        setRecords(sortRecords(indexedDbRecords));
      }
    }

    void loadRecords();

    return () => {
      ignore = true;
    };
  }, []);

  const dailyDurationMap = useMemo(() => {
    return records.reduce<Record<string, number>>((result, record) => {
      const date = dayjs(record.createdAt).format("YYYY-MM-DD");

      result[date] = (result[date] ?? 0) + record.durationSeconds;

      return result;
    }, {});
  }, [records]);

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
      <div>
        <p className="text-sm font-medium text-muted-foreground">Charts</p>
        <h1 className="text-2xl font-semibold tracking-tight">专注图表</h1>
      </div>

      {records.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border px-4 py-12 text-center text-sm text-muted-foreground">
          暂无专注数据，完成一次专注后会生成图表。
        </div>
      ) : (
        <Suspense
          fallback={
            <div className="rounded-lg border border-dashed border-border px-4 py-12 text-center text-sm text-muted-foreground">
              图表加载中...
            </div>
          }
        >
          <div className="grid gap-4 lg:grid-cols-2">
            <FocusDurationBarChart records={records} />
            <DailyFocusLineChart dailyDurationMap={dailyDurationMap} />
            <FocusHeatmapChart dailyDurationMap={dailyDurationMap} />
          </div>
        </Suspense>
      )}
    </div>
  );
}
