import type { ColumnDef, ColumnFiltersState } from "@tanstack/react-table";
import type { Alarma } from "./types";
import { formatDate, highlightText } from "./utils";

export const getColumnDefs = (
  t: (key: string) => string,
  columnFilters: ColumnFiltersState,
): ColumnDef<Alarma>[] => {
  const getColFilter = (id: string) => {
    const f = columnFilters.find((f) => f.id === id);
    return f?.value ? String(f.value) : "";
  };

  return [
    {
      accessorKey: "name",
      header: t("min.nombre"),
      cell: ({ getValue }) =>
        highlightText(getValue<string>() || "", getColFilter("name")),
    },
    {
      accessorKey: "type",
      header: t("min.tipo"),
      cell: ({ getValue }) =>
        highlightText(getValue<string>() || "", getColFilter("type")),
    },
    {
      accessorKey: "description",
      header: t("min.descripcion"),
      cell: ({ getValue }) =>
        highlightText(getValue<string>() || "", getColFilter("description")),
    },
    {
      accessorKey: "time",
      header: t("min.fechaInicio"),
      accessorFn: (row) => formatDate(row.time),
      cell: ({ row }) =>
        highlightText(formatDate(row.original.time), getColFilter("time")),
    },
    {
      accessorKey: "timeEnd",
      header: t("min.fechaFin"),
      accessorFn: (row) => formatDate(row.timeEnd),
      cell: ({ row }) =>
        highlightText(
          formatDate(row.original.timeEnd),
          getColFilter("timeEnd"),
        ),
    },
  ];
};
