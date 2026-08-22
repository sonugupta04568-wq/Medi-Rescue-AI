const router = require("express").Router();
const ctrl = require("../controllers/ambulanceController");

router.get("/", ctrl.list);
router.post("/request", ctrl.request);
router.get("/request/:id", ctrl.get);
router.patch("/request/:id/status", ctrl.advance);

module.exports = router;
