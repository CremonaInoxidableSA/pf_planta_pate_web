"use client";

import { useState, useEffect, useCallback } from "react";
import { startOfWeek, endOfWeek } from "date-fns";
import { useTranslation } from "react-i18next";
import type { DateRange } from "react-day-picker";
import { format } from "date-fns";
import DateRangePicker from "@/components/selectores/dateRangePicker";
import SelectorEquiposProductividad, {
  type EquipoProductividadId,
} from "./selectorLineas";
import { authFetch } from "@/app/api/api";
import { Button } from "@/components/ui/button";

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

  const notifyFilterChange = useCallback(
    (newEquipoId: number, newDateRange: DateRange | undefined) => {
      onFilterChange?.({ equipoId: newEquipoId, dateRange: newDateRange });
    },
    [onFilterChange],
  );

  useEffect(() => {
    if (!dateRange?.from || !dateRange?.to || equipoSeleccionado === undefined)
      return;

    const controller = new AbortController();

    notifyFilterChange(equipoSeleccionado, dateRange);

    const fechaInicio = format(dateRange.from, "yyyy-MM-dd");
    const fechaFin = format(dateRange.to, "yyyy-MM-dd");

    onLoading?.(true);
    onError?.(null);

    authFetch(
      `/api/historico-productividad/${equipoSeleccionado}/${fechaInicio}/${fechaFin}`,
      { signal: controller.signal },
    )
      .then(async (response) => {
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Error al obtener datos");
        }
        const data: ProductividadData = await response.json();
        onDataLoaded?.(data);
      })
      .catch((error) => {
        if (error instanceof DOMException && error.name === "AbortError")
          return;
        const errorMessage =
          error instanceof Error ? error.message : "Error desconocido";
        onError?.(errorMessage);
      })
      .finally(() => {
        onLoading?.(false);
      });

    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    dateRange?.from?.getTime(),
    dateRange?.to?.getTime(),
    equipoSeleccionado,
  ]);

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
      <Button 
        onClick={() => {
          
        }}
      />
    </div>
  );
};

export default FiltroProductividad;
