const BASE_URL = process.env.API_DATOS_URL ?? "http://192.168.20.152:8000";

export async function GET() {
  try {
    const response = await fetch(`${BASE_URL}/alarmas/defecto`, {
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
