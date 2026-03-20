import { Button } from "@/components/ui/button";
import { FaFilePdf } from "react-icons/fa";
import { useTranslation } from "react-i18next";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { toast } from "sonner";

import logoDataURL from "../../public/cremonabase64"; // Asegúrate que esta ruta es correcta

interface ProductoRealizadoAPI {
  nombre_receta: string;
  capacidad_receta: number;
  cantidad_ciclos: number;
}

interface ProductividadDataAPI {
  ciclos_realizados: number;
  produccion_total: number;
  ciclos_correctos: number;
  ciclos_incorrectos: number;
  productos_realizados: ProductoRealizadoAPI[];
}

interface BotonInformeProductividadProps {
  selectClasses?: string;
  lineaId?: number;
  equipoId?: number;
  startDate?: string | null;
  endDate?: string | null;
}

export default function BotonInformeProductividad({
  selectClasses,
  lineaId,
  equipoId,
  startDate,
  endDate,
}: BotonInformeProductividadProps) {
  const { t } = useTranslation();

  const getLineaName = (id?: number) => {
    if (id === undefined) return t("todasLasLineas", "Todas las líneas");
    switch (id) {
      case 15:
        return t("linea1", "Línea 1");
      case 16:
        return t("linea2", "Línea 2");
      default:
        return `${t("linea", "Línea")} ${id}`;
    }
  };

  const getEquipoName = (id?: number) => {
    if (!id || id === 30) return t("todosLosEquipos", "Todos los equipos");

    return id <= 6
      ? `${t("cocina", "Cocina")} ${id}`
      : `${t("enfriador", "Enfriador")} ${id - 6}`;
  };

  const handleInformeUnificadoDownload = async () => {
    try {
      const productivityContainer = document.querySelector(
        ".productividad-container",
      ) as HTMLElement;

      if (!productivityContainer) {
        throw new Error(
          t(
            "error.productividadContainerNoEncontrado",
            "No se encontró el contenedor de productividad para la captura.",
          ),
        );
      }

      const canvas = await html2canvas(productivityContainer, {
        scale: 3, // Aumentado de 2 a 3 para mejor calidad
        logging: false,
        useCORS: true,
        allowTaint: true,
        ignoreElements: (element) => {
          return (
            element.classList.contains("pdf-ignore") ||
            element.classList.contains("recharts-tooltip-wrapper") ||
            element.classList.contains("ciclos-image") ||
            element.classList.contains("product-tooltip")
          );
        },
      });
      const imgData = canvas.toDataURL("image/png");

      const host = process.env.NEXT_PUBLIC_WS_HOST || "192.168.10.114";
      const port = process.env.NEXT_PUBLIC_WS_PORT || "8001";

      const today = new Date().toISOString().split("T")[0];
      const sevenDaysAgo = new Date();

      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const sevenDaysAgoFormatted = sevenDaysAgo.toISOString().split("T")[0];

      const formattedStartDate = startDate
        ? startDate.split("T")[0]
        : sevenDaysAgoFormatted;
      const formattedEndDate = endDate ? endDate.split("T")[0] : today;

      const apiEquipoId = equipoId === 30 ? 0 : equipoId || 0;

      const apiUrl = `http://${host}:${port}/historico-productividad/${apiEquipoId}?fecha_inicio=${formattedStartDate}&fecha_fin=${formattedEndDate}`;

      const response = await fetch(apiUrl, {
        method: "GET",
        headers: { Accept: "application/json" },
      });

      if (!response.ok) {
        const errorText = await response.text();
        let detailedError = errorText;

        try {
          const errorJson = JSON.parse(errorText);

          detailedError = errorJson.detail || errorJson.message || errorText;
        } catch {}
        throw new Error(
          t(
            "error.apiProductividad",
            `Error al obtener datos de productividad: ${response.status} - ${detailedError}`,
            { status: response.status, error: detailedError },
          ),
        );
      }
      const apiData: ProductividadDataAPI = await response.json();

      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: "a4",
      });

      const metadataHeight = 25; // Altura para la información adicional
      const margin = 5;
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const contentWidth = pageWidth - 2 * margin;
      const logoWidth = 40;
      const logoHeight = 10;

      pdf.setFillColor(19, 19, 19);
      pdf.rect(0, 0, pageWidth, metadataHeight, "F");

      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(10);
      pdf.setTextColor(255, 255, 255);

      pdf.text(
        t("pdf.tituloProductividad", "Informe de Productividad"),
        margin,
        8,
      );
      const currentDate = new Date().toLocaleDateString("es-ES", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });

      pdf.text(
        `${t("pdf.fechaExportacion", "Fecha de exportación")}: ${currentDate}`,
        margin,
        14,
      );

      pdf.setFont("helvetica", "normal");
      const lineaText = `${t("pdf.linea", "Línea")}: ${getLineaName(lineaId)}`;
      const equipoText = `${t("pdf.equipo", "Equipo")}: ${getEquipoName(equipoId)}`;

      pdf.text(lineaText, pageWidth / 2 - 30, 8);
      pdf.text(equipoText, pageWidth / 2 - 30, 14);

      pdf.addImage(
        logoDataURL,
        "PNG",
        pageWidth - logoWidth - margin,
        margin,
        logoWidth,
        logoHeight,
      );
      pdf.link(
        pageWidth - logoWidth - margin,
        margin - 1,
        logoWidth,
        logoHeight + 2,
        { url: "https://creminox.com", target: "_blank" },
      );

      const imgPdfWidth = 359; // Ancho fijo para la imagen
      const imgPdfHeight = (canvas.height * imgPdfWidth) / canvas.width;
      const imgY = metadataHeight + margin;

      const maxImgHeight = pageHeight - metadataHeight - 2 * margin;
      const finalImgHeight = Math.min(imgPdfHeight, maxImgHeight);

      pdf.addImage(imgData, "PNG", margin, imgY, imgPdfWidth, finalImgHeight);

      pdf.addPage();

      const drawDataPageHeader = (isContinuation = false) => {
        pdf.setFillColor(19, 19, 19);
        pdf.rect(0, 0, pageWidth, metadataHeight, "F");
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(10);
        pdf.setTextColor(255, 255, 255);
        const pageTitle = isContinuation
          ? t("pdf.datosProductividadCont", "Datos de Productividad (Cont.)")
          : t("pdf.datosProductividad", "Datos de Productividad");

        pdf.text(pageTitle, margin, 8);
        pdf.text(
          `${t("pdf.periodo", "Periodo")}: ${formattedStartDate} - ${formattedEndDate}`,
          margin,
          14,
        );

        pdf.setFont("helvetica", "normal");
        pdf.text(lineaText, pageWidth / 2 - 30, 8);
        pdf.text(equipoText, pageWidth / 2 - 30, 14);

        pdf.addImage(
          logoDataURL,
          "PNG",
          pageWidth - logoWidth - margin,
          margin,
          logoWidth,
          logoHeight,
        );
        pdf.link(
          pageWidth - logoWidth - margin,
          margin - 1,
          logoWidth,
          logoHeight + 2,
          { url: "https://creminox.com", target: "_blank" },
        );
      };

      drawDataPageHeader();
      let currentY = metadataHeight + margin + 5;

      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(10);
      pdf.setTextColor(0, 0, 0);
      pdf.text(
        t("pdf.datosGenerales", "Resumen General de Productividad:"),
        margin,
        currentY,
      );
      currentY += 6;

      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(9);
      const generalData = [
        `${t("pdf.ciclosRealizados", "Ciclos Realizados")}: ${apiData.ciclos_realizados}`,
        `${t("pdf.produccionTotal", "Producción Total")}: ${apiData.produccion_total.toFixed(2)} kg`,
        `${t("pdf.ciclosCorrectos", "Ciclos Correctos")}: ${apiData.ciclos_correctos}`,
        `${t("pdf.ciclosIncorrectos", "Ciclos Incorrectos")}: ${apiData.ciclos_incorrectos}`,
      ];

      generalData.forEach((line) => {
        if (currentY > pageHeight - margin - 10) {
          pdf.addPage();
          drawDataPageHeader(true);
          currentY = metadataHeight + margin + 5;
        }
        pdf.text(line, margin + 5, currentY);
        currentY += 5;
      });
      currentY += 5;

      if (
        apiData.productos_realizados &&
        apiData.productos_realizados.length > 0
      ) {
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(10);
        pdf.setTextColor(0, 0, 0);
        pdf.text(
          t("pdf.productosRealizados", "Detalle de Productos Realizados:"),
          margin,
          currentY,
        );
        currentY += 7;

        const tableHeaders = [
          t("pdf.nombreReceta", "Nombre Receta"),
          t("pdf.capacidadReceta", "Capacidad Receta (kg)"),
          t("pdf.cantidadCiclos", "Cantidad de Ciclos"),
        ];

        const tableDataRows = apiData.productos_realizados.map((p) => [
          p.nombre_receta,
          p.capacidad_receta.toString(),
          p.cantidad_ciclos.toString(),
        ]);

        const cellHeight = 7;
        const tableFontSize = 8;
        const textPadding = 1.5;
        const numCols = tableHeaders.length;
        const cellWidth = contentWidth / numCols;
        const textYOffset = cellHeight / 2 + tableFontSize / 3.5;
        const pageBottomMargin = 10;
        const maxContentHeightOnPage =
          pageHeight - pageBottomMargin - metadataHeight;

        const drawTableHeadersPdf = (yPos: number) => {
          pdf.setFont("helvetica", "bold");
          pdf.setFontSize(tableFontSize);
          for (let col = 0; col < numCols; col++) {
            const x = margin + col * cellWidth;

            pdf.setFillColor(220, 220, 220);
            pdf.setTextColor(0, 0, 0);
            pdf.rect(x, yPos, cellWidth, cellHeight, "FD");
            pdf.text(
              String(tableHeaders[col] || ""),
              x + textPadding,
              yPos + textYOffset,
              { maxWidth: cellWidth - 2 * textPadding, align: "left" },
            );
          }

          return yPos + cellHeight;
        };

        currentY = drawTableHeadersPdf(currentY);

        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(tableFontSize);
        pdf.setTextColor(0, 0, 0);

        for (const row of tableDataRows) {
          if (currentY + cellHeight > maxContentHeightOnPage) {
            pdf.addPage();
            drawDataPageHeader(true);
            currentY = metadataHeight + margin + 5;
            currentY = drawTableHeadersPdf(currentY);
            pdf.setFont("helvetica", "normal");
            pdf.setTextColor(0, 0, 0);
            pdf.setFontSize(tableFontSize);
          }

          for (let colIdx = 0; colIdx < numCols; colIdx++) {
            const x = margin + colIdx * cellWidth;

            pdf.rect(x, currentY, cellWidth, cellHeight, "S");
            const cellValue = String(row[colIdx] || "");

            pdf.text(cellValue, x + textPadding, currentY + textYOffset, {
              maxWidth: cellWidth - 2 * textPadding,
              align: "left",
            });
          }
          currentY += cellHeight;
        }
      } else {
        if (currentY > pageHeight - margin - 10) {
          pdf.addPage();
          drawDataPageHeader(true);
          currentY = metadataHeight + margin + 5;
        }
        pdf.text(
          t(
            "pdf.noProductosRealizados",
            "No hay datos de productos realizados para el periodo seleccionado.",
          ),
          margin,
          currentY,
        );
      }

      const nombreArchivo = `${t("nombreArchivoProductividad", "Informe_Productividad")}_${getEquipoName(equipoId)}_${formattedStartDate}_a_${formattedEndDate}.pdf`;

      pdf.save(nombreArchivo);

      toast.success(t("exitoTitulo", "Éxito"), {
        description: t(
          "exito.informeProductividadDescargado",
          "Informe de productividad descargado correctamente.",
        ),
        position: "bottom-right",
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : t(
              "errorGenerarInformeDesconocido",
              "Ocurrió un error desconocido al generar el informe.",
            );

      toast.error(t("errorTitulo", "Error"), {
        description: errorMessage,
        position: "bottom-right",
      });
    }
  };

  return (
    <Button
      className={`text-primary ${selectClasses || "h-1/5"} min-w-[180px]`}
      variant="ghost"
      onClick={handleInformeUnificadoDownload}
    >
      <FaFilePdf style={{ marginRight: "8px" }} />
      {t("informeProductividad", "Informe Productividad")}
    </Button>
  );
}
