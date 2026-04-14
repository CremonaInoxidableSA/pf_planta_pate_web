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
import { cn } from "@/lib/utils";

interface SelectorProps {
  value: number;
  onChange: (value: number) => void;
  selectClasses?: string;
  optionClasses?: string;
}

export const EQUIPOS_HISTORICO = [
  { id: 1, shortName: "C1", type: "cocina", lineKey: "linea1" },
  { id: 2, shortName: "C2", type: "cocina", lineKey: "linea1" },
  { id: 3, shortName: "C3", type: "cocina", lineKey: "linea1" },
  { id: 4, shortName: "C4", type: "cocina", lineKey: "linea2" },
  { id: 5, shortName: "C5", type: "cocina", lineKey: "linea2" },
  { id: 6, shortName: "C6", type: "cocina", lineKey: "linea2" },
  { id: 7, shortName: "E1", type: "enfriador", lineKey: "linea1" },
  { id: 8, shortName: "E2", type: "enfriador", lineKey: "linea1" },
  { id: 9, shortName: "E3", type: "enfriador", lineKey: "linea1" },
  { id: 10, shortName: "E4", type: "enfriador", lineKey: "linea2" },
  { id: 11, shortName: "E5", type: "enfriador", lineKey: "linea2" },
  { id: 12, shortName: "E6", type: "enfriador", lineKey: "linea2" },
  { id: 13, shortName: "E7", type: "enfriador", lineKey: "linea2" },
  { id: 14, shortName: "E8", type: "enfriador", lineKey: "linea2" },
] as const;

const Selector: React.FC<SelectorProps> = ({
  value = 1,
  onChange,
  selectClasses,
  optionClasses,
}) => {
  const [, setInternalValue] = React.useState<number>(value);
  const { t } = useTranslation();

  const itemsList = EQUIPOS_HISTORICO;

  React.useEffect(() => {
    setInternalValue(value);
  }, [value]);

  const handleChange = (selectedValue: string) => {
    const numValue = Number(selectedValue);
    if (!isNaN(numValue) && numValue !== value) {
      setInternalValue(numValue);
      onChange(numValue);
    }
  };

  const getDisplayName = (item: (typeof EQUIPOS_HISTORICO)[number]) => {
    let typeLabel = "";
    if (item.type === "cocina") {
      typeLabel = t("min.cocina");
    } else if (item.type === "enfriador") {
      typeLabel = t("min.enfriador");
    }
    const lineLabel = t(`min.${item.lineKey}`);
    return `${typeLabel} ${item.id} - ${lineLabel}`;
  };

  return (
    <Select value={value.toString()} onValueChange={handleChange}>
      <SelectTrigger
        className={cn(
          "border-0 shadow-none focus-visible:ring-0 focus-visible:border-0 h-full! text-texto",
          selectClasses,
        )}
      >
        <SelectValue placeholder={t("seleccionar", "Seleccionar")} />
      </SelectTrigger>
      <SelectContent
        position="popper"
        className="bg-background3 border-border text-texto w-(--radix-select-trigger-width)"
      >
        <SelectGroup>
          <SelectLabel className="text-orange py-1.5 text-sm font-semibold">
            {t("mayus.cocinas")}
          </SelectLabel>
          {itemsList
            .filter((item) => item.type === "cocina")
            .map((item) => (
              <SelectItem
                key={item.id.toString()}
                value={item.id.toString()}
                className={cn(
                  "cursor-pointer w-full text-texto",
                  optionClasses,
                )}
              >
                {getDisplayName(item)}
              </SelectItem>
            ))}
        </SelectGroup>

        <SelectGroup>
          <SelectLabel className="text-blue py-1.5 text-sm font-semibold">
            {t("mayus.enfriadores")}
          </SelectLabel>
          {itemsList
            .filter((item) => item.type === "enfriador")
            .map((item) => (
              <SelectItem
                key={item.id.toString()}
                value={item.id.toString()}
                className={cn(
                  "cursor-pointer w-full text-texto",
                  optionClasses,
                )}
              >
                {getDisplayName(item)}
              </SelectItem>
            ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
};

export default Selector;
