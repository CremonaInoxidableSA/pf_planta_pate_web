"use client";

import { useTranslation } from "react-i18next";

import { useLinea, type LineaId } from "@/context/LineaContext";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const Selector: React.FC = () => {
  const { lineaSeleccionada, setLineaSeleccionada } = useLinea();

  const { t } = useTranslation();

  const lineaList: Array<{ id: LineaId; name: string }> = [
    { id: 1, name: t("min.linea1") },
    { id: 2, name: t("min.linea2") },
  ];

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
