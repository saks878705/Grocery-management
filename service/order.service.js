const sequelize = require("../config/postgres");
const {Category, Stock, Product, OrderItem, Order, User} = require("../models/sequelize");
const Notification = require("../models/mongo/notification.model");
const { getAdminUsers } = require("../utils/adminUsers.util");

exports.updateOrderStatus = async (orderId, status, adminId) => {
  const order = await Order.findByPk(orderId);

  if (!order) {
    throw new Error("Order not found");
  }

  const allowedStatuses = ["PLACED", "PROCESSING", "READY_FOR_DELIVERY", "DELIVERED", "CANCELLED"];

  if (!allowedStatuses.includes(status)) {
    throw new Error("Invalid status");
  }

  if (order.status === "DELIVERED" || order.status === "CANCELLED") {
    throw new Error("Cannot update completed/cancelled order");
  }

  order.status = status;
  await order.save();

  if (status === "READY_FOR_DELIVERY") {
    const user = await User.findByPk(order.userId);

    if (user) {
      await Notification.create({
        userId: user.id,
        type: "ORDER_READY",
        userType: "CUSTOMER",
        message: `Your order (${order.id}) is ready for delivery`,
      });
    }
  }

  return order;
};

exports.placeOrder = async (userId, orderData) => {
  const { items, scheduledAt } = orderData;

  const transaction = await sequelize.transaction();

  try {
    let totalAmount = 0;
    const orderItemsData = [];

    for (const item of items) {
      const { productId, quantity } = item;

      const stock = await Stock.findOne({
        where: { productId },
        lock: transaction.LOCK.UPDATE,
        transaction
      });

      if (!stock || stock.quantity < quantity) {
        throw new Error(`Product ${productId} is out of stock`);
      }

      const product = await Product.findByPk(productId, {
        include: [{ model: Category, as: "category" }],
        transaction
      });

      if (!product) {
        throw new Error(`Product ${productId} not found`);
      }

      stock.quantity -= quantity;
      await stock.save({ transaction });

      totalAmount += product.price * quantity;

      orderItemsData.push({
        productId,
        categoryId: product.category.id,
        quantity,
        priceAtPurchase: product.price
      });
    }

    const order = await Order.create({
      userId,
      totalAmount,
      scheduledAt,
      status: "PLACED"
    }, { transaction });

    for (const item of orderItemsData) {
      await OrderItem.create({
        ...item,
        orderId: order.id
      }, { transaction });
    }

    await transaction.commit();

    getAdminUsers()
      .then((admins) => Notification.insertMany(admins.map((admin) => ({
        userId: admin.id,
        type: "ORDER_CREATED",
        userType: "ADMIN",
        message: `New order (${order.id}) placed for ${totalAmount}`
      }))))
      .catch((err) => console.error("Failed to notify admins of new order:", err));

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
        attributes: ["id", "quantity", "priceAtPurchase"],
        include: [
          {
            model: Product,
            attributes: ["id", "name", "price", "image"],
            include: [
              {
                model: Category,
                as: "category",
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

exports.getAllOrders = async () => {
  const orders = await Order.findAll({
    order: [["createdAt", "DESC"]],
    include: [
      {
        model: OrderItem,
        as: "items",
        attributes: ["id", "quantity", "priceAtPurchase"],
        include: [
          {
            model: Product,
            attributes: ["id", "name", "price", "image"],
            include: [
              {
                model: Category,
                as: "category",
                attributes: ["id", "name"]
              }
            ]
          }
        ]
      },
      {
        model: User,
        attributes: ["id", "name", "email"]
      }
    ]
  });

  return orders;
};

exports.modifyOrderItems = async (orderId, items, adminId) => {
  const transaction = await sequelize.transaction();

  try {
    const order = await Order.findByPk(orderId, {
      transaction,
      lock: transaction.LOCK.UPDATE
    });

    if (!order) throw new Error("Order not found");

    if (["DELIVERED", "CANCELLED"].includes(order.status)) {
      throw new Error("Cannot modify completed order");
    }

    const existingItems = await OrderItem.findAll({ where: { orderId }, transaction });

    for (const item of existingItems) {
      const stock = await Stock.findOne({
        where: { productId: item.productId },
        transaction,
        lock: transaction.LOCK.UPDATE
      });

      stock.quantity += item.quantity;
      await stock.save({ transaction });
    }

    await OrderItem.destroy({
      where: { orderId },
      transaction
    });

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
        include: [{ model: Category, as: "category" }],
        transaction
      });

      stock.quantity -= quantity;
      await stock.save({ transaction });

      totalAmount += product.price * quantity;

      await OrderItem.create({
        orderId,
        productId,
        categoryId: product.category.id,
        quantity,
        priceAtPurchase: product.price
      }, { transaction });
    }

    order.totalAmount = totalAmount;
    await order.save({ transaction });

    await transaction.commit();

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

  order.scheduledAt = newDate;
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
      transaction,
      lock: transaction.LOCK.UPDATE
    });

    if (!order) throw new Error("Order not found");

    if (user.role !== "ADMIN" && order.userId !== user.id) {
      throw new Error("Unauthorized");
    }

    if (order.status === "CANCELLED") {
      throw new Error("Order already cancelled");
    }

    const existingItems = await OrderItem.findAll({ where: { orderId }, transaction });

    for (const item of existingItems) {
      const stock = await Stock.findOne({
        where: { productId: item.productId },
        transaction,
        lock: transaction.LOCK.UPDATE
      });

      stock.quantity += item.quantity;
      await stock.save({ transaction });
    }

    order.status = "CANCELLED";
    await order.save({ transaction });

    await transaction.commit();

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
