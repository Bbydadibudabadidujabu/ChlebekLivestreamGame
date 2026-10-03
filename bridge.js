const WebSocket = require("ws");

const TIKFINITY_WS_URL = process.env.TIKFINITY_WS_URL || "ws://127.0.0.1:21213/";
const CLOUD_SERVER_URL = process.env.CLOUD_SERVER_URL; // e.g. https://klaskanie-server.onrender.com
const BRIDGE_TOKEN = process.env.BRIDGE_TOKEN;

if (!CLOUD_SERVER_URL || !BRIDGE_TOKEN) {
  console.error("Set CLOUD_SERVER_URL and BRIDGE_TOKEN before starting.");
  process.exit(1);
}

let retryTimer = null;

function sendToCloud(event) {
  fetch(`${CLOUD_SERVER_URL.replace(/\/$/, "")}/api/events`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${BRIDGE_TOKEN}`
    },
    body: JSON.stringify(event)
  })
  .then(async res => {
    if (!res.ok) console.error("Cloud rejected event:", res.status, await res.text());
  })
  .catch(err => console.error("Cloud send error:", err.message));
}

function connect() {
  console.log(`Connecting to TikFinity: ${TIKFINITY_WS_URL}`);

  const ws = new WebSocket(TIKFINITY_WS_URL);

  ws.on("open", () => {
    console.log("Connected to TikFinity Event API.");
  });

  ws.on("message", raw => {
    try {
      const event = JSON.parse(raw.toString());
      if ((event.event || event.type) === "chat") {
        sendToCloud({
          type: "chat",
          data: event.data || event
        });
      }
    } catch (err) {
      console.error("Bad TikFinity message:", err.message);
    }
  });

  ws.on("error", err => {
    console.error("TikFinity WebSocket error:", err.message);
  });

  ws.on("close", () => {
    console.log("TikFinity disconnected. Reconnecting in 2 seconds...");
    clearTimeout(retryTimer);
    retryTimer = setTimeout(connect, 2000);
  });
}

connect();
