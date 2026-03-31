import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

interface ExcelGraficoParams {
  data: Array<Record<string, any>>;
  fileName: string;
  sheetName?: string;
}

export function exportToExcelGrafico({
  data,
  fileName,
  sheetName = "Sheet1",
}: ExcelGraficoParams) {
  // Crear hoja
  const ws = XLSX.utils.json_to_sheet(data);
  // Formato de tabla (auto filtro y banded rows)
  // Asegurar que ws["!ref"] sea string y convertir a Range para encode_range
  const headers = Object.keys(data[0] || {});
  let refRange: XLSX.Range;
  if (typeof ws["!ref"] === "string") {
    refRange = XLSX.utils.decode_range(ws["!ref"]);
  } else {
    // fallback: usar rango por defecto
    refRange = {
      s: { r: 0, c: 0 },
      e: { r: data.length, c: headers.length - 1 },
    };
  }
  ws["!autofilter"] = { ref: XLSX.utils.encode_range(refRange) };
  // Colores para encabezado y columnas (pastel)
  // Encabezado: azul (agua), verde (producto), violeta (nivel)
  // Pastel: usar colores con más blanco
  headers.forEach((h, idx) => {
    const colIdx = XLSX.utils.encode_col(idx);
    // Encabezado
    const cell = ws[colIdx + "1"];
    if (cell) {
      if (h === "Temp. Agua")
        cell.s = {
          fill: { fgColor: { rgb: "039DFC" } },
          font: { bold: true, color: { rgb: "FFFFFF" } },
        };
      else if (h === "Temp. Producto")
        cell.s = {
          fill: { fgColor: { rgb: "29CF00" } },
          font: { bold: true, color: { rgb: "FFFFFF" } },
        };
      else if (h === "Nivel Agua")
        cell.s = {
          fill: { fgColor: { rgb: "A855F7" } },
          font: { bold: true, color: { rgb: "FFFFFF" } },
        };
      else
        cell.s = { fill: { fgColor: { rgb: "CCCCCC" } }, font: { bold: true } };
    }
    // Columnas pastel
    let pastel = null;
    if (h === "Temp. Agua") pastel = "e3f3fc";
    if (h === "Temp. Producto") pastel = "eafbe3";
    if (h === "Nivel Agua") pastel = "f3e3fc";
    if (pastel) {
      for (let r = 2; r <= data.length + 1; r++) {
        const c = ws[colIdx + r];
        if (c) {
          c.s = { fill: { fgColor: { rgb: pastel.toUpperCase() } } };
        }
      }
    }
  });
  // Crear libro y guardar
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName);
  const wbout = XLSX.write(wb, {
    bookType: "xlsx",
    type: "array",
    cellStyles: true,
  });
  saveAs(new Blob([wbout], { type: "application/octet-stream" }), fileName);
}

interface ExcelProductividadParams {
  resumen: Array<Record<string, any>>;
  productos: Array<Record<string, any>>;
  fileName: string;
}

export function exportToExcelProductividad({
  resumen,
  productos,
  fileName,
}: ExcelProductividadParams) {
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(
    wb,
    XLSX.utils.json_to_sheet(resumen),
    "Resumen",
  );
  XLSX.utils.book_append_sheet(
    wb,
    XLSX.utils.json_to_sheet(productos),
    "Productos",
  );
  const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });
  saveAs(new Blob([wbout], { type: "application/octet-stream" }), fileName);
}
