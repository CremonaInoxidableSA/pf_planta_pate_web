"use client";

import React from "react";
import type { Row } from "@tanstack/react-table";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Download } from "lucide-react";
import { exportPDF, getColHeaders, exportExcelFromAPI } from "../exportar";
import type { Alarma } from "../types";

interface BotonExportarProps {
  allRows: Row<Alarma>[];
  visibleRows: Row<Alarma>[];
  dateRange?: { from?: Date; to?: Date };
}

const BotonExportar: React.FC<BotonExportarProps> = ({
  allRows,
  dateRange,
}) => {
  const { t } = useTranslation();
  const colHeaders = getColHeaders(t);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          className="h-full bg-[#761122] hover:bg-[#8f1529] text-white"
          size="sm"
        >
          <Download className="size-4" />
          {t("min.exportar")}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="bg-background2">
        <DropdownMenuItem
          className="hover:bg-background5 cursor-pointer"
          onClick={() => exportPDF(allRows, colHeaders)}
        >
          {t("min.exptodaspdf")}
        </DropdownMenuItem>
        <DropdownMenuItem
          className="hover:bg-background5 cursor-pointer"
          onClick={() => exportExcelFromAPI(dateRange)}
        >
          {t("min.exptodasexcel")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default BotonExportar;
