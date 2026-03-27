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
import type { Alerta, AlarmaData } from "./types";
import { getColumnDefs } from "./columnas";

export function useTablaAlertas() {
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
