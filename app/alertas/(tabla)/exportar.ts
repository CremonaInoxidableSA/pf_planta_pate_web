import * as XLSX from "xlsx";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { toast } from "sonner";
import logoDataURL from "@/public/logo/cremonabase64";
import type { Row } from "@tanstack/react-table";
import type { Alerta } from "./types";
import { formatDate } from "./utils";

export const getColHeaders = (t: (key: string) => string): string[] => [
  t("min.descripcion"),
  t("min.tipo"),
  t("min.estado"),
  t("min.fechaRegistro"),
];

export const rowToArray = (row: Alerta): string[] => [
  row.description,
  row.type,
  row.state,
  formatDate(row.time),
];

export const exportPDF = (rows: Row<Alerta>[], colHeaders: string[]): void => {
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

export const exportExcel = (
  rows: Row<Alerta>[],
  colHeaders: string[],
  fileName: string,
): void => {
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
