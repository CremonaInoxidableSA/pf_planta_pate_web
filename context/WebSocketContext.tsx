"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

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
  const [data, setData] = useState<Record<string, unknown[][]> | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const es = new EventSource("/api/datos-generales");

    es.addEventListener("connected", (e) => {
      const connected = (e as MessageEvent).data === "true";
      setIsConnected(connected);
      if (connected) setError(null);
    });

    es.addEventListener("message", (e) => {
      try {
        const parsed = JSON.parse((e as MessageEvent).data) as Record<
          string,
          unknown[][]
        >;
        setData(parsed);
      } catch {
        setError("Error al procesar los datos recibidos");
      }
    });

    es.addEventListener("ws-error", (e) => {
      try {
        setError(JSON.parse((e as MessageEvent).data) as string);
      } catch {
        setError("Error en la conexión con el servidor");
      }
      setIsConnected(false);
    });

    es.onerror = () => {
      setIsConnected(false);
    };

    return () => {
      es.close();
    };
  }, []);

  return (
    <WebSocketContext.Provider value={{ data, isConnected, error }}>
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
