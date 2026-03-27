"use client";

import { useTranslation } from "react-i18next";
import { useSearchParams } from "next/navigation";
import { useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";

import Selector from "./selectorEquipos";
import Grafico from "../cocinas&enfriadores/graficoIndividual/graficoMonitoreoIndividual";
import CicloActivo from "./cicloActivo";
import EstadoEquipo from "./estadoEquipo";
import SectorIO from "./sectorIO";

import { getColorClass } from "@/utils/logicaColores";
import { displayData } from "@/utils/displayData";

import { useCocinaContext } from "@/context/CocinaContext";
import { useEnfriadorContext } from "@/context/EnfriadorContext";
import { SectorIOType } from "@/types/sectorIO";

interface EquipoPageProps {
  type: "cocina" | "enfriador";
}

export default function EquipoPage({ type }: EquipoPageProps) {
  const { t } = useTranslation();
  const searchParams = useSearchParams();
  const { cocinas } = useCocinaContext();
  const { enfriadores } = useEnfriadorContext();
  const router = useRouter();

  const storageKey = `lastEquipoId_${type}`;
  const defaultId = type === "cocina" ? 1 : 7;
  const currentId = useMemo(() => {
    const fromUrl = Number(searchParams.get("id"));
    if (fromUrl) return fromUrl;
    if (typeof window !== "undefined") {
      const stored = Number(localStorage.getItem(storageKey));
      if (stored) return stored;
    }
    return defaultId;
  }, [searchParams, storageKey, defaultId]);

  const equipo =
    type === "cocina"
      ? cocinas.find((c) => c.info.id === currentId)
      : enfriadores.find((e) => e.info.id === currentId);

  const isCocina = type === "cocina";
  const color = isCocina ? "orange" : "blue";
  const borderColor = isCocina ? "border-orange" : "border-blue";
  const bgColor = isCocina ? "bg-oranget" : "bg-bluet";

  const labelToKeyMap: Record<string, string> = {
    [t("min.tempAgua")]: "tempAgua",
    [t("min.tempProd")]: "tempProd",
    [t("min.nivelAgua")]: "nivelAgua",
  };

  const datosEquipo = [
    {
      label: t("min.tempAgua"),
      value: equipo?.info.temp_agua ?? "N/A",
      unit: "°C",
    },
    {
      label: t("min.tempProd"),
      value: equipo?.info.temp_prod ?? "N/A",
      unit: "°C",
    },
    {
      label: t("min.nivelAgua"),
      value: equipo?.info.niv_agua ?? "N/A",
      unit: "mm",
    },
    {
      label: t("min.tiempo"),
      value: equipo?.info.tiempoTranscurrido ?? "N/A",
    },
  ];

  const datosCiclo = [
    {
      label: t("min.paso"),
      value: equipo?.info.receta_paso_actual || "N/A",
    },
    {
      label: t("min.lote"),
      value: equipo?.detalles.num_receta || "N/A",
    },
    {
      label: t("min.cantTorres"),
      value: equipo?.detalles.cant_torres || "N/A",
    },
    {
      label: t("min.tipoFin"),
      value: equipo?.detalles.tipo_fin ?? "N/A",
    },
  ];

  const datosIO = useMemo(() => {
    const defaultBaseIO = [
      { label: t("min.bomba"), value: false },
      { label: t("min.entradaAgua"), value: false },
      { label: t("min.filtroSuccion"), value: false },
    ];

    if (!equipo?.detalles.sector_io[0]) {
      if (isCocina) {
        return [
          ...defaultBaseIO,
          { label: t("min.vaporSerp"), value: false },
          { label: t("min.vaporVivo"), value: false },
        ];
      } else {
        return [
          ...defaultBaseIO,
          { label: t("min.valvulaAmoniaco"), value: false },
          { label: t("min.vaporLim"), value: false },
        ];
      }
    }

    const sectorIO = equipo.detalles.sector_io[0] as SectorIOType;
    const baseIO = [
      { label: t("min.bomba"), value: sectorIO.bomba_recirculacion },
      { label: t("min.entradaAgua"), value: sectorIO.entrada_agua },
      {
        label: t("min.filtroSuccion"),
        value: sectorIO.filtro_succion_agua,
      },
    ];

    if (isCocina && "vapor_serpentina" in sectorIO) {
      return [
        ...baseIO,
        { label: t("min.vaporSerp"), value: sectorIO.vapor_serpentina },
        { label: t("min.vaporVivo"), value: sectorIO.vapor_vivo },
      ];
    } else if (!isCocina && "valvula_amoniaco" in sectorIO) {
      return [
        ...baseIO,
        {
          label: t("min.valvulaAmoniaco"),
          value: sectorIO.valvula_amoniaco,
        },
        { label: t("min.vaporLim"), value: sectorIO.vapor_vivo_lim },
      ];
    }

    return baseIO;
  }, [equipo, isCocina, t]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(storageKey, String(currentId));
    }
  }, [currentId, storageKey]);

  const handleSelectionChange = (newId: number) => {
    router.push(`?id=${newId}`);
  };

  const formattedDisplayData = (value: string | number, unit?: string) => {
    if (value === "N/A") return value;

    return unit ? `${value} ${unit}` : value;
  };

  return (
    <div className="w-full flex flex-col gap-5">
      {/* SELECCIÓN Y ESTADO */}
      <div className="w-full grid grid-cols-3 gap-5">
        <Selector
          isCocina={isCocina}
          optionClasses="p-0.5 bg-background2 font-bold"
          selectClasses={`w-full h-full bg-background2 px-5 border-b-[2px] ${borderColor} focus:outline-none text-lg text-${color} hover:text-${color} transition-colors cursor-pointer`}
          value={currentId}
          onChange={handleSelectionChange}
        />
        <p
          className={`${bgColor} flex justify-start items-center h-12.5 p-3.75 ${borderColor} text-2xl font-semibold rounded-md text-texto`}
        >
          {t("mayus.receta")}: {equipo?.detalles.nom_receta ?? "N/A"}
        </p>
        <p
          className={`bg-background2 flex justify-start items-center h-12.5 p-3.75 ${borderColor} text-2xl font-semibold rounded-md text-texto`}
        >
          {t("mayus.estado")}: {equipo?.info.estado ?? "N/A"}
        </p>
      </div>

      {/* SECCIONES DE INFORMACIÓN */}
      <div className="grid grid-cols-3 w-full gap-5">
        <div className="flex flex-col gap-5 col-span-1">
          <div className="flex flex-row gap-5">
            <EstadoEquipo
              datos={datosEquipo}
              displayData={formattedDisplayData}
              getColorClass={(label, value) => {
                const key = labelToKeyMap[label] || "";
                if (!key) return "text-texto";
                return getColorClass(key, value, color);
              }}
            />
            <CicloActivo
              datosCiclo={datosCiclo}
              defaultColor={color}
              displayData={displayData}
            />
          </div>
          <SectorIO
            datosIO={datosIO}
            getColorClass={(label, value) => getColorClass(label, value, color)}
          />
        </div>
        <div className="flex col-span-2 bg-background2 rounded-md p-5">
          <Grafico
            historial={
              (equipo?.detalles.historial ??
                []) as import("../cocinas&enfriadores/graficoIndividual/graficoTypes").HistorialItem[]
            }
            estado={equipo?.info.estado ?? "INACTIVO"}
            isCocina={isCocina}
          />
        </div>
      </div>
    </div>
  );
}
