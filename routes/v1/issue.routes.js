const express = require("express");
const { body } = require("express-validator");
const controller = require("../../controller/issue.controller");
const { protect, isAdmin } = require("../../middleware/auth.middleware");
const { validate } = require("../../middleware/validate.middleware");

const router = express.Router();

const createChain = [
    body("description").trim().notEmpty().withMessage("Description is required"),
];

router.post("/", protect, createChain, validate, controller.create);
router.get("/", protect, controller.getAll);
router.patch("/:id/status", protect, isAdmin, controller.updateStatus);

module.exports = router;
