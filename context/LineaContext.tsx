"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

import { useWebSocketContext } from "@/context/WebSocketContext";

interface InfoEquipo {
  tipo: "COCINA" | "ENFRIADOR";
  id: number;
  estado:
    | "ACTIVO"
    | "INACTIVO"
    | "FALLA"
    | "OPERATIVO"
    | "FINALIZADO"
    | "PRE OPERATIVO"
    | "PRE OPERATIVO";
  temp_agua: number;
  temp_prod: number;
  temp_ingreso: number;
  temp_chiller: number;
  niv_agua: number;
  receta: string;
  receta_paso_actual: number;
  tiempoTranscurrido: number;
  num_cocina?: number;
  num_enfriador?: number;
}

interface DetallesEquipo {
  historial: Array<{
    id_historial: number;
    tiempo: number;
    temp_agua: number;
    temp_ingreso: number;
    estado: string;
  }>;
}

export type LineaId = 1 | 2;

interface LineaData {
  cocinas: Array<[InfoEquipo, DetallesEquipo]>;
  enfriadores: Array<[InfoEquipo, DetallesEquipo]>;
}

type LineasState = Record<LineaId, LineaData>;

interface LineaContextType {
  lineaSeleccionada: LineaId;
  setLineaSeleccionada: (id: LineaId) => void;
  lineasData: LineasState | null;
}

const LineaContext = createContext<LineaContextType | undefined>(undefined);

export const LineaProvider = ({ children }: { children: React.ReactNode }) => {
  const [lineaSeleccionada, setLineaSeleccionada] = useState<LineaId>(1);
  const [lineasData, setLineasData] = useState<LineasState | null>(null);
  const { data } = useWebSocketContext();

  useEffect(() => {
    if (data) {
      const datosCocinas =
        (data["datos-cocinas"] as [InfoEquipo, DetallesEquipo][] | undefined) ||
        [];
      const datosEnfriadores =
        (data["datos-enfriadores"] as
          | [InfoEquipo, DetallesEquipo][]
          | undefined) || [];

      const linea1 = {
        cocinas: datosCocinas.filter(([info]) => [1, 2, 3].includes(info.id)),
        enfriadores: datosEnfriadores.filter(([info]) =>
          [7, 8, 9, 10].includes(info.id),
        ),
      };

      const linea2 = {
        cocinas: datosCocinas.filter(([info]) => [4, 5, 6].includes(info.id)),
        enfriadores: datosEnfriadores.filter(([info]) =>
          [11, 12, 13, 14].includes(info.id),
        ),
      };

      const timer = setTimeout(() => {
        setLineasData({
          1: linea1,
          2: linea2,
        });
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [data]);

  return (
    <LineaContext.Provider
      value={{
        lineaSeleccionada,
        setLineaSeleccionada,
        lineasData,
      }}
    >
      {children}
    </LineaContext.Provider>
  );
};

export const useLinea = () => {
  const context = useContext(LineaContext);

  if (!context) {
    throw new Error("useLinea debe ser usado dentro de un LineaProvider");
  }

  return context;
};
