import { NextRequest } from "next/server";

function getBaseUrl(): string {
  const raw = process.env.API_DATOS_URL ?? "http://192.168.20.152:8000";
  return raw.startsWith("http") ? raw : `http://${raw}`;
}

function buildHeaders(request: NextRequest): Record<string, string> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  const cookie = request.headers.get("cookie");
  if (cookie) headers["Cookie"] = cookie;
  const auth = request.headers.get("authorization");
  if (auth) headers["Authorization"] = auth;
  return headers;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id_equipo: string }> },
) {
  try {
    const { id_equipo } = await params;
    const { searchParams } = new URL(request.url);
    const fecha_inicio = searchParams.get("fecha_inicio");
    const fecha_fin = searchParams.get("fecha_fin");
    const equipoId = parseInt(id_equipo, 10);
    if (isNaN(equipoId) || equipoId < 1) {
      return Response.json(
        { error: "id_equipo inválido. Debe ser un número positivo." },
        { status: 400 },
      );
    }
    if (!fecha_inicio || !fecha_fin) {
      return Response.json(
        { error: "Debe proporcionar fecha_inicio y fecha_fin" },
        { status: 400 },
      );
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
    console.error("Error en /api/historico-graficos/[id_equipo]:", error);
    return Response.json(
      { error: "Error interno del servidor" },
      { status: 500 },
    );
  }
}
