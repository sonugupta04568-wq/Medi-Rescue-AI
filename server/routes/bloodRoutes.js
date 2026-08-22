const router = require("express").Router();
const ctrl = require("../controllers/bloodController");

router.get("/", ctrl.availability);

module.exports = router;
