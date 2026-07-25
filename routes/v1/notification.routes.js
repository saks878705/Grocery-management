const express = require("express");
const controller = require("../../controller/notification.controller");
const { protect } = require("../../middleware/auth.middleware");

const router = express.Router();

router.get("/", protect, controller.getAll);
router.patch("/:id/read", protect, controller.markRead);

module.exports = router;
