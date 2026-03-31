"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Download } from "lucide-react";

interface ExportButtonProps {
  onExportGrafico: () => void;
  onExportProductividad: () => void;
  disabled?: boolean;
}

const ExportButton: React.FC<ExportButtonProps> = ({ onExportGrafico, onExportProductividad, disabled }) => {
  const [open, setOpen] = useState(false);

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="w-full flex items-center gap-2" disabled={disabled}>
          <Download className="w-4 h-4" /> Exportar Excel
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        <DropdownMenuItem onClick={onExportGrafico} disabled={disabled}>
          Exportar datos del gráfico
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onExportProductividad} disabled={disabled}>
          Exportar datos de productividad
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ExportButton;
