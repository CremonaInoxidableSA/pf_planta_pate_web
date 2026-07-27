const BASE_URL = process.env.API_DATOS_URL ?? "http://192.168.20.152:8001";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const fecha_inicio = searchParams.get("fecha_inicio");
    const fecha_fin = searchParams.get("fecha_fin");

    let url = `${BASE_URL}/alarmas/defecto`;
    if (fecha_inicio && fecha_fin) {
      url = `${BASE_URL}/alarmas?fecha_inicio=${fecha_inicio}&fecha_fin=${fecha_fin}`;
    }

    const response = await fetch(url, {
      cache: "no-store",
    });

    if (!response.ok) {
      return Response.json(
        { error: `Backend respondió con ${response.status}` },
        { status: response.status },
      );
    }

    const data = await response.json();
    return Response.json(data);
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : String(error) },
      { status: 500 },
    );
  }
}
