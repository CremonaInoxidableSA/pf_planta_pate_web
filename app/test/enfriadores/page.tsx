"use client";

import { useEnfriadorContext } from "@/context/EnfriadorContext";

export default function TestPage() {
  const { enfriadores, isLoading } = useEnfriadorContext();

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
      {enfriadores && (
        <pre className="bg-black p-1 rounded">
          {JSON.stringify(enfriadores, null, 2)}
        </pre>
      )}
    </div>
  );
}
