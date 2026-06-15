import { useEffect, useMemo, useState } from "react";
import dayjs from "dayjs";
import type { EChartsOption } from "echarts";
import { getAllIndexedDbItems } from "@/lib/indexed-db";
import type { FocusRecord } from "@/types/focus";
import { EChartPanel } from "./EChartPanel";

function toMinutes(seconds: number) {
  return Number((seconds / 60).toFixed(1));
}

function createRecordLabel(record: FocusRecord, index: number) {
  const name = record.name.trim() || "未命名专注";

  return name.length > 8 ? `${name.slice(0, 8)}...${index + 1}` : name;
}

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

  const barOption = useMemo<EChartsOption>(() => {
    const latestRecords = records.toReversed().slice(-10);

    return {
      color: ["#18181b"],
      grid: { bottom: 40, left: 48, right: 16, top: 24 },
      tooltip: {
        trigger: "axis",
        valueFormatter: (value) => `${value} 分钟`,
      },
      xAxis: {
        axisLabel: { interval: 0, rotate: 25 },
        data: latestRecords.map(createRecordLabel),
        type: "category",
      },
      yAxis: {
        name: "分钟",
        type: "value",
      },
      series: [
        {
          barMaxWidth: 36,
          data: latestRecords.map((record) => toMinutes(record.durationSeconds)),
          name: "专注时长",
          type: "bar",
        },
      ],
    };
  }, [records]);

  const lineOption = useMemo<EChartsOption>(() => {
    const dailyDurationMap = records.reduce<Record<string, number>>(
      (result, record) => {
        const date = dayjs(record.createdAt).format("MM-DD");

        result[date] = (result[date] ?? 0) + record.durationSeconds;

        return result;
      },
      {},
    );
    const dates = Object.keys(dailyDurationMap).toSorted();

    return {
      color: ["#18181b"],
      grid: { bottom: 40, left: 48, right: 16, top: 24 },
      tooltip: {
        trigger: "axis",
        valueFormatter: (value) => `${value} 分钟`,
      },
      xAxis: {
        boundaryGap: false,
        data: dates,
        type: "category",
      },
      yAxis: {
        name: "分钟",
        type: "value",
      },
      series: [
        {
          areaStyle: { opacity: 0.08 },
          data: dates.map((date) => toMinutes(dailyDurationMap[date] ?? 0)),
          name: "每日专注",
          smooth: true,
          type: "line",
        },
      ],
    };
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
        <div className="grid gap-4 lg:grid-cols-2">
          <section className="rounded-lg border border-border bg-card p-4 text-card-foreground shadow-sm">
            <h2 className="text-base font-medium">最近专注时长</h2>
            <EChartPanel option={barOption} />
          </section>
          <section className="rounded-lg border border-border bg-card p-4 text-card-foreground shadow-sm">
            <h2 className="text-base font-medium">每日专注趋势</h2>
            <EChartPanel option={lineOption} />
          </section>
        </div>
      )}
    </div>
  );
}
