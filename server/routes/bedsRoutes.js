const router = require("express").Router();
const ctrl = require("../controllers/bedsController");

router.get("/", ctrl.list);
router.get("/events", ctrl.events);

module.exports = router;
