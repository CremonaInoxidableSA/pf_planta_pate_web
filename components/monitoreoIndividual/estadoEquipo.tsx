import React from "react";
import { useTranslation } from "react-i18next";

interface EstadoEquipoProps {
  datos: Array<{
    label: string;
    value: string | number;
    unit?: string;
  }>;
  getColorClass: (label: string, value: string | number | null) => string;
  displayData?: (
    value: string | number,
    unit?: string,
  ) => string | number | boolean;
}

const EstadoEquipo: React.FC<EstadoEquipoProps> = ({
  datos,
  getColorClass,
  displayData,
}) => {
  const { t } = useTranslation();

  const formatValue = (value: string | number, unit?: string) => {
    if (displayData) {
      return displayData(value, unit);
    }

    return unit ? `${value} ${unit}` : value;
  };

  return (
    <>
      <h2 className="text-xl text-white w-auto ">{t("estadoEquipo.titulo")}</h2>
      <ul className="flex flex-col justify-between grow gap-[1vh]">
        {datos.map((dato, index) => (
          <li
            key={`${dato.label}-${index}`}
            className="bg-grey flex flex-col px-[20px] py-[1vh] rounded-md"
          >
            <span className="text-[calc(0.6vw+1vh)] text-white">
              {dato.label}:
            </span>
            <span
              className={`text-[calc(0.5vw+1vh)] ${getColorClass(dato.label, dato.value)}`}
            >
              {formatValue(dato.value, dato.unit)}
            </span>
          </li>
        ))}
      </ul>
    </>
  );
};

export default EstadoEquipo;
