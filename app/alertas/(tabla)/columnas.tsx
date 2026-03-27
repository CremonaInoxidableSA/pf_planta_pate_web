import type { ColumnDef, ColumnFiltersState } from "@tanstack/react-table";
import type { Alerta } from "./types";
import { formatDate, highlightText } from "./utils";

export const getColumnDefs = (
  t: (key: string) => string,
  columnFilters: ColumnFiltersState,
): ColumnDef<Alerta>[] => {
  const getColFilter = (id: string) => {
    const f = columnFilters.find((f) => f.id === id);
    return f?.value ? String(f.value) : "";
  };

  return [
    {
      accessorKey: "description",
      header: t("min.descripcion"),
      cell: ({ getValue }) =>
        highlightText(getValue<string>() || "", getColFilter("description")),
    },
    {
      accessorKey: "type",
      header: t("min.tipo"),
      cell: ({ getValue }) =>
        highlightText(getValue<string>() || "", getColFilter("type")),
    },
    {
      accessorKey: "state",
      header: t("min.estado"),
      cell: ({ getValue }) =>
        highlightText(getValue<string>() || "", getColFilter("state")),
    },
    {
      accessorKey: "time",
      header: t("min.fechaRegistro"),
      accessorFn: (row) => formatDate(row.time),
      cell: ({ row }) =>
        highlightText(formatDate(row.original.time), getColFilter("time")),
    },
  ];
};
