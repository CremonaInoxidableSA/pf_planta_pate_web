import type { ChartOptions } from "chart.js";

export const formatTiempo = (segundos: number): string => {
  const h = Math.floor(segundos / 3600);
  const m = Math.floor((segundos % 3600) / 60);
  const s = Math.floor(segundos % 60);
  const mm = String(m).padStart(2, "0");
  const ss = String(s).padStart(2, "0");
  return h > 0 ? `${h}:${mm}:${ss}` : `${mm}:${ss}`;
};

export const buildChartOptions = (): ChartOptions<"line"> => ({
  responsive: true,
  maintainAspectRatio: false,
  animation: false,
  plugins: {
    legend: {
      display: true,
      labels: {
        color: "#8C8C8C",
        usePointStyle: true,
        pointStyle: "circle",
        padding: 16,
      },
    },
    tooltip: {
      enabled: true,
      mode: "x",
      intersect: false,
      callbacks: {
        title: (items) => `Tiempo: ${formatTiempo(items[0]?.parsed.x ?? 0)}`,
        label: (item) =>
          ` ${item.dataset.label}: ${(item.parsed.y ?? 0).toFixed(1)} °C`,
      },
    },
    zoom: undefined,
  },
  scales: {
    x: {
      type: "linear",
      ticks: {
        color: "#8C8C8C",
        maxTicksLimit: 8,
        callback: (val) => formatTiempo(val as number),
      },
      grid: { color: "rgba(140,140,140,0.12)" },
      border: { color: "rgba(140,140,140,0.3)" },
    },
    y: {
      type: "linear",
      title: { display: true, text: "°C", color: "#8C8C8C" },
      ticks: { color: "#8C8C8C" },
      grid: { color: "rgba(140,140,140,0.12)" },
      border: { color: "rgba(140,140,140,0.3)" },
    },
  },
});
