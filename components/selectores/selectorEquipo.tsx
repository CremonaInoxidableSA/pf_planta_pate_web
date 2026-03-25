"use client";

import { useState, useEffect } from "react";

interface SelectorProps {
  selectClasses?: string;
  onEquipoChange: (equipoId: number) => void;
  disabled?: boolean;
  lineaSeleccionada?: number;
}

const Selector: React.FC<SelectorProps> = ({
  selectClasses,
  onEquipoChange,
  disabled = false,
  lineaSeleccionada = 15,
}) => {
  const [selectedEquipo, setSelectedEquipo] = useState<string>("todos");

  const equiposLinea1 = [
    { id: "todos", name: "Todos", value: 30 },
    { id: "cocina1", name: "Cocina 1", value: 1 },
    { id: "cocina2", name: "Cocina 2", value: 2 },
    { id: "cocina3", name: "Cocina 3", value: 3 },
    { id: "enfriador1", name: "Enfriador 1", value: 7 },
    { id: "enfriador2", name: "Enfriador 2", value: 8 },
    { id: "enfriador3", name: "Enfriador 3", value: 9 },
    { id: "enfriador4", name: "Enfriador 4", value: 10 },
  ];

  const equiposLinea2 = [
    { id: "todos", name: "Todos", value: 30 },
    { id: "cocina1", name: "Cocina 4", value: 4 },
    { id: "cocina2", name: "Cocina 5", value: 5 },
    { id: "cocina3", name: "Cocina 6", value: 6 },
    { id: "enfriador1", name: "Enfriador 5", value: 11 },
    { id: "enfriador2", name: "Enfriador 6", value: 12 },
    { id: "enfriador3", name: "Enfriador 7", value: 13 },
    { id: "enfriador4", name: "Enfriador 8", value: 14 },
  ];

  const equipoList = lineaSeleccionada === 16 ? equiposLinea2 : equiposLinea1;

  useEffect(() => {
    onEquipoChange(30);
  }, [lineaSeleccionada, onEquipoChange]);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = e.target.value;

    setSelectedEquipo(selectedId);
    const equipo = equipoList.find((eq) => eq.id === selectedId);

    onEquipoChange(equipo?.value ?? 30);
  };

  return (
    <select
      className={`${selectClasses || "bg-[#0001] h-full w-full px-5 border-b-2 border-white focus:border-white focus:outline-none text-lg text-texto hover:text-texto transition-colors cursor-pointer"} ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
      disabled={disabled}
      value={selectedEquipo}
      onChange={handleChange}
    >
      {equipoList.map((equipo) => (
        <option
          key={equipo.id}
          className="p-0.5 text-texto hover:text-texto bg-black font-bold"
          value={equipo.id}
        >
          {equipo.name}
        </option>
      ))}
    </select>
  );
};

export default Selector;
