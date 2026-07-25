const express = require("express");
const { body } = require("express-validator");
const router = express.Router();

const orderController = require("../../controller/order.controller");
const {protect, isAdmin} = require("../../middleware/auth.middleware");
const { validate } = require("../../middleware/validate.middleware");

const placeOrderChain = [
  body("items").isArray({ min: 1 }).withMessage("items must be a non-empty array"),
  body("items.*.productId").notEmpty().withMessage("Each item requires a productId"),
  body("items.*.quantity").isInt({ min: 1 }).withMessage("Each item requires a positive integer quantity"),
];

router.post("/", protect, placeOrderChain, validate, orderController.placeOrder);
router.get("/", protect, orderController.getUserOrders);
router.patch(
  "/:orderId/status",
  protect,
  isAdmin,
  orderController.updateOrderStatus
);
router.put("/:orderId/items", protect, isAdmin, orderController.modifyOrderItems);
router.patch("/:orderId/reschedule", protect, isAdmin, orderController.rescheduleOrder);
router.patch("/:orderId/cancel", protect, orderController.cancelOrder);

module.exports = router;