"use client";

import { useState, useEffect } from "react";
import { startOfWeek, endOfWeek } from "date-fns";
import { useTranslation } from "react-i18next";
import type { DateRange } from "react-day-picker";
import { format } from "date-fns";
import DateRangePicker from "@/components/selectores/dateRangePicker";
import BotonAplicar from "@/app/historico/(productividad)/(filtradoFechas)/botonAplicar";
import SelectorEquiposProductividad, {
  type EquipoProductividadId,
} from "./selectorLineas";
import { authFetch } from "@/app/api/api";

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
  onFilterChange?: (filter: {
    equipoId: number;
    dateRange: DateRange | undefined;
  }) => void;
}

const FiltroProductividad: React.FC<FiltroProductividadProps> = ({
  onDataLoaded,
  onLoading,
  onError,
  onFilterChange,
}) => {
  const { t } = useTranslation();
  const today = new Date();
  const defaultWeekRange = {
    from: startOfWeek(today, { weekStartsOn: 0 }),
    to: endOfWeek(today, { weekStartsOn: 0 }),
  };
  const [dateRange, setDateRange] = useState<DateRange | undefined>(
    defaultWeekRange,
  );
  const [equipoSeleccionado, setEquipoSeleccionado] =
    useState<EquipoProductividadId>(0);
  useEffect(() => {
    if (dateRange?.from && dateRange?.to && equipoSeleccionado !== undefined) {
      handleApply();
    }
  }, []);

  const notifyFilterChange = (
    newEquipoId: number,
    newDateRange: DateRange | undefined,
  ) => {
    onFilterChange?.({ equipoId: newEquipoId, dateRange: newDateRange });
  };
  const [isLoading, setIsLoading] = useState(false);

  const handleApply = async () => {
    if (!dateRange?.from || !dateRange?.to) return;

    notifyFilterChange(equipoSeleccionado, dateRange);

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
        onChange={(val) => {
          setEquipoSeleccionado(val);
          notifyFilterChange(val, dateRange);
        }}
      />
      <DateRangePicker
        className="w-full bg-background3 cursor-pointer"
        value={dateRange}
        onChange={(range) => {
          setDateRange(range);
          notifyFilterChange(equipoSeleccionado, range);
        }}
      />
      <BotonAplicar
        selectClasses={`cursor-pointer ${isLoading ? "opacity-50" : ""}`}
        onClick={handleApply}
        disabled={isLoading || !dateRange?.from || !dateRange?.to}
      />
    </div>
  );
};

export default FiltroProductividad;
