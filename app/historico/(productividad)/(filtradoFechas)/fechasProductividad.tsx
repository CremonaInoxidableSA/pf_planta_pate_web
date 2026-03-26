import { useTranslation } from "react-i18next";

const BarraProductos = () => {
  const { t } = useTranslation();
  return (
    <div className="w-[20%] h-full flex flex-col">
      <div className="w-full flex flex-row justify-center"></div>
    </div>
  );
};

export default BarraProductos;
