import { NextRequest } from "next/server";
import WebSocket from "ws";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  // SSE headers
  const headers = new Headers({
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
    "Access-Control-Allow-Origin": "*",
  });

  // Crear stream para SSE
  const stream = new ReadableStream({
    start(controller: ReadableStreamDefaultController<string>) {
      let ws: WebSocket;
      function sendEvent(data: unknown) {
        controller.enqueue(`data: ${JSON.stringify(data)}\n\n`);
      }

      ws = new WebSocket("ws://192.168.20.152:8001/ws/datos-alarmas");

      ws.on("message", (msg: WebSocket.Data) => {
        try {
          const data = JSON.parse(msg.toString());
          sendEvent(data);
        } catch (e) {
        }
      });
    },
  });

  return new Response(stream, { headers });
}
