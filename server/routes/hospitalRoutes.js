const router = require("express").Router();
const ctrl = require("../controllers/hospitalController");

router.get("/", ctrl.nearby);

module.exports = router;
