const router = require("express").Router();
const ctrl = require("../controllers/bedsController");

router.get("/", ctrl.list);

module.exports = router;
