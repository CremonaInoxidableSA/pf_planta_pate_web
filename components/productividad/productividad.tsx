"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";

import Metrics from "./metrica";
import BarraProductos from "./barraProductos";
import BarraCiclos from "./barraCiclos";
import FiltroPeriodo from "./filtroPeriodo";

interface ProductoRealizado {
  NombreProducto: string;
  pesoTotal: number;
  cantidadCiclos: number;
  tiempoTotal: number;
}

interface FixedData {
  ciclosRealizados: number;
  ciclosCorrectos: number;
  ciclosIncorrectos: number;
  produccionTotal: number;
  ProductosRealizados: ProductoRealizado[];
}

interface DateRange {
  start: string;
  end: string;
}

interface ApiResponse {
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

interface FilterData {
  startDate: string | null;
  endDate: string | null;
  lineaId: number;
  equipoId: number;
  dato_enviado?: number;
  isUserInitiated?: boolean;
}

const Productividad = () => {
  const today = new Date().toISOString().split("T")[0];
  const lastWeek = new Date();

  lastWeek.setDate(lastWeek.getDate() - 7);
  const lastWeekFormatted = lastWeek.toISOString().split("T")[0];
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  const [data, setData] = useState<FixedData>({
    ciclosRealizados: 0,
    ciclosCorrectos: 0,
    ciclosIncorrectos: 0,
    produccionTotal: 0,
    ProductosRealizados: [],
  });
  const [dateRange, setDateRange] = useState<DateRange>({
    start: lastWeekFormatted,
    end: today,
  });

  useEffect(() => {
    if (isInitialLoad) {
      handleApplyFilters({
        startDate: lastWeekFormatted,
        endDate: today,
        lineaId: 0,
        equipoId: 30,
        dato_enviado: 0,
        isUserInitiated: false,
      });
      setIsInitialLoad(false);
    }
  }, [isInitialLoad]);

  const handleApplyFilters = async (filterData: FilterData) => {
    if (!filterData.startDate || !filterData.endDate) return;

    try {
      const formattedStartDate = filterData.startDate.split("T")[0];
      const formattedEndDate = filterData.endDate.split("T")[0];
      const dato = filterData.dato_enviado ?? 0; // Usar el operador nullish coalescing para proporcionar un valor por defecto

      const host = process.env.NEXT_PUBLIC_WS_HOST || "localhost";
      const port = process.env.NEXT_PUBLIC_WS_PORT || "8000";

      const url = `http://${host}:${port}/historico-productividad/${dato}?fecha_inicio=${formattedStartDate}&fecha_fin=${formattedEndDate}`;

      const response = await fetch(url);

      const apiData: ApiResponse = await response.json();

      // Check if data is empty or null
      if (
        !apiData ||
        (apiData.ciclos_realizados === 0 &&
          apiData.produccion_total === 0 &&
          apiData.ciclos_correctos === 0 &&
          apiData.ciclos_incorrectos === 0 &&
          (!apiData.productos_realizados ||
            apiData.productos_realizados.length === 0))
      ) {
        // Only show toast error if this is a user-initiated action
        if (filterData.isUserInitiated) {
          toast.error(
            "No existen reportes de productividad en el lapso de las fechas indicadas.",
          );
        }

        return;
      }

      setData({
        ciclosRealizados: apiData.ciclos_realizados,
        ciclosCorrectos: apiData.ciclos_correctos,
        ciclosIncorrectos: apiData.ciclos_incorrectos,
        produccionTotal: apiData.produccion_total,
        ProductosRealizados: apiData.productos_realizados.map((prod) => ({
          NombreProducto: prod.nombre_receta,
          pesoTotal: prod.capacidad_receta,
          cantidadCiclos: prod.cantidad_ciclos,
          tiempoTotal: 0,
        })),
      });

      setDateRange({
        start: formattedStartDate,
        end: formattedEndDate,
      });
    } catch (error) {
      if (error instanceof Error) {
        // Only show toast error if this is a user-initiated action
        if (filterData.isUserInitiated) {
          toast.error("Error al obtener los datos de productividad");
        }
      }
    }
  };

  return (
    <div className="productividad-container flex flex-row h-full gap-[20px]">
      <div className="bg-black p-[20px] w-4/5 rounded-md">
        <Metrics
          ciclosRealizados={data.ciclosRealizados}
          dateRange={dateRange}
          produccionTotal={data.produccionTotal}
        />
        <hr className="my-[20px] border-[2px]" />
        <BarraProductos data={data} />
        <hr className="my-[20px] border-[2px]" />
        <BarraCiclos
          ciclosCorrectos={data.ciclosCorrectos}
          ciclosIncorrectos={data.ciclosIncorrectos}
        />
      </div>
      <div className="bg-black p-[20px] w-1/5 rounded-md pdf-ignore">
        <FiltroPeriodo onApplyFilters={handleApplyFilters} />
      </div>
    </div>
  );
};

export default Productividad;
