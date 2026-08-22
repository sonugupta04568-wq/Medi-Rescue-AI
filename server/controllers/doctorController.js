const store = require("../store");

exports.list = (req, res) => {
  res.json(store.listDoctors(req.query.specialty));
};
