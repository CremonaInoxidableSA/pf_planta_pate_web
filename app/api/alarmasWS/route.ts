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
      const ws: WebSocket = undefined as unknown as WebSocket;
      let closed = false;
      function sendEvent(data: unknown) {
        if (!closed) {
          controller.enqueue(`data: ${JSON.stringify(data)}\n\n`);
        }
      }

      const socket = new WebSocket("ws://192.168.20.152:8001/ws/datos-alarmas");

      socket.on("message", (msg: WebSocket.Data) => {
        const data = JSON.parse(msg.toString());
        sendEvent(data);
      });

      const ctrl = controller as ReadableStreamDefaultController<string> & {
        signal?: AbortSignal;
      };
      if (typeof ctrl.signal !== "undefined") {
        ctrl.signal.addEventListener("abort", () => {
          closed = true;
          if (socket && socket.readyState === WebSocket.OPEN) socket.close();
        });
      }
    },
  });

  return new Response(stream, { headers });
}
