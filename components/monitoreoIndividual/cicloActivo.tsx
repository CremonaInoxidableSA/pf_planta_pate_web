import React from "react";
import { useTranslation } from "react-i18next";

import { getColorClass } from "@/utils/logicaColores";

interface CicloActivoProps {
  datosCiclo: { label: string; value: string | number | null }[];
  displayData: (
    data: string | number | null | boolean,
  ) => string | number | boolean;
  defaultColor: "orange" | "blue" | "lightRed";
}

const CicloActivo: React.FC<CicloActivoProps> = ({
  datosCiclo,
  displayData,
  defaultColor,
}) => {
  const { t } = useTranslation();

  return (
    <>
      <h2 className="text-xl text-white">{t("cicloActivo.titulo")}</h2>
      <ul className="flex flex-col justify-between grow gap-[1vh]">
        {datosCiclo.map((dato) => (
          <li
            key={dato.label}
            className="bg-grey flex flex-col px-[20px] py-[1vh] rounded-md"
          >
            <p className="text-[calc(0.6vw+1vh)] text-white">{dato.label}</p>
            <p
              className={`text-[calc(0.5vw+1vh)] ${getColorClass(dato.label, dato.value, defaultColor)}`}
            >
              {displayData(dato.value)}
            </p>
          </li>
        ))}
      </ul>
    </>
  );
};

export default CicloActivo;
