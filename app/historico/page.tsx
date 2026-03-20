"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { useTranslation } from "react-i18next";

const GraficoHistorico = dynamic(
  () => import("@/components/graficos/graficoHistorico"),
  { ssr: false },
);

const Productividad = dynamic(
  () => import("@/components/productividad/productividad"),
  { ssr: false },
);

const Selector = dynamic(
  () => import("@/components/selectores/selectorHistorico"),
  { ssr: false },
);

const DatePicker = dynamic(() => import("@/ui/datePicker"), { ssr: false });

const BotonInforme = dynamic(
  () => import("@/components/botones/botonInforme"),
  { ssr: false },
);

const BotonAplicar = dynamic(
  () => import("@/components/botones/botonAplicar"),
  { ssr: false },
);

function getEquipmentDisplayName(id: number, type: "cocina" | "enfriador") {
  // Determinar el sufijo L1/L2 correctamente
  let linea = "L1";

  if ((type === "cocina" && id > 3) || (type === "enfriador" && id > 10)) {
    linea = "L2";
  }

  // Ajustar el número de enfriador (1-8) cuando el ID es 7-14
  const equipmentNumber = type === "enfriador" ? id - 6 : id;

  return `${type === "cocina" ? "Cocina" : "Enfriador"} ${equipmentNumber}-${linea}`;
}

export default function Historico() {
  // Estados iniciales con valores por defecto
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [selectedId, setSelectedId] = useState<number>(1);
  const [selectedType, setSelectedType] = useState<"cocina" | "enfriador">(
    "cocina",
  );
  const [_graphData, _setGraphData] = useState<any>(null);
  const [tempSelectedValue, setTempSelectedValue] = useState(1);
  const [showGraphic, setShowGraphic] = useState(true);
  const [selectedCicloId, setSelectedCicloId] = useState<number | null>(null);
  const { t } = useTranslation("grafico");
  const [tempDateRange, setTempDateRange] = useState<{
    startDate: string | null;
    endDate: string | null;
  }>({
    startDate: "2000-01-01",
    endDate: "2100-01-01",
  });

  const handleDateChange = (
    startDate: string | null,
    endDate: string | null,
  ) => {
    setTempDateRange({ startDate, endDate });
  };

  const handleChange = (value: number) => {
    setTempSelectedValue(value);
  };

  const handleApplyClick = async () => {
    try {
      const equipmentType = tempSelectedValue <= 6 ? "cocina" : "enfriador";

      // Determinar el sufijo L1/L2 correctamente
      let linea = "L1";

      if (
        (equipmentType === "cocina" && tempSelectedValue > 3) ||
        (equipmentType === "enfriador" && tempSelectedValue > 10)
      ) {
        linea = "L2";
      }

      // Ajustar el número de enfriador (1-8) cuando el ID es 7-14
      const equipmentNumber =
        equipmentType === "enfriador"
          ? tempSelectedValue - 6
          : tempSelectedValue;

      const equipoName = `${equipmentType === "cocina" ? "Cocina" : "Enfriador"} ${equipmentNumber}-${linea}`;

      // Obtener el último ciclo del equipo seleccionado
      const host = process.env.NEXT_PUBLIC_WS_HOST || "localhost";
      const port = process.env.NEXT_PUBLIC_WS_PORT || "8000";

      const response = await fetch(
        `http://${host}:${port}/historico-graficos/${equipoName}?fecha_inicio=${tempDateRange.startDate}&fecha_fin=${tempDateRange.endDate}`,
      );

      if (response.ok) {
        const data = await response.json();

        if (data && data.length > 0) {
          const lastCiclo = data.reduce((max: any, ciclo: any) =>
            ciclo.id_ciclo > max.id_ciclo ? ciclo : max,
          );

          setSelectedCicloId(lastCiclo.id_ciclo);
          setSelectedId(tempSelectedValue);
          setSelectedType(equipmentType);
          setShowGraphic(false);
        }
      }
    } catch {}
  };

  const handleCicloSelect = (cicloId: number) => {
    setSelectedCicloId(cicloId);
    setShowGraphic(true);
  };

  useEffect(() => {
    const fetchLastCiclo = async () => {
      if (!isInitialLoad) return;

      try {
        const host = process.env.NEXT_PUBLIC_WS_HOST || "localhost";
        const port = process.env.NEXT_PUBLIC_WS_PORT || "8000";
        const equipmentType = "Cocina 1-L1"; // Cocina 1 por defecto

        const response = await fetch(
          `http://${host}:${port}/historico-graficos/${equipmentType}?fecha_inicio=2000-01-01&fecha_fin=2100-01-01`,
        );

        if (!response.ok) throw new Error("Network response was not ok");

        const data = await response.json();

        if (data && data.length > 0) {
          // Obtener el ciclo con el ID más alto
          const lastCiclo = data.reduce((max: any, ciclo: any) =>
            ciclo.id_ciclo > max.id_ciclo ? ciclo : max,
          );

          setSelectedCicloId(lastCiclo.id_ciclo);
        }
      } finally {
        setIsInitialLoad(false);
      }
    };

    fetchLastCiclo();
  }, [isInitialLoad]);

  return (
    <section className="flex flex-col w-[100%] items-center justify-center gap-[20px]">
      <div className="flex flex-row items-center justify-between bg-black p-[8px] w-[100%] rounded-md">
        <div className="flex gap-[10px] ml-[10px]">
          <BotonInforme
            cicloId={selectedCicloId}
            equipo={getEquipmentDisplayName(selectedId, selectedType)}
            selectClasses="min-h-[40px]"
          />
        </div>

        <div className="text-center text-white ml-[110px]">
          <h2 className="text-lg font-bold uppercase mb-[-6px]">
            {t("filtroPeriodo.titulo")}
          </h2>
          <span className="text-sm">{t("filtroPeriodo.subtitulo")}</span>
        </div>

        <div className="flex gap-[5px] items-center pr-[10px]">
          <Selector
            selectClasses="text-white hover:bg-gray-700"
            value={tempSelectedValue}
            onChange={handleChange}
          />
          <DatePicker onDateChange={handleDateChange} />
          <BotonAplicar
            selectClasses="text-white hover:bg-gray-700 px-[4px] py-[2px] min-h-[40px]"
            onClick={handleApplyClick}
          />
        </div>
      </div>

      <div className="w-[100%] h-[80vh]">
        <GraficoHistorico
          contextType={selectedType === "cocina" ? "cocinas" : "enfriadores"}
          endDate={tempDateRange.endDate}
          id={selectedId}
          selectedCicloId={selectedCicloId}
          showTableOnLoad={!showGraphic} // Cambiado para que se sincronice con el estado
          startDate={tempDateRange.startDate}
          onCicloSelect={handleCicloSelect}
          onTableClose={() => setShowGraphic(true)}
        />
      </div>
      <div className="w-[100%] h-auto">
        <Productividad />
      </div>
    </section>
  );
}
