import { useTranslation } from "react-i18next";

const BarraProductos = () => {
  const { t } = useTranslation();
  return (
    <div className="w-[20%] h-full flex flex-col">
      <h1 className="w-full text-center text-3xl">{t("mayus.filtroFechas")}</h1>
      <div className="w-full flex flex-row justify-center">
        
      </div>
    </div>
  );
};

export default BarraProductos;
