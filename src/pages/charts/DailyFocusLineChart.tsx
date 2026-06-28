import { useMemo } from "react";
import dayjs from "dayjs";
import type { EChartsOption } from "echarts";
import { EChartPanel } from "./EChartPanel";
import { toMinutes } from "./chart-utils";

type DailyFocusLineChartProps = {
  dailyDurationMap: Record<string, number>;
};

export function DailyFocusLineChart({
  dailyDurationMap,
}: DailyFocusLineChartProps) {
  const option = useMemo<EChartsOption>(() => {
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
        data: dates.map((date) => dayjs(date).format("MM-DD")),
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
  }, [dailyDurationMap]);

  return (
    <section className="rounded-lg border border-border bg-card p-4 text-card-foreground shadow-sm">
      <h2 className="text-base font-medium">每日专注趋势</h2>
      <EChartPanel option={option} />
    </section>
  );
}
