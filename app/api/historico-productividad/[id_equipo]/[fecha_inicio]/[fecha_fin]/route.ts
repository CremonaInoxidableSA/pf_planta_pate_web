type Props = {
  params: Promise<{
    id_equipo: string;
    fecha_inicio: string;
    fecha_fin: string;
  }>;
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
    const { id_equipo, fecha_inicio, fecha_fin } = await props.params;

    const equipoId = parseInt(id_equipo, 10);
    if (isNaN(equipoId) || equipoId < 0 || equipoId > 16) {
      return Response.json(
        { error: "id_equipo inválido. Debe ser un número entre 0 y 16." },
        { status: 400 },
      );
    }

    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(fecha_inicio) || !dateRegex.test(fecha_fin)) {
      return Response.json(
        { error: "Formato de fecha inválido. Use YYYY-MM-DD." },
        { status: 400 },
      );
    }

    const fullUrl = `${getBaseUrl()}/historico-productividad/${id_equipo}?fecha_inicio=${fecha_inicio}&fecha_fin=${fecha_fin}`;

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
