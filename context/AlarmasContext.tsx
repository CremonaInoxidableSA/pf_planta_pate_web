"use client";
import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

export type Alarma = {
  id: number;
  nombre: string;
  tipoAlarma: string;
  descripcion: string;
  fechaRegistro: string;
  valor: boolean;
};

export type AlarmasWS = {
  alarmas_l1: Alarma[];
  alarmas_l2: Alarma[];
};

interface AlarmasContextType {
  alarmas: AlarmasWS;
  loading: boolean;
  error: string | null;
}

const AlarmasContext = createContext<AlarmasContextType | undefined>(undefined);

export const useAlarmas = () => {
  const ctx = useContext(AlarmasContext);
  if (!ctx) throw new Error("useAlarmas debe usarse dentro de AlarmasProvider");
  return ctx;
};

export const AlarmasProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [alarmas, setAlarmas] = useState<AlarmasWS>({
    alarmas_l1: [],
    alarmas_l2: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    const es = new EventSource("/api/alarmasWS");
    eventSourceRef.current = es;

    es.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        setAlarmas(data);
        setLoading(false);
      } catch {
        setError("Error al parsear datos de alarmas");
      }
    };
    es.onerror = () => {
      setError("Error de conexión con el servidor de alarmas");
      setLoading(false);
    };
    return () => {
      es.close();
    };
  }, []);

  return (
    <AlarmasContext.Provider value={{ alarmas, loading, error }}>
      {children}
    </AlarmasContext.Provider>
  );
};
