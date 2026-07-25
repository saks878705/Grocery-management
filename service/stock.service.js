const { Stock, Product } = require("../models/sequelize");

exports.createStock = async (data) => {
    const product = await Product.findOne({ where: { id: data.productId } });
    if (!product) throw new Error("Product not found");

    const existing = await Stock.findOne({
        where: { productId: data.productId }
    });

    if (existing) {
        throw new Error("Stock already exists for this product");
    }

    return await Stock.create(data);
};

exports.getAllStocks = async () => {
    return await Stock.findAll({
        include: [
            {
                model: Product,
                as: "product",
                attributes: ["id", "name", "price"]
            }
        ]
    });
};

exports.getStockByProduct = async (productId) => {
    const stock = await Stock.findOne({
        where: { productId },
        include: [
            {
                model: Product,
                as: "product"
            }
        ]
    });

    if (!stock) throw new Error("Stock not found");

    return stock;
};

exports.updateStock = async (productId, { quantity, lowStockThreshold }) => {
    const stock = await Stock.findOne({ where: { productId } });
    if (!stock) throw new Error("Stock not found");

    if (quantity !== undefined) {
        if (!Number.isInteger(quantity) || quantity < 0) {
            throw new Error("Quantity must be a non-negative integer");
        }
        stock.quantity = quantity;
    }

    if (lowStockThreshold !== undefined) {
        if (!Number.isInteger(lowStockThreshold) || lowStockThreshold < 0) {
            throw new Error("Low stock threshold must be a non-negative integer");
        }
        stock.lowStockThreshold = lowStockThreshold;
    }

    await stock.save();

    return stock;
};

exports.deleteStock = async (productId) => {
    const stock = await Stock.findOne({ where: { productId } });
    if (!stock) throw new Error("Stock not found");

    await stock.destroy();
    return true;
};
