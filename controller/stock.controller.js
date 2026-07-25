const stockService = require("../service/stock.service");

// CREATE
exports.create = async (req, res) => {
    try {
        if(!req.body.productId || !req.body.quantity) {
            return res.status(400).json({ message: "Product ID and quantity are required" });
        };
        const stock = await stockService.createStock(req.body);
        res.status(201).json(stock);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// GET ALL
exports.getAll = async (req, res) => {
    try {
        const stocks = await stockService.getAllStocks();
        res.json(stocks);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// GET BY PRODUCT
exports.getByProduct = async (req, res) => {
    try {
        const stock = await stockService.getStockByProduct(req.params.productId);
        res.json(stock);
    } catch (err) {
        res.status(404).json({ message: err.message });
    }
};

// UPDATE
exports.update = async (req, res) => {
    try {
        const stock = await stockService.updateStock(
            req.params.productId,
            req.body
        );
        res.json(stock);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// DELETE
exports.delete = async (req, res) => {
    try {
        await stockService.deleteStock(req.params.productId);
        res.json({ message: "Stock deleted successfully" });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};