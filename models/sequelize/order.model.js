const { DataTypes } = require("sequelize");
const sequelize = require("../../config/postgres");

const Order = sequelize.define("Order", {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  status: {
    type: DataTypes.ENUM("PLACED", "PROCESSING", "READY_FOR_DELIVERY", "DELIVERED", "CANCELLED"),
    defaultValue: "PLACED",
  },
  totalAmount: { type: DataTypes.FLOAT, defaultValue: 0 },
  scheduledAt: { type: DataTypes.DATE },
},{
    timestamps: true,
});

module.exports = Order;