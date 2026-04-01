"use client";

import React from "react";
import type { Table } from "@tanstack/react-table";
import type { DateRange } from "react-day-picker";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FilterX } from "lucide-react";
import DateRangePicker from "@/components/selectores/dateRangePicker";
import type { Alarma, ColumnKey } from "./types";
import BotonExportar from "./(exportar)/botonExportar";

interface FiltrosProps {
  table: Table<Alarma>;
  dateRange: DateRange | undefined;
  setDateRange: (value: DateRange | undefined) => void;
  error: string | null;
  onRetry: () => void;
  onClearFilters: () => void;
}

const Filtros: React.FC<FiltrosProps> = ({
  table,
  dateRange,
  setDateRange,
  error,
  onRetry,
  onClearFilters,
}) => {
  const { t } = useTranslation();

  return (
    <>
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2">
        <BotonExportar
          allRows={table.getPrePaginationRowModel().rows}
          visibleRows={table.getRowModel().rows}
          dateRange={dateRange}
        />

        <DateRangePicker value={dateRange} onChange={setDateRange} />

        <Button
          variant="outline"
          size="sm"
          className="h-full bg-background2 hover:bg-white/5"
          onClick={onClearFilters}
        >
          <FilterX className="size-4" />
          {t("min.limpiarFiltros")}
        </Button>

        {error && (
          <Button
            size="sm"
            className="bg-[#761122] hover:bg-[#8f1529] text-white"
            onClick={onRetry}
          >
            {t("min.reintentar")}
          </Button>
        )}
      </div>

      {/* Filtros por columna */}
      <div className="flex gap-5">
        {(["description", "type", "state", "time"] as ColumnKey[]).map(
          (col) => (
            <Input
              key={col}
              placeholder={`${t("min.filtrar")} ${table.getColumn(col)?.columnDef.header as string}…`}
              value={(table.getColumn(col)?.getFilterValue() as string) ?? ""}
              className="h-7 text-xs bg-transparent border-[#515151] text-[#d9d9d9] placeholder:text-[#515151]"
              onChange={(e) =>
                table.getColumn(col)?.setFilterValue(e.target.value)
              }
            />
          ),
        )}
      </div>
    </>
  );
};

export default Filtros;
