import { Button } from "@/components/ui/button";
import { FaFilePdf } from "react-icons/fa";
import { useTranslation } from "react-i18next";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { toast } from "sonner";

import logoDataURL from "../../public/cremonabase64";

interface BotonInformeProps {
  selectClasses?: string;
  equipo?: string;
  cicloId?: number | null;
}

export default function BotonInforme({
  selectClasses,
  equipo,
  cicloId,
}: BotonInformeProps) {
  const { t } = useTranslation();

  const formatDateForTable = (dateString: string | null | undefined) => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);

      if (isNaN(date.getTime())) return dateString;

      const year = date.getFullYear();
      const month = (date.getMonth() + 1).toString().padStart(2, "0");
      const day = date.getDate().toString().padStart(2, "0");
      const hours = date.getHours().toString().padStart(2, "0");
      const minutes = date.getMinutes().toString().padStart(2, "0");
      const seconds = date.getSeconds().toString().padStart(2, "0");

      return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    } catch {
      return dateString;
    }
  };

  const handleInformeDownload = async () => {
    if (!equipo || !cicloId) {
      toast.error(t("errorTitulo"), {
        description: t("seleccioneEquipoCicloError"),
        position: "bottom-right",
      });

      return;
    }

    try {
      const graphContainer = document.querySelector(
        ".grafico-historico",
      ) as HTMLElement;

      if (!graphContainer) {
        throw new Error(t("graficoNoEncontradoError"));
      }

      const canvas = await html2canvas(graphContainer, {
        scale: 3,
        backgroundColor: "#000000",
        logging: false,
        useCORS: true,
        allowTaint: true,
        ignoreElements: (element) => {
          return element.classList.contains("pdf-ignore");
        },
      });

      const imgData = canvas.toDataURL("image/png");

      const host = process.env.NEXT_PUBLIC_WS_HOST || "localhost";
      const port = process.env.NEXT_PUBLIC_WS_PORT || "8001";

      const apiUrl = `http://${host}:${port}/historico-graficos/${equipo}/${cicloId}`;

      const response = await fetch(apiUrl, {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        let detailedError = errorText;

        try {
          const errorJson = JSON.parse(errorText);

          detailedError = errorJson.detail || errorJson.message || errorText;
        } catch {}
        throw new Error(
          t("apiError", { status: response.status, error: detailedError }),
        );
      }

      const apiData = await response.json();

      const imgWidth = 287;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      const metadataHeight = 20;

      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: "a4",
      });

      pdf.addImage(imgData, "PNG", 5, 25, imgWidth, imgHeight);

      pdf.rect(0, 0, 297, metadataHeight, "F");

      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(10);
      pdf.setTextColor(255, 255, 255);

      pdf.text(t("pdfEquipo"), 5, 11);
      pdf.text(t("pdfCiclo"), 5, 16);
      pdf.text(t("pdfFechaExportacion"), 5, 6);

      pdf.setFont("helvetica", "normal");

      const currentDate = new Date().toLocaleDateString("es-ES", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });

      pdf.text(equipo, 30, 11); // Ajustado de 20 a 35
      pdf.text(cicloId.toString(), 30, 16);
      pdf.text(currentDate, 30, 6);

      const logoWidth = 40;
      const logoHeight = 10;

      pdf.addImage(logoDataURL, "PNG", 252, 5, logoWidth, logoHeight);
      pdf.link(252, 4, 40, 12, {
        url: "https://creminox.com",
        target: "_blank",
      });

      const jsonData: string[][] = [];
      const generalData = apiData.general || {};

      const tableHeaders = [
        t("pdfHeaderIdCiclo"),
        t("pdfHeaderEquipo"),
        t("pdfHeaderLote"),
        t("pdfHeaderEstadoCiclo"),
        t("pdfHeaderNombreReceta"),
        t("pdfHeaderTempAgua"),
        t("pdfHeaderTempProd"),
        t("pdfHeaderNivelAgua"),
        t("pdfHeaderFechaRegistro"),
      ];

      jsonData.push(tableHeaders);

      const temperaturaAguaData = apiData["Temperatura agua"] || [];
      const temperaturaProductoData = apiData["Temperatura producto"] || [];
      const nivelAguaData = apiData["Nivel agua"] || [];

      const temperaturaAguaMap = new Map(
        temperaturaAguaData.map((item: any) => [
          item.fechaRegistro,
          item.valor,
        ]),
      );
      const temperaturaProductoMap = new Map(
        temperaturaProductoData.map((item: any) => [
          item.fechaRegistro,
          item.valor,
        ]),
      );
      const nivelAguaMap = new Map(
        nivelAguaData.map((item: any) => [item.fechaRegistro, item.valor]),
      );

      const allTimestamps = new Set<string>();

      temperaturaAguaData.forEach((item: any) =>
        allTimestamps.add(item.fechaRegistro),
      );
      temperaturaProductoData.forEach((item: any) =>
        allTimestamps.add(item.fechaRegistro),
      );
      nivelAguaData.forEach((item: any) =>
        allTimestamps.add(item.fechaRegistro),
      );

      const sortedTimestamps = Array.from(allTimestamps).sort(
        (a, b) => new Date(a).getTime() - new Date(b).getTime(),
      );

      for (const ts of sortedTimestamps) {
        const row = [
          String(generalData.id_ciclo || cicloId || ""),
          String(equipo || ""),
          String(generalData.ciclo_lote || ""),
          t("pdfEstadoCicloValor"),
          String(generalData.receta || ""),
          String(temperaturaAguaMap.get(ts) ?? ""),
          String(temperaturaProductoMap.get(ts) ?? ""),
          String(nivelAguaMap.get(ts) ?? ""),
          formatDateForTable(ts),
        ];

        jsonData.push(row);
      }

      if (jsonData.length > 1 && jsonData[0] && jsonData[0].length > 0) {
        pdf.addPage();

        pdf.rect(0, 0, 297, metadataHeight, "F"); // Encabezado de página
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(10);
        pdf.setTextColor(255, 255, 255); // Texto blanco para encabezado de página
        pdf.text(t("pdfDatosDelCiclo"), 5, 11);
        pdf.text(t("pdfEquipo"), 100, 11);
        pdf.text(t("pdfCiclo"), 100, 16);
        pdf.setFont("helvetica", "normal");
        pdf.text(equipo || "", 130, 11); // Ajustado de 115 a 130
        pdf.text(cicloId?.toString() || "", 111, 16);
        pdf.addImage(logoDataURL, "PNG", 252, 5, logoWidth, logoHeight);

        const tableStartY = metadataHeight + 5;
        const cellHeight = 6;
        const margin = 5;
        const pageWidth = 297;
        const tableWidth = pageWidth - 2 * margin;

        const numCols = jsonData[0].length;
        const cellWidth = tableWidth / numCols;

        const tableFontSize = 6.5;
        const textPadding = 1;
        const textMaxWidth = Math.max(1, cellWidth - 2 * textPadding);
        const textYOffset = cellHeight / 2 + tableFontSize / 3.5;

        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(tableFontSize);

        for (let col = 0; col < numCols; col++) {
          const x = margin + col * cellWidth;

          pdf.setFillColor(220, 220, 220); // Fondo gris claro para CADA celda de cabecera
          pdf.setTextColor(0, 0, 0); // Texto NEGRO para CADA celda de cabecera
          pdf.rect(x, tableStartY, cellWidth, cellHeight, "FD"); // 'FD' para rellenar y dibujar borde
          pdf.text(
            String(jsonData[0][col] || ""),
            x + textPadding,
            tableStartY + textYOffset,
            { maxWidth: textMaxWidth, align: "left" },
          );
        }

        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(tableFontSize);
        pdf.setTextColor(0, 0, 0); // Texto de datos NEGRO

        let currentY = tableStartY + cellHeight;
        const pageBottomMargin = 10;
        const maxContentHeightOnPage = 210 - pageBottomMargin - metadataHeight;

        for (let rowIdx = 1; rowIdx < jsonData.length; rowIdx++) {
          if (currentY + cellHeight > maxContentHeightOnPage) {
            pdf.addPage();

            pdf.rect(0, 0, 297, metadataHeight, "F"); // Encabezado de página nueva
            pdf.setFont("helvetica", "bold");
            pdf.setFontSize(10);
            pdf.setTextColor(255, 255, 255); // Texto blanco para encabezado de página nueva
            pdf.text(t("pdfDatosDelCicloCont"), 5, 11);
            pdf.text(t("pdfEquipo"), 100, 11);
            pdf.text(t("pdfCiclo"), 100, 16);
            pdf.setFont("helvetica", "normal");
            pdf.text(equipo || "", 130, 11); // Ajustado de 115 a 130
            pdf.text(cicloId?.toString() || "", 111, 16);
            pdf.addImage(logoDataURL, "PNG", 252, 5, logoWidth, logoHeight);

            currentY = tableStartY;

            pdf.setFont("helvetica", "bold");
            pdf.setFontSize(tableFontSize);

            for (let col = 0; col < numCols; col++) {
              const x = margin + col * cellWidth;

              pdf.setFillColor(220, 220, 220); // Fondo gris claro para CADA celda de cabecera
              pdf.setTextColor(0, 0, 0); // Texto NEGRO para CADA celda de cabecera
              pdf.rect(x, currentY, cellWidth, cellHeight, "FD"); // 'FD' para rellenar y dibujar borde
              pdf.text(
                String(jsonData[0][col] || ""),
                x + textPadding,
                currentY + textYOffset,
                { maxWidth: textMaxWidth, align: "left" },
              );
            }
            currentY += cellHeight;
            pdf.setFont("helvetica", "normal");
            pdf.setTextColor(0, 0, 0); // Texto de datos NEGRO
            pdf.setFontSize(tableFontSize);
          }

          for (let col = 0; col < numCols; col++) {
            const x = margin + col * cellWidth;

            pdf.rect(x, currentY, cellWidth, cellHeight, "S");
            const cellValue = String(jsonData[rowIdx][col] || "");

            pdf.text(cellValue, x + textPadding, currentY + textYOffset, {
              maxWidth: textMaxWidth,
              align: "left",
            });
          }
          currentY += cellHeight;
        }
      } else {
        pdf.addPage();
        pdf.text(t("datosTabularesNoDisponibles"), 10, metadataHeight + 10);
      }

      pdf.save(`${t("nombreArchivoInforme")}_${equipo}_Ciclo-${cicloId}.pdf`);

      toast.success(t("exitoTitulo"), {
        description: t("informeDescargadoExito"),
        position: "bottom-right",
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : t("errorGenerarInformeDesconocido");

      toast.error(t("errorTitulo"), {
        description: errorMessage,
        position: "bottom-right",
      });
    }
  };

  return (
    <Button
      className={`text-primary ${selectClasses || "h-1/5"} min-w-[160px]`}
      variant="ghost"
      onClick={handleInformeDownload}
    >
      <FaFilePdf style={{ marginRight: "8px" }} />
      {t("informe") || "Informe Completo"}
    </Button>
  );
}
