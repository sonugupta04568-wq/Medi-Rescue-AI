const router = require("express").Router();
const ctrl = require("../controllers/aiController");

router.post("/chat", ctrl.chat);

module.exports = router;
