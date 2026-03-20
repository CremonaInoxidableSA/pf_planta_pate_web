"use client";

//React
import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AiOutlineExclamationCircle } from "react-icons/ai";
//ChartJs
import {
  Chart,
  registerables,
  ChartConfiguration,
  Plugin,
  ChartDataset,
  ScriptableContext,
} from "chart.js";
import zoomPlugin from "chartjs-plugin-zoom";
//Context y Funciones
import { useTranslation } from "react-i18next";

import { useLinea } from "@/context/LineaContext";
import { transformData } from "@/utils/logicaGraficosLinea";

// Registrar los plugins
Chart.register(...registerables);
Chart.register(zoomPlugin);

// Mantener tus interfaces originales
interface InfoEquipo {
  tipo: "COCINA" | "ENFRIADOR";
  id: number;
  estado:
    | "ACTIVO"
    | "INACTIVO"
    | "FALLA"
    | "OPERATIVO"
    | "FINALIZADO"
    | "PRE OPERATIVO"
    | "PRE OPERATIVO";
  temp_agua: number;
  temp_prod: number;
  temp_ingreso: number;
  temp_chiller: number;
  niv_agua: number;
  receta: string;
  receta_paso_actual: number;
  tiempoTranscurrido: number;
  num_cocina?: number;
  num_enfriador?: number;
}

interface DetallesEquipo {
  historial: Array<{
    id_historial: number;
    tiempo: number;
    temp_agua: number;
    temp_ingreso: number;
    estado: string;
  }>;
}

