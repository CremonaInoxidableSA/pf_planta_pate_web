"use client";

import React, { useMemo, useState, useEffect, useCallback } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
  type ColumnFiltersState,
  type Row,
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
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Download,
  FilterX,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import * as XLSX from "xlsx";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import logoDataURL from "@/public/logo/cremonabase64";

export interface Alerta {
  key: string;
  description: string;
  type: string;
  state: string;
  time: string;
}

interface AlarmaData {
  id_alarma: number;
  descripcion: string;
  tipoAlarma: string;
  estadoAlarma: boolean;
  fechaRegistro: string;
}

const formatDate = (raw: string): string => {
  try {
    return new Date(raw).toISOString().slice(0, 16).replace("T", " ");
  } catch {
    return raw || "";
  }
};

const highlightText = (text: string, filter: string): React.ReactNode => {
  if (!filter) return text;
  try {
    const escaped = filter.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(`(${escaped})`, "gi");
    const parts = text.split(regex);
    return parts.map((part, i) =>
      part.toLowerCase() === filter.toLowerCase() ? (
        <mark
          key={i}
          className="bg-yellow-400/40 text-texto font-bold rounded-sm"
        >
          {part}
        </mark>
      ) : (
        <span key={i}>{part}</span>
      ),
    );
  } catch {
    return text;
  }
};

type ColumnKey = "description" | "type" | "state" | "time";

