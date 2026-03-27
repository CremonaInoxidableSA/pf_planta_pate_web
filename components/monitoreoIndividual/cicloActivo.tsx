import React from "react";
import { useTranslation } from "react-i18next";

interface CicloActivoProps {
  datosCiclo: { label: string; value: string | number | null }[];
  displayData: (
    data: string | number | null | boolean,
  ) => string | number | boolean;
  defaultColor?: "orange" | "blue" | "lightRed";
}

const CicloActivo: React.FC<CicloActivoProps> = ({
  datosCiclo,
  displayData,
  defaultColor,
}) => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col bg-background2 p-5 rounded-md gap-2.5 w-1/2">
      <h2 className="text-xl text-texto w-full">{t("mayus.cicloActivo")}</h2>
      <ul className="flex flex-col justify-between grow gap-2.5">
        {datosCiclo.map((dato) => (
          <li
            key={dato.label}
            className="bg-background3 flex flex-col px-5 py-2.5 rounded-md"
          >
            <p className="text-lg text-texto">{dato.label}</p>
            <p className="text-lg text-texto">{displayData(dato.value)}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CicloActivo;
