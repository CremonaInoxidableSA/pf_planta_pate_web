"use client";

import { useState, useCallback } from "react";
import { format } from "date-fns";
import { useTranslation } from "react-i18next";
import BarraProductos from "./barraProductos";
import FiltroFechas, {
  type ProductividadData,
} from "./(filtradoFechas)/filtroProductividad";
import BarraCiclos from "./barraCiclos";

import type { DateRange } from "react-day-picker";

interface ProductividadProps {
  onDataLoaded?: (data: ProductividadData | null) => void;
  onProductividadFilterChange?: (filter: {
    equipoId: number;
    dateRange: DateRange | undefined;
  }) => void;
  productividadFilter?: {
    equipoId: number;
    dateRange: DateRange | undefined;
  };
}

const Productividad = ({
  onDataLoaded,
  onProductividadFilterChange,
  productividadFilter,
}: ProductividadProps) => {
  const { t } = useTranslation();
  const [data, setData] = useState<ProductividadData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDataLoaded = useCallback(
    (d: ProductividadData) => {
      setData(d);
      onDataLoaded?.(d);
    },
    [onDataLoaded],
  );

  return (
    <div className="bg-background2 rounded-md p-5 w-full gap-5 flex items-center justify-between">
      <div className="w-[80%] flex flex-col justify-center">
        <h1 className="text-2xl">{t("mayus.productividad")}</h1>
        {typeof productividadFilter?.dateRange?.from !== "undefined" &&
          typeof productividadFilter?.dateRange?.to !== "undefined" && (
            <span className="text-base text-texto/70 mb-1">
              {t("min.rangoSeleccionado")}:{" "}
              {productividadFilter.dateRange.from &&
              productividadFilter.dateRange.to
                ? `${format(productividadFilter.dateRange.from, "dd/MM/yyyy")} - ${format(productividadFilter.dateRange.to, "dd/MM/yyyy")}`
                : ""}
            </span>
          )}
        <p className="text-sm text-orange">
          {isLoading
            ? t("min.cargando")
            : error
              ? error
              : data
                ? `${data.ciclos_realizados} ciclos - ${data.produccion_total} Tn`
                : t("min.seleccionarRango")}
        </p>
        <div className="w-full flex justify-evenly">
          <span className="flex flex-col items-center gap-1">
            <p className="text-4xl text-texto">
              {data?.ciclos_realizados ?? "-"}
            </p>
            <p className="text-xl text-texto">{t("min.ciclosTotales")}</p>
          </span>
          <span className="flex flex-col items-center gap-1">
            <p className="text-4xl text-texto">
              {data ? `${data.produccion_total} Tn` : "-"}
            </p>
            <p className="text-xl text-texto">{t("min.produccionTotal")}</p>
          </span>
        </div>
        <hr className="w-full border-3 rounded-2xl my-4" />
        <BarraProductos productos={data?.productos_realizados ?? []} />
        <hr className="w-full border-3 rounded-2xl my-4" />
        <BarraCiclos
          ciclos_correctos={data?.ciclos_correctos ?? 0}
          ciclos_incorrectos={data?.ciclos_incorrectos ?? 0}
        />
      </div>
      <hr className="h-full border-3 rounded-2xl" />
      <FiltroFechas
        onDataLoaded={handleDataLoaded}
        onLoading={setIsLoading}
        onError={setError}
        onFilterChange={onProductividadFilterChange}
      />
    </div>
  );
};

export default Productividad;
