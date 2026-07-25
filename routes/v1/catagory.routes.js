const express = require("express");
const { body } = require("express-validator");
const controller = require("../../controller/catagory.controller");
const { protect, isAdmin } = require("../../middleware/auth.middleware");
const { validate } = require("../../middleware/validate.middleware");

const router = express.Router();

const categoryChain = [
    body("name").trim().notEmpty().withMessage("Name is required"),
];

router.get("/",protect, controller.getAll);
router.get("/:id", protect, controller.getById);

router.post("/", protect, isAdmin, categoryChain, validate, controller.create);
router.put("/:id", protect, isAdmin, controller.update);
router.delete("/:id", protect, isAdmin, controller.delete);

module.exports = router;