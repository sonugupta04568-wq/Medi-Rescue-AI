const store = require("../store");

exports.create = async (req, res) => {
  try {
    const { type, severity, location, address, notes, contactsNotified, userId } = req.body;
    const record = await store.createEmergency({ type, severity, location, address, notes, contactsNotified, userId });
    res.status(201).json(record);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

exports.get = async (req, res) => {
  const record = await store.getEmergency(req.params.id);
  if (!record) return res.status(404).json({ error: "Emergency not found" });
  res.json(record);
};

exports.list = async (req, res) => {
  res.json(await store.listEmergencies(Number(req.query.limit) || 20));
};

exports.updateStatus = async (req, res) => {
  const record = await store.updateEmergencyStatus(req.params.id, req.body.status, req.body.label);
  if (!record) return res.status(404).json({ error: "Emergency not found" });
  res.json(record);
};
