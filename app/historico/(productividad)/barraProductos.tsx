import { useTranslation } from "react-i18next";

const BarraProductos = () => {
  const { t } = useTranslation();
  return (
    <div className="w-full gap-5 flex items-center justify-between text-texto">
      <h1 className="whitespace-nowrap">% {t("mayus.productoRealizado")}</h1>
      <div className="w-full flex flex-row justify-center"></div>
      <hr className="h-5 border-3 rounded-2xl" />
      <h1>{t("min.total")}</h1>
    </div>
  );
};

export default BarraProductos;
