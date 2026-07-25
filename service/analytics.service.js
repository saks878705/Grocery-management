const { Op, fn, col } = require("sequelize");
const { OrderItem, Order, Product } = require("../models/sequelize");
const LoginActivity = require("../models/mongo/loginActivity.model");

exports.getProductConsumption = async ({ from, to }) => {
    const orderWhere = { status: { [Op.ne]: "CANCELLED" } };

    if (from || to) {
        orderWhere.createdAt = {};
        if (from) orderWhere.createdAt[Op.gte] = new Date(from);
        if (to) orderWhere.createdAt[Op.lte] = new Date(to);
    }

    const rows = await OrderItem.findAll({
        attributes: [
            "productId",
            [fn("SUM", col("OrderItem.quantity")), "totalQuantity"],
        ],
        include: [
            { model: Order, attributes: [], where: orderWhere },
            { model: Product, attributes: ["name"] },
        ],
        group: ["OrderItem.productId", "Product.id"],
        order: [[fn("SUM", col("OrderItem.quantity")), "DESC"]],
    });

    return rows.map((row) => ({
        productId: row.productId,
        productName: row.Product?.name,
        totalQuantity: parseInt(row.get("totalQuantity"), 10),
    }));
};

exports.getLoginActivity = async ({ groupBy = "day" }) => {
    const format = groupBy === "hour" ? "%Y-%m-%d %H:00" : "%Y-%m-%d";

    const results = await LoginActivity.aggregate([
        {
            $group: {
                _id: { $dateToString: { format, date: "$createdAt" } },
                count: { $sum: 1 },
            },
        },
        { $sort: { _id: 1 } },
    ]);

    return results.map((r) => ({ bucket: r._id, count: r.count }));
};
