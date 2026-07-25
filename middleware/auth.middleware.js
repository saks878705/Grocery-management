const jwt = require("jsonwebtoken");
const { User } = require("../models/sequelize");

exports.protect = async (req, res, next) => {
    try {
        let token;

        if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
            token = req.headers.authorization.split(" ")[1];
        }

        if (!token) {
            return res.status(401).json({ message: "Not authorized, token missing" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findByPk(decoded.id);

        if (!user) {
            return res.status(401).json({ message: "User not found" });
        }

        req.user = {
            id: user.id,
            role: user.role
        };

        next();

    } catch (err) {
        return res.status(401).json({ message: "Invalid or expired token" });
    }
};

exports.isAdmin = (req, res, next) => {
    if (req.user.role !== "ADMIN") {
        return res.status(403).json({ message: "Access denied (Admin only)" });
    }
    next();
};
