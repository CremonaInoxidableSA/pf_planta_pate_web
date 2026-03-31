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
import { authFetch } from "@/app/api/api";

interface SensorReading {
  id: number;
  valor: number;
  fechaRegistro: string;
  idCiclo: number;
  idSensor: number;
}

interface CicloGeneral {
  id_ciclo: number;
  ciclo_lote: string;
  tiempo_transcurrido: string;
  fecha_inicio: string;
  fecha_fin: string;
  receta: string;
  temp_agua_max: number;
  temp_agua_min: number;
  temp_producto_max: number;
  temp_producto_min: number;
  nivel_agua_max: number;
  nivel_agua_min: number;
}

interface GraficoData {
  general: CicloGeneral;
  [sensorName: string]: SensorReading[] | CicloGeneral;
}

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
  onDataLoaded?: (data: GraficoData | null) => void;
}

const coloresSensores: Record<string, string> = {
  "Temperatura agua": "rgb(3, 157, 252)",
  "Temperatura producto": "rgb(41, 207, 0)",
  "Temperatura ingreso": "rgb(159, 0, 207)",
  "Nivel agua": "rgb(168, 85, 247)",
};

const GraficoHistorico = ({
  filter,
  selectedCiclo,
  onDataLoaded,
}: GraficoHistoricoProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<Chart | null>(null);
  const [zoomPluginLoaded, setZoomPluginLoaded] = useState(false);
  const [hasData, setHasData] = useState(false);
  const [graficoData, setGraficoData] = useState<GraficoData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  // Fetch sensor data when a ciclo is selected
  useEffect(() => {
    if (!selectedCiclo || !filter?.equipoId) {
      setGraficoData(null);
      onDataLoaded?.(null);
      return;
    }

    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      setGraficoData(null);
      try {
        const response = await authFetch(
          `/api/historico-graficos/${filter.equipoId}/${selectedCiclo.id_ciclo}`,
        );
        if (!response.ok) {
          const err = await response.json();
          throw new Error(err.error || "Error al obtener datos del ciclo");
        }
        const data: GraficoData = await response.json();
        setGraficoData(data);
        onDataLoaded?.(data);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Error desconocido");
        onDataLoaded?.(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCiclo, filter?.equipoId]);

  // Build chart when sensor data and zoom plugin are ready
  useEffect(() => {
    if (!graficoData || !canvasRef.current || !zoomPluginLoaded) return;

    const datasets = Object.entries(graficoData)
      .filter(([key, value]) => key !== "general" && Array.isArray(value))
      .map(([sensorName, readings]) => {
        const sensorReadings = readings as SensorReading[];
        if (sensorReadings.length === 0) return null;
        // Use right axis for Nivel agua, left for others
        const isNivelAgua = sensorName === "Nivel agua";
        return {
          label: sensorName,
          data: sensorReadings
            .sort(
              (a, b) =>
                new Date(a.fechaRegistro).getTime() -
                new Date(b.fechaRegistro).getTime(),
            )
            .map((r) => ({
              x: new Date(r.fechaRegistro).getTime(),
              y: r.valor,
            })),
          borderColor: coloresSensores[sensorName],
          backgroundColor: coloresSensores[sensorName] + "1A",
          tension: 0.3,
          pointRadius: 2,
          yAxisID: isNivelAgua ? "y2" : "y",
        };
      })
      .filter((d) => d !== null);

    if (datasets.length === 0) {
      setHasData(false);
      chartRef.current?.destroy();
      chartRef.current = null;
      return;
    }

    setHasData(true);
    chartRef.current?.destroy();
    chartRef.current = null;

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
          tooltip: {
            mode: "index",
            intersect: false,
          },
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
            time: { tooltipFormat: "dd/MM/yyyy HH:mm:ss" },
            ticks: { color: "rgb(156, 163, 175)" },
            grid: { color: "rgba(156, 163, 175, 0.1)" },
          },
          y: {
            title: {
              display: true,
              text: "Temperatura (°C)",
              color: "rgb(59, 130, 246)",
            },
            position: "left",
            ticks: { color: "rgb(59, 130, 246)" },
            grid: { color: "rgba(156, 163, 175, 0.1)" },
          },
          y2: {
            title: {
              display: true,
              text: "Nivel agua (mm)",
              color: "rgb(168, 85, 247)",
            },
            position: "right",
            ticks: { color: "rgb(168, 85, 247)" },
            grid: { drawOnChartArea: false },
          },
        },
      },
    });

    return () => {
      chartRef.current?.destroy();
      chartRef.current = null;
    };
  }, [graficoData, zoomPluginLoaded]);

  if (!selectedCiclo) {
    return (
      <div className="bg-background2 rounded-md p-5 w-full min-h-75 flex items-center justify-center text-texto">
        {filter
          ? "Seleccioná un ciclo del listado para visualizarlo."
          : "Aplicá un filtro para comenzar."}
      </div>
    );
  }

  const general = graficoData?.general;
  const lote = general?.ciclo_lote ?? selectedCiclo.lote;
  const fechaInicio = general?.fecha_inicio ?? selectedCiclo.fecha_inicio;
  const fechaFin = general?.fecha_fin ?? selectedCiclo.fecha_fin;

  return (
    <div className="bg-background2 rounded-md p-5 w-full">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-texto">
            Ciclo {selectedCiclo.id_ciclo} — {lote}
            {general?.receta && (
              <span className="ml-2 text-sm font-normal text-orange">
                {general.receta}
              </span>
            )}
          </h3>
          <p className="text-sm text-orange">
            {format(new Date(fechaInicio), "dd/MM/yyyy HH:mm")} —{" "}
            {format(new Date(fechaFin), "HH:mm")}
            {general?.tiempo_transcurrido && (
              <span className="ml-2">({general.tiempo_transcurrido})</span>
            )}
          </p>
          {/* Valores máximos */}
          {general && (
            <div className="flex flex-wrap gap-4 mt-2">
              <span
                className="flex items-center gap-1 text-sm"
                style={{ color: "rgb(3, 157, 252)" }}
              >
                <span
                  className="w-3 h-3 rounded-sm inline-block"
                  style={{ background: "rgb(3, 157, 252)" }}
                />
                Temp. agua máx: <b>{general.temp_agua_max}°C</b>
              </span>
              <span
                className="flex items-center gap-1 text-sm"
                style={{ color: "rgb(41, 207, 0)" }}
              >
                <span
                  className="w-3 h-3 rounded-sm inline-block"
                  style={{ background: "rgb(41, 207, 0)" }}
                />
                Temp. producto máx: <b>{general.temp_producto_max}°C</b>
              </span>
              <span
                className="flex items-center gap-1 text-sm"
                style={{ color: "rgb(168, 85, 247)" }}
              >
                <span
                  className="w-3 h-3 rounded-sm inline-block"
                  style={{ background: "rgb(168, 85, 247)" }}
                />
                Nivel agua máx: <b>{general.nivel_agua_max} mm</b>
              </span>
            </div>
          )}
        </div>
      </div>
      <div className="relative h-80">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center text-texto">
            Cargando datos...
          </div>
        )}
        {error && !isLoading && (
          <div className="absolute inset-0 flex items-center justify-center text-red-400">
            {error}
          </div>
        )}
        {!isLoading && !error && !hasData && graficoData && (
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
