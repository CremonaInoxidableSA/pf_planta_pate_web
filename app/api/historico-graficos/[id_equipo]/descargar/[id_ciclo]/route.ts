import { NextRequest } from "next/server";

function getBaseUrl(): string {
  const raw = process.env.API_DATOS_URL ?? "http://localhost:8000";
  return raw.startsWith("http") ? raw : `http://${raw}`;
}

function buildHeaders(request: NextRequest): Record<string, string> {
  const headers: Record<string, string> = {};
  const cookie = request.headers.get("cookie");
  if (cookie) headers["Cookie"] = cookie;
  const auth = request.headers.get("authorization");
  if (auth) headers["Authorization"] = auth;
  return headers;
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id_equipo: string; id_ciclo: string } },
) {
  try {
    const { id_equipo, id_ciclo } = params;
    const equipoId = parseInt(id_equipo, 10);
    const cicloId = parseInt(id_ciclo, 10);
    if (isNaN(equipoId) || equipoId < 1 || isNaN(cicloId) || cicloId < 1) {
      return new Response(JSON.stringify({ error: "Parámetros inválidos." }), {
        status: 400,
      });
    }
    const fullUrl = `${getBaseUrl()}/historico-graficos/${id_equipo}/descargar/${id_ciclo}`;
    const response = await fetch(fullUrl, {
      method: "GET",
      headers: buildHeaders(request),
    });
    if (!response.ok) {
      const errorText = await response.text();
      return new Response(
        JSON.stringify({
          error: `Error del servidor: ${response.status}`,
          details: errorText,
        }),
        { status: response.status },
      );
    }
    const blob = await response.arrayBuffer();
    return new Response(blob, {
      status: 200,
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename=historico_grafico_equipo${equipoId}_ciclo${cicloId}.xlsx`,
      },
    });
  } catch (error) {
    console.error(
      "Error en /api/historico-graficos/[id_equipo]/descargar/[id_ciclo]:",
      error,
    );
    return new Response(
      JSON.stringify({ error: "Error interno del servidor" }),
      { status: 500 },
    );
  }
}
