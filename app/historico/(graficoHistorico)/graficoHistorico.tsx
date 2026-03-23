"use client";

import "chartjs-adapter-date-fns";
import { format } from "date-fns";
import type { HistoricoFilter, Ciclo } from "../page";

interface GraficoHistoricoProps {
  filter: HistoricoFilter | null;
  selectedCiclo: Ciclo | null;
}

const GraficoHistorico = ({ filter, selectedCiclo }: GraficoHistoricoProps) => {
  if (!selectedCiclo) {
    return (
      <div className="bg-background2 rounded-md p-4 w-full min-h-75 flex items-center justify-center text-texto opacity-50">
        {filter
          ? "Seleccioná un ciclo del listado para visualizarlo."
          : "Aplicá un filtro para comenzar."}
      </div>
    );
  }

  const inicio = new Date(selectedCiclo.fecha_inicio);
  const fin = new Date(selectedCiclo.fecha_fin);

  return (
    <div className="bg-background2 rounded-md p-6 w-full min-h-75 text-texto">
      <h3 className="text-lg font-semibold mb-4">Datos del Ciclo</h3>
      <div className="grid grid-cols-2 gap-3 text-sm">
        <span className="text-texto2">ID Ciclo</span>
        <span>{selectedCiclo.id_ciclo}</span>

        <span className="text-texto2">Lote</span>
        <span>{selectedCiclo.lote}</span>

        <span className="text-texto2">Inicio</span>
        <span>{format(inicio, "dd/MM/yyyy HH:mm:ss")}</span>

        <span className="text-texto2">Fin</span>
        <span>{format(fin, "dd/MM/yyyy HH:mm:ss")}</span>

        <span className="text-texto2">Tiempo transcurrido</span>
        <span>{selectedCiclo.tiempo_transcurrido}</span>
      </div>
    </div>
  );
};

export default GraficoHistorico;
