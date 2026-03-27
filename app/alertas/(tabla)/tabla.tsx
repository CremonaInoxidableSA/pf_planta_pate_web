"use client";

import React, { useMemo, useState, useEffect, useCallback } from "react";
import { authFetch } from "@/app/api/api";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
  type SortingState,
  type ColumnFiltersState,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import type { DateRange } from "react-day-picker";
import type { Alerta, AlarmaData } from "./types";
import { getColumnDefs } from "./columnas";
import Filtros from "./filtros";

const Tabla: React.FC = () => {
  const { t } = useTranslation();
  const [data, setData] = useState<Alerta[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await authFetch("/api/alarmas");
      if (!res.ok) throw new Error(`${res.status}`);
      const apiData: AlarmaData[] = await res.json();
      setData(
        apiData
          .filter((a) => a.descripcion?.trim())
          .map((a) => ({
            key: a.id_alarma.toString(),
            description: a.descripcion,
            type: a.tipo,
            state: a.estadoAlarma ? "Activo" : "Inactivo",
            time: a.fecha_registro,
          })),
      );
    } catch {
      setError(t("min.noSePudieronObtenerDatos"));
    } finally {
      setIsLoading(false);
    }
  }, [t]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const dateFilteredData = useMemo(() => {
    if (!dateRange?.from && !dateRange?.to) return data;
    const from = dateRange?.from ?? new Date(0);
    const to = dateRange?.to
      ? new Date(new Date(dateRange.to).setHours(23, 59, 59, 999))
      : new Date();
    return data.filter((item) => {
      try {
        const d = new Date(item.time);
        return d >= from && d <= to;
      } catch {
        return false;
      }
    });
  }, [data, dateRange]);

  const columnDefs = useMemo(
    () => getColumnDefs(t, columnFilters),
    [t, columnFilters],
  );

  const table = useReactTable({
    data: dateFilteredData,
    columns: columnDefs,
    state: { sorting, columnFilters, pagination },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  const handleClearFilters = () => {
    setColumnFilters([]);
    setDateRange(undefined);
    toast.success(t("min.filtrosLimpiados"), { position: "bottom-right" });
  };

  return (
    <div className="w-full bg-background1 rounded-3.75 text-[#d9d9d9]">
      <Filtros
        table={table}
        dateRange={dateRange}
        setDateRange={setDateRange}
        error={error}
        onRetry={loadData}
        onClearFilters={handleClearFilters}
      />
      <div className="rounded-md border border-[#515151] overflow-x-auto">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((hg) => (
              <TableRow
                key={hg.id}
                className="border-[#515151] hover:bg-transparent"
              >
                {hg.headers.map((header) => {
                  const sorted = header.column.getIsSorted();
                  return (
                    <TableHead
                      key={header.id}
                      className="text-[#d9d9d9] font-bold bg-[#1a1a1a] border-b border-[#515151] cursor-pointer select-none"
                      onClick={header.column.getToggleSortingHandler()}
                    >
                      <div className="flex items-center gap-1">
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                        {sorted === "asc" ? (
                          <ChevronUp className="size-3" />
                        ) : sorted === "desc" ? (
                          <ChevronDown className="size-3" />
                        ) : (
                          <ChevronsUpDown className="size-3 opacity-40" />
                        )}
                      </div>
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <TableRow key={i} className="border-[#515151]">
                  {columnDefs.map((_, j) => (
                    <TableCell key={j}>
                      <Skeleton className="h-4 w-full bg-[#2a2a2a]" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : table.getRowModel().rows.length === 0 ? (
              <TableRow className="border-[#515151]">
                <TableCell
                  colSpan={columnDefs.length}
                  className="text-center py-8 text-lightgrey"
                >
                  {error || t("min.noExistenDatos")}
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  className="border-[#515151] hover:bg-white/3 bg-black"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="text-[#d9d9d9]">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* ── Pagination ── */}
      <div className="flex items-center justify-between mt-3 text-sm text-lightgrey">
        <span>
          {t("min.pagina")} {table.getState().pagination.pageIndex + 1}{" "}
          {t("min.de")} {table.getPageCount()}
          {" · "}
          {table.getFilteredRowModel().rows.length} {t("min.registros")}
        </span>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon-sm"
            className="text-[#d9d9d9] hover:bg-white/10 disabled:opacity-30"
            disabled={!table.getCanPreviousPage()}
            onClick={() => table.setPageIndex(0)}
          >
            <ChevronsLeft className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            className="text-[#d9d9d9] hover:bg-white/10 disabled:opacity-30"
            disabled={!table.getCanPreviousPage()}
            onClick={() => table.previousPage()}
          >
            <ChevronLeft className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            className="text-[#d9d9d9] hover:bg-white/10 disabled:opacity-30"
            disabled={!table.getCanNextPage()}
            onClick={() => table.nextPage()}
          >
            <ChevronRight className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            className="text-[#d9d9d9] hover:bg-white/10 disabled:opacity-30"
            disabled={!table.getCanNextPage()}
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
          >
            <ChevronsRight className="size-4" />
          </Button>
          <select
            className="ml-2 bg-[#1e1e1e] border border-[#515151] rounded text-[#d9d9d9] text-xs px-1 py-0.5"
            value={table.getState().pagination.pageSize}
            onChange={(e) => table.setPageSize(Number(e.target.value))}
          >
            {[10, 20, 50, 100].map((s) => (
              <option key={s} value={s}>
                {s} / {t("min.pagina")}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

export default Tabla;
