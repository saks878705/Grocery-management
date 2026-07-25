const { DataTypes } = require("sequelize");
const sequelize = require("../../config/postgres");

const Stock = sequelize.define("Stock", {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    productId: {
        type: DataTypes.UUID,
        allowNull: false,
    },
    quantity: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        validate: {
            min: 0,
        }
    },
    lowStockThreshold: {
        type: DataTypes.INTEGER,
        defaultValue: 5,
        validate: {
            min: 0,
        }
    },
}, {
    timestamps: true,
});

module.exports = Stock;
