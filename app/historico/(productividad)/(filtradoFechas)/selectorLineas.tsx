"use client";

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

// Tipo para el ID de equipo que se enviará a la API
export type EquipoProductividadId = number;

interface SelectorEquiposProductividadProps {
  value: EquipoProductividadId;
  onChange: (value: EquipoProductividadId) => void;
}

// Opciones de equipos con sus IDs correspondientes para la API
const opcionesEquipos = {
  general: [
    { id: 0, key: "todosLosEquipos" },
    { id: 15, key: "linea1" },
    { id: 16, key: "linea2" },
  ],
  // IDs de cocinas en la API: 1-6, numeración para mostrar: 1-6
  cocinas: [
    { id: 1, num: 1 },
    { id: 2, num: 2 },
    { id: 3, num: 3 },
    { id: 4, num: 4 },
    { id: 5, num: 5 },
    { id: 6, num: 6 },
  ],
  // IDs de enfriadores en la API: 7-14, numeración para mostrar: 1-8
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

  // Obtener el nombre para mostrar basado en el ID
  const getDisplayName = (id: number): string => {
    // Opciones generales
    const generalOption = opcionesEquipos.general.find((opt) => opt.id === id);
    if (generalOption) {
      return t(`min.${generalOption.key}`);
    }

    // Cocinas
    const cocinaOption = opcionesEquipos.cocinas.find((opt) => opt.id === id);
    if (cocinaOption) {
      return `${t("min.cocina")} ${cocinaOption.num}`;
    }

    // Enfriadores
    const enfriadorOption = opcionesEquipos.enfriadores.find(
      (opt) => opt.id === id,
    );
    if (enfriadorOption) {
      return `${t("min.enfriador")} ${enfriadorOption.num}`;
    }

    return "";
  };

  return (
    <Select
      value={String(value)}
      onValueChange={(val) => onChange(Number(val))}
    >
      <SelectTrigger className="w-full bg-background3">
        <SelectValue>{getDisplayName(value)}</SelectValue>
      </SelectTrigger>
      <SelectContent
        position="popper"
        className="bg-background2 border-border text-texto w-(--radix-select-trigger-width) max-h-75"
      >
        {/* Opciones generales */}
        <SelectGroup>
          {opcionesEquipos.general.map((option) => (
            <SelectItem key={option.id} value={String(option.id)}>
              {t(`min.${option.key}`)}
            </SelectItem>
          ))}
        </SelectGroup>

        {/* Cocinas */}
        <SelectGroup>
          <SelectLabel className="text-orange px-2 py-1.5 text-sm font-semibold">
            {t("mayus.cocinas")}
          </SelectLabel>
          {opcionesEquipos.cocinas.map((equipo) => (
            <SelectItem key={equipo.id} value={String(equipo.id)}>
              {t("min.cocina")} {equipo.num}
            </SelectItem>
          ))}
        </SelectGroup>

        {/* Enfriadores */}
        <SelectGroup>
          <SelectLabel className="text-blue px-2 py-1.5 text-sm font-semibold">
            {t("mayus.enfriadores")}
          </SelectLabel>
          {opcionesEquipos.enfriadores.map((equipo) => (
            <SelectItem key={equipo.id} value={String(equipo.id)}>
              {t("min.enfriador")} {equipo.num}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
};

export default SelectorEquiposProductividad;
