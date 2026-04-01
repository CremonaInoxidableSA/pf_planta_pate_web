"use client";
import { useTranslation } from "react-i18next";
import { useTablaAlarmas } from "@/app/alarmas/(tabla)/useTablaAlarmas";
import Filtros from "@/app/alarmas/(tabla)/filtros";
import Tabla from "@/app/alarmas/(tabla)/tabla";

export default function Home() {
  const { t } = useTranslation();
  const {
    table,
    isLoading,
    error,
    dateRange,
    setDateRange,
    loadData,
    handleClearFilters,
    columnDefs,
  } = useTablaAlarmas();

  return (
    <section className="flex flex-col w-full">
      <div className="text-center pointer-events-none">
        <p className="text-4xl font-bold leading-none">{t("min.historial")}</p>
        <p className="text-2xl text-lightgrey">{t("min.alarmas")}</p>
      </div>
      <div className="flex flex-col gap-5">
        <Filtros
          table={table}
          dateRange={dateRange}
          setDateRange={setDateRange}
          error={error}
          onRetry={loadData}
          onClearFilters={handleClearFilters}
        />
        <Tabla
          table={table}
          isLoading={isLoading}
          columnDefs={columnDefs}
          error={error}
        />
      </div>
    </section>
  );
}