const Tabla: React.FC = () => {
  const { t } = useTranslation();
  const [data, setData] = useState<Alerta[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [dateRange, setDateRange] = useState<{
    from: string;
    to: string;
  }>({ from: "", to: "" });
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });

  const isSecure =
    typeof window !== "undefined" && window.location.protocol === "https:";
  const wsProtocol = isSecure ? "wss:" : "ws:";
  const host = process.env.NEXT_PUBLIC_WS_HOST || "localhost";
  const port = process.env.NEXT_PUBLIC_WS_PORT || "8001";
  const wsUrl = `${wsProtocol}//${host}:${port}/ws`;

  const connectWebSocket = useCallback(() => {
    setIsLoading(true);
    setError(null);
    try {
      const socket = new WebSocket(wsUrl);
      socket.onmessage = (event) => {
        try {
          const parsed = JSON.parse(event.data);
          const alarmas: AlarmaData[] =
            Array.isArray(parsed) && parsed.length >= 4 ? parsed[3] : [];
          if (Array.isArray(alarmas) && alarmas.length > 0) {
            setData((prev) => {
              const updated = [...prev];
              alarmas.forEach((alarma) => {
                if (alarma.descripcion?.trim()) {
                  const idx = updated.findIndex(
                    (i) => i.key === alarma.id_alarma.toString(),
                  );
                  const item: Alerta = {
                    key: alarma.id_alarma.toString(),
                    description: alarma.descripcion,
                    type: alarma.tipoAlarma,
                    state: alarma.estadoAlarma ? "Activo" : "Inactivo",
                    time: alarma.fechaRegistro,
                  };
                  if (idx !== -1) updated[idx] = item;
                  else updated.push(item);
                }
              });
              return updated.filter((i) => i.description?.trim());
            });
            setIsLoading(false);
          }
        } catch {
          setError(t("noSePudieronObtenerDatos"));
          setIsLoading(false);
        }
      };
      socket.onerror = () => {
        setError(t("noSePudieronObtenerDatos"));
        setIsLoading(false);
      };
      return () => socket.close();
    } catch {
      setError(t("error"));
      setIsLoading(false);
      return () => {};
    }
  }, [wsUrl, t]);

  useEffect(() => {
    return connectWebSocket();
  }, [connectWebSocket]);

  useEffect(() => {
    if (!error) return;
    const load = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`http://${host}:${port}/alarmas`);
        if (!res.ok) throw new Error();
        const apiData = await res.json();
        setData(
          apiData.map(
            (a: {
              id_alarma: number;
              descripcion: string;
              tipo: string;
              estadoAlarma: boolean;
              fecha_registro: string;
            }) => ({
              key: a.id_alarma.toString(),
              description: a.descripcion,
              type: a.tipo,
              state: a.estadoAlarma ? "Activo" : "Inactivo",
              time: a.fecha_registro,
            }),
          ),
        );
        setError(null);
      } catch {
        setError(t("noSePudieronObtenerDatos"));
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [error, t, host, port]);

  const dateFilteredData = useMemo(() => {
    if (!dateRange.from && !dateRange.to) return data;
    const from = dateRange.from ? new Date(dateRange.from) : new Date(0);
    const to = dateRange.to
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
  }, [data, dateRange.from, dateRange.to]);

  const columnDefs = useMemo<ColumnDef<Alerta>[]>(() => {
    const getColFilter = (id: string) => {
      const f = columnFilters.find((f) => f.id === id);
      return f?.value ? String(f.value) : "";
    };

    return [
      {
        accessorKey: "description",
        header: t("descripcion"),
        cell: ({ getValue }) =>
          highlightText(getValue<string>() || "", getColFilter("description")),
      },
      {
        accessorKey: "type",
        header: t("tipo"),
        cell: ({ getValue }) =>
          highlightText(getValue<string>() || "", getColFilter("type")),
      },
      {
        accessorKey: "state",
        header: t("estado"),
        cell: ({ getValue }) =>
          highlightText(getValue<string>() || "", getColFilter("state")),
      },
      {
        accessorKey: "time",
        header: t("fechaRegistro"),
        accessorFn: (row) => formatDate(row.time),
        cell: ({ row }) =>
          highlightText(formatDate(row.original.time), getColFilter("time")),
      },
    ];
  }, [t, columnFilters]);

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
    setDateRange({ from: "", to: "" });
    toast.success(t("filtrosLimpiados"), { position: "bottom-right" });
  };

  const colHeaders = [
    t("descripcion"),
    t("tipo"),
    t("estado"),
    t("fechaRegistro"),
  ];

  const rowToArray = (row: Alerta) => [
    row.description,
    row.type,
    row.state,
    formatDate(row.time),
  ];

  const exportPDF = (rows: Row<Alerta>[]) => {
    try {
      const doc = new jsPDF({
        orientation: "portrait",
        unit: "pt",
        format: "A4",
      });
      const pageWidth = doc.internal.pageSize.getWidth();
      const headerHeight = 70;
      const exportDate = new Date().toLocaleDateString("es-ES", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });

      doc.setFillColor(19, 19, 19);
      doc.rect(0, 0, pageWidth, headerHeight, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.text("Fecha de exportación:", 20, 25);
      doc.text("Contacto: soporte@creminox.com", 20, 40);
      doc.text(`Total de registros: ${rows.length}`, 20, 55);
      doc.setFont("helvetica", "normal");
      doc.text(exportDate, 145, 25);

      const logoWidth = 120;
      const logoHeight = 25;
      const logoX = pageWidth - logoWidth - 40;
      const logoY = (headerHeight - logoHeight) / 2;
      doc.addImage(logoDataURL, "PNG", logoX, logoY, logoWidth, logoHeight);
      doc.link(logoX, logoY, logoWidth, logoHeight, {
        url: "https://creminox.com",
      });

      autoTable(doc, {
        head: [colHeaders],
        body: rows.map((r) => rowToArray(r.original)),
        theme: "grid",
        margin: { top: headerHeight + 10 },
        styles: {
          fillColor: [41, 41, 41],
          textColor: [255, 255, 255],
          fontSize: 9,
        },
        headStyles: {
          fillColor: [25, 25, 25],
          textColor: [255, 255, 255],
          fontStyle: "bold",
        },
        alternateRowStyles: { fillColor: [30, 30, 30] },
        tableLineColor: [100, 100, 100],
        tableLineWidth: 0.1,
      });

      doc.save("Registro_Eventos.pdf");
      toast.success("Éxito", {
        description: "PDF descargado correctamente",
        position: "bottom-right",
      });
    } catch (err) {
      toast.error("Error", {
        description:
          err instanceof Error ? err.message : "Error al generar el PDF",
        position: "bottom-right",
      });
    }
  };

  const exportExcel = (rows: Row<Alerta>[], fileName: string) => {
    try {
      const sheetData = rows.map((r) => {
        const arr = rowToArray(r.original);
        return Object.fromEntries(colHeaders.map((h, i) => [h, arr[i]]));
      });
      const ws = XLSX.utils.json_to_sheet(sheetData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Alertas");
      XLSX.writeFile(wb, `${fileName}.xlsx`);
      toast.success("Éxito", {
        description: "Excel descargado correctamente",
        position: "bottom-right",
      });
    } catch (err) {
      toast.error("Error", {
        description:
          err instanceof Error ? err.message : "Error al generar el Excel",
        position: "bottom-right",
      });
    }
  };

  return (
    <div className="w-full bg-background1 rounded-[15px] p-5 text-[#d9d9d9]">
      {/* ── Toolbar ── */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        {/* Export dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              className="bg-[#761122] hover:bg-[#8f1529] text-texto"
              size="sm"
            >
              <Download className="size-4" />
              {t("exportar")}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="bg-[#1e1e1e] border-[#515151] text-[#d9d9d9]">
            <DropdownMenuItem
              className="hover:bg-[#2a2a2a] cursor-pointer"
              onClick={() => exportPDF(table.getPrePaginationRowModel().rows)}
            >
              {t("exptodaspdf")}
            </DropdownMenuItem>
            <DropdownMenuItem
              className="hover:bg-[#2a2a2a] cursor-pointer"
              onClick={() => exportPDF(table.getRowModel().rows)}
            >
              {t("expvisiblespdf")}
            </DropdownMenuItem>
            <DropdownMenuItem
              className="hover:bg-[#2a2a2a] cursor-pointer"
              onClick={() =>
                exportExcel(
                  table.getPrePaginationRowModel().rows,
                  "Todas_Alertas",
                )
              }
            >
              {t("exptodasexcel")}
            </DropdownMenuItem>
            <DropdownMenuItem
              className="hover:bg-[#2a2a2a] cursor-pointer"
              onClick={() =>
                exportExcel(table.getRowModel().rows, "Alertas_Visibles")
              }
            >
              {t("expvisiblesexcel")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Date range */}
        <div className="flex items-center gap-2">
          <label className="text-xs text-[#8c8c8c] whitespace-nowrap">
            {t("fechaInicio")}
          </label>
          <Input
            type="date"
            value={dateRange.from}
            className="h-8 w-36 bg-transparent border-[#515151] text-[#d9d9d9] scheme-dark"
            onChange={(e) =>
              setDateRange((prev) => ({ ...prev, from: e.target.value }))
            }
          />
          <label className="text-xs text-[#8c8c8c] whitespace-nowrap">
            {t("fechaFin")}
          </label>
          <Input
            type="date"
            value={dateRange.to}
            className="h-8 w-36 bg-transparent border-[#515151] text-[#d9d9d9] scheme-dark"
            onChange={(e) =>
              setDateRange((prev) => ({ ...prev, to: e.target.value }))
            }
          />
        </div>

        {/* Clear filters */}
        <Button
          variant="outline"
          size="sm"
          className="border-[#515151] text-[#d9d9d9] bg-transparent hover:bg-white/5 hover:text-texto"
          onClick={handleClearFilters}
        >
          <FilterX className="size-4" />
          {t("limpiarFiltros")}
        </Button>

        {error && (
          <Button
            size="sm"
            className="bg-[#761122] hover:bg-[#8f1529] text-texto"
            onClick={connectWebSocket}
          >
            {t("reintentar")}
          </Button>
        )}

        {/* Title centred */}
        <div className="ml-auto text-center pointer-events-none">
          <p className="text-xl font-bold leading-none">{t("historial")}</p>
          <p className="text-sm text-[#8c8c8c]">{t("alertas")}</p>
        </div>
      </div>

      {/* ── Column filters row ── */}
      <div className="grid grid-cols-4 gap-2 mb-3">
        {(["description", "type", "state", "time"] as ColumnKey[]).map(
          (col) => (
            <Input
              key={col}
              placeholder={`${t("filtrar")} ${table.getColumn(col)?.columnDef.header as string}…`}
              value={(table.getColumn(col)?.getFilterValue() as string) ?? ""}
              className="h-7 text-xs bg-transparent border-[#515151] text-[#d9d9d9] placeholder:text-[#515151]"
              onChange={(e) =>
                table.getColumn(col)?.setFilterValue(e.target.value)
              }
            />
          ),
        )}
      </div>

      {/* ── Table ── */}
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
                  className="text-center py-8 text-[#8c8c8c]"
                >
                  {error || t("noExistenDatos")}
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  className="border-[#515151] hover:bg-white/3 bg-[#131313]"
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
      <div className="flex items-center justify-between mt-3 text-sm text-[#8c8c8c]">
        <span>
          {t("pagina")} {table.getState().pagination.pageIndex + 1} {t("de")}{" "}
          {table.getPageCount()}
          {" · "}
          {table.getFilteredRowModel().rows.length} {t("registros")}
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
                {s} / {t("pagina")}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

export default Tabla;
