"use client";

import React, { createContext, useContext } from "react";

import { useWebSocketContext } from "./WebSocketContext";

interface EnfriadorInfo {
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

interface EnfriadorDetalles {
  num_enfriador: number;
  num_receta: number;
  nom_receta: string;
  cant_torres: number;
  tipo_fin: string;
  sector_io: SectorIO[];
  historial: unknown[];
}

interface SectorIO {
  filtro_succion_agua: boolean;
  entrada_agua: boolean;
  bomba_recirculacion: boolean;
  valvula_amoniaco: boolean;
  vapor_serpentina_acc: boolean;
  vapor_vivo_lim: boolean;
  vapor_vivo_lim_acc: boolean;
  tapa_estado: boolean;
  tapa_estado_acc: string;
}

export interface EnfriadorCompleto {
  info: EnfriadorInfo;
  detalles: EnfriadorDetalles;
}

interface EnfriadorContextType {
  enfriadores: EnfriadorCompleto[];
  isLoading: boolean;
  error: string | null;
}

const EnfriadorContext = createContext<EnfriadorContextType | undefined>(
  undefined,
);

export const EnfriadorProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { data, isConnected, error } = useWebSocketContext();

  const enfriadores =
    (
      data?.["datos-enfriadores"] as
        | [EnfriadorInfo, EnfriadorDetalles][]
        | undefined
    )?.map((item) => ({
      info: item[0],
      detalles: item[1],
    })) || [];

  return (
    <EnfriadorContext.Provider
      value={{
        enfriadores,
        isLoading: !isConnected,
        error,
      }}
    >
      {children}
    </EnfriadorContext.Provider>
  );
};

export function useEnfriadorContext() {
  const context = useContext(EnfriadorContext);

  if (!context) {
    throw new Error(
      "useEnfriadorContext debe ser usado dentro de un EnfriadorProvider",
    );
  }

  return context;
}
