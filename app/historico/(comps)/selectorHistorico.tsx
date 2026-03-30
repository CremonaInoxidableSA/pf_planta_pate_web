"use client";

import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface SelectorProps {
  value: number;
  onChange: (value: number) => void;
  selectClasses?: string;
  optionClasses?: string;
}

export const EQUIPOS_HISTORICO = [
  { id: 1, shortName: "C1", name: "Cocina 1" },
  { id: 2, shortName: "C2", name: "Cocina 2" },
  { id: 3, shortName: "C3", name: "Cocina 3" },
  { id: 4, shortName: "C4", name: "Cocina 4" },
  { id: 5, shortName: "C5", name: "Cocina 5" },
  { id: 6, shortName: "C6", name: "Cocina 6" },
  { id: 7, shortName: "E1", name: "Enfriador 1" },
  { id: 8, shortName: "E2", name: "Enfriador 2" },
  { id: 9, shortName: "E3", name: "Enfriador 3" },
  { id: 10, shortName: "E4", name: "Enfriador 4" },
  { id: 11, shortName: "E5", name: "Enfriador 5" },
  { id: 12, shortName: "E6", name: "Enfriador 6" },
  { id: 13, shortName: "E7", name: "Enfriador 7" },
  { id: 14, shortName: "E8", name: "Enfriador 8" },
] as const;

const Selector: React.FC<SelectorProps> = ({
  value = 1,
  onChange,
  selectClasses,
  optionClasses,
}) => {
  const [, setInternalValue] = React.useState<number>(value);

  const itemsList = EQUIPOS_HISTORICO;

  React.useEffect(() => {
    setInternalValue(value);
  }, [value]);

  const handleChange = (selectedValue: string) => {
    const numValue = Number(selectedValue);

    if (!isNaN(numValue)) {
      setInternalValue(numValue);
      onChange(numValue);
    } else {
      setInternalValue(value);
    }
  };

  return (
    <Select value={value.toString()} onValueChange={handleChange}>
      <SelectTrigger
        className={cn(
          "border-0 shadow-none focus-visible:ring-0 focus-visible:border-0 h-full! text-texto",
          selectClasses,
        )}
      >
        <SelectValue placeholder="Seleccionar" />
      </SelectTrigger>
      <SelectContent
        position="popper"
        className="bg-background2 border-border text-texto w-(--radix-select-trigger-width)"
      >
        {itemsList.map((item) => (
          <SelectItem
            key={item.id.toString()}
            value={item.id.toString()}
            className={cn("cursor-pointer w-full text-texto", optionClasses)}
          >
            {item.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default Selector;
