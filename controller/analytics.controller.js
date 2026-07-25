const analyticsService = require("../service/analytics.service");

exports.productConsumption = async (req, res) => {
    try {
        const data = await analyticsService.getProductConsumption(req.query);
        res.json({ data });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.loginActivity = async (req, res) => {
    try {
        const data = await analyticsService.getLoginActivity(req.query);
        res.json({ data });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
