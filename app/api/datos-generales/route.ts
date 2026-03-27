/**
 * API Route: /api/datos-generales
 *
 * Establece una conexión WebSocket desde el servidor hacia el backend
 * y expone los datos al navegador como un stream de Server-Sent Events (SSE).
 *
 * El navegador nunca se conecta directamente al backend WS; solo esta ruta
 * lo hace, desde la máquina que corre el servidor Next.js.
 *
 * URL del WebSocket de origen: WS_DATOS_GENERALES_URL (variable de entorno)
 * Valor predeterminado: ws://192.168.20.27:8000/ws/datos-generales
 */

import { NextRequest } from "next/server";

const WS_URL =
  process.env.WS_DATOS_GENERALES_URL ??
  "ws://192.168.20.27:8000/ws/datos-generales";

const MAX_RETRIES = 5;
const RETRY_DELAY_MS = 3000;

export async function GET(request: NextRequest) {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      let ws: WebSocket | null = null;
      let closed = false;
      let retries = 0;
      let retryTimer: ReturnType<typeof setTimeout> | null = null;

      const cleanup = () => {
        closed = true;
        if (retryTimer) {
          clearTimeout(retryTimer);
          retryTimer = null;
        }
        if (ws) {
          ws.onopen = null;
          ws.onmessage = null;
          ws.onclose = null;
          ws.onerror = null;
          ws.close();
          ws = null;
        }
        try {
          controller.close();
        } catch {
          // Ya cerrado
        }
      };

      request.signal.addEventListener("abort", cleanup);

      const send = (event: string, data: string) => {
        try {
          controller.enqueue(
            encoder.encode(`event: ${event}\ndata: ${data}\n\n`),
          );
        } catch {
          // El stream ya fue cerrado
        }
      };

      const connect = () => {
        if (closed) return;
        try {
          ws = new WebSocket(WS_URL);

          ws.onopen = () => {
            retries = 0;
            send("connected", "true");
          };

          ws.onmessage = (event: MessageEvent) => {
            send("message", event.data as string);
          };

          ws.onclose = () => {
            if (closed) return;
            send("connected", "false");
            if (retries < MAX_RETRIES) {
              retries++;
              retryTimer = setTimeout(connect, RETRY_DELAY_MS);
            } else {
              send(
                "ws-error",
                JSON.stringify("Límite de reconexiones alcanzado"),
              );
              cleanup();
            }
          };

          ws.onerror = () => {
            ws?.close();
          };
        } catch (err) {
          send("ws-error", JSON.stringify(String(err)));
          cleanup();
        }
      };

      connect();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
