"use client";

import { useState } from "react";
import { format } from "date-fns";
import { useTranslation } from "react-i18next";
import type { DateRange } from "react-day-picker";
import { Button } from "@/components/ui/button";
import ExportButton from "./(comps)/exportButton";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import DateRangePicker from "@/components/selectores/dateRangePicker";
import BotonAplicar from "@/app/historico/(productividad)/(filtradoFechas)/botonAplicar";
import SelectorHistorico from "@/app/historico/(comps)/selectorHistorico";
import { authFetch } from "@/app/api/api";
import TablaCiclos from "./(tablaCiclos)/tablaCiclos";
import GraficoHistorico from "./(graficoHistorico)/graficoHistorico";
import Productividad from "./(productividad)/productividad";

export interface Ciclo {
  id_ciclo: number;
  lote: string;
  fecha_inicio: string;
  fecha_fin: string;
  tiempo_transcurrido: string;
}

export interface HistoricoFilter {
  dateRange: DateRange;
  equipoId: number;
}

// Helpers para exportar a Excel
function exportToExcel({ data, fileName, sheetName = "Sheet1" }) {
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName);
  const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });
  saveAs(new Blob([wbout], { type: "application/octet-stream" }), fileName);
}

export default function Historico() {
  const { t } = useTranslation();

  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [equipoId, setEquipoId] = useState<number>(1);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [appliedFilter, setAppliedFilter] = useState<HistoricoFilter | null>(
    null,
  );
  const [selectedCiclo, setSelectedCiclo] = useState<Ciclo | null>(null);
  const [ciclos, setCiclos] = useState<Ciclo[]>([]);
  const [isLoadingCiclos, setIsLoadingCiclos] = useState(false);
  // Para acceder a los datos de los hijos
  const [graficoData, setGraficoData] = useState<any>(null);
  const [productividadData, setProductividadData] = useState<any>(null);

  const handleApply = async () => {
    if (!dateRange?.from || !dateRange?.to) return;
    const fechaInicio = format(dateRange.from, "yyyy-MM-dd");
    const fechaFin = format(dateRange.to, "yyyy-MM-dd");
    setIsLoadingCiclos(true);
    try {
      const response = await authFetch(
        `/api/historico-graficos/${equipoId}?fecha_inicio=${fechaInicio}&fecha_fin=${fechaFin}`,
      );
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al obtener ciclos");
      }
      const data: Ciclo[] = await response.json();
      if (data.length === 0) {
        toast.error(t("min.errorObtenerCiclos"), {
          description: t("min.noExistenDatos"),
          position: "bottom-right",
          id: `no-data-${fechaInicio}-${fechaFin}-${equipoId}`,
        });
        return;
      }
      setCiclos(data);
      setAppliedFilter({ dateRange: dateRange as DateRange, equipoId });
      setDialogOpen(true);
    } catch (error) {
      toast.error(t("min.errorObtenerCiclos"), {
        description:
          error instanceof Error ? error.message : "Error desconocido",
        position: "bottom-right",
        id: `error-ciclos-${equipoId}`,
      });
    } finally {
      setIsLoadingCiclos(false);
    }
  };

  const handleCicloSelect = (ciclo: Ciclo) => {
    setSelectedCiclo(ciclo);
    setDialogOpen(false);
  };

  return (
    <div className="flex flex-col w-full gap-5">
      <div className="flex flex-row items-center justify-between bg-background2 p-2 w-full rounded-md">
        <div className="w-[35%] justify-start">
          <ExportButton
            onExportGrafico={() => {
              if (!graficoData) {
                alert("No hay datos del gráfico para exportar");
                return;
              }
              // Exportar cada registro como una fila, sin agrupar, con columnas: Fecha | Temp. Agua | Temp. Producto | Nivel Agua
              const sensores = [
                "Temperatura agua",
                "Temperatura producto",
                "Nivel agua",
              ];
              // Unir por fecha completa (incluyendo segundos) y poner los tres valores en la misma fila
              const fechaMap = new Map();
              sensores.forEach((sensor) => {
                const readings = graficoData[sensor] as any[];
                if (Array.isArray(readings)) {
                  readings.forEach((r) => {
                    const fecha = r.fechaRegistro;
                    if (!fechaMap.has(fecha)) {
                      fechaMap.set(fecha, { Fecha: fecha });
                    }
                    if (sensor === "Temperatura agua")
                      fechaMap.get(fecha)["Temp. Agua"] = r.valor;
                    if (sensor === "Temperatura producto")
                      fechaMap.get(fecha)["Temp. Producto"] = r.valor;
                    if (sensor === "Nivel agua")
                      fechaMap.get(fecha)["Nivel Agua"] = r.valor;
                  });
                }
              });
              // Convertir a array ordenado por fecha
              const rows = Array.from(fechaMap.values()).sort((a, b) =>
                a.Fecha.localeCompare(b.Fecha),
              );
              exportToExcel({
                data: rows,
                fileName: "grafico_historico.xlsx",
                sheetName: "Grafico",
              });
            }}
            onExportProductividad={() => {
              if (!productividadData) {
                alert("No hay datos de productividad para exportar");
                return;
              }
              // Exportar resumen y productos realizados
              const resumen = [
                {
                  "Ciclos realizados": productividadData.ciclos_realizados,
                  "Producción total": productividadData.produccion_total,
                  "Ciclos correctos": productividadData.ciclos_correctos,
                  "Ciclos incorrectos": productividadData.ciclos_incorrectos,
                },
              ];
              const productos =
                productividadData.productos_realizados?.map((p: any) => ({
                  "Nombre receta": p.nombre_receta,
                  "Capacidad receta": p.capacidad_receta,
                  "Cantidad ciclos": p.cantidad_ciclos,
                })) || [];
              // Dos hojas: Resumen y Productos
              const wb = XLSX.utils.book_new();
              XLSX.utils.book_append_sheet(
                wb,
                XLSX.utils.json_to_sheet(resumen),
                "Resumen",
              );
              XLSX.utils.book_append_sheet(
                wb,
                XLSX.utils.json_to_sheet(productos),
                "Productos",
              );
              const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });
              saveAs(
                new Blob([wbout], { type: "application/octet-stream" }),
                "productividad.xlsx",
              );
            }}
            disabled={isLoadingCiclos}
          />
        </div>

        <h2 className="w-[30%] flex justify-center items-center text-texto text-xl">
          {t("mayus.filtroPeriodo")}
        </h2>

        <div className="flex flex-row items-stretch gap-5 w-[35%] justify-end h-full">
          <SelectorHistorico
            optionClasses="p-0.5 bg-background3 font-bold"
            selectClasses="w-full bg-background3 px-5 border-b-[2px] focus:outline-none text-lg text-texto transition-colors cursor-pointer"
            value={equipoId}
            onChange={setEquipoId}
          />
          <DateRangePicker
            className="bg-background3 h-full"
            value={dateRange}
            onChange={setDateRange}
          />
          <BotonAplicar
            selectClasses={`bg-background3 cursor-pointer ${isLoadingCiclos ? "opacity-50" : ""}`}
            onClick={handleApply}
            disabled={isLoadingCiclos}
          />
        </div>
      </div>
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent
          aria-describedby={undefined}
          className="w-fit sm:max-w-fit max-w-[calc(100%-2rem)] shadow-none p-5"
        >
          <DialogHeader>
            <DialogTitle className="text-texto">
              {t("min.seleccionarCiclo")}
            </DialogTitle>
          </DialogHeader>
          {appliedFilter && (
            <TablaCiclos
              ciclos={ciclos}
              selectedCicloId={selectedCiclo?.id_ciclo ?? null}
              onCicloSelect={handleCicloSelect}
            />
          )}
        </DialogContent>
      </Dialog>
      <GraficoHistorico
        filter={appliedFilter}
        selectedCiclo={selectedCiclo}
        // @ts-ignore
        onDataLoaded={setGraficoData}
      />
      <Productividad
        // @ts-ignore
        onDataLoaded={setProductividadData}
      />
    </div>
  );
}
