"use client";

import { useMemo, useState, useEffect, useCallback } from "react";
import { authFetch } from "@/app/api/api";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  type SortingState,
  type ColumnFiltersState,
} from "@tanstack/react-table";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import type { DateRange } from "react-day-picker";
import type { Alarma } from "./types";
import { getColumnDefs } from "./columnas";

export function useTablaAlarmas() {
  const { t } = useTranslation();
  const [data, setData] = useState<Alarma[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });

  const loadData = useCallback(
    async (range?: DateRange) => {
      setIsLoading(true);
      setError(null);
      try {
        let url = "/api/alarmas";
        if (range?.from && range?.to) {
          const from = range.from.toISOString().slice(0, 10);
          const to = range.to.toISOString().slice(0, 10);
          url += `?fecha_inicio=${from}&fecha_fin=${to}`;
        }
        const res = await authFetch(url);
        if (!res.ok) throw new Error(`${res.status}`);
        type ApiAlarma = {
          id?: number | string;
          id_alarma?: number | string;
          descripcion?: string;
          tipo_alarma?: string;
          tipo?: string;
          estadoAlarma?: boolean;
          fecha_inicio?: string;
          fecha_registro?: string;
        };
        const apiData: ApiAlarma[] = await res.json();
        setData(
          apiData
            .filter((a) => a.descripcion?.trim())
            .map((a) => ({
              key:
                a.id?.toString() ??
                a.id_alarma?.toString() ??
                Math.random().toString(),
              description: a.descripcion ?? "",
              type: a.tipo_alarma ?? a.tipo ?? "",
              state:
                a.estadoAlarma !== undefined
                  ? a.estadoAlarma
                    ? t("min.activo")
                    : t("min.inactivo")
                  : "-",
              time: a.fecha_inicio ?? a.fecha_registro ?? "",
            })),
        );
      } catch {
        setError(t("min.noSePudieronObtenerDatos"));
      } finally {
        setIsLoading(false);
      }
    },
    [t],
  );

  useEffect(() => {
    loadData(dateRange);
  }, [dateRange, loadData]);

  const dateFilteredData = data;

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
    loadData(undefined);
  };

  return {
    table,
    isLoading,
    error,
    dateRange,
    setDateRange,
    loadData,
    handleClearFilters,
    columnDefs,
  };
}
