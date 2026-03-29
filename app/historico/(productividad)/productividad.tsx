"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import BarraProductos from "./barraProductos";
import FiltroFechas, {
  type ProductividadData,
} from "./(filtradoFechas)/filtroProductividad";

const Productividad = () => {
  const { t } = useTranslation();
  const [data, setData] = useState<ProductividadData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="bg-background2 rounded-md p-5 w-full gap-5 flex items-center justify-between text-texto">
      <div className="w-[80%] flex flex-col justify-center">
        <h1 className="text-2xl">{t("mayus.productividad")}</h1>
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
      </div>
      <hr className="h-full border-3 rounded-2xl" />
      <FiltroFechas
        onDataLoaded={setData}
        onLoading={setIsLoading}
        onError={setError}
      />
    </div>
  );
};

export default Productividad;
