import React, { useEffect, useRef, useState } from "react";
import {
  Chart,
  registerables,
  ChartConfiguration,
  Plugin,
  TooltipItem,
  ScriptableContext,
} from "chart.js";
import zoomPlugin from "chartjs-plugin-zoom";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import "chartjs-adapter-date-fns";
import { es } from "date-fns/locale";
import { useTranslation } from "react-i18next";

import TablaCiclos from "@/components/tablaciclos/tablaCiclos";

Chart.register(...registerables);
Chart.register(zoomPlugin);

const _equipmentMapping: Record<string, string> = {
  C1: "Cocina 1-L1",
  C2: "Cocina 2-L1",
  C3: "Cocina 3-L1",
  C4: "Cocina 4-L2",
  C5: "Cocina 5-L2",
  C6: "Cocina 6-L2",
  E1: "Enfriador 1-L1",
  E2: "Enfriador 2-L1",
  E3: "Enfriador 3-L1",
  E4: "Enfriador 4-L1",
  E5: "Enfriador 5-L2",
  E6: "Enfriador 6-L2",
  E7: "Enfriador 7-L2",
  E8: "Enfriador 8-L2",
};

const getEquipmentName = (type: string, id: number): string => {
  // Para enfriadores, necesitamos convertir el ID (7-14) a número de enfriador (1-8)
  const adjustedId = type === "enfriadores" ? id - 6 : id;

  // Determinar la línea
  let linea = "L1";

  if (
    (type === "cocinas" && id > 3) ||
    (type === "enfriadores" && adjustedId > 4)
  ) {
    linea = "L2";
  }

  // Construir el nombre del equipo directamente sin usar el mapeo
  const equipmentType = type === "cocinas" ? "Cocina" : "Enfriador";

  return `${equipmentType} ${adjustedId}-${linea}`;
};

interface GraficoProps {
  contextType: "cocinas" | "enfriadores";
  id: number;
  startDate: string | null;
  endDate: string | null;
  showTableOnLoad?: boolean;
  onTableClose?: () => void;
  onCicloSelect?: (cicloId: number) => void;
  selectedCicloId?: number | null;
}

interface HistoricoData {
  "Temperatura agua": Array<{
    id: number;
    idCiclo: number;
    fechaRegistro: string;
    idSensor: number;
    valor: number;
  }>;
  "Temperatura producto": Array<{
    id: number;
    idCiclo: number;
    fechaRegistro: string;
    idSensor: number;
    valor: number;
  }>;
  "Nivel agua": Array<{
    id: number;
    idCiclo: number;
    fechaRegistro: string;
    idSensor: number;
    valor: number;
  }>;
  general: {
    id_ciclo: number;
    ciclo_lote: string;
    tiempo_transcurrido: string;
    fecha_inicio: string;
    fecha_fin: string;
    receta: string;
    temp_producto_max: number; // Añadido
    temp_producto_min: number; // Añadido
    temp_agua_max: number; // Añadido
    temp_agua_min: number; // Añadido
    nivel_agua_max: number; // Añadido
    nivel_agua_min: number; // Añadido
  };
}

