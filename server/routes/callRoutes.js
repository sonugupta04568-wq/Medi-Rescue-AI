const router = require("express").Router();
const ctrl = require("../controllers/callController");

router.post("/room", ctrl.create);
router.get("/:id", ctrl.info);
router.post("/:id/signal", ctrl.pushSignal);
router.get("/:id/signals", ctrl.pullSignals);

module.exports = router;
