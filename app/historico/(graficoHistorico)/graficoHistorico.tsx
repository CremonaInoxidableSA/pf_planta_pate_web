"use client";

import "chartjs-adapter-date-fns";
import { format } from "date-fns";
import {
  Chart,
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  TimeScale,
  Tooltip,
  Legend,
} from "chart.js";
import { useEffect, useRef, useState } from "react";
import type { HistoricoFilter, Ciclo } from "../page";
import graficoData from "@/mocks/graficoHistorico.json";

Chart.register(
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  TimeScale,
  Tooltip,
  Legend,
);

interface GraficoHistoricoProps {
  filter: HistoricoFilter | null;
  selectedCiclo: Ciclo | null;
}

const GraficoHistorico = ({ filter, selectedCiclo }: GraficoHistoricoProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<Chart | null>(null);
  const [zoomPluginLoaded, setZoomPluginLoaded] = useState(false);

  useEffect(() => {
    const loadZoomPlugin = async () => {
      try {
        const { default: zoomPlugin } = await import("chartjs-plugin-zoom");
        Chart.register(zoomPlugin);
        setZoomPluginLoaded(true);
      } catch (error) {
        console.error("Error cargando chartjs-plugin-zoom:", error);
        setZoomPluginLoaded(true);
      }
    };

    loadZoomPlugin();
  }, []);

  useEffect(() => {
    if (!selectedCiclo || !canvasRef.current || !zoomPluginLoaded) return;

    const cicloData = graficoData.find(
      (c) => c.idCiclo === selectedCiclo.id_ciclo,
    );
    if (!cicloData) return;

    if (chartRef.current) {
      chartRef.current.destroy();
      chartRef.current = null;
    }

    const ctx = canvasRef.current.getContext("2d");
    if (!ctx) return;

    chartRef.current = new Chart(ctx, {
      type: "line",
      data: {
        datasets: [
          {
            label: "Temperatura (°C)",
            data: cicloData.historial.map((h) => ({
              x: new Date(h.timestamp).getTime(),
              y: h.temperatura,
            })),
            borderColor: "rgb(59, 130, 246)",
            backgroundColor: "rgba(59, 130, 246, 0.1)",
            tension: 0.3,
            pointRadius: 4,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: true },
          zoom: {
            zoom: {
              wheel: { enabled: true },
              drag: { enabled: false },
              mode: "x",
            },
            pan: { enabled: true, mode: "x" },
          },
        },
        scales: {
          x: {
            type: "time",
            time: { tooltipFormat: "dd/MM/yyyy HH:mm" },
            ticks: { color: "rgb(156, 163, 175)" },
            grid: { color: "rgba(156, 163, 175, 0.1)" },
          },
          y: {
            title: { display: true, text: "°C", color: "rgb(156, 163, 175)" },
            ticks: { color: "rgb(156, 163, 175)" },
            grid: { color: "rgba(156, 163, 175, 0.1)" },
          },
        },
      },
    });

    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
        chartRef.current = null;
      }
    };
  }, [selectedCiclo, zoomPluginLoaded]);

  if (!selectedCiclo) {
    return (
      <div className="bg-background2 rounded-md p-5 w-full min-h-75 flex items-center justify-center text-texto">
        {filter
          ? "Seleccioná un ciclo del listado para visualizarlo."
          : "Aplicá un filtro para comenzar."}
      </div>
    );
  }

  return (
    <div className="bg-background2 rounded-md p-5 w-full">
      <h3 className="text-lg font-semibold text-texto">
        Ciclo {selectedCiclo.id_ciclo} — Lote {selectedCiclo.lote}
      </h3>
      <p className="text-sm text-orange mb-4">
        {format(new Date(selectedCiclo.fecha_inicio), "dd/MM/yyyy HH:mm")} —{" "}
        {format(new Date(selectedCiclo.fecha_fin), "HH:mm")}
      </p>
      <div className="relative h-80">
        <canvas ref={canvasRef} />
      </div>
    </div>
  );
};

export default GraficoHistorico;
