"use client";

import React, { createContext, useContext } from "react";

import useWebSocket from "@/services/websocket";

interface WebSocketContextType {
  data: any;
  isConnected: boolean;
  error: string | null;
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(
  undefined,
);

export const WebSocketProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { data, isConnected, error } = useWebSocket("datos-generales");

  // Proporcionar un valor inicial seguro
  const value = {
    data: data || { "datos-cocinas": [], "datos-enfriadores": [] },
    isConnected,
    error,
  };

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
};

export function useWebSocketContext() {
  const context = useContext(WebSocketContext);

  if (!context) {
    throw new Error(
      "useWebSocketContext debe ser usado dentro de un WebSocketProvider",
    );
  }

  return context;
}
