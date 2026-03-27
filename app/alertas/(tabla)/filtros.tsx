"use client";

import React from "react";
import type { Table } from "@tanstack/react-table";
import type { DateRange } from "react-day-picker";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Download, FilterX } from "lucide-react";
import DateRangePicker from "@/components/selectores/dateRangePicker";
import type { Alerta, ColumnKey } from "./types";
import { getColHeaders, exportPDF, exportExcel } from "./exportar";

interface FiltrosProps {
  table: Table<Alerta>;
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
  const colHeaders = getColHeaders(t);

  return (
    <>
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              className="bg-[#761122] hover:bg-[#8f1529] text-texto"
              size="sm"
            >
              <Download className="size-4" />
              {t("min.exportar")}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="bg-[#1e1e1e] border-[#515151] text-[#d9d9d9]">
            <DropdownMenuItem
              className="hover:bg-[#2a2a2a] cursor-pointer"
              onClick={() =>
                exportPDF(table.getPrePaginationRowModel().rows, colHeaders)
              }
            >
              {t("min.exptodaspdf")}
            </DropdownMenuItem>
            <DropdownMenuItem
              className="hover:bg-[#2a2a2a] cursor-pointer"
              onClick={() => exportPDF(table.getRowModel().rows, colHeaders)}
            >
              {t("min.expvisiblespdf")}
            </DropdownMenuItem>
            <DropdownMenuItem
              className="hover:bg-[#2a2a2a] cursor-pointer"
              onClick={() =>
                exportExcel(
                  table.getPrePaginationRowModel().rows,
                  colHeaders,
                  "Todas_Alertas",
                )
              }
            >
              {t("min.exptodasexcel")}
            </DropdownMenuItem>
            <DropdownMenuItem
              className="hover:bg-[#2a2a2a] cursor-pointer"
              onClick={() =>
                exportExcel(
                  table.getRowModel().rows,
                  colHeaders,
                  "Alertas_Visibles",
                )
              }
            >
              {t("min.expvisiblesexcel")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DateRangePicker value={dateRange} onChange={setDateRange} />

        <Button
          variant="outline"
          size="sm"
          className="border-[#515151] text-[#d9d9d9] bg-transparent hover:bg-white/5 hover:text-texto"
          onClick={onClearFilters}
        >
          <FilterX className="size-4" />
          {t("min.limpiarFiltros")}
        </Button>

        {error && (
          <Button
            size="sm"
            className="bg-[#761122] hover:bg-[#8f1529] text-texto"
            onClick={onRetry}
          >
            {t("min.reintentar")}
          </Button>
        )}
      </div>

      {/* Filtros por columna */}
      <div className="grid grid-cols-4 gap-2 mb-3">
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
