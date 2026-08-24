const rooms = new Map();

function create(req, res) {
  const roomId = "VC-" + Math.floor(1000 + Math.random() * 9000);
  rooms.set(roomId, { signals: [], createdAt: Date.now(), peers: new Set() });
  setTimeout(() => rooms.delete(roomId), 2 * 60 * 60 * 1000);
  res.json({ roomId });
}

function info(req, res) {
  const room = rooms.get(req.params.id);
  if (!room) return res.status(404).json({ exists: false });
  res.json({ exists: true, signals: room.signals.length, createdAt: room.createdAt });
}

function pushSignal(req, res) {
  const room = rooms.get(req.params.id);
  if (!room) return res.status(404).json({ error: "Room not found or expired" });
  const { from, type, payload } = req.body;
  if (!from || !type) return res.status(400).json({ error: "from and type are required" });
  room.signals.push({ i: room.signals.length, from, type, payload });
  res.json({ ok: true, index: room.signals.length - 1 });
}

function pullSignals(req, res) {
  const room = rooms.get(req.params.id);
  if (!room) return res.status(404).json({ error: "Room not found or expired" });
  const since = parseInt(req.query.since, 10) || 0;
  const peer = req.query.peer || "";
  res.json({
    signals: room.signals.filter((s) => s.i >= since && s.from !== peer),
    total: room.signals.length
  });
}

module.exports = { create, info, pushSignal, pullSignals };
