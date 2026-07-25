const express = require("express");
const { body } = require("express-validator");
const controller = require("../../controller/stock.controller");
const { protect, isAdmin } = require("../../middleware/auth.middleware");
const { validate } = require("../../middleware/validate.middleware");

const router = express.Router();

const createChain = [
    body("productId").notEmpty().withMessage("productId is required"),
    body("quantity").isInt({ min: 0 }).withMessage("Quantity must be a non-negative integer"),
];

router.post("/", protect, isAdmin, createChain, validate, controller.create);
router.get("/", protect, controller.getAll);
router.get("/:productId", protect, controller.getByProduct);
router.put("/:productId", protect, isAdmin, controller.update);
router.delete("/:productId", protect, isAdmin, controller.delete);

module.exports = router;