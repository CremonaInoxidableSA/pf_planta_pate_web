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
    <>
      <h2 className="text-xl text-white flex text-center">
        {t("sectorIO.titulo")}
      </h2>
      <ul className="grid gap-[1vh] h-full 1365:grid-cols-2">
        {datosIO.map((dato, index) => {
          const isLastAndOdd = isOddCount && index === datosIO.length - 1;

          return (
            <li
              key={dato.label}
              className={`bg-grey flex justify-between px-[20px] py-0 rounded-md items-center ${
                isLastAndOdd ? "1365:col-span-2" : ""
              }`}
            >
              <p className="text-[calc(0.4vw+1vh)] text-white">{dato.label}</p>
              <p
                className={`text-[calc(0.4vw+1vh)] ${getColorClass(dato.label, dato.value)}`}
              >
                <GoDotFill
                  className={`${dato.value ? "text-green" : "text-lightGrey"} text-[3rem]`}
                />
              </p>
            </li>
          );
        })}
      </ul>
    </>
  );
};

export default SectorIO;
