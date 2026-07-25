const { Product, Category } = require("../models/sequelize");
const { Op } = require("sequelize");

// CREATE PRODUCT
exports.createProduct = async (data) => {
    // validate category
    const category = await Category.findByPk(data.categoryId);
    if (!category) throw new Error("Invalid category");

    return await Product.create(data);
};

// GET ALL PRODUCTS (filter + search + pagination + sorting)
exports.getAllProducts = async (query) => {
    let { page = 1, limit = 10, search = "", minPrice, maxPrice, categoryId, sortBy = "createdAt", order = "DESC" } = query;

    const offset = (page - 1) * limit;

    let where = {};

    // Search
    if (search) {
        where.name = {
            [Op.iLike]: `%${search}%`
        };
    }

    // Price filter
    if (minPrice || maxPrice) {
        where.price = {};
        if (minPrice) where.price[Op.gte] = minPrice;
        if (maxPrice) where.price[Op.lte] = maxPrice;
    }

    // Category filter
    if (categoryId) {
        where.categoryId = categoryId;
    }

    const { count, rows } = await Product.findAndCountAll({
        where,
        include: [
            {
                model: Category,
                as: "category",
                attributes: ["id", "name"]
            }
        ],
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [[sortBy, order.toUpperCase()]],
    });

    return {
        total: count,
        page: parseInt(page),
        pages: Math.ceil(count / limit),
        data: rows
    };
};

// GET PRODUCT BY ID
exports.getProductById = async (id) => {
    const product = await Product.findByPk(id, {
        include: [
            {
                model: Category,
                as: "category",
                attributes: ["id", "name"]
            }
        ]
    });

    if (!product) throw new Error("Product not found");

    return product;
};

//   UPDATE PRODUCT
exports.updateProduct = async (id, data) => {
    const product = await Product.findByPk(id);
    if (!product) throw new Error("Product not found");

    // validate category if updating
    if (data.categoryId) {
        const category = await Category.findByPk(data.categoryId);
        if (!category) throw new Error("Invalid category");
    }

    await product.update(data);
    return product;
};

//   DELETE PRODUCT
exports.deleteProduct = async (id) => {
    const product = await Product.findByPk(id);
    if (!product) throw new Error("Product not found");

    await product.destroy();
    return true;
};