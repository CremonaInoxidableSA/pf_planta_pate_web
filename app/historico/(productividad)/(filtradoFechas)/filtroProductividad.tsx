"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import type { DateRange } from "react-day-picker";
import { format } from "date-fns";
import DateRangePicker from "@/components/selectores/dateRangePicker";
import BotonAplicar from "@/app/historico/(productividad)/(filtradoFechas)/botonAplicar";
import SelectorEquiposProductividad, {
  type EquipoProductividadId,
} from "./selectorLineas";
import { authFetch } from "@/app/api/api";

// Tipo para los datos de productividad que devuelve la API
export interface ProductividadData {
  ciclos_realizados: number;
  produccion_total: number;
  ciclos_correctos: number;
  ciclos_incorrectos: number;
  productos_realizados: Array<{
    nombre_receta: string;
    capacidad_receta: number;
    cantidad_ciclos: number;
  }>;
}

interface FiltroProductividadProps {
  onDataLoaded?: (data: ProductividadData) => void;
  onLoading?: (loading: boolean) => void;
  onError?: (error: string | null) => void;
}

const FiltroProductividad: React.FC<FiltroProductividadProps> = ({
  onDataLoaded,
  onLoading,
  onError,
}) => {
  const { t } = useTranslation();
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [equipoSeleccionado, setEquipoSeleccionado] =
    useState<EquipoProductividadId>(0);
  const [isLoading, setIsLoading] = useState(false);

  const handleApply = async () => {
    if (!dateRange?.from || !dateRange?.to) return;

    const fechaInicio = format(dateRange.from, "yyyy-MM-dd");
    const fechaFin = format(dateRange.to, "yyyy-MM-dd");

    setIsLoading(true);
    onLoading?.(true);
    onError?.(null);

    try {
      const response = await authFetch(
        `/api/historico-productividad/${equipoSeleccionado}/${fechaInicio}/${fechaFin}`,
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al obtener datos");
      }

      const data: ProductividadData = await response.json();
      onDataLoaded?.(data);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Error desconocido";
      onError?.(errorMessage);
      console.error("Error fetching productividad:", error);
    } finally {
      setIsLoading(false);
      onLoading?.(false);
    }
  };

  return (
    <div className="w-[20%] h-full flex flex-col justify-evenly gap-3">
      <h1 className="w-full text-center text-3xl">{t("min.filtroFechas")}</h1>
      <SelectorEquiposProductividad
        value={equipoSeleccionado}
        onChange={setEquipoSeleccionado}
      />
      <div className="w-full flex flex-row items-center justify-between gap-3">
        <DateRangePicker
          className="w-[80%] h-full bg-background3 cursor-pointer"
          value={dateRange}
          onChange={setDateRange}
        />
        <BotonAplicar
          selectClasses={`cursor-pointer ${isLoading ? "opacity-50" : ""}`}
          onClick={handleApply}
          disabled={isLoading || !dateRange?.from || !dateRange?.to}
        />
      </div>
    </div>
  );
};

export default FiltroProductividad;