// Modificar la definición del componente para recibir solo el id
const GraficoMonitoreo: React.FC<{ id: number }> = ({ id }) => {
  const router = useRouter();
  const { t } = useTranslation();
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstanceRef = useRef<Chart<"line"> | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isFirstLoad, setIsFirstLoad] = useState<boolean>(true);
  const [hasCachedData, setHasCachedData] = useState<boolean>(false);
  const { lineasData, lineaSeleccionada } = useLinea();

  // Determinar el tipo de equipo basado en el ID
  const contextType = id <= 6 ? "cocinas" : "enfriadores";

  const handleClick = () => {
    const path = id <= 6 ? `/cocinas?id=${id}` : `/enfriadores?id=${id}`;

    router.push(path);
  };

  useEffect(() => {
    if (!lineasData) {
      // Verificar si hay datos en caché
      const cachedData = localStorage.getItem(`equipo-${id}`);

      if (cachedData) {
        setHasCachedData(true);
        setLoading(false);
      } else {
        setHasCachedData(false);
        setLoading(true);
      }

      return;
    }

    // Obtener los datos del equipo según la línea seleccionada
    const lineaActual = lineasData?.[lineaSeleccionada];

    try {
      const image = new Image();

      image.src = "/creminox.png";

      const plugin: Plugin = {
        id: "customCanvasBackgroundImage",
        beforeDraw: (chart: Chart) => {
          if (image.complete) {
            const ctx = chart.ctx;
            const { top, left, width, height } = chart.chartArea;

            ctx.save();
            ctx.globalAlpha = 0.2;

            const imageWidth = width * 0.5;
            const imageHeight = (image.height / image.width) * imageWidth;
            const x = left + (width - imageWidth) / 2;
            const y = top + (height - imageHeight) / 2;

            ctx.drawImage(image, x, y, imageWidth, imageHeight);
            ctx.restore();
          } else {
            image.onload = () => chart.draw();
          }
        },
      };

      // Usar aserciones de tipo para pasar los datos a transformData
      // Esto le dice a TypeScript que confíe en que los datos son compatibles
      const chartData = transformData(
        id,
        (lineaActual?.cocinas as any) || [],
        (lineaActual?.enfriadores as any) || [],
      );

      // Configurar tensión para líneas curvas
      if (chartData && chartData.datasets) {
        chartData.datasets.forEach((dataset: ChartDataset<"line">) => {
          dataset.tension = 0.4; // Esto creará curvas suaves
        });
      }

      if (chartRef.current) {
        if (chartInstanceRef.current) {
          chartInstanceRef.current.destroy();
        }

        const ctx = chartRef.current.getContext("2d");

        if (ctx) {
          const config: ChartConfiguration<"line"> = {
            type: "line",
            data: {
              datasets: chartData.datasets.map(
                (dataset: ChartDataset<"line">) => {
                  const baseConfig = {
                    ...dataset,
                    pointRadius: 2,
                    pointHoverRadius: 4,
                    tension: 0.4, // Mantener esta propiedad en cada dataset
                  };

                  if (dataset.label === "Nivel Agua") {
                    return {
                      ...baseConfig,
                      fill: true,
                      backgroundColor: (context: ScriptableContext<"line">) => {
                        if (!context.chart.chartArea) {
                          return dataset.borderColor;
                        }

                        const { ctx, chartArea } = context.chart;
                        const gradient = ctx.createLinearGradient(
                          0,
                          chartArea.bottom,
                          0,
                          chartArea.top,
                        );

                        gradient.addColorStop(0, "rgba(255, 165, 0, 0)");
                        gradient.addColorStop(1, "rgba(255, 165, 0, 0.3)");

                        return gradient;
                      },
                    };
                  } else {
                    return {
                      ...baseConfig,
                      fill: false,
                    };
                  }
                },
              ),
            },
            options: {
              interaction: {
                intersect: false,
                mode: "index",
              },
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  position: "top",
                  labels: {
                    usePointStyle: true,
                  },
                  display: false,
                },
                title: {
                  align: "start",
                  color: "#D9D9D9",
                  display: false, // Desactivamos el título nativo ya que ahora usamos el div
                  font: {
                    weight: "normal",
                    size: 20,
                  },
                  padding: {
                    top: 0,
                    bottom: 15,
                  },
                },
                zoom: {
                  pan: {
                    enabled: false,
                  },
                  zoom: {
                    wheel: {
                      enabled: false,
                    },
                    pinch: {
                      enabled: false,
                    },
                    mode: "x",
                  },
                },
                tooltip: {
                  callbacks: {
                    title: (context) => {
                      const totalSeconds = Math.floor(context[0].parsed.x);
                      const hours = Math.floor(totalSeconds / 3600);
                      const minutes = Math.floor((totalSeconds % 3600) / 60);
                      const seconds = totalSeconds % 60;
                      const timeFormatted = `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;

                      return `${t("tooltip")}: ${timeFormatted}`;
                    },
                    label: (context) => {
                      const datasetLabel = context.dataset.label || "";
                      const value = context.parsed.y;
                      const yAxisID = context.dataset.yAxisID;

                      return `${datasetLabel}: ${value}${yAxisID === "y1" ? " mm" : "°C"}`;
                    },
                  },
                  displayColors: true, // Mostrar los cuadrados de color
                  boxWidth: 8, // Tamaño del cuadrado de color
                  boxHeight: 8, // Altura del cuadrado de color
                  boxPadding: 4, // Espacio entre el cuadrado y el texto
                  usePointStyle: false, // Usar cuadrados en lugar de círculos
                },
              },
              animation: {
                duration: isFirstLoad ? 750 : 0,
              },
              transitions: {
                zoom: {
                  animation: {
                    duration: 0,
                  },
                },
                active: {
                  animation: {
                    duration: 0,
                  },
                },
              },
              scales: {
                y: {
                  type: "linear",
                  display: true,
                  position: "left",
                  beginAtZero: true,
                  title: {
                    display: true,
                    text: t("ejes.y"),
                    color: "#D9D9D9",
                  },
                  grid: {
                    color: "#1F1F1F",
                    tickColor: "#fff",
                  },
                  border: {
                    color: "#D9D9D9", // Color de la línea del eje
                  },
                },
                y1: {
                  type: "linear",
                  display: true,
                  position: "right",
                  beginAtZero: true,
                  title: {
                    display: true,
                    text: t("ejes.y1"),
                    color: "#D9D9D9",
                  },
                  grid: {
                    drawOnChartArea: false, // Solo mostrar la línea del eje
                  },
                  border: {
                    color: "#D9D9D9", // Color de la línea del eje
                  },
                },
                x: {
                  type: "linear",
                  position: "bottom",
                  min: 0,
                  ticks: {
                    stepSize: 10,
                    callback: (value) => {
                      const totalSeconds = Math.floor(Number(value));
                      const hours = Math.floor(totalSeconds / 3600);
                      const minutes = Math.floor((totalSeconds % 3600) / 60);

                      return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
                    },
                  },
                  afterBuildTicks: (axis) => {
                    axis.ticks = axis.ticks.filter((t) => t.value >= 0);
                  },
                  title: {
                    display: true,
                    text: t("ejes.x"),
                  },
                  border: {
                    color: "#D9D9D9",
                  },
                  grid: {
                    color: "#1F1F1F",
                    tickColor: "#fff",
                  },
                  bounds: "ticks",
                  grace: "5%",
                },
              },
            },
            plugins: [plugin],
          };

          chartInstanceRef.current = new Chart(ctx, config);
          if (isFirstLoad) {
            setIsFirstLoad(false);
          }
        }
      }
      setLoading(false);
    } catch {
      setLoading(true);
    }
  }, [lineasData, lineaSeleccionada, id, t, isFirstLoad]);

  // Buscar el equipo en los datos de la línea seleccionada
  const equipos = lineasData?.[lineaSeleccionada]?.[contextType] || [];
  const equipo = equipos.find(
    (value: [InfoEquipo, DetallesEquipo]) => value[0].id === id,
  )?.[0];

  if (!equipo) {
    return (
      <div className="bg-midGrey p-[20px] h-full w-full rounded-md flex flex-col items-center justify-center text-white gap-[20px]">
        <AiOutlineExclamationCircle className="w-auto h-1/4" />
        <p className="text-3xl text-white text-center">
          {t("equipoNoEncontrado")}
        </p>
      </div>
    );
  }

  if (equipo.estado === "INACTIVO") {
    const nombreEquipo =
      contextType === "cocinas" && "num_cocina" in equipo
        ? `${t("equipo.cocina")} ${equipo.num_cocina}`
        : contextType === "enfriadores" && "num_enfriador" in equipo
          ? `${t("equipo.enfriador")} ${equipo.num_enfriador}`
          : t("equipo.desconocido");

    return (
      <div className="bg-midGrey p-[20px] h-full w-full rounded-md flex flex-col items-center justify-center text-white gap-[20px]">
        <AiOutlineExclamationCircle className="w-auto h-1/4" />
        <p className="text-3xl text-white text-center">
          {nombreEquipo} - {t("inactividad.titulo")}
        </p>
        <p className="text-xl text-white text-center">
          {t("inactividad.mensaje")}
        </p>
      </div>
    );
  }

  if (equipo.estado === "FALLA") {
    const nombreEquipo =
      contextType === "cocinas" && "num_cocina" in equipo
        ? `${t("equipo.cocina")} ${equipo.num_cocina}`
        : contextType === "enfriadores" && "num_enfriador" in equipo
          ? `${t("equipo.enfriador")} ${equipo.num_enfriador}`
          : t("equipo.desconocido");

    return (
      <div className="bg-redChill p-[20px] h-full w-full rounded-md flex flex-col items-center justify-center text-white gap-[20px]">
        <AiOutlineExclamationCircle className="w-auto h-1/4" />
        <p className="text-3xl text-white">
          {nombreEquipo} - {t("error.titulo")}
        </p>
        <p className="text-xl text-white">{t("error.mensaje")}</p>
      </div>
    );
  }

  return (
    <button
      className="bg-black p-[6px] h-full w-full rounded-md relative text-white cursor-pointer hover:bg-black/80 transition-colors"
      onClick={handleClick}
    >
      <div className="flex h-[20%] justify-between p-[5px]">
        <div className="flex items-start gap-[6px]">
          <div
            className={`text-[28px] font-bold ${equipo.tipo === "COCINA" ? "text-[#ff7f2a]" : "text-[#3AF]"}`}
          >
            {equipo.tipo === "COCINA"
              ? `${t("datosMonitoreo.letraCocina")}${equipo.id}`
              : `${t("datosMonitoreo.letraEnfriador")}${equipo.id - 6}`}
          </div>
          <div className="text-sm leading-tight">
            <div>
              <span className="font-semibold" /> {equipo.receta}
            </div>
            <div>
              <span className="font-semibold">{t("estado")}</span>{" "}
              {equipo.estado}
            </div>
            <div>
              <span className="font-semibold">{t("tiempo")}</span>{" "}
              {equipo.tiempoTranscurrido}
            </div>
          </div>
        </div>

        {/* Derecha: Temperaturas */}
        <div className="text-right text-sm">
          <div className={`text-[#FFA500] font-semibold`}>
            {t("datosMonitoreo.nivelAgua")}{" "}
            <span className="text-white">{equipo.niv_agua.toFixed(0)}mm</span>
          </div>
          <div className={`text-[#36A2EB] font-semibold`}>
            {t("datosMonitoreo.tempAgua")}{" "}
            <span className="text-white">{equipo.temp_agua.toFixed(1)}°C</span>
          </div>
          <div className={`text-[#4BC04B] font-semibold`}>
            {t("datosMonitoreo.tempProd")}{" "}
            <span className="text-white">{equipo.temp_prod.toFixed(1)}°C</span>
          </div>
        </div>
      </div>

      <canvas ref={chartRef} className="block w-full max-h-[80%] px-[6px]" />

      {loading && !hasCachedData && (
        <div className="flex absolute items-center justify-center h-full w-full">
          <div className="text-center">
            <div className="animate-spin rounded-[100%] h-[12px] w-[12px] border-t-[2px] border-b-[2px] border-primary mx-auto" />
            <p className="mt-[4px]">Conectando al servidor...</p>
          </div>
        </div>
      )}
    </button>
  );
};

export default GraficoMonitoreo;
