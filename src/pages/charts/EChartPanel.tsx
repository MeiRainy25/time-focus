import { useEffect, useRef } from "react";
import * as echarts from "echarts";
import type { EChartsOption } from "echarts";

type EChartPanelProps = {
  option: EChartsOption;
};

export function EChartPanel({ option }: EChartPanelProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (containerRef.current === null) {
      return;
    }

    const chart = echarts.init(containerRef.current);
    const resizeChart = () => chart.resize();

    chart.setOption(option);
    window.addEventListener("resize", resizeChart);

    return () => {
      window.removeEventListener("resize", resizeChart);
      chart.dispose();
    };
  }, [option]);

  return <div className="h-80 w-full" ref={containerRef} />;
}
