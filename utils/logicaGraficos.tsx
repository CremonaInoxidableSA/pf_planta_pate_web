interface DatosEquipo {
  tipo: string;
  id: number;
  estado: string;
  temp_agua: number;
  temp_prod: number;
  temp_ingreso: number;
  temp_chiller: number;
  niv_agua: number;
  receta: string;
  receta_paso_actual: number;
  tiempoTranscurrido: string;
}

interface HistorialItem {
  id_historial: number;
  tiempo: string;
  temp_agua: number;
  temp_prod?: number;
  temp_ingreso?: number;
  niv_agua: number;
  estado: string;
}

interface DetallesEquipo {
  historial: HistorialItem[];
}

export const transformData = (
  equipoId: number,
  datosCocinas: Array<[DatosEquipo, DetallesEquipo]>,
  datosEnfriadores: Array<[DatosEquipo, DetallesEquipo]>,
) => {
  const todosEquipos = [...(datosCocinas || []), ...(datosEnfriadores || [])];
  const equipo = todosEquipos.find(([info]) => info.id === equipoId);

  if (!equipo) {
    const cachedData = localStorage.getItem(`equipo-${equipoId}`);

    if (cachedData) {
      return JSON.parse(cachedData);
    }

    return {
      labels: [],
      datasets: [],
    };
  }

  const [, detalles] = equipo;
  const historial = detalles.historial || [];

  const getTimestamp = (dateStr: string) => {
    const date = new Date(dateStr);

    return Math.floor(date.getTime() / 1000);
  };

  const tiempoInicial =
    historial.length > 0
      ? getTimestamp(historial[0].tiempo)
      : getTimestamp(new Date().toISOString());

  const historialOrdenado = [...historial].sort(
    (a, b) => getTimestamp(a.tiempo) - getTimestamp(b.tiempo),
  );

  const tempAguaData: { x: number; y: number }[] = [];
  const tempProdData: { x: number; y: number }[] = [];
  const nivAguaData: { x: number; y: number }[] = [];

  historialOrdenado.forEach((item) => {
    const tiempoRelativo = getTimestamp(item.tiempo) - tiempoInicial;

    if (typeof item.temp_agua === "number" && !isNaN(item.temp_agua)) {
      tempAguaData.push({ x: tiempoRelativo, y: item.temp_agua });
    }

    if (typeof item.temp_prod === "number" && !isNaN(item.temp_prod)) {
      tempProdData.push({ x: tiempoRelativo, y: item.temp_prod });
    }

    if (typeof item.niv_agua === "number" && !isNaN(item.niv_agua)) {
      nivAguaData.push({ x: tiempoRelativo, y: item.niv_agua });
    }
  });

  const chartData = {
    datasets: [
      {
        label: "Temperatura Agua",
        backgroundColor: "rgba(54, 162, 235, 0.5)",
        borderColor: "rgb(54, 162, 235)",
        fill: false,
        data: tempAguaData,
        yAxisID: "y",
        borderWidth: 2,
        pointRadius: 0,
        tension: 0.4,
      },
      {
        label: "Temperatura Producto",
        backgroundColor: "rgba(75, 192, 75, 0.5)",
        borderColor: "rgb(75, 192, 75)",
        fill: false,
        data: tempProdData,
        yAxisID: "y",
        borderWidth: 2,
        pointRadius: 0,
        tension: 0.4,
      },
      {
        label: "Nivel Agua",
        backgroundColor: "rgba(255, 165, 0, 0.5)",
        borderColor: "rgb(255, 165, 0)",
        fill: false,
        data: nivAguaData,
        yAxisID: "y1",
        borderWidth: 2,
        pointRadius: 0,
        tension: 0.4,
      },
    ],
  };

  try {
    localStorage.setItem(`equipo-${equipoId}`, JSON.stringify(chartData));
  } catch {}

  return chartData;
};

export const clearStoredData = (equipoId: number) => {
  localStorage.removeItem(`equipo-${equipoId}`);
};
