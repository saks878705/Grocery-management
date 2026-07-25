const express = require("express");
const controller = require("../../controller/analytics.controller");
const { protect, isAdmin } = require("../../middleware/auth.middleware");

const router = express.Router();

router.get("/product-consumption", protect, isAdmin, controller.productConsumption);
router.get("/login-activity", protect, isAdmin, controller.loginActivity);

module.exports = router;
