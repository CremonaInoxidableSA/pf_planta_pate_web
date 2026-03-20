"use client";

import React, { createContext, useContext } from "react";

import { useWebSocketContext } from "./WebSocketContext";

interface CocinaInfo {
  tipo: string;
  id: number;
  estado: string;
  temp_agua: number;
  temp_prod: number;
  temp_ingreso: number;
  temp_chiller: number;
  niv_agua: number;
  receta: string;
  receta_paso_actual: number;
  tiempoTranscurrido: string;
}

interface CocinaDetalles {
  num_cocina: number;
  num_receta: number;
  nom_receta: string;
  cant_torres: number;
  tipo_fin: string;
  sector_io: SectorIO[];
  historial: any[];
}

interface SectorIO {
  filtro_succion_agua: boolean;
  entrada_agua: boolean;
  bomba_recirculacion: boolean;
  vapor_serpentina: boolean;
  vapor_serpentina_acc: boolean;
  vapor_vivo: boolean;
  vapor_vivo_acc: boolean;
  tapa_estado: boolean;
  tapa_estado_acc: string;
}

export interface CocinaCompleta {
  info: CocinaInfo;
  detalles: CocinaDetalles;
}

interface CocinaContextType {
  cocinas: CocinaCompleta[];
  isLoading: boolean;
  error: string | null;
}

const CocinaContext = createContext<CocinaContextType | undefined>(undefined);

export const CocinaProvider = ({ children }: { children: React.ReactNode }) => {
  const { data, isConnected, error } = useWebSocketContext();

  const cocinas =
    data?.["datos-cocinas"]?.map((item: any[]) => ({
      info: item[0],
      detalles: item[1],
    })) || [];

  return (
    <CocinaContext.Provider
      value={{
        cocinas,
        isLoading: !isConnected,
        error,
      }}
    >
      {children}
    </CocinaContext.Provider>
  );
};

export function useCocinaContext() {
  const context = useContext(CocinaContext);

  if (!context) {
    throw new Error(
      "useCocinaContext debe ser usado dentro de un CocinaProvider",
    );
  }

  return context;
}
