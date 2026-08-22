const store = require("../store");

exports.availability = (req, res) => {
  const group = req.query.group ? decodeURIComponent(req.query.group).toUpperCase() : null;
  res.json(store.listBlood(group));
};
