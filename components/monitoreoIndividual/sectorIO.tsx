import React from "react";
import { GoDotFill } from "react-icons/go";
import { useTranslation } from "react-i18next";

interface DatoIO {
  label: string;
  value: boolean;
}

interface SectorIOProps {
  datosIO: DatoIO[];
  getColorClass: (label: string, value: boolean) => string;
}

const SectorIO: React.FC<SectorIOProps> = ({ datosIO, getColorClass }) => {
  const isOddCount = datosIO.length % 2 !== 0;
  const { t } = useTranslation();

  return (
    <div className="flex flex-col bg-background2 p-5 rounded gap-2.5">
      <h2 className="text-lg text-texto flex text-center">
        {t("mayus.sectorIO")}
      </h2>
      <ul className="grid gap-2.5 h-full grid-cols-2">
        {datosIO.map((dato, index) => {
          const isLastAndOdd = isOddCount && index === datosIO.length - 1;

          return (
            <li
              key={dato.label}
              className={`bg-background3 flex justify-between px-5 py-0 rounded items-center ${
                isLastAndOdd ? "col-span-2" : ""
              }`}
            >
              <p className="text-2.5 text-texto">{dato.label}</p>
              <p
                className={`text-2.5 ${getColorClass(dato.label, dato.value)}`}
              >
                <GoDotFill
                  className={`$ {
                    dato.value === null || dato.value === undefined
                      ? "text-lightGrey"
                      : dato.value === true
                        ? "text-green"
                        : "text-red"
                  } text-4xl`}
                />
              </p>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default SectorIO;
