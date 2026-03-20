"use client";

import { useState } from "react";

interface SelectorProps {
  selectClasses?: string;
  onLineaChange: (lineaId: number) => void;
}

const Selector: React.FC<SelectorProps> = ({
  selectClasses,
  onLineaChange,
}) => {
  const [selectedLinea, setSelectedLinea] = useState<number>(3);

  const lineaList = [
    { id: 1, name: "Línea 1", value: 15 },
    { id: 2, name: "Línea 2", value: 16 },
    { id: 3, name: "Completo", value: 0 },
  ];

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const lineaId = Number(e.target.value);

    setSelectedLinea(lineaId);
    const linea = lineaList.find((l) => l.id === lineaId);

    onLineaChange(linea?.value ?? 0);
  };

  return (
    <select
      className={
        selectClasses ||
        "bg-[#0001] h-full w-full px-[20px] border-b-2 border-white focus:border-white focus:outline-none text-lg text-white hover:text-white transition-colors cursor-pointer"
      }
      value={selectedLinea}
      onChange={handleChange}
    >
      {lineaList.map((linea) => (
        <option
          key={linea.id}
          className="p-[2px] text-white hover:text-white bg-black font-bold"
          value={linea.id}
        >
          {linea.name}
        </option>
      ))}
    </select>
  );
};

export default Selector;
