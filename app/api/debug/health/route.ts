import { NextResponse } from "next/server";

// ─── Servicios a verificar ────────────────────────────────────────────────────
// Los WebSockets comparten servidor HTTP, se verifica el endpoint HTTP base.
const SERVICES = {
  auth: process.env.API_AUTH_URL ?? "http://192.168.20.150:8000",
  mail: process.env.API_MAIL_URL ?? "http://192.168.20.150:8001",
  datos: process.env.API_DATOS_URL ?? "http://192.168.20.152:8000",
  wsAlarmas: process.env.API_WS_ALARMAS_URL ?? "http://192.168.20.152:8001",
  wsDatos: process.env.API_WS_DATOS_URL ?? "http://192.168.20.152:8000",
} as const;

export type ServiceName = keyof typeof SERVICES;

const TIMEOUT_MS = 4000;

// ─── Verifica un endpoint con timeout ────────────────────────────────────────
async function checkService(url: string): Promise<boolean> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    // Usamos GET en lugar de HEAD por compatibilidad con más backends.
    // Cualquier respuesta (incluso 404 / 500) significa que el servidor está vivo.
    await fetch(url, {
      method: "GET",
      signal: controller.signal,
      cache: "no-store",
    });
    return true;
  } catch {
    // AbortError (timeout) o connection refused → offline
    return false;
  } finally {
    clearTimeout(timer);
  }
}

export async function GET() {
  const checks = await Promise.allSettled(
    Object.entries(SERVICES).map(async ([key, url]) => ({
      key: key as ServiceName,
      online: await checkService(url),
    })),
  );

  const result = checks.reduce<Record<string, boolean>>((acc, settled) => {
    if (settled.status === "fulfilled") {
      acc[settled.value.key] = settled.value.online;
    }
    return acc;
  }, {});

  const allOffline = Object.values(result).every((v) => !v);

  return NextResponse.json(result, {
    status: 200,
    headers: {
      // No cachear: siempre queremos el estado real
      "Cache-Control": "no-store, no-cache, must-revalidate",
      // Header útil para debugging
      "X-Services-All-Offline": String(allOffline),
    },
  });
}
