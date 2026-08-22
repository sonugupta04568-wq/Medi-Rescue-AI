const store = require("../store");

exports.list = (req, res) => {
  res.json(store.listAmbulances());
};

exports.request = (req, res) => {
  const { type, emergencyType, pickup, hospitalId } = req.body;
  const request = store.createAmbulanceRequest({ type, emergencyType, pickup, hospitalId });
  if (!request) return res.status(503).json({ error: "No ambulances available" });
  res.status(201).json(request);
};

exports.get = (req, res) => {
  const request = store.getAmbulanceRequest(req.params.id);
  if (!request) return res.status(404).json({ error: "Request not found" });
  res.json(request);
};

exports.advance = (req, res) => {
  const request = store.advanceAmbulanceRequest(req.params.id);
  if (!request) return res.status(404).json({ error: "Request not found" });
  res.json(request);
};
