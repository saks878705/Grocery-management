const { DataTypes } = require("sequelize");
const sequelize = require("../../config/postgres");

const Issue = sequelize.define("Issue", {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    userId: { type: DataTypes.UUID, allowNull: false },
    orderId: { type: DataTypes.UUID, allowNull: true },
    description: { type: DataTypes.TEXT, allowNull: false },
    status: {
        type: DataTypes.ENUM("OPEN", "IN_PROGRESS", "RESOLVED"),
        defaultValue: "OPEN",
    },
}, {
    timestamps: true,
});

module.exports = Issue;
