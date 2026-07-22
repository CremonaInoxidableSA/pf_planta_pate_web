"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useCocinaContext } from "@/context/CocinaContext";
import { useEnfriadorContext } from "@/context/EnfriadorContext";
import Grafico from "@/components/cocinas&enfriadores/graficoIndividual/graficoMonitoreoIndividual";
import type { HistorialItem } from "@/components/cocinas&enfriadores/graficoIndividual/graficoTypes";
import { useTranslation } from "react-i18next";

const COCINA_IDS = [1, 2, 3, 4, 5, 6];

const GraficoMonitoreo: React.FC<{ id: number }> = ({ id }) => {
  const router = useRouter();
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
    ? `COCINA ${numero ?? id}`
    : `ENFRIADOR ${numero ?? id}`;
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

  const handleEquipoClick = () => {
    const route = isCocina ? `/cocinas?id=${id}` : `/enfriadores?id=${id}`;
    router.push(route);
  };

  return (
    <div
      className={`flex flex-col w-full h-full bg-background2 rounded p-3 border-b-2 ${borderColor} gap-2 min-h-0`}
    >
      <div className="flex items-center justify-between shrink-0 w-full">
        <div className="flex flex-col items-center">
          <span
            onClick={handleEquipoClick}
            className={`font-semibold ${textColor} cursor-pointer hover:opacity-80 transition-opacity justify-start w-full`}
          >
            {label}
          </span>
          <span className={"text-sm"}>{t("mayus.receta")}: {info?.receta}</span>
        </div>
        <span
          className={`flex flex-col text-sm px-2 justify-center items-center ${estadoColor}`}
        >
          <p>{estado}</p>
          <p>{info?.tiempoTranscurrido ?? ""}</p>
        </span>
      </div>

      <div className="flex gap-4 text-sm shrink-0">
        <span className="text-waterTemp">
          {t("min.tempAgua")}: {info?.temp_agua ?? "-"} °C
        </span>
        <span className="text-greengraph">
          {t("min.tempIngreso")}: {info?.temp_ingreso ?? "-"} °C
        </span>
      </div>

      <Grafico historial={historial} estado={estado} isCocina={isCocina} />
    </div>
  );
};

export default GraficoMonitoreo;
