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
import { exportPDF, exportExcel, getColHeaders } from "../exportar";
import type { Alerta } from "../types";

interface BotonExportarProps {
  allRows: Row<Alerta>[];
  visibleRows: Row<Alerta>[];
}

const BotonExportar: React.FC<BotonExportarProps> = ({
  allRows,
  visibleRows,
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
          onClick={() => exportPDF(visibleRows, colHeaders)}
        >
          {t("min.expvisiblespdf")}
        </DropdownMenuItem>
        <DropdownMenuItem
          className="hover:bg-background5 cursor-pointer"
          onClick={() => exportExcel(allRows, colHeaders, "Todas_Alertas")}
        >
          {t("min.exptodasexcel")}
        </DropdownMenuItem>
        <DropdownMenuItem
          className="hover:bg-background5 cursor-pointer"
          onClick={() =>
            exportExcel(visibleRows, colHeaders, "Alertas_Visibles")
          }
        >
          {t("min.expvisiblesexcel")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default BotonExportar;
