import type { HistorialItem, PuntoTiempo } from "./graficoTypes";

export const ESTADOS_VACIO: string[] = ["INACTIVO"];

export const historialToPoints = (
  historial: HistorialItem[],
): { tempAgua: PuntoTiempo[]; tempProd: PuntoTiempo[] } => {
  if (!historial.length) return { tempAgua: [], tempProd: [] };

  const sorted = [...historial].sort(
    (a, b) => new Date(a.tiempo).getTime() - new Date(b.tiempo).getTime(),
  );

  const t0 = new Date(sorted[0].tiempo).getTime() / 1000;

  const tempAgua: PuntoTiempo[] = [];
  const tempProd: PuntoTiempo[] = [];

  for (const item of sorted) {
    const x = Math.round(new Date(item.tiempo).getTime() / 1000 - t0);

    if (typeof item.temp_agua === "number" && !isNaN(item.temp_agua)) {
      tempAgua.push({ x, y: item.temp_agua });
    }

    if (
      typeof item.temp_prod === "number" &&
      !isNaN(item.temp_prod) &&
      item.temp_prod !== 0
    ) {
      tempProd.push({ x, y: item.temp_prod });
    }
  }

  return { tempAgua, tempProd };
};
