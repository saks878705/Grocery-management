const express = require("express");
const router = express.Router();

const orderController = require("../../controller/order.controller");
const {protect, isAdmin} = require("../../middleware/auth.middleware");

// Place Order
router.post("/", protect, orderController.placeOrder);
router.get("/", protect, orderController.getUserOrders);
router.patch(
  "/:orderId/status",
  protect,
  isAdmin,
  orderController.updateOrderStatus
);
router.put("/:orderId/items", protect, orderController.modifyOrderItems);
router.patch("/:orderId/reschedule", protect, isAdmin, orderController.rescheduleOrder);
router.patch("/:orderId/cancel", protect, orderController.cancelOrder);

module.exports = router;