"use client";

import { useEffect, useRef } from "react";
import {
  Chart,
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";

import type { HistorialItem } from "./graficoTypes";
import { ESTADOS_VACIO, historialToPoints } from "./graficoData";
import { buildChartOptions } from "./graficoConfig";

Chart.register(
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  Tooltip,
  Legend,
);

interface GraficoProps {
  historial: HistorialItem[];
  estado: string;
  isCocina: boolean;
}

const getCssColor = (variable: string, fallback: string): string => {
  if (typeof window === "undefined") return fallback;
  return (
    getComputedStyle(document.documentElement)
      .getPropertyValue(variable)
      .trim() || fallback
  );
};

const Grafico = ({ historial, estado, isCocina }: GraficoProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<Chart | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const ctx = canvasRef.current.getContext("2d");
    if (!ctx) return;

    const aguaColor = getCssColor("--color-blue", "#30a0f0");
    const prodColor = getCssColor("--color-greengraph", "#4bc04b");

    chartRef.current = new Chart(ctx, {
      type: "line",
      data: {
        datasets: [
          {
            label: "Temp. Agua",
            data: [],
            borderColor: aguaColor,
            backgroundColor: aguaColor + "33",
            borderWidth: 2,
            pointRadius: 3,
            pointHoverRadius: 5,
            tension: 0.3,
            fill: false,
          },
          {
            label: "Temp. Ingreso",
            data: [],
            borderColor: prodColor,
            backgroundColor: prodColor + "33",
            borderWidth: 2,
            pointRadius: 3,
            pointHoverRadius: 5,
            tension: 0.3,
            fill: false,
          },
        ],
      },
      options: buildChartOptions(),
    });

    return () => {
      chartRef.current?.destroy();
      chartRef.current = null;
    };
  }, [isCocina]);

  useEffect(() => {
    const chart = chartRef.current;
    if (!chart) return;

    if (ESTADOS_VACIO.includes(estado)) {
      chart.data.datasets[0].data = [];
      chart.data.datasets[1].data = [];
    } else {
      const { tempAgua, tempIngreso } = historialToPoints(historial);
      chart.data.datasets[0].data = tempAgua;
      chart.data.datasets[1].data = tempIngreso;
    }

    chart.update("none");
  }, [historial, estado]);

  return (
    <div className="relative w-full h-full min-h-0">
      <canvas ref={canvasRef} />
    </div>
  );
};

export default Grafico;
