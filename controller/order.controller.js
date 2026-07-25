const orderService = require("../service/order.service");

exports.placeOrder = async (req, res) => {
  try {
    const userId = req.user.id; // from auth middleware

    const order = await orderService.placeOrder(userId, req.body);

    res.status(201).json({
      success: true,
      message: "Order placed successfully",
      data: order
    });

  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

exports.getUserOrders = async (req, res) => {
  try {
    const orders = req.user.role === "ADMIN"
      ? await orderService.getAllOrders()
      : await orderService.getUserOrders(req.user.id);

    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    const adminId = req.user.id;

    const order = await orderService.updateOrderStatus(orderId, status, adminId);

    res.status(200).json({
      success: true,
      message: "Order status updated successfully",
      data: order,
    });

  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

exports.modifyOrderItems = async (req, res) => {
  try {
    const order = await orderService.modifyOrderItems(
      req.params.orderId,
      req.body.items,
      req.user.id
    );

    res.json({ success: true, data: order });
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
};

exports.rescheduleOrder = async (req, res) => {
  try {
    const order = await orderService.rescheduleOrder(
      req.params.orderId,
      req.body.scheduledAt,
      req.user.id
    );

    res.json({ success: true, data: order });
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
};

exports.cancelOrder = async (req, res) => {
  try {
    const order = await orderService.cancelOrder(
      req.params.orderId,
      req.user
    );

    res.json({ success: true, data: order });
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
};