const sequelize = require("../../config/postgres");

const User = require("./user.model");
const Product = require("./product.model");
const Category = require("./category.model");
const Stock = require("./stock.model");
const Order = require("./order.model");
const OrderItem = require("./orderItem.model");

// Relations

Category.hasMany(Product, {
    foreignKey: "categoryId",
    as: "products"
});

Product.belongsTo(Category, {
    foreignKey: "categoryId",
    as: "category"
});

User.hasMany(Order);
Order.belongsTo(User);

// ORDER ↔ ORDER ITEMS
Order.hasMany(OrderItem, { foreignKey: "orderId", onDelete: "CASCADE" });
OrderItem.belongsTo(Order, { foreignKey: "orderId" });

// PRODUCT ↔ ORDER ITEMS
Product.hasMany(OrderItem, { foreignKey: "productId" });
OrderItem.belongsTo(Product, { foreignKey: "productId" });

// CATEGORY ↔ ORDER ITEMS
Category.hasMany(OrderItem, { foreignKey: "categoryId" });
OrderItem.belongsTo(Category, { foreignKey: "categoryId" });

Product.hasOne(Stock, { foreignKey: "productId", onDelete: "CASCADE" });
Stock.belongsTo(Product, { foreignKey: "productId" });

module.exports = {
  sequelize,
  User,
  Product,
  Category,
  Stock,
  Order,
  OrderItem,
};