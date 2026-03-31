import {
  exportToExcelGrafico,
  exportToExcelProductividad,
} from "../(excel)/excelExport";

export function handleExportGrafico(graficoData: any) {
  if (!graficoData) {
    alert("No hay datos del gráfico para exportar");
    return;
  }
  const sensores = ["Temperatura agua", "Temperatura producto", "Nivel agua"];
  const fechaMap = new Map();
  sensores.forEach((sensor) => {
    const readings = graficoData[sensor] as any[];
    if (Array.isArray(readings)) {
      readings.forEach((r) => {
        const fecha = r.fechaRegistro;
        if (!fechaMap.has(fecha)) {
          fechaMap.set(fecha, { Fecha: fecha });
        }
        if (sensor === "Temperatura agua")
          fechaMap.get(fecha)["Temp. Agua"] = r.valor;
        if (sensor === "Temperatura producto")
          fechaMap.get(fecha)["Temp. Producto"] = r.valor;
        if (sensor === "Nivel agua")
          fechaMap.get(fecha)["Nivel Agua"] = r.valor;
      });
    }
  });
  const rows = Array.from(fechaMap.values()).sort((a, b) =>
    a.Fecha.localeCompare(b.Fecha),
  );
  exportToExcelGrafico({
    data: rows,
    fileName: "grafico_historico.xlsx",
    sheetName: "Grafico",
  });
}

export function handleExportProductividad(productividadData: any) {
  if (!productividadData) {
    alert("No hay datos de productividad para exportar");
    return;
  }
  const resumen = [
    {
      "Ciclos realizados": productividadData.ciclos_realizados,
      "Producción total": productividadData.produccion_total,
      "Ciclos correctos": productividadData.ciclos_correctos,
      "Ciclos incorrectos": productividadData.ciclos_incorrectos,
    },
  ];
  const productos =
    productividadData.productos_realizados?.map((p: any) => ({
      "Nombre receta": p.nombre_receta,
      "Capacidad receta": p.capacidad_receta,
      "Cantidad ciclos": p.cantidad_ciclos,
    })) || [];
  exportToExcelProductividad({
    resumen,
    productos,
    fileName: "productividad.xlsx",
  });
}
