const sequelize = require("../config/postgres");
const {Category, Stock, Product, OrderItem, Order, User} = require("../models/sequelize");
const Notification = require("../models/mongo/notification.model");

exports.updateOrderStatus = async (orderId, status, adminId) => {
  // 🔍 Find order
  const order = await Order.findByPk(orderId);

  if (!order) {
    throw new Error("Order not found");
  }

  // 🔒 Optional: validate status transitions
  const allowedStatuses = ["PLACED", "PROCESSING", "READY_FOR_DELIVERY", "DELIVERED", "CANCELLED"];

  if (!allowedStatuses.includes(status)) {
    throw new Error("Invalid status");
  }

  // Example rule: cannot move backwards
  if (order.status === "DELIVERED" || order.status === "CANCELLED") {
    throw new Error("Cannot update completed/cancelled order");
  }

  //   Update status
  order.status = status;
  await order.save();

  // 🎯 If READY_FOR_DELIVERY → notify customer
  if (status === "READY_FOR_DELIVERY") {
    const user = await User.findByPk(order.userId);

    if (user) {
      await Notification.create({
        userId: user.id,
        type: "ORDER_READY",
        userType: "CUSTOMER",
        message: `Your order (${order.id}) is ready for delivery 🚚`,
      });
    }
  }

  return order;
};

exports.placeOrder = async (userId, orderData) => {
  const { items, deliveryDate } = orderData;

  const transaction = await sequelize.transaction();

  try {
    let totalAmount = 0;
    const orderItemsData = [];

    for (const item of items) {
      const { productId, quantity } = item;

      // 🔒 Lock stock row
      const stock = await Stock.findOne({
        where: { productId },
        lock: transaction.LOCK.UPDATE, //means now the row is locked for update
        transaction
      });

      if (!stock || stock.quantity < quantity) {
        throw new Error(`Product ${productId} is out of stock`);
      }

      // Get product details
      const product = await Product.findByPk(productId, {
        include: [{ model: Category }],
        transaction
      });

      if (!product) {
        throw new Error(`Product ${productId} not found`);
      }

      // Deduct stock
      stock.quantity -= quantity;
      await stock.save({ transaction });

      // Calculate price
      totalAmount += product.price * quantity;

      orderItemsData.push({
        productId,
        categoryId: product.Category.id,
        quantity,
        price: product.price
      });
    }

    // Create Order
    const order = await Order.create({
      userId,
      totalAmount,
      deliveryDate,
      status: "PLACED"
    }, { transaction });

    // Create Order Items
    for (const item of orderItemsData) {
      await OrderItem.create({
        ...item,
        orderId: order.id
      }, { transaction });
    }

    await transaction.commit();

    return order;

  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

exports.getUserOrders = async (userId) => {
  const orders = await Order.findAll({
    where: { userId },
    order: [["createdAt", "DESC"]],
    include: [
      {
        model: OrderItem,
        as: "items",
        attributes: ["id", "quantity", "price"],
        include: [
          {
            model: Product,
            attributes: ["id", "name", "price", "image"],
            include: [
              {
                model: Category,
                attributes: ["id", "name"]
              }
            ]
          }
        ]
      }
    ]
  });

  return orders;
};

exports.modifyOrderItems = async (orderId, items, adminId) => {
  const transaction = await sequelize.transaction();

  try {
    const order = await Order.findByPk(orderId, {
      include: [{ model: OrderItem, as: "items" }],
      transaction,
      lock: transaction.LOCK.UPDATE
    });

    if (!order) throw new Error("Order not found");

    if (["DELIVERED", "CANCELLED"].includes(order.status)) {
      throw new Error("Cannot modify completed order");
    }

    // 🔄 Restore old stock first
    for (const item of order.items) {
      const stock = await Stock.findOne({
        where: { productId: item.productId },
        transaction,
        lock: transaction.LOCK.UPDATE
      });

      stock.quantity += item.quantity;
      await stock.save({ transaction });
    }

    // ❌ Remove old items
    await OrderItem.destroy({
      where: { orderId },
      transaction
    });

    // ➕ Add new items
    let totalAmount = 0;

    for (const item of items) {
      const { productId, quantity } = item;

      const stock = await Stock.findOne({
        where: { productId },
        transaction,
        lock: transaction.LOCK.UPDATE
      });

      if (!stock || stock.quantity < quantity) {
        throw new Error(`Product ${productId} out of stock`);
      }

      const product = await Product.findByPk(productId, {
        include: [Category],
        transaction
      });

      stock.quantity -= quantity;
      await stock.save({ transaction });

      totalAmount += product.price * quantity;

      await OrderItem.create({
        orderId,
        productId,
        categoryId: product.Category.id,
        quantity,
        price: product.price
      }, { transaction });
    }

    // 🔄 Update total
    order.totalAmount = totalAmount;
    await order.save({ transaction });

    await transaction.commit();

    // 🔔 Notify user
    await Notification.create({
      userId: order.userId,
      type: "ORDER_UPDATED",
      userType: "CUSTOMER",
      message: `Your order (${order.id}) has been updated by admin`
    });

    return order;

  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

exports.rescheduleOrder = async (orderId, newDate, adminId) => {
  const order = await Order.findByPk(orderId);

  if (!order) throw new Error("Order not found");

  if (["DELIVERED", "CANCELLED"].includes(order.status)) {
    throw new Error("Cannot reschedule completed order");
  }

  order.deliveryDate = newDate;
  await order.save();

  await Notification.create({
    userId: order.userId,
    type: "ORDER_UPDATED",
    userType: "CUSTOMER",
    message: `Your order (${order.id}) has been rescheduled to ${newDate}`
  });

  return order;
};

exports.cancelOrder = async (orderId, user) => {
  const transaction = await sequelize.transaction();

  try {
    const order = await Order.findByPk(orderId, {
      include: [{ model: OrderItem, as: "items" }],
      transaction,
      lock: transaction.LOCK.UPDATE
    });

    if (!order) throw new Error("Order not found");

    // 🔐 Permission check
    if (user.role !== "admin" && order.userId !== user.id) {
      throw new Error("Unauthorized");
    }

    if (order.status === "CANCELLED") {
      throw new Error("Order already cancelled");
    }

    // 🔄 Restore stock
    for (const item of order.items) {
      const stock = await Stock.findOne({
        where: { productId: item.productId },
        transaction,
        lock: transaction.LOCK.UPDATE
      });

      stock.quantity += item.quantity;
      await stock.save({ transaction });
    }

    // ❌ Update status
    order.status = "CANCELLED";
    await order.save({ transaction });

    await transaction.commit();

    // 🔔 Notify user
    await Notification.create({
      userId: order.userId,
      type: "ORDER_UPDATED",
      userType: "CUSTOMER",
      message: `Your order (${order.id}) has been cancelled`
    });

    return order;

  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};