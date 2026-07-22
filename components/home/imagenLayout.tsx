"use client";

import { useTranslation } from "react-i18next";
import { useMemo } from "react";
import Link from "next/link";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { useCocinaContext } from "@/context/CocinaContext";
import { useEnfriadorContext } from "@/context/EnfriadorContext";
import Image from "next/image";

interface Equipo {
  tipo: "COCINA" | "ENFRIADOR";
  id: number;
  estado: string;
  tempAguaActual: number | null;
  receta: string;
  tiempoTranscurrido: string;
}

interface Section {
  id: number;
  name: string;
  key: string;
  path: string;
  line: number;
  style: React.CSSProperties;
}

const h = "25%";
const topL1 = "13%";
const topL2 = "62%";
const width = "13%";

const leftPositions = {
  C1: "2.8%",
  C2: "16.4%",
  C3: "30%",
  E1: "43.5%",
  E2: "57.05%",
  E3: "70.65%",
  E4: "84.1%",
};

const sectionConfig = {
  cocinas: [
    { id: 1, key: "COCINA 1", line: 1, position: "C1" },
    { id: 2, key: "COCINA 2", line: 1, position: "C2" },
    { id: 3, key: "COCINA 3", line: 1, position: "C3" },
    { id: 4, key: "COCINA 1", line: 2, position: "C1" },
    { id: 5, key: "COCINA 2", line: 2, position: "C2" },
    { id: 6, key: "COCINA 3", line: 2, position: "C3" },
  ],
  enfriadores: [
    { id: 7, key: "ENFRIADOR 1", line: 1, position: "E1" },
    { id: 8, key: "ENFRIADOR 2", line: 1, position: "E2" },
    { id: 9, key: "ENFRIADOR 3", line: 1, position: "E3" },
    { id: 10, key: "ENFRIADOR 4", line: 1, position: "E4" },
    { id: 11, key: "ENFRIADOR 1", line: 2, position: "E1" },
    { id: 12, key: "ENFRIADOR 2", line: 2, position: "E2" },
    { id: 13, key: "ENFRIADOR 3", line: 2, position: "E3" },
    { id: 14, key: "ENFRIADOR 4", line: 2, position: "E4" },
  ],
};

function getEstadoColor(estado: string): string {
  const estadoUpper = estado.toUpperCase();

  if (estadoUpper === "FALLA") return "#C13D";
  if (["OPERACIONAL", "PRE OPERACIONAL"].includes(estadoUpper)) return "#9b9D";
  if (estadoUpper === "PAUSA") return "#BB8D";
  if (estadoUpper === "FINALIZADO") return "#9bbD";
  if (estadoUpper === "INACTIVO") return "#666D";

  return "black";
}

function formatearTemperatura(valor: number | null | undefined): string {
  if (typeof valor !== "number" || !Number.isFinite(valor)) {
    return "-";
  }

  return `${valor.toFixed(0)}°C`;
}

