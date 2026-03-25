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
  { id: 101, shortName: "C1", name: "Cocina 1 - L1" },
  { id: 102, shortName: "C2", name: "Cocina 2 - L1" },
  { id: 103, shortName: "C3", name: "Cocina 3 - L1" },
  { id: 104, shortName: "E1", name: "Enfriador 1 - L1" },
  { id: 105, shortName: "E2", name: "Enfriador 2 - L1" },
  { id: 106, shortName: "E3", name: "Enfriador 3 - L1" },
  { id: 107, shortName: "E4", name: "Enfriador 4 - L1" },
  { id: 201, shortName: "C4", name: "Cocina 4 - L2" },
  { id: 202, shortName: "C5", name: "Cocina 5 - L2" },
  { id: 203, shortName: "C6", name: "Cocina 6 - L2" },
  { id: 204, shortName: "E5", name: "Enfriador 5 - L2" },
  { id: 205, shortName: "E6", name: "Enfriador 6 - L2" },
  { id: 206, shortName: "E7", name: "Enfriador 7 - L2" },
  { id: 207, shortName: "E8", name: "Enfriador 8 - L2" },
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
