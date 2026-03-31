"use client";

import { useState } from "react";
import { format } from "date-fns";
import { useTranslation } from "react-i18next";
import type { DateRange } from "react-day-picker";
import ExportButton from "./(comps)/exportButton";
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
  // Estado para filtro de productividad
  const [productividadFilter, setProductividadFilter] = useState<{
    equipoId: number;
    dateRange: DateRange | undefined;
  }>({ equipoId: 0, dateRange: undefined });

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

  // --- Exportación de Excel ---
  const handleExportGrafico = async () => {
    if (!selectedCiclo || !equipoId) {
      toast.error(t("min.seleccionarCiclo"));
      return;
    }
    try {
      const url = `http://192.168.20.152:8000/historico-graficos/${equipoId}/descargar/${selectedCiclo.id_ciclo}`;
      const response = await fetch(url);
      if (!response.ok) throw new Error("Error al descargar archivo");
      const blob = await response.blob();
      saveAs(
        blob,
        `historico_grafico_equipo${equipoId}_ciclo${selectedCiclo.id_ciclo}.xlsx`,
      );
    } catch (err) {
      toast.error(t("min.errorDescarga"), {
        description: err instanceof Error ? err.message : String(err),
      });
    }
  };

  const handleExportProductividad = async () => {
    const { equipoId, dateRange } = productividadFilter;
    if (!dateRange?.from || !dateRange?.to) {
      toast.error(t("min.seleccionarFechas"));
      return;
    }
    try {
      const fechaInicio = format(dateRange.from, "yyyy-MM-dd");
      const fechaFin = format(dateRange.to, "yyyy-MM-dd");
      const url = `http://192.168.20.152:8000/historico-productividad/descargar/${equipoId}?fecha_inicio=${fechaInicio}&fecha_fin=${fechaFin}`;
      const response = await fetch(url);
      if (!response.ok) throw new Error("Error al descargar archivo");
      const blob = await response.blob();
      saveAs(
        blob,
        `productividad_equipo${equipoId}_${fechaInicio}_a_${fechaFin}.xlsx`,
      );
    } catch (err) {
      toast.error(t("min.errorDescarga"), {
        description: err instanceof Error ? err.message : String(err),
      });
    }
  };

  return (
    <div className="flex flex-col w-full gap-5">
      <div className="flex flex-row items-center justify-between bg-background2 p-2 w-full rounded-md h-13">
        <div className="w-[35%] h-full justify-start">
          <ExportButton
            onExportGrafico={handleExportGrafico}
            onExportProductividad={handleExportProductividad}
            disabled={isLoadingCiclos || !appliedFilter}
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
            selectClasses={`aspect-square bg-background3 cursor-pointer w-auto h-full ${isLoadingCiclos ? "opacity-50" : ""}`}
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
        onDataLoaded={setGraficoData}
      />
      <Productividad
        onDataLoaded={setProductividadData}
        onProductividadFilterChange={setProductividadFilter}
        productividadFilter={productividadFilter}
      />
    </div>
  );
}
