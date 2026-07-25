const categoryService = require("../service/catagory.service");

// CREATE
exports.create = async (req, res) => {
    try {
        if(!req.body.name) {
            return res.status(400).json({ message: "Name is required" });
        }
        const category = await categoryService.createCategory(req.body);
        res.status(201).json(category);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// GET ALL
exports.getAll = async (req, res) => {
    try {
        const data = await categoryService.getAllCategories(req.query);
        res.json(data);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// GET BY ID
exports.getById = async (req, res) => {
    try {
        const category = await categoryService.getCategoryById(req.params.id);
        res.json(category);
    } catch (err) {
        res.status(404).json({ message: err.message });
    }
};

// UPDATE
exports.update = async (req, res) => {
    try {
        const category = await categoryService.updateCategory(
            req.params.id,
            req.body
        );
        res.json(category);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// DELETE
exports.delete = async (req, res) => {
    try {
        await categoryService.deleteCategory(req.params.id);
        res.json({ message: "Category deleted successfully" });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};