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
import sensoresData from "@/mocks/obtenerDatosSensores.json";

// Tipo para los datos del sensor
interface SensorData {
  idSensor: number;
  valor: number;
  fechaRegistro: string;
  idCiclo: number;
  id: number;
}

// Tipo para el objeto de sensores
type SensoresObject = Record<string, SensorData[]>;

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

// Colores para diferentes sensores
const coloresSensores: Record<string, string> = {
  "Temperatura agua": "rgb(59, 130, 246)",
  "Temperatura producto": "rgb(239, 68, 68)",
  "Temperatura ingreso": "rgb(34, 197, 94)",
  "Nivel agua": "rgb(168, 85, 247)",
};

const GraficoHistorico = ({ filter, selectedCiclo }: GraficoHistoricoProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<Chart | null>(null);
  const [zoomPluginLoaded, setZoomPluginLoaded] = useState(false);
  const [hasData, setHasData] = useState(false);

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

    // Filtrar datos por idCiclo para cada sensor
    const data = sensoresData as SensoresObject;
    const datasets = Object.entries(data)
      .map(([sensorName, readings]) => {
        // Verificar que readings sea un array
        if (!Array.isArray(readings)) return null;

        const filteredReadings = readings.filter(
          (r) => r.idCiclo === selectedCiclo.id_ciclo,
        );

        if (filteredReadings.length === 0) return null;

        return {
          label: sensorName,
          data: filteredReadings
            .sort(
              (a, b) =>
                new Date(a.fechaRegistro).getTime() -
                new Date(b.fechaRegistro).getTime(),
            )
            .map((r) => ({
              x: new Date(r.fechaRegistro).getTime(),
              y: r.valor,
            })),
          borderColor: coloresSensores[sensorName] || "rgb(156, 163, 175)",
          backgroundColor:
            (coloresSensores[sensorName] || "rgb(156, 163, 175)") + "1A",
          tension: 0.3,
          pointRadius: 2,
        };
      })
      .filter((d) => d !== null);

    if (datasets.length === 0) {
      setHasData(false);
      if (chartRef.current) {
        chartRef.current.destroy();
        chartRef.current = null;
      }
      return;
    }

    setHasData(true);

    if (chartRef.current) {
      chartRef.current.destroy();
      chartRef.current = null;
    }

    const ctx = canvasRef.current.getContext("2d");
    if (!ctx) return;

    chartRef.current = new Chart(ctx, {
      type: "line",
      data: { datasets },
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
            title: {
              display: true,
              text: "Valor",
              color: "rgb(156, 163, 175)",
            },
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
        {!hasData && (
          <div className="absolute inset-0 flex items-center justify-center text-texto">
            No hay datos de sensores para este ciclo.
          </div>
        )}
        <canvas ref={canvasRef} />
      </div>
    </div>
  );
};

export default GraficoHistorico;
