import WebSocket from "ws";

export const dynamic = "force-dynamic";

export async function GET() {
  const headers = new Headers({
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
    "Access-Control-Allow-Origin": "*",
  });

  const stream = new ReadableStream({
    start(controller: ReadableStreamDefaultController<string>) {
      let ws: WebSocket;
      let closed = false;
      function sendEvent(data: unknown) {
        if (!closed) {
          controller.enqueue(`data: ${JSON.stringify(data)}\n\n`);
        }
      }

      ws = new WebSocket("ws://192.168.20.152:8001/ws/datos-alarmas");

      ws.on("message", (msg: WebSocket.Data) => {
        const data = JSON.parse(msg.toString());
        sendEvent(data);
      });

      if (typeof (controller as any).signal !== "undefined") {
        (controller as any).signal.addEventListener("abort", () => {
          closed = true;
          if (ws && ws.readyState === WebSocket.OPEN) ws.close();
        });
      }
    },
  });

  return new Response(stream, { headers });
}
