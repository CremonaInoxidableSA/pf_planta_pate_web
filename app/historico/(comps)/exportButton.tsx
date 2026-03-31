"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Download } from "lucide-react";
import { useTranslation } from "react-i18next";

interface ExportButtonProps {
  onExportGrafico: () => void;
  onExportProductividad: () => void;
  disabled?: boolean;
}

const ExportButton: React.FC<ExportButtonProps> = ({ onExportGrafico, onExportProductividad, disabled }) => {
  const [open, setOpen] = useState(false);
  const { t } = useTranslation();
  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="w-1/2 h-full flex items-center gap-2" disabled={disabled}>
          <Download className="w-4 h-4" /> {t("min.exportarExcel")}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        <DropdownMenuItem onClick={onExportGrafico} disabled={disabled}>
          {t("min.exportarDatosGrafico")}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onExportProductividad} disabled={disabled}>
          {t("min.exportarDatosProductividad")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ExportButton;
