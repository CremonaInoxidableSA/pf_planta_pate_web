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

// Exportar el tipo LineaId
export type LineaId = 1 | 2;

// Interfaces existentes con tipos corregidos
interface LineaData {
  cocinas: Array<[InfoEquipo, DetallesEquipo]>;
  enfriadores: Array<[InfoEquipo, DetallesEquipo]>;
}

// Modificar LineasState para usar Record
interface LineasState extends Record<LineaId, LineaData> {}

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
      const datosCocinas = data["datos-cocinas"] || [];
      const datosEnfriadores = data["datos-enfriadores"] || [];

      // Organizar datos por líneas
      const linea1 = {
        cocinas: datosCocinas.filter(([info]: [InfoEquipo, any]) =>
          [1, 2, 3].includes(info.id),
        ),
        enfriadores: datosEnfriadores.filter(([info]: [InfoEquipo, any]) =>
          [7, 8, 9, 10].includes(info.id),
        ),
      };

      const linea2 = {
        cocinas: datosCocinas.filter(([info]: [InfoEquipo, any]) =>
          [4, 5, 6].includes(info.id),
        ),
        enfriadores: datosEnfriadores.filter(([info]: [InfoEquipo, any]) =>
          [11, 12, 13, 14].includes(info.id),
        ),
      };

      setLineasData({
        1: linea1,
        2: linea2,
      });
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
