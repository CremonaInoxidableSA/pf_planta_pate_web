"use client";

import { useLinea } from "@/context/LineaContext";

const Selector: React.FC = () => {
  const { lineaSeleccionada, setLineaSeleccionada } = useLinea();

  const lineaList = [
    { id: 1, name: "Línea 1" },
    { id: 2, name: "Línea 2" },
  ];

  return (
    <select
      className="
                bg-[#0001] h-full w-full px-[20px] border-b-[2px] border-white 
                focus:border-white focus:outline-none text-lg text-white 
                hover:text-white transition-colors cursor-pointer
            "
      value={lineaSeleccionada}
      onChange={(e) => {
        // Convertimos el valor numérico al tipo esperado por LineaId
        const value = Number(e.target.value);

        setLineaSeleccionada(value as any); // Usamos type assertion para convertir al tipo esperado
      }}
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
