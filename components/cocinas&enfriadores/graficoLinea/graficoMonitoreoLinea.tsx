"use client";

import React from "react";
import { useCocinaContext } from "@/context/CocinaContext";
import { useEnfriadorContext } from "@/context/EnfriadorContext";
import Grafico from "@/components/cocinas&enfriadores/graficoIndividual/graficoMonitoreoIndividual";
import type { HistorialItem } from "@/components/cocinas&enfriadores/graficoIndividual/graficoTypes";
import { useTranslation } from "react-i18next";

const COCINA_IDS = [1, 2, 3, 4, 5, 6];

const GraficoMonitoreo: React.FC<{ id: number }> = ({ id }) => {
  const { cocinas } = useCocinaContext();
  const { enfriadores } = useEnfriadorContext();
  const { t } = useTranslation();

  const isCocina = COCINA_IDS.includes(id);

  const cocina = cocinas.find((c) => c.info.id === id);
  const enfriador = enfriadores.find((e) => e.info.id === id);

  const info = isCocina ? cocina?.info : enfriador?.info;
  const historial =
    ((isCocina ? cocina?.detalles.historial : enfriador?.detalles.historial) as
      | HistorialItem[]
      | undefined) ?? [];

  const numero = isCocina
    ? cocina?.detalles.num_cocina
    : enfriador?.detalles.num_enfriador;

  const estado = info?.estado ?? "INACTIVO";
  const label = isCocina
    ? `Cocina ${numero ?? id}`
    : `Enfriador ${numero ?? id}`;
  const borderColor = isCocina ? "border-orange" : "border-blue";
  const textColor = isCocina ? "text-orange" : "text-blue";
  const estadoColor =
    estado === "FALLA"
    ? "text-red bg-red/10 px-1.5 rounded"
    : estado === "PAUSA"
    ? "text-yellow bg-yellow/10 px-1.5 rounded"
    : estado === "INACTIVO"
    ? "text-gray bg-gray/10 px-1.5 rounded"
    : estado === "FINALIZADO"
    ? "text-blue bg-blue/10 px-1.5 rounded"
    : "text-green bg-green/10 px-1.5 rounded";

  return (
    <div
      className={`flex flex-col w-full h-full bg-background2 rounded-md p-3 border-b-2 ${borderColor} gap-2 min-h-0`}
    >
      <div className="flex items-center justify-between shrink-0">
        <span className={`font-semibold ${textColor}`}>{label}</span>
        <span className={"text-sm"}>{info?.receta}</span>
        <span className={`text-sm ${estadoColor}`}>{estado}</span>
      </div>

      <div className="flex gap-4 text-sm shrink-0">
        <span className="text-waterTemp">
          {t("min.tempAgua")}: {info?.temp_agua ?? "—"} °C
        </span>
        <span className="text-greengraph">
          {t("min.tempProd")}: {info?.temp_prod ?? "—"} °C
        </span>
      </div>

      <div className="flex-1 min-h-0">
        <Grafico historial={historial} estado={estado} isCocina={isCocina} />
      </div>
    </div>
  );
};

export default GraficoMonitoreo;
