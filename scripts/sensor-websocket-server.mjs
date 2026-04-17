import { WebSocketServer } from "ws";

const host = process.env.SENSOR_WS_HOST ?? "0.0.0.0";
const port = Number(process.env.SENSOR_WS_PORT ?? 3001);

const wss = new WebSocketServer({ host, port });
let latestPayload = null;

function sendJson(socket, data) {
  try {
    socket.send(JSON.stringify(data));
  } catch (error) {
    console.error("Failed to send websocket message:", error);
  }
}

function broadcast(data) {
  const message = JSON.stringify(data);
  for (const client of wss.clients) {
    if (client.readyState === client.OPEN) {
      client.send(message);
    }
  }
}

wss.on("connection", (socket, request) => {
  const remoteAddress = request.socket.remoteAddress ?? "unknown";
  console.log(`[sensor-ws] client connected from ${remoteAddress}`);

  sendJson(socket, {
    type: "welcome",
    host,
    port,
    hasLatestPayload: Boolean(latestPayload),
  });

  if (latestPayload) {
    sendJson(socket, {
      type: "sensor-update",
      payload: latestPayload,
    });
  }

  socket.on("message", (buffer) => {
    try {
      const message = JSON.parse(buffer.toString());

      if (message?.type === "sensor-update" && message.payload) {
        latestPayload = {
          ...message.payload,
          serverTimestamp: new Date().toISOString(),
        };

        broadcast({
          type: "sensor-update",
          payload: latestPayload,
        });
        return;
      }

      if (message?.type === "get-latest" && latestPayload) {
        sendJson(socket, {
          type: "sensor-update",
          payload: latestPayload,
        });
        return;
      }

      if (message?.type === "ping") {
        sendJson(socket, {
          type: "pong",
          time: Date.now(),
        });
      }
    } catch (error) {
      console.error("[sensor-ws] invalid message", error);
      sendJson(socket, {
        type: "error",
        message: "Invalid JSON message",
      });
    }
  });

  socket.on("close", () => {
    console.log(`[sensor-ws] client disconnected from ${remoteAddress}`);
  });
});

console.log(
  `[sensor-ws] listening on ws://${host}:${port} and ready to broadcast sensor data`,
);
