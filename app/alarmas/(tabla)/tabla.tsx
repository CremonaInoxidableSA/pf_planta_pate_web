"use client";

import React from "react";
import {
  flexRender,
  type ColumnDef,
  type Table as TanstackTable,
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
import type { Alarma } from "./types";

interface TablaProps {
  table: TanstackTable<Alarma>;
  isLoading: boolean;
  columnDefs: ColumnDef<Alarma>[];
  error: string | null;
}

const Tabla: React.FC<TablaProps> = ({
  table,
  isLoading,
  columnDefs,
  error,
}) => {
  const { t } = useTranslation();

  return (
    <div className="w-full">
      <div className="rounded-md overflow-x-auto">
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
                      className="font-bold bg-background2 border-b border-[#515151] cursor-pointer select-none"
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
                      <Skeleton className="h-4 w-full bg-background5" />
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
                  className="border-[#515151] hover:bg-background5 bg-background2"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
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

      <div className="flex items-center justify-between text-sm text-lightgrey">
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
            className="bg-background2 border border-[#515151] rounded text-xs px-1 py-0.5"
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
