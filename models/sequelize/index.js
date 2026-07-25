const sequelize = require("../../config/postgres");

const User = require("./user.model");
const Product = require("./product.model");
const Category = require("./category.model");
const Stock = require("./stock.model");
const Order = require("./order.model");
const OrderItem = require("./orderItem.model");
const Issue = require("./issue.model");

// Relations

Category.hasMany(Product, {
    foreignKey: "categoryId",
    as: "products"
});

Product.belongsTo(Category, {
    foreignKey: "categoryId",
    as: "category"
});

User.hasMany(Order, { foreignKey: "userId" });
Order.belongsTo(User, { foreignKey: "userId" });

Order.hasMany(OrderItem, { foreignKey: "orderId", onDelete: "CASCADE", as: "items" });
OrderItem.belongsTo(Order, { foreignKey: "orderId" });

Product.hasMany(OrderItem, { foreignKey: "productId" });
OrderItem.belongsTo(Product, { foreignKey: "productId" });

Category.hasMany(OrderItem, { foreignKey: "categoryId" });
OrderItem.belongsTo(Category, { foreignKey: "categoryId" });

Product.hasOne(Stock, { foreignKey: "productId", onDelete: "CASCADE", as: "stock" });
Stock.belongsTo(Product, { foreignKey: "productId", as: "product" });

User.hasMany(Issue, { foreignKey: "userId" });
Issue.belongsTo(User, { foreignKey: "userId" });
Order.hasMany(Issue, { foreignKey: "orderId" });
Issue.belongsTo(Order, { foreignKey: "orderId" });

module.exports = {
  sequelize,
  User,
  Product,
  Category,
  Stock,
  Order,
  OrderItem,
  Issue,
};