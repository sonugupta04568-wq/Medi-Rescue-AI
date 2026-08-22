const store = require("../store");

exports.nearby = (req, res) => {
  const lat = parseFloat(req.query.lat);
  const lng = parseFloat(req.query.lng);
  const radius = parseFloat(req.query.radius) || 25;
  if (!isNaN(lat) && !isNaN(lng)) {
    return res.json(store.listHospitals(lat, lng, radius));
  }
  res.json(store.listHospitals(null, null, radius));
};
