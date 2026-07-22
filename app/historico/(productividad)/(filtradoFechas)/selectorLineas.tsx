"use client";

import React from "react";
import { useTranslation } from "react-i18next";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectGroup,
  SelectLabel,
} from "@/components/ui/select";

export type EquipoProductividadId = number;

interface SelectorEquiposProductividadProps {
  value: EquipoProductividadId;
  onChange: (value: EquipoProductividadId) => void;
}

const opcionesEquipos = {
  general: [
    { id: 0, key: "todosLosEquipos" },
    { id: 15, key: "linea1" },
    { id: 16, key: "linea2" },
  ],
  cocinas: [
    { id: 1, num: 1 },
    { id: 2, num: 2 },
    { id: 3, num: 3 },
    { id: 4, num: 4 },
    { id: 5, num: 5 },
    { id: 6, num: 6 },
  ],
  enfriadores: [
    { id: 7, num: 1 },
    { id: 8, num: 2 },
    { id: 9, num: 3 },
    { id: 10, num: 4 },
    { id: 11, num: 5 },
    { id: 12, num: 6 },
    { id: 13, num: 7 },
    { id: 14, num: 8 },
  ],
};

const SelectorEquiposProductividad: React.FC<
  SelectorEquiposProductividadProps
> = ({ value, onChange }) => {
  const { t } = useTranslation();
  const [internalValue, setInternalValue] = React.useState<number>(value);

  React.useEffect(() => {
    setInternalValue(value);
  }, [value]);

  const getDisplayName = (id: number): string => {
    const generalOption = opcionesEquipos.general.find((opt) => opt.id === id);
    if (generalOption) {
      return t(`min.${generalOption.key}`);
    }

    const isCocina = id >= 1 && id <= 6;
    const isEnfriador = id >= 7 && id <= 14;

    if (isCocina || isEnfriador) {
      const typeLabel = isCocina ? t("min.cocina") : t("min.enfriador");

      const equipmentNumber = isCocina
        ? id <= 3
          ? id
          : id - 3
        : id <= 10
          ? id - 6
          : id - 10;

      const lineNumber = isCocina ? (id <= 3 ? 1 : 2) : id <= 10 ? 1 : 2;

      const equipmentCode = `${isCocina ? "C" : "E"}${lineNumber}${equipmentNumber}`;

      return `${typeLabel} ${equipmentNumber} - L${lineNumber} (${equipmentCode})`;
    }

    return "";
  };

  const handleChange = (val: string) => {
    const numValue = Number(val);
    if (!isNaN(numValue) && numValue !== internalValue) {
      setInternalValue(numValue);
      onChange(numValue);
    }
  };

  return (
    <Select value={String(internalValue)} onValueChange={handleChange}>
      <SelectTrigger className="w-full bg-background3">
        <SelectValue>{getDisplayName(internalValue)}</SelectValue>
      </SelectTrigger>
      <SelectContent
        position="popper"
        className="bg-background2 border-border text-texto w-(--radix-select-trigger-width) max-h-75"
      >
        <SelectGroup>
          {opcionesEquipos.general.map((option) => (
            <SelectItem key={option.id} value={String(option.id)}>
              {t(`min.${option.key}`)}
            </SelectItem>
          ))}
        </SelectGroup>

        <SelectGroup>
          <SelectLabel className="text-orange px-2 py-1.5 text-sm font-semibold">
            {t("mayus.cocinas")}
          </SelectLabel>
          {opcionesEquipos.cocinas.map((equipo) => (
            <SelectItem key={equipo.id} value={String(equipo.id)}>
              {getDisplayName(equipo.id)}
            </SelectItem>
          ))}
        </SelectGroup>

        <SelectGroup>
          <SelectLabel className="text-blue px-2 py-1.5 text-sm font-semibold">
            {t("mayus.enfriadores")}
          </SelectLabel>
          {opcionesEquipos.enfriadores.map((equipo) => (
            <SelectItem key={equipo.id} value={String(equipo.id)}>
              {getDisplayName(equipo.id)}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
};

export default SelectorEquiposProductividad;
