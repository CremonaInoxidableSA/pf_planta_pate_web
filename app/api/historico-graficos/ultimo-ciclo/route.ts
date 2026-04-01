import { NextRequest } from "next/server";

function getBaseUrl(): string {
  const raw = process.env.API_DATOS_URL ?? "http://localhost:8000";
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

export async function GET(request: NextRequest) {
  try {
    const fullUrl = `${getBaseUrl()}/historico-graficos/ultimo-ciclo`;
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
    console.error("Error en /api/historico-graficos/ultimo-ciclo:", error);
    return Response.json(
      { error: "Error interno del servidor" },
      { status: 500 },
    );
  }
}
