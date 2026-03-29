/**
 * API Route proxy para endpoint de histórico de productividad
 * Ruta: /api/historico-productividad/[id_equipo]/[fecha_inicio]/[fecha_fin]
 * Redirige a: http://localhost/historico-productividad/[id_equipo]/[fecha_inicio]/[fecha_fin]
 *
 * id_equipo:
 *   - 0: Todos los equipos (ambas líneas)
 *   - 15: Línea 1
 *   - 16: Línea 2
 *   - 1-6: Cocinas individuales
 *   - 7-14: Enfriadores individuales
 *
 * Corre únicamente en el servidor — la URL real de la API nunca se envía al navegador.
 */

import mockData from "@/mocks/obtenerListaProductividad.json";

// =====================================================
// MODO MOCK - Usar datos de prueba en lugar de la API
// Para usar la API real, cambiar a false
// =====================================================
const USE_MOCK = true;
// =====================================================

type Props = {
  params: Promise<{
    id_equipo: string;
    fecha_inicio: string;
    fecha_fin: string;
  }>;
};

function getBaseUrl(): string {
  const raw = process.env.API_HISTORICO_URL ?? "http://localhost";
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
    const { id_equipo, fecha_inicio, fecha_fin } = await props.params;

    // Validar que los parámetros son correctos
    const equipoId = parseInt(id_equipo, 10);
    if (isNaN(equipoId) || equipoId < 0 || equipoId > 16) {
      return Response.json(
        { error: "id_equipo inválido. Debe ser un número entre 0 y 16." },
        { status: 400 },
      );
    }

    // Validar formato de fechas (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(fecha_inicio) || !dateRegex.test(fecha_fin)) {
      return Response.json(
        { error: "Formato de fecha inválido. Use YYYY-MM-DD." },
        { status: 400 },
      );
    }

    // Usar datos mock si está habilitado
    if (USE_MOCK) {
      return Response.json(mockData, { status: 200 });
    }

    const fullUrl = `${getBaseUrl()}/historico-productividad/${id_equipo}/${fecha_inicio}/${fecha_fin}`;

    const response = await fetch(fullUrl, {
      method: "GET",
      headers: buildHeaders(request),
    });

    const text = await response.text();
    let data: unknown;
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }

    return Response.json(data, { status: response.status });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : String(error) },
      { status: 500 },
    );
  }
}
