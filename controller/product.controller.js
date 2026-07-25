const productService = require("../service/product.service");

// CREATE
exports.create = async (req, res) => {
    try {
        if(!req.body.name || !req.body.price || !req.body.categoryId) {
            return res.status(400).json({ message: "Name, price, and categoryId are required" });
        };
        const product = await productService.createProduct(req.body);
        res.status(201).json(product);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// GET ALL
exports.getAll = async (req, res) => {
    try {
        const data = await productService.getAllProducts(req.query);
        res.json(data);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// GET BY ID
exports.getById = async (req, res) => {
    try {
        const product = await productService.getProductById(req.params.id);
        res.json(product);
    } catch (err) {
        res.status(404).json({ message: err.message });
    }
};

// UPDATE
exports.update = async (req, res) => {
    try {
        const product = await productService.updateProduct(
            req.params.id,
            req.body
        );
        res.json(product);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// DELETE
exports.delete = async (req, res) => {
    try {
        await productService.deleteProduct(req.params.id);
        res.json({ message: "Product deleted successfully" });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};