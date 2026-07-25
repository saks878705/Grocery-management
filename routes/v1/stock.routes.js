const express = require("express");
const controller = require("../../controller/stock.controller");
const { protect, isAdmin } = require("../../middleware/auth.middleware");

const router = express.Router();

// Protected (Admin recommended)
router.post("/", protect, isAdmin, controller.create);
router.get("/", protect, controller.getAll);
router.get("/:productId", protect, controller.getByProduct);
router.put("/:productId", protect, isAdmin, controller.update);
router.delete("/:productId", protect, isAdmin, controller.delete);

module.exports = router;