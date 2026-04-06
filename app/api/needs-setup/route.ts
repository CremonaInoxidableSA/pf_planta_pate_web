import { getSetupCache, setSetupCache } from "@/lib/setup-cache";

const API_AUTH_URL = process.env.API_AUTH_URL ?? "http://localhost:8001";

export async function GET() {
  // Si ya cacheamos que NO necesita setup, devolver directo sin consultar backend
  const cached = getSetupCache();
  if (cached === false) {
    return Response.json({ needs_setup: false });
  }

  // Si no hay cache (null) o es true, consultar al backend
  try {
    const res = await fetch(`${API_AUTH_URL}/needs-setup`, {
      cache: "no-store",
    });

    if (!res.ok) {
      return Response.json({ needs_setup: false }, { status: res.status });
    }

    const data = await res.json();
    const needsSetup = data.needs_setup === true;

    // Cachear el resultado (solo se persiste si es false)
    setSetupCache(needsSetup);

    return Response.json({ needs_setup: needsSetup });
  } catch {
    return Response.json(
      { error: "No se pudo verificar el estado de setup" },
      { status: 500 },
    );
  }
}
