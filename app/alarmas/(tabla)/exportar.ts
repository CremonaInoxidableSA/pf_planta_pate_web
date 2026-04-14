export const exportExcelFromAPI = async (dateRange?: {
  from?: Date;
  to?: Date;
}) => {
  try {
    const today = new Date();
    const from = dateRange?.from ?? today;
    const to = dateRange?.to ?? today;
    const fromStr = from.toISOString().slice(0, 10);
    const toStr = to.toISOString().slice(0, 10);
    const url = `/api/alarmas/descarga?descargar=1&fecha_inicio=${fromStr}&fecha_fin=${toStr}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error("Error al descargar archivo");
    const blob = await response.blob();
    const fecha = `_${fromStr}_a_${toStr}`;
    const fileName = `alarmas${fecha}.xlsx`;
    if (window.saveAs) {
      window.saveAs(blob, fileName);
    } else {
      const link = document.createElement("a");
      link.href = window.URL.createObjectURL(blob);
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
    toast.success("Éxito", {
      description: "Excel descargado correctamente",
      position: "bottom-right",
    });
  } catch (err) {
    toast.error("Error", {
      description:
        err instanceof Error ? err.message : "Error al descargar el Excel",
      position: "bottom-right",
    });
  }
};
import * as XLSX from "xlsx";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { toast } from "sonner";
import logoDataURL from "@/public/logo/cremonabase64";
import type { Row } from "@tanstack/react-table";
import type { Alarma } from "./types";
import { formatDate } from "./utils";

export const getColHeaders = (t: (key: string) => string): string[] => [
  t("min.nombre"),
  t("min.tipo"),
  t("min.descripcion"),
  t("min.fechaInicio"),
  t("min.fechaFin"),
];

export const rowToArray = (row: Alarma): string[] => [
  row.name,
  row.type,
  row.description,
  formatDate(row.time),
  formatDate(row.timeEnd),
];

export const exportPDF = (
  rows: Row<Alarma>[],
  colHeaders: string[],
  dateRange?: { from?: Date; to?: Date },
): void => {
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
    const dateRangeStr =
      dateRange?.from && dateRange?.to
        ? `(${dateRange.from.toISOString().slice(0, 10)} a ${dateRange.to.toISOString().slice(0, 10)})`
        : "";

    doc.setFillColor(255, 255, 255);
    doc.rect(0, 0, pageWidth, headerHeight, "F");
    doc.setTextColor(0, 0, 0);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text("Fecha de exportación:", 20, 25);
    doc.text("Contacto: soporte@creminox.com", 20, 40);
    doc.text(`Total de registros: ${rows.length}`, 20, 55);
    doc.setFont("helvetica", "normal");
    doc.text(exportDate, 145, 25);
    if (dateRangeStr) {
      doc.setFontSize(8);
      doc.text(`Rango: ${dateRangeStr}`, 20, 68);
    }

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
        fillColor: [255, 255, 255],
        textColor: [0, 0, 0],
        fontSize: 9,
      },
      headStyles: {
        fillColor: [245, 245, 245],
        textColor: [0, 0, 0],
        fontStyle: "bold",
      },
      alternateRowStyles: { fillColor: [255, 255, 255] },
      tableLineColor: [200, 200, 200],
      tableLineWidth: 0.1,
    });

    const fromStr = dateRange?.from
      ? dateRange.from.toISOString().slice(0, 10)
      : "";
    const toStr = dateRange?.to ? dateRange.to.toISOString().slice(0, 10) : "";
    const fileName =
      dateRange?.from && dateRange?.to
        ? `Registro_Eventos_${fromStr}_a_${toStr}.pdf`
        : "Registro_Eventos.pdf";
    doc.save(fileName);
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
  rows: Row<Alarma>[],
  colHeaders: string[],
  fileName: string,
  dateRange?: { from?: Date; to?: Date },
): void => {
  try {
    const sheetData = rows.map((r) => {
      const arr = rowToArray(r.original);
      return Object.fromEntries(colHeaders.map((h, i) => [h, arr[i]]));
    });
    const ws = XLSX.utils.json_to_sheet(sheetData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Alarmas");
    const exportDate = new Date().toISOString().slice(0, 10);
    const fromStr = dateRange?.from
      ? dateRange.from.toISOString().slice(0, 10)
      : "";
    const toStr = dateRange?.to ? dateRange.to.toISOString().slice(0, 10) : "";
    const fileNameWithDate =
      dateRange?.from && dateRange?.to
        ? `${fileName}_${fromStr}_a_${toStr}.xlsx`
        : `${fileName}_${exportDate}.xlsx`;
    XLSX.writeFile(wb, fileNameWithDate);
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
