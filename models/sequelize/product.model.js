const { DataTypes } = require("sequelize");
const sequelize = require("../../config/postgres");

const Product = sequelize.define("Product", {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty: true,
        }
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    image: {
        type: DataTypes.STRING, // store URL (S3 / CDN / local path)
        allowNull: true,
        validate: {
            isUrl: true,
        }
    },
    categoryId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: "Categories", // table name
            key: "id"
        },
        onDelete: "CASCADE",
        onUpdate: "CASCADE"
    },
    price: {
        type: DataTypes.FLOAT,
        allowNull: false,
        validate: {
            min: 0,
        }
    },
}, {
    timestamps: true,
});

module.exports = Product;
