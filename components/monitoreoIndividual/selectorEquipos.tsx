"use client";

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
  const maxItems = isCocina ? 6 : 8;

  const options = Array.from({ length: maxItems }, (_, i) => {
    const globalNumber = i + 1;
    const actualValue = isCocina ? globalNumber : globalNumber + 6;

    const lineNumber = isCocina
      ? globalNumber <= 3
        ? "1"
        : "2"
      : globalNumber <= 4
        ? "1"
        : "2";

    const equipmentInLine = isCocina
      ? globalNumber <= 3
        ? globalNumber
        : globalNumber - 3
      : globalNumber <= 4
        ? globalNumber
        : globalNumber - 4;

    const equipmentCode = `${isCocina ? "C" : "E"}${lineNumber}${equipmentInLine}`;

    return {
      value: actualValue,
      label: `${isCocina ? "Cocina" : "Enfriador"} ${equipmentInLine} - L${lineNumber} (${equipmentCode})`,
      visibleNumber: globalNumber,
    };
  });

  const validValue = isCocina
    ? Math.min(Math.max(1, value), 6)
    : Math.min(Math.max(7, value), 14);

  return (
    <Select
      value={String(validValue)}
      onValueChange={(val) => {
        const newValue = parseInt(val);
        const minValue = isCocina ? 1 : 7;
        const maxValue = isCocina ? 6 : 14;

        if (newValue >= minValue && newValue <= maxValue) {
          onChange(newValue);
        }
      }}
    >
      <SelectTrigger
        className={cn(
          "border-0 shadow-none focus-visible:ring-0 focus-visible:border-0 h-full!",
          selectClasses,
        )}
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent
        position="popper"
        className="bg-background2 border-border w-(--radix-select-trigger-width)"
      >
        {options.map((option) => (
          <SelectItem
            key={option.value}
            value={String(option.value)}
            className={cn("cursor-pointer w-full", optionClasses)}
          >
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
