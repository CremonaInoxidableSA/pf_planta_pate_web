"use client";

import { useEffect, useState, useRef, useCallback } from "react";

import { WS_CONFIG } from "@/config/websocket";

export default function useWebSocket(pollId: string) {
  const [data, setData] = useState<Record<string, unknown> | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const socketRef = useRef<WebSocket | null>(null);
  const retryCountRef = useRef(0);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const connectRef = useRef<(() => void) | null>(null);

  const connect = useCallback(() => {
    try {
      if (socketRef.current?.readyState === WebSocket.OPEN) {
        return;
      }

      const wsUrl = `ws://${WS_CONFIG.HOST}:${WS_CONFIG.PORT}/ws/${pollId}`;
      const socket = new WebSocket(wsUrl);

      socketRef.current = socket;

      socket.onopen = () => {
        setIsConnected(true);
        setError(null);
        retryCountRef.current = 0;
      };

      socket.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);

          setData(message);
        } catch {
          setError("Error al procesar el mensaje recibido");
        }
      };

      socket.onclose = () => {
        setIsConnected(false);

        if (retryCountRef.current < WS_CONFIG.MAX_RETRIES) {
          reconnectTimeoutRef.current = setTimeout(() => {
            retryCountRef.current += 1;
            connectRef.current?.();
          }, WS_CONFIG.RETRY_DELAY);
        } else {
          setError(
            `Se alcanzó el límite de reconexiones (${WS_CONFIG.MAX_RETRIES})`,
          );
        }
      };

      socket.onerror = () => {
        setError("Error en la conexión WebSocket");
        socket.close();
      };
    } catch {
      setError("Error al crear la conexión WebSocket");
      setIsConnected(false);
    }
  }, [pollId]);

  useEffect(() => {
    connectRef.current = connect;
    const connectTimer = setTimeout(connect, 0);

    return () => {
      clearTimeout(connectTimer);
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, [connect]);

  return { data, isConnected, error };
}
