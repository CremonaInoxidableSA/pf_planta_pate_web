"use client";

import { useTranslation } from "react-i18next";

import { useLinea, type LineaId } from "@/context/LineaContext";

interface SelectorProps {
  selectClasses?: string;
}

const Selector: React.FC<SelectorProps> = ({ selectClasses }) => {
  const { lineaSeleccionada, setLineaSeleccionada } = useLinea();

  const { t } = useTranslation();

  const lineaList: Array<{ id: LineaId; name: string }> = [
    { id: 1, name: t("lineas.linea1") },
    { id: 2, name: t("lineas.linea2") },
  ];

  const defaultClasses =
    "bg-[#0001] h-full w-full px-[20px] border-b-2 border-white focus:border-white focus:outline-none text-lg text-texto hover:text-texto transition-colors cursor-pointer";

  return (
    <select
      className={selectClasses || defaultClasses}
      value={lineaSeleccionada}
      onChange={(e) => setLineaSeleccionada(Number(e.target.value) as LineaId)}
    >
      {lineaList.map((linea) => (
        <option
          key={linea.id}
          className="p-0.5 text-texto hover:text-texto bg-black font-bold"
          value={linea.id}
        >
          {linea.name}
        </option>
      ))}
    </select>
  );
};

export default Selector;
