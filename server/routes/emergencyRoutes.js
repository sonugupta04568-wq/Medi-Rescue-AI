const router = require("express").Router();
const ctrl = require("../controllers/emergencyController");

router.post("/create", ctrl.create);
router.get("/", ctrl.list);
router.get("/:id", ctrl.get);
router.patch("/:id/status", ctrl.updateStatus);

module.exports = router;
