const { Category, Product } = require("../models/sequelize");
const { Op } = require("sequelize");

// CREATE
exports.createCategory = async (data) => {
    //we can implement validation for checking duplicate categories by storing all categories in lower case and matching the req.name with existing categories in lower case. If a match is found, we can throw an error indicating that the category already exists.
    //bt we have implemented role based access ( Amin Only)
    return await Category.create(data);
};

// GET ALL (with pagination + search)
exports.getAllCategories = async ({ page = 1, limit = 10, search = "" }) => {
    const offset = (page - 1) * limit;

    const { count, rows } = await Category.findAndCountAll({
        where: {
            name: {
                [Op.iLike]: `%${search}%`
            }
        },
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [["createdAt", "DESC"]],
    });

    return {
        total: count,
        page: parseInt(page),
        pages: Math.ceil(count / limit),
        data: rows
    };
};

// GET BY ID (with products)
exports.getCategoryById = async (id) => {
    const category = await Category.findByPk(id, {
        include: [
            {
                model: Product,
                as: "products"
            }
        ]
    });

    if (!category) throw new Error("Category not found");

    return category;
};

// UPDATE
exports.updateCategory = async (id, data) => {
    const category = await Category.findByPk(id);
    if (!category) throw new Error("Category not found");

    await category.update(data);
    return category;
};

// DELETE (safe delete)
exports.deleteCategory = async (id) => {
    const category = await Category.findByPk(id);
    if (!category) throw new Error("Category not found");

    // check if products exist
    const productCount = await Product.count({
        where: { categoryId: id }
    });

    if (productCount > 0) {
        throw new Error("Cannot delete category with existing products");
    }

    await category.destroy();
    return true;
};