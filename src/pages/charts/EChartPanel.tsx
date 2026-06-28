import { useEffect, useRef } from "react";
import type { ECharts, EChartsOption } from "echarts";
import { cn } from "@/lib/utils";

type EChartPanelProps = {
  className?: string;
  option: EChartsOption;
};

export function EChartPanel({ className, option }: EChartPanelProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (containerRef.current === null) {
      return;
    }

    let chart: ECharts | null = null;
    let isDisposed = false;
    const resizeChart = () => chart?.resize();

    async function initChart() {
      const echarts = await import("echarts");

      if (containerRef.current === null || isDisposed) {
        return;
      }

      chart = echarts.init(containerRef.current);
      chart.setOption(option);
      window.addEventListener("resize", resizeChart);
    }

    void initChart();

    return () => {
      isDisposed = true;
      window.removeEventListener("resize", resizeChart);
      chart?.dispose();
    };
  }, [option]);

  return <div className={cn("h-80 w-full", className)} ref={containerRef} />;
}
