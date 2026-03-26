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
    <div className="flex flex-col bg-background2 p-5 rounded-md gap-2.5 w-1/2">
      <h2 className="text-xl text-texto w-full ">{t("mayus.estadoEquipo")}</h2>
      <ul className="flex flex-col justify-between grow gap-2.5">
        {datos.map((dato, index) => (
          <li
            key={`${dato.label}-${index}`}
            className="bg-background3 flex flex-col px-5 py-2.5 rounded-md"
          >
            <span className="text-xl text-texto">{dato.label}:</span>
            <span
              className={`text-xl ${getColorClass(dato.label, dato.value)}`}
            >
              {formatValue(dato.value, dato.unit)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default EstadoEquipo;
