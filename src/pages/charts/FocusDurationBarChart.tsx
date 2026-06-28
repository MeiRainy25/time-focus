import { useMemo } from "react";
import type { EChartsOption } from "echarts";
import type { FocusRecord } from "@/types/focus";
import { EChartPanel } from "./EChartPanel";
import { toMinutes } from "./chart-utils";

type FocusDurationBarChartProps = {
  records: FocusRecord[];
};

function createRecordLabel(record: FocusRecord, index: number) {
  const name = record.name.trim() || "未命名专注";

  return name.length > 8 ? `${name.slice(0, 8)}...${index + 1}` : name;
}

export function FocusDurationBarChart({
  records,
}: FocusDurationBarChartProps) {
  const option = useMemo<EChartsOption>(() => {
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

  return (
    <section className="rounded-lg border border-border bg-card p-4 text-card-foreground shadow-sm">
      <h2 className="text-base font-medium">最近专注时长</h2>
      <EChartPanel option={option} />
    </section>
  );
}
