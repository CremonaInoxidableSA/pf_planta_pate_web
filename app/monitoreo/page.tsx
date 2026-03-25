"use client";

import { useTranslation } from "react-i18next";

import { useLinea } from "@/context/LineaContext";
import GraficoMonitoreo from "@/components/cocinas&enfriadores/graficoMonitoreo";
import Selector from "@/components/selectores/selectorLineas";

const lineas = {
  1: { cocinas: [1, 2, 3], enfriadores: [7, 8, 9, 10] },
  2: { cocinas: [4, 5, 6], enfriadores: [11, 12, 13, 14] },
} as const;

const Monitoreo = () => {
  const { t } = useTranslation();
  const { lineaSeleccionada } = useLinea();
  const linea = lineas[lineaSeleccionada as keyof typeof lineas];

  return (
    <section className="flex flex-col h-screen max-h-screen w-full min-w-[720px] overflow-hidden">
      {/* Header con título y selector - altura fija */}
      <div className="flex w-full justify-between mb-[10px]">
        <h1 className="text-2xl font-semibold text-texto">{t("monitoreo")}</h1>
        <div className="w-1/5">
          <Selector />
        </div>
      </div>

      {/* Contenedor con los gráficos - altura adaptable */}
      <div className="flex-1 flex flex-col gap-4 overflow-hidden">
        {/* Contenedor de cocinas - mitad superior */}
        <div className="flex-1 flex flex-row gap-[20px] min-h-0">
          {linea.cocinas.map((id) => (
            <GraficoMonitoreo key={`equipo-${id}`} id={id} />
          ))}
        </div>

        {/* Contenedor de enfriadores - mitad inferior */}
        <div className="flex-1 flex flex-row gap-[20px] min-h-0">
          {linea.enfriadores.map((id) => (
            <GraficoMonitoreo key={`equipo-${id}`} id={id} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Monitoreo;
