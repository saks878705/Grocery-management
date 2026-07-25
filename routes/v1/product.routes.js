const express = require("express");
const { body } = require("express-validator");
const controller = require("../../controller/product.controller");
const { protect, isAdmin } = require("../../middleware/auth.middleware");
const { validate } = require("../../middleware/validate.middleware");

const router = express.Router();

const productChain = [
    body("name").trim().notEmpty().withMessage("Name is required"),
    body("price").isFloat({ gt: 0 }).withMessage("Price must be a positive number"),
    body("categoryId").notEmpty().withMessage("categoryId is required"),
];

router.get("/", protect, controller.getAll);
router.get("/:id", protect, controller.getById);

router.post("/", protect, isAdmin, productChain, validate, controller.create);
router.put("/:id", protect, isAdmin, controller.update);
router.delete("/:id", protect, isAdmin, controller.delete);

module.exports = router;