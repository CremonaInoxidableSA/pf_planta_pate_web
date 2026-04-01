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
  { params }: { params: { id_equipo: string } },
) {
  try {
    const { id_equipo } = params;
    const equipoId = parseInt(id_equipo, 10);
    if (isNaN(equipoId) || equipoId < 1) {
      return new Response(JSON.stringify({ error: "id_equipo inválido." }), {
        status: 400,
      });
    }
    const { searchParams } = new URL(request.url);
    const fecha_inicio = searchParams.get("fecha_inicio");
    const fecha_fin = searchParams.get("fecha_fin");
    if (!fecha_inicio || !fecha_fin) {
      return new Response(
        JSON.stringify({ error: "Debe proporcionar fecha_inicio y fecha_fin" }),
        { status: 400 },
      );
    }
    const fullUrl = `${getBaseUrl()}/historico-productividad/descargar/${id_equipo}?fecha_inicio=${fecha_inicio}&fecha_fin=${fecha_fin}`;
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
        "Content-Disposition": `attachment; filename=productividad_equipo${equipoId}_${fecha_inicio}_a_${fecha_fin}.xlsx`,
      },
    });
  } catch (error) {
    console.error(
      "Error en /api/historico-productividad/descargar/[id_equipo]:",
      error,
    );
    return new Response(
      JSON.stringify({ error: "Error interno del servidor" }),
      { status: 500 },
    );
  }
}
