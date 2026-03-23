"use client";

import { useState } from "react";
import { format } from "date-fns";
import { useTranslation } from "react-i18next";
import type { DateRange } from "react-day-picker";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import DateRangePicker from "@/components/selectores/dateRangePicker";
import BotonAplicar from "@/components/botones/botonAplicar";
import SelectorHistorico, {
  EQUIPOS_HISTORICO,
} from "@/app/historico/(comps)/selectorHistorico";
import TablaCiclos from "./(tablaCiclos)/tablaCiclos";
import GraficoHistorico from "./(graficoHistorico)/graficoHistorico";

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

  const handleApply = () => {
    if (!dateRange?.from || !dateRange?.to) return;
    setAppliedFilter({ dateRange: dateRange as DateRange, equipoId });
    setDialogOpen(true);
  };

  const handleCicloSelect = (ciclo: Ciclo) => {
    setSelectedCiclo(ciclo);
    setDialogOpen(false);
  };

  const equipoShortName =
    EQUIPOS_HISTORICO.find((e) => e.id === (appliedFilter?.equipoId ?? 1))
      ?.shortName ?? "C1";

  const fechaInicio = appliedFilter?.dateRange?.from
    ? format(appliedFilter.dateRange.from, "yyyy-MM-dd")
    : "";
  const fechaFin = appliedFilter?.dateRange?.to
    ? format(appliedFilter.dateRange.to, "yyyy-MM-dd")
    : "";

  return (
    <div className="flex flex-col w-full gap-5">
      <div className="flex flex-row items-center justify-between bg-background2 p-2 w-full rounded-md">
        <div className="w-[35%] justify-start">
          <Button className="w-[35%]" />
        </div>

        <h2 className="w-[30%] flex justify-center items-center text-texto text-xl">
          {t("filtroPeriodo.titulo")}
        </h2>

        <div className="flex flex-row gap-5 w-[35%] justify-end">
          <SelectorHistorico value={equipoId} onChange={setEquipoId} />
          <DateRangePicker value={dateRange} onChange={setDateRange} />
          <BotonAplicar onClick={handleApply} />
        </div>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl" aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle className="text-texto">Seleccionar Ciclo</DialogTitle>
          </DialogHeader>
          {appliedFilter && (
            <TablaCiclos
              fechaInicio={fechaInicio}
              fechaFin={fechaFin}
              equipo={equipoShortName}
              selectedCicloId={selectedCiclo?.id_ciclo ?? null}
              onCicloSelect={handleCicloSelect}
              onTableClose={() => setDialogOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>

      <GraficoHistorico filter={appliedFilter} selectedCiclo={selectedCiclo} />

      <div className="bg-red">Productividad</div>
    </div>
  );
}
