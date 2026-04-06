"use client";

import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { useTranslation } from "react-i18next";

interface ExportButtonProps {
  onExport: () => void;
  disabled?: boolean;
}

const ExportButton: React.FC<ExportButtonProps> = ({ onExport, disabled }) => {
  const { t } = useTranslation();
  return (
    <Button
      variant="outline"
      className="w-1/2 h-full flex items-center gap-2"
      disabled={disabled}
      onClick={onExport}
    >
      <Download className="w-4 h-4" /> {t("min.exportarExcel")}
    </Button>
  );
};

export default ExportButton;
