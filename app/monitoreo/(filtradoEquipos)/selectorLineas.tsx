"use client";

import { useTranslation } from "react-i18next";

import {
  useLinea,
  type LineaId,
  type EquipoSeleccionado,
} from "@/context/LineaContext";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type EquipoOption = { id: EquipoSeleccionado; name: string };

const equiposPorLinea: Record<LineaId, EquipoOption[]> = {
  1: [
    { id: 1, name: "Cocina 1" },
    { id: 2, name: "Cocina 2" },
    { id: 3, name: "Cocina 3" },
    { id: 7, name: "Enfriador 7" },
    { id: 8, name: "Enfriador 8" },
    { id: 9, name: "Enfriador 9" },
    { id: 10, name: "Enfriador 10" },
  ],
  2: [
    { id: 4, name: "Cocina 4" },
    { id: 5, name: "Cocina 5" },
    { id: 6, name: "Cocina 6" },
    { id: 11, name: "Enfriador 11" },
    { id: 12, name: "Enfriador 12" },
    { id: 13, name: "Enfriador 13" },
    { id: 14, name: "Enfriador 14" },
  ],
  3: [],
};

const Selector: React.FC = () => {
  const {
    lineaSeleccionada,
    setLineaSeleccionada,
    equipoSeleccionado,
    setEquipoSeleccionado,
  } = useLinea();

  const { t } = useTranslation();

  const lineaList: Array<{ id: LineaId; name: string }> = [
    { id: 1, name: t("min.linea1") },
    { id: 2, name: t("min.linea2") },
  ];

  const equipos = equiposPorLinea[lineaSeleccionada];

  return (
    <div className="flex flex-row gap-3 w-1/4">
      <Select
        value={String(lineaSeleccionada)}
        onValueChange={(val) => setLineaSeleccionada(Number(val) as LineaId)}
      >
        <SelectTrigger className="w-full bg-background3">
          <SelectValue />
        </SelectTrigger>
        <SelectContent
          position="popper"
          className="bg-background2 border-border text-texto w-(--radix-select-trigger-width)"
        >
          {lineaList.map((linea) => (
            <SelectItem key={linea.id} value={String(linea.id)}>
              {linea.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default Selector;
