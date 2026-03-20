"use client";

import React from "react";

interface SelectorProps {
  value: number;
  onChange: (value: number) => void;
  isCocina: boolean;
  selectClasses?: string;
  optionClasses?: string;
}

export default function Selector({
  value,
  onChange,
  isCocina,
  selectClasses,
  optionClasses,
}: SelectorProps) {
  const maxItems = isCocina ? 6 : 8; // 6 cocinas o 8 enfriadores máximo

  const options = Array.from({ length: maxItems }, (_, i) => {
    const globalNumber = i + 1; // Numeración global (1-6 o 1-8)
    // Si es enfriador, el valor real será 7-14 en lugar de 1-8
    const actualValue = isCocina ? globalNumber : globalNumber + 6;

    // Determinar la línea (1 o 2)
    const lineNumber = isCocina
      ? globalNumber <= 3 ? "1" : "2"
      : globalNumber <= 4 ? "1" : "2";
    
    // Determinar el número de equipo en la línea (1-3 para cocinas, 1-4 para enfriadores)
    const equipmentInLine = isCocina 
      ? globalNumber <= 3 ? globalNumber : globalNumber - 3
      : globalNumber <= 4 ? globalNumber : globalNumber - 4;
    
    // Crear el código del equipo (C11, E21, etc.)
    const equipmentCode = `${isCocina ? "C" : "E"}${lineNumber}${equipmentInLine}`;

    return {
      value: actualValue, // Este es el ID real que se usará
      label: `${isCocina ? "Cocina" : "Enfriador"} ${equipmentInLine} - L${lineNumber} (${equipmentCode})`,
      visibleNumber: globalNumber, // Mantenemos esto para compatibilidad
    };
  });

  // Validar que el valor esté dentro del rango permitido
  const validValue = isCocina
    ? Math.min(Math.max(1, value), 6)
    : Math.min(Math.max(7, value), 14);

  return (
    <select
      className={selectClasses}
      value={validValue}
      onChange={(e) => {
        const newValue = parseInt(e.target.value);
        const minValue = isCocina ? 1 : 7;
        const maxValue = isCocina ? 6 : 14;

        if (newValue >= minValue && newValue <= maxValue) {
          onChange(newValue);
        }
      }}
    >
      {options.map((option) => (
        <option
          key={option.value}
          className={optionClasses}
          value={option.value}
        >
          {option.label}
        </option>
      ))}
    </select>
  );
}