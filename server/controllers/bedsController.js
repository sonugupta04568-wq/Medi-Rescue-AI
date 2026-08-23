const store = require("../store");

exports.list = (req, res) => {
  res.json(store.listBeds(req.query.city));
};

exports.events = (req, res) => {
  res.json(store.listBedEvents());
};
