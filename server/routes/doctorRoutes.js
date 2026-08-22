const router = require("express").Router();
const ctrl = require("../controllers/doctorController");

router.get("/", ctrl.list);

module.exports = router;