const GraficoHistorico: React.FC<GraficoProps> = ({
  contextType,
  id,
  startDate,
  endDate,
  showTableOnLoad = false,
  onTableClose,
  onCicloSelect,
  selectedCicloId: externalSelectedCicloId,
}) => {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstanceRef = useRef<Chart<"line"> | null>(null);
  const [data, setData] = useState<HistoricoData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [_selectedCicloId, _setSelectedCicloId] = useState<number | null>(null);
  const [showTable, setShowTable] = useState(showTableOnLoad);
  const [internalSelectedCicloId, setInternalSelectedCicloId] = useState<
    number | null
  >(null);
  const [isLoading, setIsLoading] = useState(true);
  const { t } = useTranslation();

  useEffect(() => {
    if (externalSelectedCicloId !== undefined) {
      setInternalSelectedCicloId(externalSelectedCicloId);
    }
  }, [externalSelectedCicloId]);

  useEffect(() => {
    setShowTable(showTableOnLoad);
  }, [showTableOnLoad, contextType, id]); // Agregado contextType e id como dependencias

  const handleTableClose = () => {
    setShowTable(false);
    if (onTableClose) {
      onTableClose();
    }
  };

  useEffect(() => {
    let isMounted = true;

    // En graficoHistorico.tsx, añadir verificación antes de hacer la solicitud
    const fetchData = async () => {
      setError(null);
      try {
        setIsLoading(true);

        // Si no hay ciclo seleccionado, no hacer la petición
        if (externalSelectedCicloId === null) {
          setIsLoading(false);

          return;
        }

        const equipmentName = getEquipmentName(contextType, id);
        const host = process.env.NEXT_PUBLIC_WS_HOST || "192.168.0.61";
        const port = process.env.NEXT_PUBLIC_WS_PORT || "8000";

        const url = `http://${host}:${port}/historico-graficos/${equipmentName}/${externalSelectedCicloId}`;

        const response = await fetch(url);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const jsonData = await response.json();

        // Verificar si los datos que llegan son null o vacíos
        if (!jsonData || Object.keys(jsonData).length === 0) {
          setShowTable(false); // Cierra la tabla si los datos son null o vacíos
          if (onTableClose) {
            onTableClose();
          }

          return; // Termina la ejecución si no hay datos
        }

        setData(jsonData);

        if (isMounted) {
          // Solo actualiza si el componente está montado
          setData(jsonData);
        }
      } catch (error) {
        setError(
          error instanceof Error ? error.message : "Error al cargar los datos",
        );
        setShowTable(false); // Hide table on error
        if (onTableClose) {
          onTableClose();
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchData();

    return () => {
      isMounted = false; // Cancela operaciones pendientes
      setData(null); // Resetear estado crítico
    };
  }, [contextType, id, externalSelectedCicloId]);

  useEffect(() => {
    if (!data || !chartRef.current) return;

    const ctx = chartRef.current.getContext("2d");

    if (!ctx) return;

    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
    }

    // Agregar el plugin de la imagen de fondo
    const image = new Image();

    image.src = "/creminox.png";

    const plugin: Plugin = {
      id: "customCanvasBackgroundImage",
      beforeDraw: (chart: Chart) => {
        if (image.complete) {
          const ctx = chart.ctx;
          const { top, left, width, height } = chart.chartArea;

          ctx.save();
          ctx.globalAlpha = 0.1;

          const imageWidth = width * 0.25;
          const imageHeight = (image.height / image.width) * imageWidth;
          const x = left + (width - imageWidth) / 2;
          const y = top + (height - imageHeight) / 2.5;

          ctx.drawImage(image, x, y, imageWidth, imageHeight);
          ctx.restore();
        } else {
          image.onload = () => chart.draw();
        }
      },
    };

    // Procesar los datos para el gráfico con valores por defecto
    const tempProducto = (data["Temperatura producto"] || []).map((item) => ({
      x: new Date(item.fechaRegistro).getTime(),
      y: item.valor,
    }));

    const tempAgua = (data["Temperatura agua"] || []).map((item) => ({
      x: new Date(item.fechaRegistro).getTime(),
      y: item.valor,
    }));

    const nivelAgua = (data["Nivel agua"] || []).map((item) => ({
      x: new Date(item.fechaRegistro).getTime(),
      y: item.valor,
    }));

    const config: ChartConfiguration<"line"> = {
      type: "line",
      data: {
        datasets: [
          {
            label: t("datos.tempIng"),
            data: tempProducto,
            borderColor: "rgb(75, 192, 75)",
            backgroundColor: "rgba(75, 192, 75, 0.5)",
            fill: false,
            tension: 0.4,
            yAxisID: "y",
            pointStyle: "circle",
          },
          {
            label: t("datos.tempAgua"),
            data: tempAgua,
            borderColor: "rgb(54, 162, 235)",
            backgroundColor: "rgba(54, 162, 235, 0.5)",
            fill: false,
            tension: 0.4,
            yAxisID: "y",
            pointStyle: "circle",
          },
          {
            label: t("datos.nivelAgua"),
            data: nivelAgua,
            borderColor: "rgb(255, 165, 0)",
            backgroundColor: (context: ScriptableContext<"line">) => {
              if (!context.chart.chartArea) {
                return "rgba(255, 165, 0, 0.5)";
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
            fill: true, // Activar el relleno para el nivel de agua
            tension: 0.4,
            yAxisID: "y1",
            pointStyle: "circle",
          },
        ].filter((dataset) => dataset.data.length > 0),
      },
      options: {
        interaction: {
          intersect: false,
          mode: "nearest", // Cambiado de 'index' a 'nearest'
          axis: "x", // Especifica que solo considere el eje X
        },
        responsive: true,
        maintainAspectRatio: false,
        transitions: {
          zoom: {
            animation: {
              duration: 0,
            },
          },
        },
        plugins: {
          legend: {
            position: "top",
            labels: {
              usePointStyle: true,
            },
          },
          tooltip: {
            callbacks: {
              title: (context: TooltipItem<"line">[]) => {
                const date = new Date(context[0].parsed.x);
                const hours = date.getHours();
                const minutes = date.getMinutes();
                const seconds = date.getSeconds();
                const timeFormatted = `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;

                return `${t("tooltip")}: ${timeFormatted}`;
              },
              label: (context: TooltipItem<"line">) => {
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
          zoom: {
            pan: {
              enabled: true,
              mode: "x",
              threshold: 10,
            },
            zoom: {
              wheel: {
                enabled: true,
                modifierKey: "ctrl",
              },
              pinch: {
                enabled: true,
              },
              mode: "x",
            },
          },
        },
        scales: {
          x: {
            type: "time",
            border: {
              color: "#D9D9D9",
            },
            grid: {
              color: "#1F1F1F",
            },
            time: {
              unit: "minute",
              displayFormats: {
                minute: "HH:mm",
              },
              tooltipFormat: "HH:mm:ss",
            },
            adapters: {
              date: {
                locale: es,
              },
            },
            title: {
              display: true,
              text: t("ejes.x"),
            },
          },
          y: {
            beginAtZero: true,
            grid: {
              color: "#1F1F1F",
            },
            border: {
              color: "#D9D9D9",
            },
            title: {
              display: true,
              text: t("ejes.y"),
            },
          },
          y1: {
            position: "right",
            beginAtZero: true,
            border: {
              color: "#D9D9D9",
            },
            grid: {
              drawOnChartArea: false, // 👉 evita líneas duplicadas en el fondo
            },
            title: {
              display: true,
              text: t("ejes.y1"),
            },
          },
        },
      },
      plugins: [plugin],
    };

    chartInstanceRef.current = new Chart(ctx, config) as Chart<"line">;

    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }
    };
  }, [data]);

  const resetZoom = () => {
    if (chartInstanceRef.current) {
      chartInstanceRef.current.resetZoom();
    }
  };

  if (error) {
    return (
      <div className="bg-black p-5 h-full w-full rounded-md flex items-center justify-center">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  const formatDate = (date: string) => {
    const d = new Date(date);

    return d.toLocaleDateString("es-ES", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  const formatTime = (date: string) => {
    const d = new Date(date);

    return d.toLocaleTimeString("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatTimeTranscurrido = (timeString: string) => {
    // Separar horas, minutos y segundos
    const [hours, minutes, secondsWithMs] = timeString.split(":");

    // Obtener solo la parte entera de los segundos
    const seconds = Math.floor(parseFloat(secondsWithMs));

    // Formatear con dos dígitos para cada unidad
    const formattedHours = hours.padStart(2, "0");
    const formattedMinutes = minutes.padStart(2, "0");
    const formattedSeconds = seconds.toString().padStart(2, "0");

    // Retornar en formato HH:MM:SS
    return `${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
  };

  return (
    <div className="bg-black h-full w-full rounded-md relative pt-2 px-2 pb-27 grafico-historico">
      {/* Botones de control */}
      <div className="absolute top-8.75 right-8.75 flex gap-5 z-5 pdf-ignore">
        <Button
          className="text-white bg-grey hover:bg-lightGrey/25 px-2.5 py-5 rounded-md backdrop-blur-sm border border-grey/50"
          onClick={() => setShowTable(!showTable)}
        >
          {showTable
            ? t("graficoHistorico.botonCiclos")
            : t("graficoHistorico.botonCiclos")}
        </Button>
        <Button
          className="text-white bg-grey hover:bg-lightGrey/25 px-2.5 py-5 rounded-md backdrop-blur-sm border border-grey/50"
          onClick={resetZoom}
        >
          {t("graficoHistorico.botonZoom")}
        </Button>
      </div>

      {/* Info del ciclo */}
      {isLoading ? (
        <div className="flex justify-center items-center h-full">
          <Spinner />
        </div>
      ) : data && data.general ? (
        <div className="mb-[5px] ml-[5px]">
          <div className="flex items-center gap-[8px] pdf-info-section">
            <div className="text-white">
              <h2 className="text-[32px] font-bold">
                {t("graficoHistorico.titulo")}
              </h2>
              <p className="mt-[-6px]">
                <strong>{t("graficoHistorico.lote")}</strong>{" "}
                {data.general.ciclo_lote} - {data.general.receta}
              </p>
              <p className="text-orange text-[14px] mt-[-5px]">
                {formatDate(data.general.fecha_inicio)} -{" "}
                {formatDate(data.general.fecha_fin)}
              </p>
            </div>

            <div className="grid grid-cols-4 gap-[12px] ml-[5px]">
              <div className="bg-[#4bc04b] bg-opacity-25 text-white text-sm p-[0px] rounded-lg border border-[#4bc04b]/50">
                <div className="font-bold text-center mt-[5px] mb-[-5px]">
                  {t("datosHistorico.tempProd")}
                </div>
                <div className="grid grid-cols-2 m-2">
                  <span className="font-bold">Max:</span>
                  <span className="ml-[-22px]">
                    {data.general.temp_producto_max}°C
                  </span>
                  <span className="font-bold">Min:</span>
                  <span className="ml-[-25px]">
                    {data.general.temp_producto_min}°C
                  </span>
                </div>
              </div>

              <div className="bg-[#3666cc] bg-opacity-25 text-white text-sm p-[0px] rounded-lg border border-[#3666cc]/50">
                <div className="font-bold text-center mt-[5px] mb-[-5px]">
                  {t("datosHistorico.tempAgua")}
                </div>
                <div className="grid grid-cols-2 m-2">
                  <span className="font-bold">Max:</span>
                  <span className="ml-[-22px]">
                    {data.general.temp_agua_max}°C
                  </span>
                  <span className="font-bold">Min:</span>
                  <span className="ml-[-25px]">
                    {data.general.temp_agua_min}°C
                  </span>
                </div>
              </div>

              <div className="bg-yellow-500 bg-opacity-25 text-white text-sm p-[0px] rounded-lg border border-yellow-500/50">
                <div className="font-bold text-center mt-[5px] mb-[-5px]">
                  {t("datosHistorico.nivelAgua")}
                </div>
                <div className="grid grid-cols-2 m-2">
                  <span className="font-bold">Max:</span>
                  <span className="ml-[-22px]">
                    {data.general.nivel_agua_max} mm
                  </span>
                  <span className="font-bold">Min:</span>
                  <span className="ml-[-25px]">
                    {data.general.nivel_agua_min} mm
                  </span>
                </div>
              </div>

              <div className="bg-[#e82a31] bg-opacity-25 text-white text-sm p-[0px] rounded-lg border border-[#e82a31]/50">
                <div className="grid grid-cols-2 m-2">
                  <span className="font-bold">
                    {t("datosHistorico.hInicio")}
                  </span>
                  <span className="ml-[5px]">
                    {formatTime(data.general.fecha_inicio)}
                  </span>
                  <span className="font-bold">{t("datosHistorico.hFin")}</span>
                  <span className="ml-[-6px]">
                    {formatTime(data.general.fecha_fin)}
                  </span>
                  <span className="font-bold">
                    {t("datosHistorico.tiempoTrans")}
                  </span>
                  <span className="ml-[3px]">
                    {formatTimeTranscurrido(data.general.tiempo_transcurrido)}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex-1 flex justify-center ml-[-200px]">
              {data?.general?.id_ciclo && (
                <p className="text-white text-lg font-semibold">
                  <strong>{t("graficoHistorico.ciclo")}</strong>{" "}
                  {data.general.id_ciclo}
                </p>
              )}
            </div>
          </div>
        </div>
      ) : null}

      {/* Gráfico y Tabla */}
      <div className="relative w-full h-[calc(100%)]">
        <canvas ref={chartRef} />

        {(showTable || showTableOnLoad) &&
          !error &&
          data &&
          data.general &&
          Object.keys(data).length > 0 && (
            <div className="fixed inset-0 flex items-center justify-center z-50">
              <button
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={handleTableClose}
              />
              <div className="relative z-20 bg-black/80 p-1 rounded-lg border border-gray-700">
                <TablaCiclos
                  equipo={getEquipmentName(contextType, id)}
                  fechaFin={endDate || "2100-01-01"}
                  fechaInicio={startDate || "2000-01-01"}
                  selectedCicloId={internalSelectedCicloId}
                  onCicloSelect={(ciclo) => {
                    if (ciclo && ciclo.id_ciclo) {
                      setInternalSelectedCicloId(ciclo.id_ciclo);
                      if (onCicloSelect) {
                        onCicloSelect(ciclo.id_ciclo);
                      }
                      handleTableClose();
                    }
                  }}
                  onTableClose={handleTableClose} // Pasar la función
                />
              </div>
            </div>
          )}
      </div>
    </div>
  );
};

export default GraficoHistorico;
