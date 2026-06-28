import { useMemo } from "react";
import dayjs from "dayjs";
import type { EChartsOption } from "echarts";
import { EChartPanel } from "./EChartPanel";
import { toMinutes } from "./chart-utils";

type FocusHeatmapChartProps = {
  dailyDurationMap: Record<string, number>;
};

export function FocusHeatmapChart({
  dailyDurationMap,
}: FocusHeatmapChartProps) {
  const option = useMemo<EChartsOption>(() => {
    const endDate = dayjs();
    const startDate = endDate.subtract(11, "month").startOf("month");
    const heatmapData: {
      actualMinutes: number;
      value: [string, number];
    }[] = [];
    let currentDate = startDate;

    while (currentDate.isBefore(endDate) || currentDate.isSame(endDate, "day")) {
      const date = currentDate.format("YYYY-MM-DD");
      const actualMinutes = toMinutes(dailyDurationMap[date] ?? 0);

      if (actualMinutes > 0) {
        heatmapData.push({
          actualMinutes,
          value: [date, Math.min(actualMinutes, 60)],
        });
      }

      currentDate = currentDate.add(1, "day");
    }

    return {
      calendar: {
        cellSize: ["auto", 16],
        dayLabel: {
          firstDay: 1,
          margin: 8,
          nameMap: ["日", "一", "二", "三", "四", "五", "六"],
        },
        itemStyle: {
          borderColor: "#ffffff",
          borderWidth: 2,
          color: "#f4f4f5",
        },
        left: 64,
        monthLabel: {
          color: "#71717a",
          nameMap: "ZH",
        },
        range: [startDate.format("YYYY-MM-DD"), endDate.format("YYYY-MM-DD")],
        right: 24,
        top: 36,
        yearLabel: { show: false },
      },
      series: [
        {
          coordinateSystem: "calendar",
          data: heatmapData,
          emphasis: {
            itemStyle: {
              borderColor: "#18181b",
              borderWidth: 1,
            },
          },
          type: "heatmap",
        },
      ],
      tooltip: {
        formatter: (params) => {
          if (Array.isArray(params)) {
            return "";
          }

          const [date] = params.value as [string, number];
          const { actualMinutes } = params.data as {
            actualMinutes: number;
          };

          return `${dayjs(date).format("YYYY-MM-DD")}<br />专注 ${actualMinutes} 分钟`;
        },
      },
      visualMap: {
        inRange: {
          color: [
            "rgba(34, 197, 94, 0.16)",
            "rgba(34, 197, 94, 0.24)",
            "rgba(34, 197, 94, 0.48)",
            "rgba(34, 197, 94, 0.72)",
            "rgba(34, 197, 94, 1)",
          ],
        },
        max: 60,
        min: 0,
        show: false,
        type: "continuous",
      },
    };
  }, [dailyDurationMap]);

  return (
    <section className="rounded-lg border border-border bg-card p-4 text-card-foreground shadow-sm lg:col-span-2">
      <h2 className="text-base font-medium">专注热力图</h2>
      <EChartPanel className="h-56" option={option} />
    </section>
  );
}
