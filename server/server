const express = require("express");
const http = require("http");
const cors = require("cors");
const { WebSocketServer, WebSocket } = require("ws");

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server, path: "/ws" });

const PORT = Number(process.env.PORT || 10000);
const BRIDGE_TOKEN = process.env.BRIDGE_TOKEN;
const ROUND_TIME_MS = Number(process.env.ROUND_TIME_MS || 15000);
const WINNER_TIME_MS = Number(process.env.WINNER_TIME_MS || 5000);

if (!BRIDGE_TOKEN) console.warn("WARNING: BRIDGE_TOKEN is not set.");

app.use(cors());
app.use(express.json({ limit: "32kb" }));

app.get("/", (req,res) => res.json({
  ok: true,
  service: "Klaskanie Live Server",
  round: roundNumber
}));

app.get("/health", (req,res) => res.json({
  ok: true,
  clients: clients.size,
  tickets: tickets.length,
  round: roundNumber
}));

const clients = new Set();
let tickets = [];
let players = new Map();
let roundNumber = 1;
let roundTimer = null;
let winner = null;

function broadcast(payload) {
  const msg = JSON.stringify(payload);
  for (const ws of clients) {
    if (ws.readyState === WebSocket.OPEN) ws.send(msg);
  }
}

function publicPlayer(p) {
  return {
    username: String(p.username || "unknown"),
    nickname: String(p.nickname || p.username || "Unknown"),
    profilePicture: String(p.profilePicture || ""),
    lastCommand: p.lastCommand || ""
  };
}

function startRound() {
  clearTimeout(roundTimer);
  tickets = [];
  players = new Map();
  winner = null;
  broadcast({ type: "newRound", round: roundNumber });
  roundTimer = setTimeout(endRound, ROUND_TIME_MS);
  console.log(`Round ${roundNumber} started`);
}

function endRound() {
  if (tickets.length === 0) {
    console.log("No entries. Starting another round.");
    roundNumber++;
    startRound();
    return;
  }

  const selected = tickets[Math.floor(Math.random() * tickets.length)];
  winner = selected;

  broadcast({
    type: "winner",
    winner: publicPlayer(winner),
    round: roundNumber
  });

  console.log(`Winner: ${winner.nickname} (@${winner.username})`);

  setTimeout(() => {
    roundNumber++;
    startRound();
  }, WINNER_TIME_MS);
}

function handleChat(raw) {
  if (!raw) return;

  const comment = String(raw.comment ?? raw.text ?? raw.content ?? "").trim().toLowerCase();
  if (comment !== "!klaskanie" && comment !== "!krzyczenie") return;

  const username = String(raw.uniqueId ?? raw.uniqueID ?? raw.username ?? raw.user?.uniqueId ?? "unknown");
  const nickname = String(raw.nickname ?? raw.displayName ?? raw.user?.nickname ?? username);
  const profilePicture = String(
    raw.profilePictureUrl ??
    raw.profilePictureURL ??
    raw.user?.profilePictureUrl ??
    ""
  );

  const command = comment === "!klaskanie" ? "!Klaskanie" : "!Krzyczenie";
  const player = { username, nickname, profilePicture, lastCommand: command };

  if (winner) return;

  players.set(username, player);
  tickets.push(player);

  broadcast({
    type: "player",
    player: publicPlayer(player),
    totalTickets: tickets.length
  });

  if (command === "!Klaskanie") {
    broadcast({ type: "klaskanie", player: publicPlayer(player) });
  } else {
    const sound = Math.floor(Math.random() * 4) + 1;
    broadcast({ type: "krzyczenie", player: publicPlayer(player), sound });
  }
}

wss.on("connection", ws => {
  clients.add(ws);
  ws.send(JSON.stringify({
    type: "state",
    round: roundNumber,
    totalTickets: tickets.length,
    players: [...players.values()].map(publicPlayer),
    winner: winner ? publicPlayer(winner) : null
  }));
  ws.on("close", () => clients.delete(ws));
});

app.post("/api/events", (req,res) => {
  const auth = req.get("authorization") || "";
  if (!BRIDGE_TOKEN || auth !== `Bearer ${BRIDGE_TOKEN}`) {
    return res.status(401).json({ ok:false, error:"Unauthorized" });
  }

  const body = req.body || {};

  // Accept either a normalized bridge event:
  // { type:"chat", data:{...} }
  // or the original TikFinity envelope:
  // { event:"chat", data:{...} }
  const type = body.type || body.event;

  if (type === "chat") handleChat(body.data || body);

  res.json({ ok:true });
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`Klaskanie server listening on ${PORT}`);
  startRound();
});
