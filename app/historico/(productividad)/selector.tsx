"use client";

import { useLinea, LineaId } from "@/context/LineaContext";

const Selector: React.FC = () => {
  const { lineaSeleccionada, setLineaSeleccionada } = useLinea();

  const lineaList = [
    { id: 1, name: "Línea 1" },
    { id: 2, name: "Línea 2" },
  ];

  return (
    <select
      className="
                bg-[#0001] h-full w-full px-5 border-b-2 border-white 
                focus:border-white focus:outline-none text-lg text-texto 
                hover:text-texto transition-colors cursor-pointer
            "
      value={lineaSeleccionada}
      onChange={(e) => {
        const value = Number(e.target.value);

        setLineaSeleccionada(value as LineaId);
      }}
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
