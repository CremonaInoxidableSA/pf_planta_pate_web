"use client";

import { useState } from "react";
import { format } from "date-fns";
import { es, enUS } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import type { DateRange } from "react-day-picker";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";

interface DateRangePickerProps {
  value?: DateRange;
  onChange?: (range: DateRange | undefined) => void;
  className?: string;
}

export default function DateRangePicker({
  value,
  onChange,
  className,
}: DateRangePickerProps) {
  const [open, setOpen] = useState(false);
  const { t, i18n } = useTranslation();

  const locale = i18n.language === "en" ? enUS : es;

  const handleSelect = (range: DateRange | undefined) => {
    onChange?.(range);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          className={cn(
            "min-w-57.5 bg-background2 text-texto justify-start gap-2 rounded hover:bg-background4 hover:text-texto",
            !value && "text-muted-foreground",
            className,
          )}
        >
          <CalendarIcon className="size-4 shrink-0" />
          {value?.from ? (
            value.to ? (
              <span>
                {format(value.from, "dd/MM/yyyy")} –{" "}
                {format(value.to, "dd/MM/yyyy")}
              </span>
            ) : (
              <span>{format(value.from, "dd/MM/yyyy")}</span>
            )
          ) : (
            <span className="text-muted-foreground">
              {t("min.seleccionarRango")}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-auto p-0 bg-background3 border-border"
        align="end"
      >
        <Calendar
          mode="range"
          selected={value}
          onSelect={handleSelect}
          numberOfMonths={2}
          locale={locale}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
}
