/**
 * API Route proxy para endpoint de histórico de gráficos (ciclos)
 * Ruta: /api/historico-graficos/[id_equipo]?fecha_inicio=YYYY-MM-DD&fecha_fin=YYYY-MM-DD
 * Redirige a: {API_DATOS_URL}/historico-graficos/[id_equipo]?fecha_inicio=...&fecha_fin=...
 *
 * Corre únicamente en el servidor — la URL real de la API nunca se envía al navegador.
 */

import mockData from "@/mocks/historico-graficos.json";

// =====================================================
// MODO MOCK - Usar datos de prueba en lugar de la API
// Para usar la API real, cambiar a false
// =====================================================
const USE_MOCK = false;
// =====================================================

type Props = {
  params: Promise<{ id_equipo: string }>;
};

function getBaseUrl(): string {
  const raw = process.env.API_DATOS_URL ?? "http://192.168.20.152:8000";
  return raw.startsWith("http") ? raw : `http://${raw}`;
}

function buildHeaders(request: Request): Record<string, string> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  const cookie = request.headers.get("cookie");
  if (cookie) headers["Cookie"] = cookie;
  const auth = request.headers.get("authorization");
  if (auth) headers["Authorization"] = auth;
  return headers;
}

export async function GET(request: Request, props: Props): Promise<Response> {
  try {
    const { id_equipo } = await props.params;
    const { searchParams } = new URL(request.url);
    const fecha_inicio = searchParams.get("fecha_inicio");
    const fecha_fin = searchParams.get("fecha_fin");

    const equipoId = parseInt(id_equipo, 10);
    if (isNaN(equipoId) || equipoId < 0) {
      return Response.json(
        { error: "id_equipo inválido. Debe ser un número positivo." },
        { status: 400 },
      );
    }

    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (
      !fecha_inicio ||
      !fecha_fin ||
      !dateRegex.test(fecha_inicio) ||
      !dateRegex.test(fecha_fin)
    ) {
      return Response.json(
        { error: "Formato de fecha inválido. Use YYYY-MM-DD." },
        { status: 400 },
      );
    }

    if (USE_MOCK) {
      return Response.json(mockData, { status: 200 });
    }

    const fullUrl = `${getBaseUrl()}/historico-graficos/${id_equipo}?fecha_inicio=${fecha_inicio}&fecha_fin=${fecha_fin}`;

    const response = await fetch(fullUrl, {
      method: "GET",
      headers: buildHeaders(request),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return Response.json(
        { error: `Error del servidor: ${response.status}`, details: errorText },
        { status: response.status },
      );
    }

    const data = await response.json();
    return Response.json(data, { status: 200 });
  } catch (error) {
    console.error("Error en /api/historico-graficos:", error);
    return Response.json(
      { error: "Error interno del servidor" },
      { status: 500 },
    );
  }
}
