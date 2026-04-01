const BASE_URL = process.env.API_DATOS_URL ?? "http://192.168.20.152:8000";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const descargar = searchParams.get("descargar");
    const fecha_inicio = searchParams.get("fecha_inicio");
    const fecha_fin = searchParams.get("fecha_fin");

    if (descargar === "1" && fecha_inicio && fecha_fin) {
      const url = `${BASE_URL}/alarmas/descargar?fecha_inicio=${fecha_inicio}&fecha_fin=${fecha_fin}`;
      const response = await fetch(url);
      if (!response.ok) {
        return new Response(await response.text(), {
          status: response.status,
          headers: {
            "content-type":
              response.headers.get("content-type") ||
              "application/octet-stream",
          },
        });
      }
      const blob = await response.arrayBuffer();
      return new Response(blob, {
        status: 200,
        headers: {
          "content-disposition": `attachment; filename=alarmas_${fecha_inicio}_a_${fecha_fin}.xlsx`,
          "content-type":
            response.headers.get("content-type") ||
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        },
      });
    }

    let url = `${BASE_URL}/alarmas/defecto`;
    if (fecha_inicio && fecha_fin) {
      url = `${BASE_URL}/alarmas?fecha_inicio=${fecha_inicio}&fecha_fin=${fecha_fin}`;
    }
    const response = await fetch(url, { cache: "no-store" });
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
