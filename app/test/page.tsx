"use client";

import { useWebSocketContext } from "@/context/WebSocketContext";

export default function TestPage() {
  const { data, isConnected } = useWebSocketContext();

  return (
    <div className="p-[4px]">
      <h1 className="text-2xl mb-[4px]">Prueba WebSocket</h1>
      <div className="mb-[4px]">
        Estado:{" "}
        {isConnected ? (
          <span className="text-green">Conectado</span>
        ) : (
          <span className="text-red">Desconectado</span>
        )}
      </div>
      {data && (
        <pre className="bg-black p-[4px] rounded">
          {JSON.stringify(data, null, 2)}
        </pre>
      )}
    </div>
  );
}
