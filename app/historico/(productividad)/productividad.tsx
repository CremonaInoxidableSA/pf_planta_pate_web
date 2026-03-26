import { useTranslation } from "react-i18next";
import BarraProductos from "./barraProductos";
import FiltroFechas from "./(filtradoFechas)/filtroProductividad";

const Productividad = () => {
  const { t } = useTranslation();
  return (
    <div className="bg-background2 rounded-md p-5 w-full gap-5 flex items-center justify-between text-texto">
      <div className="w-[80%] flex flex-col justify-center">
        <h1 className="text-2xl">{t("mayus.productividad")}</h1>
        <p className="text-sm text-orange">fechas</p>
        <div className="w-full flex justify-evenly">
          <span className="flex flex-col items-center gap-1">
            <p className="text-4xl text-texto">Valor Int Tn</p>
            <p className="text-xl text-texto">{t("min.ciclosTotales")}</p>
          </span>
          <span className="flex flex-col items-center gap-1">
            <p className="text-4xl text-texto">Valor Int Tn</p>
            <p className="text-xl text-texto">{t("min.produccionTotal")}</p>
          </span>
        </div>
        <hr className="w-full border-3 rounded-2xl my-4" />
        <BarraProductos />
        <hr className="w-full border-3 rounded-2xl my-4" />
      </div>
      <hr className="h-full border-3 rounded-2xl" />
      <FiltroFechas />
    </div>
  );
};

export default Productividad;
