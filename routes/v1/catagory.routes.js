const express = require("express");
const controller = require("../../controller/catagory.controller");
const { protect, isAdmin } = require("../../middleware/auth.middleware");

const router = express.Router();

// Public
router.get("/",protect, controller.getAll);
router.get("/:id", protect, controller.getById);

// Protected (Admin ideally)
router.post("/", protect, isAdmin, controller.create);
router.put("/:id", protect, isAdmin, controller.update);
router.delete("/:id", protect, isAdmin, controller.delete);

module.exports = router;