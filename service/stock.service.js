const { Stock, Product } = require("../models/sequelize");

//   CREATE STOCK
exports.createStock = async (data) => {
    console.log("Creating stock with data:", data);
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

//   GET ALL STOCKS
exports.getAllStocks = async () => {
    return await Stock.findAll({
        include: [
            {
                model: Product,
                // as: "product",
                attributes: ["id", "name", "price"]
            }
        ]
    });
};

//   GET STOCK BY PRODUCT ID
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

//   UPDATE STOCK
exports.updateStock = async (productId, quantity) => {
    const stock = await Stock.findOne({ where: { productId } });
    if (!stock) throw new Error("Stock not found");

    stock.quantity = quantity;
    await stock.save();

    return stock;
};

//   DELETE STOCK
exports.deleteStock = async (productId) => {
    const stock = await Stock.findOne({ where: { productId } });
    if (!stock) throw new Error("Stock not found");

    await stock.destroy();
    return true;
};