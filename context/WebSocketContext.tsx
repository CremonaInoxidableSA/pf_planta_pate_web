"use client";

import React, { createContext, useContext } from "react";

interface WebSocketContextType {
  data: Record<string, unknown[][]> | null;
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
  const value = {
    data: { "datos-cocinas": [], "datos-enfriadores": [] },
    isConnected: false,
    error: null,
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
