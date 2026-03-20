"use client";

import { useCocinaContext } from "@/context/CocinaContext";

export default function TestPage() {
  const { cocinas, isLoading } = useCocinaContext();

  return (
    <div className="p-1">
      <h1 className="text-2xl mb-1">Prueba WebSocket</h1>
      <div className="mb-1">
        Estado:{" "}
        {isLoading ? (
          <span className="text-green">Conectado</span>
        ) : (
          <span className="text-red">Desconectado</span>
        )}
      </div>
      {cocinas && (
        <pre className="bg-black1 p-1 rounded">
          {JSON.stringify(cocinas, null, 2)}
        </pre>
      )}
    </div>
  );
}