export function ImagenLayout() {
  const { t } = useTranslation();
  const { cocinas } = useCocinaContext();
  const { enfriadores } = useEnfriadorContext();

  const sections: Section[] = useMemo(() => {
    const generateSections = (
      config: { id: number; key: string; position: string; line: number }[],
      path: string,
      type: "cocinas" | "enfriadores",
    ) => {
      return config.map(({ id, key, position, line }) => {
        const translatedName = t(`equipos.${key}`, { defaultValue: key });

        return {
          id: type === "enfriadores" ? id : id,
          name: translatedName,
          key: key,
          path,
          line,
          style: {
            top: line === 1 ? topL1 : topL2,
            left: leftPositions[position as keyof typeof leftPositions],
            width,
            height: h,
          },
        };
      });
    };

    return [
      ...generateSections(sectionConfig.cocinas, "/cocinas", "cocinas"),
      ...generateSections(
        sectionConfig.enfriadores,
        "/enfriadores",
        "enfriadores",
      ),
    ];
  }, [t]);

  const getEquipoData = (section: Section): Equipo | undefined => {
    const tipoEquipo =
      section.path.slice(1) === "cocinas" ? "COCINA" : "ENFRIADOR";

    if (tipoEquipo === "COCINA") {
      const cocina = cocinas.find((c) => c.info.id === section.id);

      if (cocina) {
        return {
          tipo: "COCINA",
          id: cocina.info.id,
          estado: cocina.info.estado,
          tempAguaActual: cocina.info.temp_agua,
          receta: cocina.info.receta,
          tiempoTranscurrido: cocina.info.tiempoTranscurrido,
        };
      }
    } else {
      const enfriador = enfriadores.find((e) => e.info.id === section.id);

      if (enfriador) {
        return {
          tipo: "ENFRIADOR",
          id: enfriador.info.id,
          estado: enfriador.info.estado,
          tempAguaActual: enfriador.info.temp_agua,
          receta: enfriador.info.receta,
          tiempoTranscurrido: enfriador.info.tiempoTranscurrido,
        };
      }
    }

    return {
      tipo: tipoEquipo,
      id: section.id,
      estado: "INACTIVO",
      tempAguaActual: 0,
      receta: "-",
      tiempoTranscurrido: "00:00",
    };
  };

  return (
    <div className="w-full h-full relative flex flex-col">
      <div className="flex flex-col justify-center items-center">
        <h1 className="text-4xl text-texto font-semibold">
          {t("mayus.cocinasEnfriadores")}
        </h1>
        <p className="text-xl text-texto">{t("mayus.paneoGeneral")}</p>
      </div>

      <div className="relative w-full grow">
        <Image
          alt="Cocinas y Enfriadores"
          className="w-full h-full object-contain z-1"
          src="/cocinasEnfriadores.png"
          fill
          unoptimized
        />

        {sections.map((section) => {
          const equipo = getEquipoData(section);
          const tipoEquipo =
            section.path.slice(1) === "cocinas" ? "cocina" : "enfriador";

          const equipoNum = section.id;
          const href = `${section.path}?id=${equipoNum}`;
          const recuadroStyle: React.CSSProperties = {
            ...section.style,
            backgroundColor: equipo ? getEstadoColor(equipo.estado) : "black",
          };
          const lineaEquipo = section.line;

          return (
            <Link
              key={section.id}
              className="z-999"
              href={href}
              onClick={() => {
                if (tipoEquipo === "cocina") {
                  localStorage.setItem("lastCocinaId", String(section.id));
                } else {
                  localStorage.setItem("lastEnfriadorId", String(section.id));
                }
              }}
            >
              <Tooltip>
                <TooltipTrigger asChild>
                  <span
                    className={`absolute shadow border z-999 rounded-md p-0.5 flex flex-col justify-between ${
                      equipo?.estado === "FALLA"
                        ? "bg-red"
                        : equipo?.estado === "PAUSA"
                          ? "bg-yellow"
                          : equipo?.estado === "INACTIVO"
                            ? "bg-gray"
                            : equipo?.estado === "FINALIZADO"
                              ? "bg-blue"
                              : "bg-green"
                    }`}
                    style={{
                      ...recuadroStyle,
                      color: "white",
                      fontFamily: "sans-serif",
                      textShadow: "1px 1px 2px rgba(0,0,0,0.8)",
                    }}
                  >
                    {equipo && (
                      <div className="w-full">
                        <div className="flex flex-col mb-px ml-0.5">
                          <p
                            className="font-extrabold uppercase"
                            style={{
                              fontSize: "calc(0.9vw + 0.6vh)",
                              textShadow: "1px 1px 2px black",
                            }}
                          >
                            {section.name}
                          </p>
                          <p
                            className="font-semibold uppercase"
                            style={{
                              fontSize: "calc(0.7vw + 0.5vh)",
                            }}
                          >
                            {t("mayus.linea")} {lineaEquipo}
                          </p>
                          <p
                            className="font-extrabold uppercase"
                            style={{
                              fontSize: "calc(0.4vw + 0.5vh)",
                              textShadow: "1px 1px 2px black",
                            }}
                          >
                            {equipo.estado}
                          </p>
                        </div>
                        <div
                          className="mt-2"
                          style={{
                            marginTop:
                              equipo.receta && equipo.receta.length > 7
                                ? "14px"
                                : "8px",
                          }}
                        >
                          <p
                            className="font-bold"
                            style={{
                              fontSize: "calc(0.7vw + 0.4vh)",
                              textShadow: "1px 1px 2px black",
                            }}
                          >
                            {t("min.tempAgua")}:{" "}
                            {formatearTemperatura(equipo.tempAguaActual)}
                          </p>
                          <p
                            className="font-bold mt-px"
                            style={{
                              fontSize: "calc(0.7vw + 0.4vh)",
                              textShadow: "1px 1px 2px black",
                              lineHeight: "1",
                            }}
                          >
                            {t("min.receta")}: {equipo.receta ?? "-"}
                          </p>
                          <p
                            className="font-bold mt-px"
                            style={{
                              fontSize: "calc(0.7vw + 0.4vh)",
                              textShadow: "1px 1px 2px black",
                            }}
                          >
                            {t("min.tiempo")}: {equipo.tiempoTranscurrido}
                          </p>
                        </div>
                      </div>
                    )}
                  </span>
                </TooltipTrigger>
                <TooltipContent side="top">
                  {t(`min.${tipoEquipo}`, {
                    number:
                      tipoEquipo === "cocina" ? section.id : section.id - 6,
                    line: lineaEquipo,
                  })}
                </TooltipContent>
              </Tooltip>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
